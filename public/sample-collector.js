class SampleCollector extends AudioWorkletProcessor {
    constructor() {
        super();
        this._fullChunk = Array(128).fill(0);
        this._indexCount = 0;
        this._fullCounter = 0;
    }

    process(inputs, outputs) {
        const inputChannelData = inputs[0][0];
        const output = outputs[0];
        const outputChannelData = output[0];

        for (let i = 0; i < 16; i++) {
            const inputIndex = 8 * i - 1 >= 0 ? 8 * i - 1 : 0;

            this._fullChunk[this._indexCount] = inputChannelData[inputIndex];
            this._indexCount++;
        }

        if (this._indexCount === 128) {
            this._indexCount = 0;
            for (let i = 0; i < outputChannelData.length; i++) {
                outputChannelData[i] = this._fullChunk[i] * 1000000;
            }
        }

        return true;
    }
}

registerProcessor("sample-collector", SampleCollector);
