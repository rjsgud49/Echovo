import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

interface Props {
    onSubmit: (field: string, stack: string, old: string) => void;
}

const InputForm = ({ onSubmit }: Props) => {
    const [field, setField] = useState('');
    const [stack, setStack] = useState('');
    const [old, setOld] = useState('');
    const navigate = useNavigate(); // ✅ 훅 사용

    const handleClick = () => {
        localStorage.setItem('interviewUserInfo', JSON.stringify({ field, stack, old }));
        onSubmit(field, stack, old);

        // ✅ 인터뷰 페이지로 이동
        navigate('/interview');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    ✍️ 면접 정보를 입력해주세요
                </h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="면접 분야 (예: 프론트엔드, 백엔드)"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="주 스택 (예: React, Spring)"
                        value={stack}
                        onChange={(e) => setStack(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="경력 (예: 신입, 2년차)"
                        value={old}
                        onChange={(e) => setOld(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        질문 생성 및 시작
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputForm;
