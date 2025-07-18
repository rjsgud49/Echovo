import React from 'react';
import type { RecordItem } from '../types/interview';

interface RecordItemListProps {
    grouped: Record<string, RecordItem[]>;
    desiredOrder: string[];
    openCategories: Record<string, boolean>;
    toggleCategory: (category: string) => void;
    onClick: (record: RecordItem) => void;
    selectableIds?: string[];
    onToggleSelect?: (id: string) => void;
}

const RecordItemList: React.FC<RecordItemListProps> = ({
    grouped,
    desiredOrder,
    openCategories,
    toggleCategory,
    onClick,
    selectableIds = [],
    onToggleSelect,
}) => {
    const isExportMode = !!onToggleSelect;

    return (
        <div className="space-y-3">
            {desiredOrder
                .filter((category) => grouped[category])
                .map((category) => {
                    const items = grouped[category];
                    return (
                        <div key={category} className="mb-4">
                            {/* 카테고리 버튼 */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full text-left font-semibold text-blue-500 px-4 py-2 rounded-2xl transition-all bg-white/10 backdrop-blur hover:bg-white/20"
                            >
                                {openCategories[category] ? '📂' : '📁'} {category}
                            </button>

                            {/* 항목 목록 */}
                            {openCategories[category] && (
                                <ul className="mt-2 space-y-2">
                                    {items.map((record) => {
                                        const isSelected = selectableIds.includes(record.id);
                                        const title = record.summary?.trim()
                                            ? record.summary.replace(/"/g, '')
                                            : record.question?.slice(0, 20).replace(/"/g, '') || '질문 없음';

                                        return (
                                            <li
                                                key={record.id}
                                                className={`text-sm px-4 py-3 rounded-2xl transition-all cursor-pointer backdrop-blur font-medium flex items-start gap-2 ${isSelected
                                                        ? 'bg-blue-100 text-blue-600 border border-blue-300'
                                                        : 'bg-white/5 hover:bg-white/20 text-gray-800'
                                                    }`}
                                                onClick={() => {
                                                    if (isExportMode) {
                                                        onToggleSelect?.(record.id);
                                                    } else {
                                                        onClick(record);
                                                    }
                                                }}
                                            >
                                                {isExportMode && (
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1"
                                                        checked={isSelected}
                                                        readOnly
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold truncate">{title}</p>
                                                    {isExportMode && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {record.answer?.slice(0, 12) || '답변 없음'}...
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default RecordItemList;
