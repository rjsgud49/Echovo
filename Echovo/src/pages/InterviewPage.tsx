import RecordSidebar from '../components/RecordSidebar';
import InterviewBox from '../components/InterviewBox';

const InterviewPage = () => {
    const saved = localStorage.getItem('interviewUserInfo');
    const userInfo = saved ? JSON.parse(saved) : { field: '', stack: '' };

    return (
        <div className="flex h-screen">
            <RecordSidebar />
            <div className="flex-grow p-6 overflow-y-auto bg-white">
                <InterviewBox
                    field={userInfo.field}
                    stack={userInfo.stack}
                />
            </div>
        </div>
    );
};
export default InterviewPage;