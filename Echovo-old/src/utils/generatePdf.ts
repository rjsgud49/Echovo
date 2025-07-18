import jsPDF from 'jspdf';
import font from '../fonts/NanumGothic'; // base64 encoded .ttf
import type { RecordItem } from '../types/interview';

export const generatePdf = (record: RecordItem) => {
    const doc = new jsPDF();

    // 🔐 폰트 등록 (이벤트 푸시 말고 직접)
    doc.addFileToVFS('NanumGothic.ttf', font);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.setFont('NanumGothic');

    doc.setFontSize(12);
    doc.text(`📝 질문`, 10, 20);
    doc.text(record.question || '', 10, 30);
    doc.text(`✍️ 답변`, 10, 50);
    doc.text(`📊 점수: ${record.score ?? '-'}`, 10, 80);
    doc.text(`💬 피드백: ${record.feedback ?? '-'}`, 10, 90);
    doc.save(`interview_${record.id}.pdf`);
};
