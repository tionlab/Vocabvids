import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Load.module.css';
const preloadImages = (paths, onProgress, onComplete) => {
    let loadedCount = 0;
    const images = [];

    const loadImage = (path, index) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            images[index] = img;
            onProgress(loadedCount / paths.length);

            if (loadedCount === paths.length) {
                onComplete(images);
            }
        };
        img.src = path;
    };

    paths.forEach((path, index) => {
        loadImage(path, index);
    });
};
export default function Index() {
    const router = useRouter();
    if (process.browser) {
        setTimeout(function () {
            router.push(`/main`);
        }, 3000);
    }
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);

    useEffect(() => {
        const imagePaths = [
            '/videos/1.mp4',
            '/images/gyesan.png',
            '/images/left.png',
            '/images/right.png',
            '/images/voice.png',
            '/videos/2.mp4',
            '/videos/3.mp4',
        ];

        preloadImages(
            imagePaths,
            (progress) => setLoadingProgress(progress),
            (images) => {
                setLoadingComplete(true);
                console.log('All files preloaded!', images);
            }
        );
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.rcontainer}>
                <title>VocabVids</title>                                
                <video controls={false} muted autoPlay>
                            <source src="videos/1.mp4" type="video/mp4" />
                        </video>
                {loadingComplete ? (
                    <div>
                        <h1>잠시만 기다려 주세요...</h1>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#f0f0f0' }}>
                        <div
                            style={{
                                width: `${loadingProgress * 100}%`,
                                height: '100%',
                                backgroundColor: '#4caf50',
                                transition: 'width 0.2s ease-in-out',
                            }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
}
