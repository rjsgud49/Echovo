import RecordSidebar from '../components/RecordSidebar';
import InterviewBox from '../components/InterviewBox';

const InterviewPage = () => {
    return (
        <div className="flex h-screen">
            <RecordSidebar />
            <div className="flex-grow p-6 overflow-y-auto bg-white">
                <InterviewBox />
            </div>
        </div>
    );
};

export default InterviewPage;
