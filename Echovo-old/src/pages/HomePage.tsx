import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/start');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
                color: '#333',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: '#00c897',
                }}
            >
                🤖 AI 기술 면접 코치 <strong style={{ color: '#333' }}>Echovo</strong>
            </h1>

            <p
                style={{
                    fontSize: '1.2rem',
                    maxWidth: '700px',
                    marginBottom: '2.5rem',
                    lineHeight: '1.8',
                }}
            >
                AI 기술을 활용해 <strong style={{ color: '#00c897' }}>질문 생성</strong>부터
                <strong style={{ color: '#0077ff' }}> 답변 분석 및 피드백</strong>까지 자동으로 수행합니다.
                <br />
                지금 바로 시작하여 나만의 AI 면접 코치를 만나보세요.
            </p>

            <button
                onClick={handleStart}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    backgroundColor: '#00c897',
                    border: 'none',
                    borderRadius: '30px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0, 200, 151, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 200, 151, 0.3)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 200, 151, 0.2)';
                }}
            >
                면접 시작하기 →
            </button>
        </div>
    );
};

export default HomePage;
