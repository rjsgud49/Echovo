import React, { useEffect, useRef, useState } from 'react';
import Recorder from './Recorder';
import type { RecorderHandle } from './Recorder';
import { generateQuestion, getScoredFeedback, transcribeAudio, summarizeQuestion } from '../utils/openai';
import type { RecordItem, Props } from '../types/interview';
import {MessageCircle } from 'lucide-react';

const InterviewBox: React.FC<Props> = ({ field: propField, stack: propStack, onLogUpdated }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [modelAnswer, setModelAnswer] = useState('');
    const [liveTranscript, setLiveTranscript] = useState('');
    const [recording, setRecording] = useState(false);
    // const [seconds, setSeconds] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [questionReady, setQuestionReady] = useState(false);

    const [field, setField] = useState('');
    const [stack, setStack] = useState('');

    const recorderRef = useRef<RecorderHandle>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isRecognitionStoppedByUser = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const recordingDurationRef = useRef<number>(0);

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

    // useEffect(() => {
    //     let timer: ReturnType<typeof setInterval>;
    //     if (recording) {
    //         timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    //     } else {
    //         setSeconds(0);
    //     }
    //     return () => clearInterval(timer);
    // }, [recording]);

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
            setLiveTranscript(text);
        };

        recognition.onend = () => {
            if (!isRecognitionStoppedByUser.current) {
                recognition.start(); // 자동 재시작 (수동 중지 아닐 때만)
            } else {
                console.log('🎤 사용자가 음성 인식을 수동으로 중지했기 때문에 재시작하지 않음');
            }
        };

        recognition.onerror = (event) => {
            console.error('🎤 음성 인식 오류:', event.error);
        };

        isRecognitionStoppedByUser.current = false; // 자동 재시작 허용
        recognitionRef.current = recognition;
        recognition.start();
    };

    // stop 함수
    const stopSpeechRecognition = () => {
        isRecognitionStoppedByUser.current = true;
        if (recognitionRef.current) {
            recognitionRef.current.stop(); // 일단 정지 요청만 함
            // recognitionRef.current = null; ❌ 여기서 지우지 말고...
        }
    };

    if (recognitionRef.current) {
        recognitionRef.current.onend = () => {
            if (!isRecognitionStoppedByUser.current) {
                recognitionRef.current?.start(); // 안전하게 재시작
            } else {
                recognitionRef.current = null;
            }
        };
    }






    const startRecording = async () => {
        console.log('▶️ 녹음 시작');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const track = stream.getAudioTracks()[0];
            if (!track) {
                alert('마이크 장치가 올바르게 연결되지 않았습니다.');
                return;
            }

            startSpeechRecognition();

            recorderRef.current?.start(stream);
            startTimeRef.current = Date.now();
            setRecording(true);
            setAnswer('');
            setFeedback('');
            setModelAnswer('');
            setLiveTranscript('');
        } catch (err) {
            console.error('🎙️ 마이크 접근 오류:', err);
            alert('마이크를 사용할 수 없습니다.');
        }
    };

    const stopRecording = () => {
        console.log('⏹️ 녹음 중지');
        recorderRef.current?.stop();
        stopSpeechRecognition();
        setRecording(false);

        if (startTimeRef.current) {
            recordingDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            console.log('🔌 마이크 stream 해제 완료');
        }
    };

    const handleRecordingStop = async (blob: Blob) => {
        console.log('📦 handleRecordingStop triggered');
        setIsSaving(true);
        const transcript = await transcribeAudio(blob);
        const summary = await summarizeQuestion(question);
        const { feedback: fb, score, modelAnswer: example } = await getScoredFeedback(question, transcript, field);
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
            modelAnswer: example,
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 max-w-4xl min-w-4xl w-full mx-auto">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2"></h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {questionReady && question?.trim()
                                ? question
                                : '⏳ 질문을 준비 중입니다...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 녹음 버튼은 질문 준비 완료 && 중복 질문 아님 && 피드백 생성 중 아님일 때만 */}
            {questionReady && !isDuplicate && !isSaving && (
                <button
                    className={`w-[150px] h-[150px] rounded-full text-white text-xl font-bold shadow transition ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={recording ? stopRecording : startRecording}
                    disabled={answer !== ''}
                >
                    {recording ? '중지하기' : '시작하기'}
                </button>
            )}

            {/* 질문 준비 중이거나 피드백 생성 중일 때 메시지 출력 */}
            {(!questionReady || isSaving) && (
                <h2 className="text-sm text-gray-500">
                    {!questionReady
                        ? ''
                        : isSaving
                            ? '💭 피드백 생성 중입니다. 잠시만 기다려주세요...'
                            : ''}
                </h2>
            )}

            {recording && (
                <div className="text-gray-700 space-y-2">
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
