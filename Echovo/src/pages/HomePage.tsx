import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/start');
    };

    return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                🤖 AI 기술 면접 코치, <strong>Echovo</strong>
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#555' }}>
                최신 AI 기술을 활용하여 당신의 기술 면접을 연습하고, 즉각적인 피드백을 받아보세요.<br />
                질문 생성부터 답변 평가까지, 모두 자동으로 진행됩니다.
            </p>
            <button
                style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onClick={handleStart}
            >
                면접 시작하기 →
            </button>
        </div>
    );
};

export default HomePage;
