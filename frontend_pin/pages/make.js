import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Make.module.css";

export default function Main() {
    const router = useRouter();
    const [datapin, setDatapin] = useState(null);

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
                    process.env.NEXT_PUBLIC_API_ENDPOINT4,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    }
                );
                if (!responsepy.ok) {
                    throw new Error("Failed to fetch data");
                }
                const datapy = await responsepy.json();
                const datapined = datapy.pass;
                console.log(datapined);
                setDatapin(datapined);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, []);
    const goHome = () => {
        router.push("/main");
    };

    function copyToClipboard() {
        const codeBox = document.getElementById("codeBox");
        const textArea = document.createElement("textarea");
        textArea.value = codeBox.innerText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(
            textArea.value +
                "가 복사되었어요!\nVocabVids 비디오 메이커 프로그램에 입력해주세요!"
        );
    }

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

                    {datapin ? (
                        <div>
                            <h1>
                                VocabVids 비디오 메이커 프로그램에
                                <br />
                                아래 번호를 입력해주세요!
                            </h1>
                            <div className={styles.code} id="codeBox">
                                {datapin}
                            </div>
                            <br />
                            <button
                                className={styles.copy}
                                onClick={copyToClipboard}
                            >
                                복사하기
                            </button>
                            <br />
                            <br />
                            <button
                                className={styles["button-55"]}
                                onClick={goHome}
                            >
                                처음 화면으로 돌아가기
                            </button>
                            <br />
                            <br />
                        </div>
                    ) : (
                        <a>동화책을 만들고 있어요! 잠시만 기다려주세요...</a>
                    )}

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
            </div>
            <div className={styles.blank}>
                <a>&nbsp;</a>
            </div>
        </div>
    );
}
