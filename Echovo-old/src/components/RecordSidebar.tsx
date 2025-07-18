import React from 'react';
import type { RecordItem } from '../types/interview';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../public/logo.svg';

interface Props {
    records?: RecordItem[];
    onSelect?: (record: RecordItem) => void;
}

const RecordSidebar: React.FC<Props> = ({ records = [], onSelect }) => {
    const navigate = useNavigate();

    const handleClick = (record: RecordItem) => {
        if (onSelect) {
            onSelect(record); // 수동 처리 방식도 가능
        } else {
            navigate('/interview', { state: { record } }); // ✅ state로 전달
        }
    };

    return (
        <aside className="flex flex-col h-screen w-[250px] bg-gray-200 px-4 py-6">
            <div className="flex flex-row items-center justify-center mb-6 gap-2">
                <img src={Logo} alt="로고이미지" className="h-10" />
                <h3 className="text-2xl font-bold text-gray-800">Echovo</h3>
            </div>

            <nav className="flex flex-col items-center space-y-3 mb-6">
                <Link to="/interview" className="text-blue-600 font-semibold hover:underline">면접</Link>
                <Link to="/statistics" className="text-blue-600 font-semibold hover:underline">면접 통계</Link>
                <Link to="/settings" className="text-blue-600 font-semibold hover:underline">설정</Link>
                <Link to="/export" className="text-blue-600 font-semibold hover:underline">출력하기</Link>
            </nav>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {records.length === 0 ? (
                    <p className="text-center text-gray-500">면접 기록이 없습니다</p>
                ) : (
                    <ul className="p-0">
                            <ul className="p-0">
                                {records.map((record) => (
                                    <li
                                        key={record.id}
                                        className="p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-100 list-none"
                                        onClick={() => handleClick(record)}
                                    >
                                        {record.summary?.trim()
                                            ? record.summary.replace(/"/g, '')
                                            : (record.question?.slice(0, 20).replace(/"/g, '') || '질문 없음')}
                                    </li>
                                ))}
                            </ul>

                    </ul>
                )}
            </div>
        </aside>
    );
};

export default RecordSidebar;
