// ✅ src/components/Recorder.tsx
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';

// Recorder.tsx
export interface RecorderHandle {
    start: (stream: MediaStream) => void;
    stop: () => void;
}


interface RecorderProps {
    onStop: (blob: Blob) => void;
    maxDuration?: number;
}

const Recorder = forwardRef<RecorderHandle, RecorderProps>(({ onStop, maxDuration = 60 }, ref) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null); // 추가

    const [elapsedTime, setElapsedTime] = useState(0);
    const [recording, setRecording] = useState(false);

    useImperativeHandle(ref, () => ({
        start,
        stop,
    }));

    useEffect(() => {
        if (recording) {
            console.log('⏱️ 타이머 시작');
            intervalRef.current = window.setInterval(() => {
                setElapsedTime((prev) => {
                    if (prev + 1 >= maxDuration) {
                        stop();
                    }
                    return prev + 1;
                });
            }, 1000);

            timerRef.current = window.setTimeout(() => stop(), maxDuration * 1000);
        }

        return () => clearTimers();
    }, [recording]);

    const clearTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const start = async () => {
        if (recording) {
            console.log('⛔ 이미 녹음 중이라 start() 무시됨');
            return;
        }

        console.log('▶️ MediaRecorder start() 호출됨');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            console.log('✅ 마이크 스트림 확보됨', stream);

            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = (e) => {
                console.log('🎙️ 데이터 발생', e.data);
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                console.log('📦 Recorder onstop triggered');
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                console.log('📦 Blob 생성됨:', blob);
                chunksRef.current = [];
                onStop(blob);
                setRecording(false);
                setElapsedTime(0);
            };

            mediaRecorderRef.current = recorder;
            recorder.start(1000); // ✅ 1초마다 ondataavailable 호출
            setRecording(true);
            console.log('🎙️ MediaRecorder 시작됨:', recorder);
        } catch (err) {
            alert('마이크 사용 권한이 필요합니다.');
            console.error('❌ 마이크 에러:', err);
        }
    };



    const stop = () => {
        console.log('🛑 MediaRecorder stop() 호출됨');
        mediaRecorderRef.current?.stop();
        clearTimers();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            console.log('🔌 Recorder 내 마이크 stream 해제 완료');
        }
    };


    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return recording ? (
        <h2 className="text-md text-gray-600 mt-2">
            🎙️ 녹음 중... <strong>{formatTime(elapsedTime)}</strong> / {formatTime(maxDuration)}
        </h2>
    ) : null;
});

export default Recorder;
