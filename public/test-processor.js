const FRAME_PER_SECOND = 60;
const FRAME_INTERVAL = 1 / FRAME_PER_SECOND;

// Multiply the input by 100000 (it is 0 to 1)

/**
 *  Print to Console "Hello" for testing
 *
 * @class TestPrint
 * @extends AudioWorkletProcessor
 */
class TestPrint extends AudioWorkletProcessor {
    constructor() {
        super();
        this._lastUpdate = currentTime;
        this._max = 0;
    }

    getRange(inputChannelData) {
        if (inputChannelData.length === 0) {
            return { min: undefined, max: undefined };
        }

        let min = inputChannelData[0];
        let max = inputChannelData[0];

        for (let i = 1; i < inputChannelData.length; i++) {
            if (inputChannelData[i] < min) {
                min = inputChannelData[i];
            }
            if (inputChannelData[i] > max) {
                max = inputChannelData[i];
            }
        }

        return min;
    }

    process(inputs, outputs) {
        const inputChannelData = inputs[0][0];

        if (currentTime - this._lastUpdate > FRAME_INTERVAL) {
            this.port.postMessage(this.getRange(inputChannelData));
            this._lastUpdate = currentTime;
        }

        return true;
    }
}

registerProcessor("test-print", TestPrint);
