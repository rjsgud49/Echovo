import { useEffect, useState } from 'react';

const InterviewBox = () => {
    const [question, setQuestion] = useState(
        'React에서 함수형 컴포넌트와 클래스형 컴포넌트 중 어떤 것을 주로 선택하시며, 그 선택의 근거는 무엇이었나요? 특정 상황에서 다른 방식을 선택해본 경험이 있다면 그 이유도 함께 말씀해주세요.'
    );
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [liveTranscript, setLiveTranscript] = useState('');

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (recording) {
            timer = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);

            // ✅ 예시: 실시간 텍스트 mock (실제로는 SpeechRecognition 사용)
            setLiveTranscript('말씀하신 내용이 여기에 실시간으로 표시됩니다...');
        } else {
            setSeconds(0);
            setLiveTranscript('');
        }

        return () => clearInterval(timer);
    }, [recording]);

    const toggleRecording = () => {
        setRecording((prev) => !prev);
    };

    const regenerateQuestion = () => {
        setQuestion('새로운 질문이 생성되었습니다.');
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50 text-center space-y-8">
            {/* 질문 */}
            <div className="max-w-4xl">
                <p className="text-lg font-semibold text-gray-900">
                    <span role="img" aria-label="mic">🎤</span>{' '}
                    <strong>질문:</strong> {question}
                </p>
            </div>

            {/* 시작/중지 버튼 */}
            <button
                className={`w-[150px] h-[150px] rounded-full text-white text-xl font-bold shadow-md transition-all duration-300 ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                onClick={toggleRecording}
            >
                {recording ? '중지하기' : '시작하기'}
            </button>

            {/* 조건부 UI */}
            {!recording ? (
                <button
                    onClick={regenerateQuestion}
                    className="mt-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow-md"
                >
                    🔄 다른 질문 요청
                </button>
            ) : (
                <div className="text-gray-700 text-md mt-2 space-y-2">
                    <p>⏱️ 경과 시간: <strong>{seconds}초</strong></p>
                    {liveTranscript && (
                        <p className="text-sm text-gray-600">🎤 <strong>실시간:</strong> {liveTranscript}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewBox;
