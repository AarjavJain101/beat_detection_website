// Define parameters
const CLAP_RANGE_LOW = 6;
const HIHAT_RANGE_LOW = 16;

const TOTAL_SUB_BANDS = 128;

// Define constants using parameters
const HISTORY_CHUNKS = 60;

/**************************************************************
 *                                                            *
 * Detects in the incoming 128 samples and posts a message    *
 * containing what beat was detected                          *
 *                                                            *
 * @class BeatDetector                                        *
 * @extends AudioWorkletProcessor                             *
 **************************************************************/
class BeatDetector extends AudioWorkletProcessor {
    constructor() {
        super();
        this._chunks_processed = 0;
        this._instant_energy = [];
        this._energy_history = [];
        this._sub_band_beat = new Array(TOTAL_SUB_BANDS).fill(false);
        this._beat_history = [];
        for (let i = 0; i < 3; i++) {
            this._beat_history.push([]);
        }
        this._bass_chunk = 0;
        this._clap_energy = 0;
        this._clap_chunk = 0;
        this._hihat_energy = 0;
        this._hihat_chunk = 0;
        this._final_detection = [false, false, false];
        this._lastUpdate = currentTime;
    }

    // ===========================================================================
    // Method: Calculates the energy
    // Input:    FFT'd audio data
    // Return:   List energy for each frequency bin (multiple of 375)
    getEnergy(audio_data_fft) {
        let instant_energy = [];

        for (let i = 0; i < TOTAL_SUB_BANDS; i++) {
            instant_energy.push(Math.pow(Math.abs(audio_data_fft[i]), 2.4));
        }

        // Return the instant energy values
        return instant_energy;
    }

    // ===========================================================================
    // Method:  Checks if a beat has occurred and makes that position in the arryay true
    // Algorithm: First normalize by dividing by max energy (from instant energy or energy history)
    //            Then check if the instant energy is greater than a certain threshold based on variance
    // Input:     Instant energy and the energy history
    // Return:    True if a beat occurred, otherwise False
    checkBeat(instant_energy, energy_history, sub_band_beat) {
        const instant_energy_f = new Array(TOTAL_SUB_BANDS).fill(0);

        // Find the max
        const max_instant = Math.max.apply(null, instant_energy);

        let max_history = energy_history[0][0];
        for (let i = 0; i < energy_history.length; i++) {
            for (let j = 0; j < energy_history[i].length; j++) {
                if (energy_history[i][j] > max_history) {
                    max_history = energy_history[i][j];
                }
            }
        }

        const max = max_history > max_instant ? max_history : max_instant;

        // Normalize the instant energy
        for (let i = 0; i < instant_energy.length; i++) {
            instant_energy_f[i] = instant_energy[i] / max;
        }

        // Calculate the thresholds based on energy history
        const thresholds = new Array(TOTAL_SUB_BANDS).fill(0);
        const average_energies = new Array(TOTAL_SUB_BANDS).fill(0);

        for (let i = 0; i < TOTAL_SUB_BANDS; i++) {
            for (let j = 0; j < HISTORY_CHUNKS; j++) {
                average_energies[i] += energy_history[j][i];
            }
            average_energies[i] = average_energies[i] / HISTORY_CHUNKS;

            for (let j = 0; j < HISTORY_CHUNKS; j++) {
                thresholds[i] += Math.pow(energy_history[j][i] - average_energies[i], 2);
            }
            thresholds[i] = thresholds[i] / HISTORY_CHUNKS;
            thresholds[i] = 27.0 * thresholds[i] + 1.2;
        }

        // Check if there is a beat for each sub band
        for (let i = 0; i < TOTAL_SUB_BANDS; i++) {
            if (
                instant_energy_f[i] > (thresholds[i] * average_energies[i]) / 3 ||
                instant_energy_f[i] > 0.15
            ) {
                sub_band_beat[i] = true;
            } else {
                sub_band_beat[i] = false;
            }
        }
    }

    // ===========================================================================
    // Method:  Calculate the energy in the clap range
    // Input:     Instant energy
    // Return:    Weighted average of the clap energy
    getClapEnergy(instant_energy) {
        return (
            (1.2 * instant_energy[CLAP_RANGE_LOW] +
                1.5 * instant_energy[CLAP_RANGE_LOW + 3] +
                1.3 * instant_energy[CLAP_RANGE_LOW + 6]) /
            4
        );
    }

    // ===========================================================================
    // Method:  Calculate the energy in the hihat
    // Input:     Instant energy
    // Return:    Weighted average of the hihat energy
    getHiHatEnergy(instant_energy) {
        return (1.8 * instant_energy[HIHAT_RANGE_LOW] + 1.2 * instant_energy[HIHAT_RANGE_LOW + 2]) / 3;
    }

    // ===========================================================================
    // Method:  Calculates the mathematical variance of an array
    // Input:     The array to take the variance of
    // Return:    The variance
    calculateVariance(array) {
        const n = array.length;
        if (n === 0) {
            return 0;
        }

        const mean = array.reduce((acc, val) => acc + val, 0) / n;
        const sumOfSquaredDifferences = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        const variance = sumOfSquaredDifferences / n;
        return variance;
    }

    // ===========================================================================
    // Method:  Appends the array and shifts all values down
    // Input:     The array to be changed and the new value to be added on
    // Return:    The edited array
    addAndShift(array, newValue) {
        array.push(newValue);
        array.shift();
    }

    // ===========================================================================
    // Method:  Confirms if the current detected beat is within an acceptable range of previous beats
    // Input:     Energy of the current detected beat and the energy history of previusly detected beats
    // Return:    True if the history is less than 20 beats or the detected beat exceeds the threshold and False if not
    confirmBeat(current_detected_beat, detected_beat_history) {
        const max_detected_beat = Math.max(...detected_beat_history);
        const norm_detected_beat_history = detected_beat_history.map((energy) => energy / max_detected_beat);
        const avg_detected_beat =
            detected_beat_history.reduce((acc, energy) => acc + energy, 0) /
            (detected_beat_history.length * max_detected_beat);

        if (
            current_detected_beat / max_detected_beat >
            avg_detected_beat * this.calculateVariance(norm_detected_beat_history) * 0.006
        ) {
            this.addAndShift(detected_beat_history, current_detected_beat);
            return true;
        } else {
            return false;
        }
    }

    // Main processing method
    process(inputs, outputs) {
        this.port.onmessage = ({ data }) => {
            // First check for real data and fill the history
            if (data && this._chunks_processed < HISTORY_CHUNKS) {
                this._energy_history.push(this.getEnergy(data));
                this._chunks_processed += 1;
            }

            // Now continously check beats
            if (data && this._chunks_processed >= HISTORY_CHUNKS) {
                // First get the energy
                this._instant_energy = this.getEnergy(data);
                this.addAndShift(this._energy_history, this._instant_energy);

                // Now check for beats in this instance
                this.checkBeat(this._instant_energy, this._energy_history, this._sub_band_beat);

                this._chunks_processed += 1;
            }

            // Checks Bass
            if (this._sub_band_beat[0]) {
                if (this._chunks_processed - this._bass_chunk > 4) {
                    if (this._beat_history[0].length >= 5) {
                        if (this.confirmBeat(this._instant_energy[0], this._beat_history[0])) {
                            this._final_detection[0] = true;
                            this._bass_chunk = this._chunks_processed;
                        }
                    } else {
                        this._beat_history[0].push(this._instant_energy[0]);
                    }
                }
            }

            // Checks Claps
            this._clap_energy = this.getClapEnergy(this._instant_energy);
            if (
                this._sub_band_beat[CLAP_RANGE_LOW] &&
                this._sub_band_beat[CLAP_RANGE_LOW + 3] &&
                this._sub_band_beat[CLAP_RANGE_LOW + 6]
            ) {
                if (this._chunks_processed - this._clap_chunk > 4) {
                    if (this._beat_history[1].length >= 3) {
                        if (this.confirmBeat(this._clap_energy * 1.6, this._beat_history[1])) {
                            this._final_detection[1] = true;
                            this._clap_chunk = this._chunks_processed;
                        }
                    } else {
                        this._beat_history[1].push(this._clap_energy);
                    }
                }
            }

            // Checks Hihats
            this._hihat_energy = this.getHiHatEnergy(this._instant_energy);
            if (this._sub_band_beat[HIHAT_RANGE_LOW] && this._sub_band_beat[CLAP_RANGE_LOW + 2]) {
                if (this._chunks_processed - this._hihat_chunk > 4) {
                    if (this._beat_history[2].length >= 6) {
                        if (this.confirmBeat(this._hihat_energy * 1.6, this._beat_history[2])) {
                            this._final_detection[2] = true;
                            this._hihat_chunk = this._chunks_processed;
                        }
                    } else {
                        this._beat_history[2].push(this._hihat_energy);
                    }
                }
            }
        };

        // Send the final detection to the main thread
        if (this._final_detection[0] || this._final_detection[1] || this._final_detection[2]) {
            this.port.postMessage(this._final_detection);
        }

        // Reset Final Detection
        for (let i = 0; i < 3; i++) {
            this._final_detection[i] = false;
        }

        return true;
    }
}

registerProcessor("beat-detector", BeatDetector);
