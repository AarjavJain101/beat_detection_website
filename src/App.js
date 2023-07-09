import Start from "./components/Start";
import "./styles/App.css";
import { useState } from "react";

function App() {
    const [play, setPlay] = useState(false);

    const handleStart = () => {
        setPlay(true);
    };

    const handleStop = () => {
        setPlay(false);
    };

    let micNode;
    let testNode;
    let mediaStream;

    const startAudio = async (context) => {
        await context.audioWorklet.addModule("test-processor.js");
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micNode = context.createMediaStreamSource(mediaStream);
        testNode = new AudioWorkletNode(context, "test-print");
        testNode.port.onmessage = ({ data }) => {
            console.log(data * 100000);
        };
        micNode.connect(testNode).connect(context.destination);
    };

    const stopAudio = async (context) => {
        try {
            if (mediaStream) {
                mediaStream.getAudioTracks().forEach((track) => {
                    track.stop();
                });
                console.log("Helllo");
                mediaStream = null;
            }

            if (micNode && testNode) {
                micNode.disconnect();
                testNode.disconnect();
                micNode = null;
                testNode = null;
            }
        } catch (error) {
            console.log("Error stopping audio:", error);
        }
    };

    return (
        <div className="App">
            <Start
                play={play}
                handleStart={handleStart}
                handleStop={handleStop}
                startAudio={startAudio}
                stopAudio={stopAudio}
            ></Start>
        </div>
    );
}

export default App;
