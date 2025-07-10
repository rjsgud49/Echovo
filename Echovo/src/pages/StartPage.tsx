import InputForm from "../components/InputForm";

const StartPage = () => {
    const handleSubmit = (field: string, stack: string, old: string) => {
        console.log("입력된 정보:", field, stack, old);
    };

    return (
        <div>
            <InputForm onSubmit={handleSubmit} />
        </div>
    );
};

export default StartPage;
