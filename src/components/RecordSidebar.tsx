import React, { useState } from 'react';
import type { RecordItem } from '../types/interview';
import { NavLink,  } from 'react-router-dom';
import Logo from '../../public/logo.svg';
import RecordItemList from './RecordItemList';

interface Props {
    records?: RecordItem[];
    onSelect?: (record: RecordItem) => void;
}

const RecordSidebar: React.FC<Props> = ({ records = [], onSelect }) => {
    

    const inferCategory = (text: string): string => {
        const lower = text.toLowerCase();
        if (/react|typescript|javascript|html|css|frontend|리액트|margin/.test(lower)) return '프론트엔드';
        if (/node|express|mysql|api|backend|spring|Spring|SpringBoot|db/.test(lower)) return '백엔드';
        if (/ai|gpt|openai|whisper|model/.test(lower)) return 'AI';
        return '기타';
    };

    const grouped = records.reduce((acc, record) => {
        const category = record.category || inferCategory(`${record.question} ${record.summary}`);
        if (!acc[category]) acc[category] = [];
        acc[category].push(record);
        return acc;
    }, {} as Record<string, RecordItem[]>);

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        for (const category in grouped) {
            initialState[category] = true; // 기본 열림 상태
        }
        return initialState;
    });

    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleClick = (record: RecordItem) => {
        if (onSelect) {
            onSelect(record);
        }
    };

    const desiredOrder = ['프론트엔드', '백엔드', 'AI', '기타'];


        return (
            <aside className="flex flex-col h-screen w-[230px] px-4 py-6 
      bg-white/5 border-r border-white/20 backdrop-blur-md text-gray-800">

                {/* 로고 */}
                <div className="flex flex-row items-center justify-center mb-6 gap-2">
                    <img src={Logo} alt="로고이미지" className="h-10" />
                    <h3 className="text-2xl font-bold text-gray-800">Echovo</h3>
                </div>


                {/* 메뉴 */}
                <nav className="flex flex-col space-y-3">
                    <NavLink
                        to="/interview"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-2xl transition-all backdrop-blur-sm font-medium ${isActive
                                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                                : 'hover:bg-white/20 hover:scale-[1.02] text-gray-800'
                            }`
                        }
                    >
                        면접
                    </NavLink>

                    <NavLink
                        to="/statistics"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-2xl transition-all backdrop-blur-sm font-medium ${isActive
                                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                                : 'hover:bg-white/20 hover:scale-[1.02] text-gray-800'
                            }`
                        }
                    >
                        면접 통계
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-2xl transition-all backdrop-blur-sm font-medium ${isActive
                                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                                : 'hover:bg-white/20 hover:scale-[1.02] text-gray-800'
                            }`
                        }
                    >
                        설정
                    </NavLink>

                    <NavLink
                        to="/export"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-2xl transition-all backdrop-blur-sm font-medium ${isActive
                                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                                : 'hover:bg-white/20 hover:scale-[1.02] text-gray-800'
                            }`
                        }
                    >
                        출력하기
                    </NavLink>
                </nav>

                <div className="flex-grow overflow-y-scroll mt-2.5 bg-gray-170 w-[200px] rounded-sm custom-scrollbar">
                {records.length === 0 ? (
                    <p className="text-center text-gray-500">면접 기록이 없습니다</p>
                ) : (
                    <div className="space-y-3">
                                <RecordItemList
                                grouped={grouped}
                                desiredOrder={desiredOrder}
                                openCategories={openCategories}
                                toggleCategory={toggleCategory}
                                onClick={handleClick}
                                />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default RecordSidebar;
