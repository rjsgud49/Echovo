import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecordItem } from '../types/interview';
import Logo from '../../public/logo.svg';

interface PdfSidebarListProps {
    records: RecordItem[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
}

const PdfSidebarList: React.FC<PdfSidebarListProps> = ({
    records,
    selectedIds,
    onToggleSelect,
}) => {
    const navigate = useNavigate();

    return (
        <aside className="flex flex-col h-screen w-[250px] bg-gray-200 px-4 py-6">
            {/* 로고 영역 */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <img src={Logo} alt="로고" className="h-10" />
                <h3 className="text-2xl font-bold text-gray-800">Echovo</h3>
            </div>

            {/* 뒤로가기 */}
            <button
                onClick={() => navigate(-1)}
                className="text-blue-600 font-semibold hover:underline mb-6"
            >
                ← 뒤로가기
            </button>

            {/* 기록 리스트 */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {records.length === 0 ? (
                    <p className="text-center text-gray-500">면접 기록이 없습니다</p>
                ) : (
                    <ul className="space-y-2 p-0">
                        {records.map((record) => {
                            const isSelected = selectedIds.includes(record.id);
                            const title = record.summary?.trim()
                                ? record.summary.replace(/"/g, '')
                                : record.question?.slice(0, 20).replace(/"/g, '') || '질문 없음';

                            return (
                                <li
                                    key={record.id}
                                    className={`p-3 rounded-md list-none cursor-pointer border border-gray-300 hover:bg-blue-100 ${isSelected ? 'bg-blue-200 border-blue-400' : 'bg-white'
                                        }`}
                                >
                                    <label className="flex items-start gap-2 cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(record.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold truncate">{title}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {record.answer?.slice(0, 12) || '답변 없음'}...
                                            </p>
                                        </div>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default PdfSidebarList;
