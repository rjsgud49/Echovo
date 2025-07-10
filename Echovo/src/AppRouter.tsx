import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import InterviewPage from './pages/InterviewPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/start" element={<StartPage />} />
                <Route path="/interview" element={<InterviewPage/>} />
                <Route path="/statistics" element={<StatisticsPage/>} />
                <Route path="/settings" element={<SettingsPage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
