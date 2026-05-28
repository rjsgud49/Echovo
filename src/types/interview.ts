// 📌 면접 기록 1건의 구조
export interface RecordItem {
    id: string;
    date: string;
    question: string;
    summary: string;
    answer: string;
    feedback: string;
    modelAnswer: string;
    score?: number;
    duration?: number;
    category?: string;// 👈 이 부분 추가
}

    
// 📊 통계 요약 타입
export interface StatsSummary {
    averageScore: number;
    averageLength: number;
    averageDuration: number;
    totalSessions: number;
}

// 📤 InterviewBox Props
export interface Props {
    field?: string;
    stack?: string;
    onLogUpdated?: () => void;
}

// 🧠 음성 인식 타입
export interface MySpeechRecognition extends SpeechRecognition {
    interimResults: boolean;
}
