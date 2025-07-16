// generatePdf.ts
import jsPDF from 'jspdf';
import font from '../fonts/NanumGothic.js'; // base64 font import
import type { RecordItem } from '../types/interview';

jsPDF.API.events.push(['addFonts', () => {
    jsPDF.API.addFileToVFS('NanumGothic.ttf', font);
    jsPDF.API.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
}]);

export const generatePdf = (record: RecordItem) => {
    const doc = new jsPDF();
    doc.setFont('NanumGothic');
    doc.setFontSize(12);
    doc.text(`📝 질문`, 10, 20);
    doc.text(record.question || '', 10, 30);
    doc.text(`✍️ 답변`, 10, 50);
    doc.text(record.answer || '', 10, 60);
    doc.text(`📊 점수: ${record.score ?? '-'}`, 10, 80);
    doc.text(`💬 피드백: ${record.feedback ?? '-'}`, 10, 90);
    doc.save(`interview_${record.id}.pdf`);
};
