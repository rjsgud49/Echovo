import React, { useEffect, useRef, useState } from 'react';
import Recorder from './Recorder';
import type { RecorderHandle } from './Recorder';
import { generateQuestion, getScoredFeedback, transcribeAudio, summarizeQuestion } from '../utils/openai';
import type { RecordItem, Props } from '../types/interview';

const InterviewBox: React.FC<Props> = ({ field: propField, stack: propStack, onLogUpdated }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [modelAnswer, setModelAnswer] = useState('');
    const [liveTranscript, setLiveTranscript] = useState('');
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [questionReady, setQuestionReady] = useState(false);

    const recorderRef = useRef<RecorderHandle>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const recordingDurationRef = useRef<number>(0);

    const [field, setField] = useState('');
    const [stack, setStack] = useState('');

    useEffect(() => {
        const setup = async () => {
            let f = propField;
            let s = propStack;
            if (!f || !s) {
                const saved = localStorage.getItem('interviewUserInfo');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    f = parsed.field;
                    s = parsed.stack;
                }
            }
            setField(f ?? '');
            setStack(s ?? '');

            if (f && s) {
                const q = await generateQuestion(f, s);
                setQuestion(q);
                setQuestionReady(true);
            }
        };
        setup();
    }, [propField, propStack]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (recording) {
            timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(timer);
    }, [recording]);

    const startSpeechRecognition = () => {
        const SpeechRecognitionConstructor =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionConstructor) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }

        const recognition = new (SpeechRecognitionConstructor as unknown as new () => SpeechRecognition)();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let text = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (!event.results[i].isFinal) {
                    text += event.results[i][0].transcript;
                }
            }
            console.log('🎤 실시간 인식:', text);
            setLiveTranscript(text);
        };

        recognition.onend = () => recognition.start();

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopSpeechRecognition = () => {
        recognitionRef.current?.stop();
        recognitionRef.current = null;
    };

    const startRecording = () => {
        console.log('▶️ 녹음 시작');
        startTimeRef.current = Date.now();
        setRecording(true);
        setAnswer('');
        setFeedback('');
        setModelAnswer('');
        setLiveTranscript('');
        startSpeechRecognition();
        recorderRef.current?.start();
    };

    const stopRecording = () => {
        console.log('⏹️ 녹음 중지');
        recorderRef.current?.stop();
        stopSpeechRecognition();
        setRecording(false);
        if (startTimeRef.current) {
            recordingDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
        }
    };

    const handleRecordingStop = async (blob: Blob) => {
        console.log('📦 handleRecordingStop triggered');
        setIsSaving(true);
        const transcript = await transcribeAudio(blob);
        const summary = await summarizeQuestion(question);
        const { feedback: fb, score, modelAnswer: example } = await getScoredFeedback(question, transcript);

        if (!transcript?.trim() || !fb?.trim()) {
            setIsSaving(false);
            return;
        }

        const prev = JSON.parse(localStorage.getItem('interviewLogs') || '[]') as RecordItem[];
        const alreadyExists = prev.some((log) => log.question === question);
        if (alreadyExists) {
            setIsDuplicate(true);
            setIsSaving(false);
            return;
        }

        const record: RecordItem = {
            id: Date.now().toString(),
            date: new Date().toLocaleString('ko-KR', { hour12: false }),
            question,
            summary,
            answer: transcript,
            feedback: fb,
            score,
            duration: recordingDurationRef.current,
        };

        try {
            localStorage.setItem('interviewLogs', JSON.stringify([record, ...prev]));
            onLogUpdated?.();
        } catch (e) {
            console.error('❌ 저장 실패:', e);
        }

        setAnswer(transcript);
        setFeedback(fb);
        setModelAnswer(example);
        setLiveTranscript('');
        setIsSaving(false);
        setIsDuplicate(true);
    };

    const regenerateQuestion = async () => {
        setQuestionReady(false);
        setIsDuplicate(false);
        setAnswer('');
        setFeedback('');
        setModelAnswer('');
        setLiveTranscript('');
        const q = await generateQuestion(field, stack);
        setQuestion(q);
        setQuestionReady(true);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50 text-center space-y-8">
            <div className="max-w-3xl">
                <p className="text-lg font-semibold text-gray-900">
                    🎤 <strong>질문:</strong> {question}
                </p>
            </div>

            <button
                className={`w-[150px] h-[150px] rounded-full text-white text-xl font-bold shadow transition ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={!questionReady || isSaving}
            >
                {recording ? '중지하기' : '시작하기'}
            </button>

            {recording && (
                <div className="text-gray-700 space-y-2">
                    <p>⏱️ 경과 시간: <strong>{seconds}초</strong></p>
                    {liveTranscript && (
                        <p className="text-sm text-gray-600">🎤 <strong>실시간:</strong> {liveTranscript}</p>
                    )}
                </div>
            )}

            {!recording && isDuplicate && (
                <button
                    onClick={regenerateQuestion}
                    className="mt-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow"
                >
                    🔄 다음 질문 요청
                </button>
            )}

            <div className="text-left max-w-3xl space-y-4 mt-8">
                {answer && <p><strong>📝 내 답변:</strong> {answer}</p>}
                {feedback && <p><strong>💡 피드백:</strong> {feedback}</p>}
                {modelAnswer && <p><strong>📘 모범답안:</strong> {modelAnswer}</p>}
            </div>

            <Recorder ref={recorderRef} onStop={handleRecordingStop} maxDuration={60} />
        </div>
    );
};

export default InterviewBox;
