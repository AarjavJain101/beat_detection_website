/**************************************************************
 *                                                            *
 * The SampleCollector class will change its output to be the *
 * incoming mic audio data amplified by 500000                *
 *                                                            *
 *                                                            *
 * @class SampleCollector                                     *
 * @extends AudioWorkletProcessor                             *
 **************************************************************/
class SampleCollector extends AudioWorkletProcessor {
    constructor() {
        super();
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
