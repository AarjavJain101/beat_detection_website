import React, { useState, useEffect } from "react";

const Start = (props) => {
    const RATE = 48000;
    const CHUNK_SIZE = 1024;

    const { startAudio, stopAudio, getAmplitudeData } = props;

    const [audioContext, setAudioContext] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    let animationFrameId;

    const handleStartButton = async () => {
        if (!audioContext) {
            const context = new AudioContext();
            setAudioContext(context);
            await startAudio(context);
            context.resume();
            setIsRunning(true);
            getAmplitudeData();
        }
    };

    const handleStopButton = async () => {
        if (audioContext) {
            await stopAudio(audioContext);
            audioContext.close();
            setAudioContext(null);
            setIsRunning(false);
            cancelAnimationFrame(animationFrameId);
        }
    };

    useEffect(() => {
        let intervalId;

        if (isRunning) {
            intervalId = setInterval(() => {
                getAmplitudeData();
            }, (CHUNK_SIZE / RATE) * 1000);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [isRunning, getAmplitudeData]);

    return (
        <div>
            <button onClick={handleStartButton}>Start</button>
            <button onClick={handleStopButton}>Stop</button>
        </div>
    );
};

export default Start;
