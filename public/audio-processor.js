// Define parameters and use mathjs
const CHANNELS = 2;
const RECORD_SECONDS = 5000;
const RATE = 48000;
const CHUNK_SIZE = 1024;
const HISTORY_SECONDS = 1;

const CLAP_RANGE_LOW = 11;
const HIHAT_RANGE_LOW = 27;

const TOTAL_SUB_BANDS = 39;

// Multiply the input by 100000 (it is 0 to 1)

/**
 *  Print to Console "Hello" for testing
 *
 * @class BeatDetector
 * @extends AudioWorkletProcessor
 */
class BeatDetector extends AudioWorkletProcessor {
    constructor() {
        super();
        this._chunks_processed = 0;
        this._instant_energy_sub_bands = [];
        this._energy_history_sub_bands = [];
        this._sub_band_beat = [];
        this._beat_history = [];
        for (let i = 0; i < 3; i++) {
            this._beat_history.push([]);
        }
        this._bass_chunk = 0;
        this._clap_energy = 0;
        this._clap_chunk = 0;
        this._hihat_energy = 0;
        this._hihat_chunk = 0;
        this._lastUpdate = currentTime;
    }

    process(inputs, outputs) {
        this.port.onmessage = ({ data }) => {
            console.log(data);
        };

        return true;
    }
}

registerProcessor("beat-detector", BeatDetector);
