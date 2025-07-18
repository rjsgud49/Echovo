import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputForm from "../components/InputForm";

const StartPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const existing = localStorage.getItem("interviewUserInfo"); // ✅ 키 이름 정확히!
        if (existing) {
            navigate("/interview");
        }
    }, [navigate]);

    const handleSubmit = (field: string, stack: string, old: string) => {
        const data = { field, stack, old };
        localStorage.setItem("interviewUserInfo", JSON.stringify(data)); // ✅ 동일 키로 저장
        navigate("/interview");
    };

    return (
        <div>
            <InputForm onSubmit={handleSubmit} />
        </div>
    );
};

export default StartPage;
