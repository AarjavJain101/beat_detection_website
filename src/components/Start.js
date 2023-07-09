import React from "react";
import { useState } from "react";

const Start = (props) => {
    const { play, handleStart, handleStop, startAudio, stopAudio } = props;

    const [audioContext, setAudioContext] = useState(null);

    console.log(`Music is ${play ? "Start" : "Stop"}`);

    const handleStartButton = async () => {
        handleStart();
        const context = new AudioContext();
        setAudioContext(context);
        await startAudio(context);
        context.resume();
    };

    const handleStopButton = async () => {
        handleStop();
        if (audioContext) {
            await stopAudio(audioContext);
            audioContext.close();
            setAudioContext(null);
        }
    };

    return (
        <div>
            <button onClick={handleStartButton}>Start</button>
            <button onClick={handleStopButton}>Stop</button>
        </div>
    );
};

export default Start;
