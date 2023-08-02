// PURPOSE: Begin the page with instruction, the start and stop buttons, and social links
// FUNCTION: Handles the logic for starting the audio pipline and stopping it

import React, { useState, useEffect } from "react";
import GitHubImage from "../media/github.png";
import ProfilePicture from "../media/Profile_Picture.jpg";
import "../styles/Start.css";

const Start = (props) => {
    // Declare constants to use for how often to call getAmplitudeData
    const RATE = 48000;
    const CHUNK_SIZE = 1024;

    // De-construct properties
    const { startAudio, stopAudio, getAmplitudeData } = props;

    // useStates for creating and closing audio contexts
    const [audioContext, setAudioContext] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // Used for requesting and stopping animation frames for the getAmplitudeData function
    let animationFrameId;
    // Handles the start button click event.
    const handleStartButton = async () => {
        // If there is no audio context, create a new one and start the audio processing.
        if (!audioContext) {
            const context = new AudioContext();
            setAudioContext(context);
            await startAudio(context);
            context.resume();
            setIsRunning(true);
            getAmplitudeData(); // Retrieve initial amplitude data.
        }
    };

    // Handles the stop button click event.
    const handleStopButton = async () => {
        // If there is an audio context, stop the audio processing, close the context, and reset the state.
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
            // Start a periodic interval to retrieve amplitude data at a specific interval.
            intervalId = setInterval(() => {
                getAmplitudeData(); // Retrieve amplitude data at each interval.
            }, (CHUNK_SIZE / RATE) * 1000);
        }

        return () => {
            // Clean up the interval when the component unmounts or when isRunning changes.
            clearInterval(intervalId);
        };
    }, [isRunning, getAmplitudeData]);

    return (
        <div>
            <h1 className="title">
                <strong>Download App Below!</strong> Orrr Click <strong>Start</strong> to Rave.
            </h1>
            <p className="info">
                <a
                    href={`https://github.com/AarjavJain101/beat_detection_website/raw/master/src/media/Light_Room.exe`}
                    download="Light_Room.exe"
                    className="download-link"
                >
                    Download App
                </a>{" "}
                = Way Better Experience
            </p>
            <div className="btns">
                <button className="start-btn" onClick={handleStartButton}>
                    Start
                </button>
                <button className="stop-btn" onClick={handleStopButton}>
                    Stop
                </button>
            </div>
            <p className="socials-text">Check out the GitHub for synched lyrics: </p>
            <div className="socials-container">
                <a
                    href="https://www.linkedin.com/in/aarjav-jain-734b8b204/"
                    className="socials-linkedin"
                    target="_blank"
                    rel="noreferrer"
                >
                    <p className="socials-linkedin-text">LinkedIn:</p>
                    <button type="button" className="linked-in-btn">
                        in
                    </button>
                </a>
                <a
                    href="https://github.com/AarjavJain101/Beat-Detector"
                    className="socials-github"
                    target="_blank"
                    rel="noreferrer"
                >
                    <p className="socials-github-text">GitHub:</p>
                    <img src={GitHubImage} alt="Github" className="socials-github-img" />
                </a>
                <a
                    href="https://aarjavjainubc.com/"
                    className="socials-website"
                    target="_blank"
                    rel="noreferrer"
                >
                    <p className="socials-website-text">My Website:</p>
                    <img src={ProfilePicture} alt="personal website" className="socials-website-img" />
                </a>
            </div>
        </div>
    );
};

export default Start;
