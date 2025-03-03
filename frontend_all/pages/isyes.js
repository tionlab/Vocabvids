import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Main.module.css";

export default function Main() {
    const inputRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isClickedMicrophone, setClickedMicrophone] = useState(false);
    const [oldtranscript, setoldTranscript] = useState(".");
    const [transcript, setTranscript] = useState(".");
    const [isLoading, setIsLoading] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [inputValue, setInputValue] = useState(".");

    const router = useRouter();
    const { story, short } = router.query;
    let recognition;

    useEffect(() => {
        if (
            !("SpeechRecognition" in window) &&
            !("webkitSpeechRecognition" in window)
        ) {
            alert("Browser that does not support Web Speech API.");
            return;
        }
    }, []);

    const toggleListening = () => {
        if (!isClickedMicrophone) {
            setClickedMicrophone(true);
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        setClickedMicrophone(true);
        setIsListening(true);

        recognition =
            new window.webkitSpeechRecognition() ||
            new window.SpeechRecognition();
        recognition.interimResults = false;
        recognition.lang = "ko-KR";

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            setTranscript(result);
            setInputValue(result);
            if (oldtranscript === result) {
                setClickedMicrophone(true);
                console.log(oldtranscript + result + "w");
                setoldTranscript(result);
            } else {
                setClickedMicrophone(false);
                console.log(oldtranscript + result + "s");
                setoldTranscript(result);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const stopListening = () => {
        setClickedMicrophone(false);
        setIsListening(false);

        if (recognition) {
            recognition.stop();
        }
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const subTitleText = isListening
        ? "듣고있어요!"
        : isClickedMicrophone
        ? "다시 말해주시겠어요..?<br/>잘 안들렸어요.."
        : "자신이 원하는 이야기가 맞는지 아닌지 알려주세요!";

    const handleSubmitClick = async () => {
        try {
            setIsLoading(true);
            const inputValue = inputRef.current.value;
            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_ENDPOINT
                }?text=${encodeURIComponent(inputValue)}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            const isp = data.text;
            console.log(inputValue);
            let substring = "긍정";
            if (isp.indexOf(substring) !== -1) {
                router.push({
                    pathname: "/make",
                    query: { story: story },
                });
            } else {
                router.push(`/main`);
            }
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        }
    };

    useEffect(() => {
        const speak = () => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(
                    `${short} 위 이야기로 동화책을 만들어 볼까요?`
                );
                utterance.lang = "ko-KR";
                window.speechSynthesis.speak(utterance);
            } else {
                console.warn("TTS not supported");
            }
        };

        speak();
    }, []);

    return (
        <div>
            <title>VocabVids</title>
            <div className={styles.container}>
                <div className={styles.subcontainer}>
                    <div className={styles.title}>
                        <video controls={false} muted autoPlay>
                            <source src="videos/1.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <video controls={false} muted autoPlay loop>
                        <source src="videos/3.mp4" type="video/mp4" />
                    </video>
                    <div className={styles.info}>
                        <a>
                            {short}
                            <br />위 이야기로 동화책을 만들어 볼까요?
                        </a>
                        {responseText && <p>{responseText}</p>}
                        <br />
                        <br />
                        <a dangerouslySetInnerHTML={{ __html: subTitleText }} />
                    </div>
                    <input
                        className={styles.input}
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <div className={styles.mic}>
                        <img
                            src="../images/voice.png"
                            alt="마이크 버튼"
                            onClick={toggleListening}
                        />
                    </div>
                    <div className={styles["btn"]}>
                        {isLoading ? (
                            <p>로딩중...</p>
                        ) : (
                            <button
                                className={styles["btn-4"]}
                                onClick={handleSubmitClick}
                            >
                                나의 의견을 전달해주기
                            </button>
                        )}
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
