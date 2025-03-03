import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Make.module.css";

export default function Main() {
    const router = useRouter();

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };
    const handleVideoEnded = () => {
        setIsPlaying(false);
    };
    const handleSkip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { story } = router.query;
                console.log(story);
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_ENDPOINT3,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ text: story }),
                    }
                );
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                const storyjson = data.story;
                const infojson = data.info;
                console.log(storyjson);
                console.log(infojson);
                const responsepy = await fetch(
                    process.env.NEXT_PUBLIC_PY_SERVER,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    }
                );
                if (!responsepy.ok) {
                    throw new Error("Failed to fetch video");
                }

                const videoBlob = await responsepy.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setVideoSrc(videoUrl);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, []);

    const [responseText, setResponseText] = useState("");

    const handleVideoClick = async (event) => {
        if (isCapturing) return;

        setIsCapturing(true);
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);

            const video = videoRef.current;
            const rect = video.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const scaleX = video.videoWidth / rect.width;
            const scaleY = video.videoHeight / rect.height;
            const radius = 20;
            context.beginPath();
            context.arc(x * scaleX, y * scaleY, radius, 0, 2 * Math.PI, false);
            context.fillStyle = "rgba(255, 0, 0, 0)";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = "red";
            context.stroke();

            const dataUrl = canvas.toDataURL("image/png");

            const base64Image = dataUrl.split(",")[1];

            const response = await fetch(
                process.env.NEXT_PUBLIC_API_ENDPOINT4,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ img: base64Image }),
                }
            );

            if (response.ok) {
                const jsonResponse = await response.json();
                setResponseText(jsonResponse.text);
            } else {
                console.error("Failed to upload image");
            }
            setIsCapturing(false);
        }
    };

    return (
        <div>
            <title>VocabVids</title>
            <div className={styles.container}>
                {" "}
                <style>
                    {`
          .darken-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
            z-index: 999; /* Ensure it's above everything */
          }
        `}
                </style>
                <div className={isCapturing ? "darken-overlay" : ""}></div>
                <div className={styles.subcontainer}>
                    <div className={styles.title}>
                        <video controls={false} muted autoPlay>
                            <source src="videos/1.mp4" type="video/mp4" />
                        </video>
                    </div>
                    {videoSrc ? (
                        <button onClick={() => handleSkip(-3)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="19 21 9 12 19 3 19 21"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                        </button>
                    ) : (
                        <a></a>
                    )}
                    {videoSrc ? (
                        <button onClick={handlePlayPause}>
                            {isPlaying ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="6"
                                        y="4"
                                        width="4"
                                        height="16"
                                    ></rect>
                                    <rect
                                        x="14"
                                        y="4"
                                        width="4"
                                        height="16"
                                    ></rect>
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            )}
                        </button>
                    ) : (
                        <a></a>
                    )}
                    {videoSrc ? (
                        <button onClick={() => handleSkip(3)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="5 21 15 12 5 3 5 21"></polygon>
                                <line x1="19" y1="19" x2="19" y2="5"></line>
                            </svg>
                        </button>
                    ) : (
                        <a></a>
                    )}
                    <div>
                        {videoSrc ? (
                            <video
                                ref={videoRef}
                                onClick={handleVideoClick}
                                onEnded={handleVideoEnded}
                                controls={false}
                            >
                                <source
                                    className={styles.video}
                                    src={videoSrc}
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <h2>
                                이야기 동화책을 만들고 있어요! 잠시만
                                기다려주세요!
                            </h2>
                        )}
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        {responseText && <p>{responseText}</p>}
                    </div>
                    <div className={styles.creater}>
                        <video
                            style={{ height: "3rem" }}
                            controls={false}
                            muted
                            autoPlay
                        >
                            <source src="videos/2.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
                <div className={styles.blank}>
                    <a>&nbsp;</a>
                </div>
            </div>
        </div>
    );
}
