export interface RecordItem {
    id: string;
    date: string;
    question: string;
    summary: string;
    answer: string;
    feedback: string;
    score?: number;
    duration?: number;
}


export interface StatsSummary {
    averageScore: number;
    averageLength: number;
    averageDuration: number;
    totalSessions: number;
}
