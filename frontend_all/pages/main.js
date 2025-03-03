import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Main.module.css";

export default function Main() {
    const inputRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isClickedMicrophone, setClickedMicrophone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oldtranscript, setoldTranscript] = useState(".");
    const [transcript, setTranscript] = useState(".");
    const [inputValue, setInputValue] = useState(".");

    const router = useRouter();
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
        : "아래 입력창 또는 마이크 버튼을<br/>눌러서 시작하세요!";

    const handleSubmitClick = async () => {
        try {
            setIsLoading(true);
            const inputValue = inputRef.current.value;
            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_ENDPOINT2
                }?text=${encodeURIComponent(inputValue)}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            const story = data.story;
            const short = data.short;
            console.log(inputValue);
            router.push({
                pathname: "/isyes",
                query: { value: inputValue, story: story, short: short },
            });
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        }
    };

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
                        <a>나만의 독창적인 이야기를 만들어 보세요!</a>
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
                                disabled={isLoading}
                            >
                                현실화 하기
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
