import React, { useRef, useState } from 'react';

interface ISpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

declare global {
    interface Window {
        webkitSpeechRecognition: SpeechRecognitionConstructor;
        SpeechRecognition: SpeechRecognitionConstructor;
    }
}
const MicTestWithSTT: React.FC = () => {
    const [testing, setTesting] = useState(false);
    const [volume, setVolume] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [transcriptVisible, setTranscriptVisible] = useState(false);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);






    
    const startTest = async () => {
        console.log('🎬 [1] startTest() 호출됨');

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                alert('이 브라우저는 마이크를 지원하지 않습니다.');
                console.error('❌ getUserMedia 지원되지 않음');
                return;
            }

            const micPermission = await navigator.permissions?.query?.({ name: 'microphone' as PermissionName });
            console.log('🔐 마이크 권한 상태:', micPermission?.state);

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputDevices = devices.filter((d) => d.kind === 'audioinput');
            console.log('🎤 감지된 마이크 장치 목록:', audioInputDevices);

            if (audioInputDevices.length === 0) {
                alert('마이크 장치가 감지되지 않았습니다.');
                return;
            }

            console.log('🛎️ [2] getUserMedia 요청 시작...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            console.log('✅ [3] 마이크 스트림 획득 성공:', stream);

            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) {
                alert('마이크 트랙이 존재하지 않습니다.');
                return;
            }

            const audioCtx = new AudioContext();
            await audioCtx.resume();
            console.log('🎧 [4] AudioContext 생성 완료');

            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);
            console.log('🔗 [5] Audio 파이프 연결 완료');

            const animate = () => {
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setVolume(avg);
                animationRef.current = requestAnimationFrame(animate);
            };
            animate();
            console.log('📊 [6] 애니메이션 시작됨');

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
                console.error('❌ [7] SpeechRecognition 미지원');
                return;
            }

            console.log('✅ [7] SpeechRecognition 생성됨');
            const recognition = new SpeechRecognition();
            recognition.lang = 'ko-KR';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const result = Array.from(event.results).map((r) => r[0].transcript).join('');
                console.log('🗣️ [8] 음성 인식 결과:', result);
                setTranscript(result);
            };

            recognition.onerror = (e) => {
                console.error('❌ [9] SpeechRecognition 에러 발생:', e);
                alert('음성 인식 중 오류가 발생했습니다.');
            };

            recognition.onstart = () => {
                console.log('🎤 [10] SpeechRecognition 시작됨');
            };

            recognition.onend = () => {
                console.log('🛑 [11] SpeechRecognition 종료됨');
            };

            console.log('🚦 [12] SpeechRecognition.start() 호출');
            recognition.start();
            recognitionRef.current = recognition;
            console.log('🟢 [13] SpeechRecognition 인스턴스 시작 요청 완료');

            setTranscriptVisible(true);
            setTesting(true);
            console.log('🏁 [14] 상태 업데이트 완료: testing = true');
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error('❌ [E] 예외 발생:', err.message);
                if (err.name === 'NotAllowedError') {
                    alert('마이크 권한이 차단되었습니다.');
                } else if (err.name === 'NotFoundError') {
                    alert('마이크 장치가 감지되지 않았습니다.');
                } else {
                    alert('마이크 접근 중 알 수 없는 오류가 발생했습니다.');
                }
            } else {
                console.error('❓ 알 수 없는 오류 객체:', err);
                alert('예기치 않은 오류가 발생했습니다.');
            }
        }
    };

    const stopTest = () => {
        console.log('⛔ stopTest() 호출됨');

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
            console.log('🛑 애니메이션 중단됨');
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            console.log('🎧 AudioContext 종료됨');
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            console.log('🛑 SpeechRecognition 중단됨');
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            console.log('🔌 MediaStream 트랙 중단됨');
        }

        setTesting(false);
        setVolume(0);
        setTranscript('');
        setTranscriptVisible(false);
        console.log('🔁 상태 초기화 완료');
    };

    return (
        <div className="flex flex-col items-center bg-white rounded shadow p-6 w-full">
            <p className="text-sm text-gray-600 mb-4">
                마이크에 대고 아무 말이나 해보세요. 텍스트로 인식됩니다!
            </p>

            <button
                onClick={testing ? stopTest : startTest}
                className={`mb-6 px-6 py-2 rounded text-white font-semibold shadow ${testing
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    }`}
            >
                {testing ? '테스트 정지하기' : '확인하기'}
            </button>

            <div className="flex items-end h-24 gap-[2px] mb-6">
                {Array.from({ length: 32 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-[4px] transition-all duration-100"
                        style={{
                            height: `${Math.max(10, volume - i * 2)}px`,
                            backgroundColor:
                                volume > i * 2
                                    ? `hsl(${50 + i * 3}, 100%, 60%)`
                                    : '#ccc',
                        }}
                    />
                ))}
            </div>

            {testing && (
                <p className="text-sm text-blue-600 mb-2">
                    🎧 음성을 듣고 텍스트로 변환 중입니다...
                </p>
            )}

            {transcriptVisible && transcript && (
                <div className="w-full max-w-lg bg-gray-100 rounded p-4 text-left text-sm text-gray-800">
                    <p className="font-semibold mb-2">📝 인식된 텍스트:</p>
                    <div className="whitespace-pre-wrap">{transcript}</div>
                </div>
            )}
        </div>
    );
};

export default MicTestWithSTT;
