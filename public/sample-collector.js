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

        for (let i = 0; i < outputChannelData.length; i++) {
            outputChannelData[i] = inputChannelData[i] * 500000;
        }

        return true;
    }
}

registerProcessor("sample-collector", SampleCollector);
