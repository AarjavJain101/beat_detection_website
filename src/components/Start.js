import React, { useState, useEffect } from "react";
import GitHubImage from "../media/github.png";
import ProfilePicture from "../media/Profile_Picture.jpg";
import "../styles/Start.css";

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
            <h1 className="title">
                Click <strong>Start</strong> to Rave
            </h1>
            <p className="info">
                <strong>Fullscreen</strong> + <strong>Zoom-In</strong> + <strong>Music in Browser</strong> =
                Better Rave
            </p>
            <div className="btns">
                <button className="start-btn" onClick={handleStartButton}>
                    Start
                </button>
                <button className="stop-btn" onClick={handleStopButton}>
                    Stop
                </button>
            </div>
            <p className="socials-text">Check out my other projects: </p>
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
                    href="https://github.com/AarjavJain101"
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
