import Start from "./components/Start";
import Color from "./components/Color";
import "./styles/App.css";

function App() {
    // Declare Nodes and stream as variables to turn on and off
    let micNode;
    let collectionNode;
    let fftNode;
    let beatDetectionNode;
    let mediaStream;

    // Declare beat detection array. Index 0 = bass, Index 1 = clao, Index 2 = hihat
    let beats = [false, false, false];

    /**
     * startAudio
     *
     * Initializes audio processing by adding a worklet module, acquiring the audio stream,
     * and connecting the necessary nodes for processing and output.
     *
     * @param {AudioContext} context - The AudioContext object in Web Audio API.
     * @returns {Promise} A Promise that resolves once the audio processing is started.
     * @example
     * Example usage:
     * startAudio(audioContext);
     */
    const startAudio = async (context) => {
        // Add the AudioWorklet Nodes
        await context.audioWorklet.addModule("audio-processor.js");
        await context.audioWorklet.addModule("sample-collector.js");

        // Create the Stream, the mic node, the sample collector node, the fft analyser
        // and the beat detection node
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micNode = context.createMediaStreamSource(mediaStream);
        collectionNode = new AudioWorkletNode(context, "sample-collector");
        fftNode = context.createAnalyser();
        fftNode.fftSize = 256;
        beatDetectionNode = new AudioWorkletNode(context, "beat-detector");

        // Connect the nodes
        micNode.connect(collectionNode);
        collectionNode.connect(fftNode);
        fftNode.connect(beatDetectionNode);

        // Upon getting the detected beats, flash colors by changing the background color
        beatDetectionNode.port.onmessage = ({ data }) => {
            beats = data;
            if (beats[0]) {
                document.querySelector(".color-wrapper").style.backgroundColor = "red";
                setTimeout(() => {
                    document.querySelector(".color-wrapper").style.backgroundColor = "black";
                }, 5);
            }

            if (beats[1]) {
                document.querySelector(".color-wrapper").style.backgroundColor = "blue";
                setTimeout(() => {
                    document.querySelector(".color-wrapper").style.backgroundColor = "black";
                }, 10);
            }

            if (beats[2]) {
                document.querySelector(".color-wrapper").style.backgroundColor = "pink";
                setTimeout(() => {
                    document.querySelector(".color-wrapper").style.backgroundColor = "black";
                }, 2);
            }
        };
    };

    /**
     * stopAudio
     *
     * Stops the audio processing by disconnecting the nodes, stopping the audio tracks.
     *
     * @param {AudioContext} context - The AudioContext object used for audio processing.
     * @returns {Promise} A Promise that resolves once the audio processing is stopped.
     * @example
     * // Example usage:
     * stopAudio(audioContext);
     */
    const stopAudio = async (context) => {
        // First close the Media Stream/Mic
        try {
            if (mediaStream) {
                mediaStream.getAudioTracks().forEach((track) => {
                    track.stop();
                });
                mediaStream = null;
            }

            // Then disconnect the nodes and clean up
            if (micNode && collectionNode && fftNode && beatDetectionNode) {
                micNode.disconnect();
                collectionNode.disconnect();
                fftNode.disconnect();
                beatDetectionNode.disconnect();
                micNode = null;
                collectionNode = null;
                fftNode = null;
                beatDetectionNode = null;
            }
        } catch (error) {
            console.log("Error stopping audio:", error);
        }
    };

    /**
     * getAmplitudeData
     *
     * Retrieves fft amplitude data from the analyser node and passes it
     * to the audio processor worklet. If data is not recieved then false is sent instead
     *
     * @returns {void}
     * @example
     * // Example usage:
     * getAmplitudeData();
     */
    const getAmplitudeData = () => {
        const bufferLength = fftNode.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        fftNode.getFloatTimeDomainData(dataArray);

        beatDetectionNode.port.postMessage(dataArray[0] !== 0 ? dataArray : false);
    };

    return (
        <div className="App">
            <Start startAudio={startAudio} stopAudio={stopAudio} getAmplitudeData={getAmplitudeData}></Start>
            <div className="color-wrapper">
                <Color></Color>
            </div>
        </div>
    );
}

export default App;
