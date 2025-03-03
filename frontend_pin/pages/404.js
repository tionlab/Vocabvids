import styles from '../styles/404.module.css';
import { useRouter } from 'next/router';

export default function Custom404() {
    const router = useRouter();
    const goHome = () => {
        router.back();
    };
    return (
        <div className={styles.container}>
            <title>?</title>
            <img className={styles.img} src="/images/gyesan.png" />
            <h1 className={styles.title}>오류가 발생하였습니다.</h1>
            <p className={styles.description}>404 Error</p>
            <button className={styles['button-55']} onClick={goHome}>
                돌아가기
            </button>
        </div>
    );
}
