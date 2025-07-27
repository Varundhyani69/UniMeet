import Navbar from './Navbar';
import Home from './Home';
import Navigator from './Navigator';
import ProfilePage from './ProfilePage';
import { useEffect, useState } from 'react';
import ChatPage from './ChatPage';
import axios from 'axios';
const Dashboard = () => {
    const [userData, setUserData] = useState({});
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getUserDetails`, { withCredentials: true })
                if (res.data.success) {
                    setUserData(res.data.user);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, [])

    const [selected, setSelected] = useState("dashboard");
    const [showNavigator, setShowNavigator] = useState(true);
    let lastScrollY = window.scrollY;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < lastScrollY) {
                setShowNavigator(false);
            } else {
                setShowNavigator(true);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF3E2] px-2 sm:px-4 py-4 sm:py-8">
            <div className="max-w-5xl mx-auto flex flex-col gap-4">
                <div className="relative z-10">
                    <Navbar userData={userData} />
                </div>

                <div className="flex-1 overflow-hidden mb-2">
                    {selected === 'dashboard' && <Home userData={userData} />}
                    {selected === 'profile' && <ProfilePage userData={userData} />}
                    {selected === 'chat' && <ChatPage userData={userData} />}
                </div>

                <div
                    className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ${showNavigator ? 'translate-y-0' : 'translate-y-full'
                        }`}
                >
                    <Navigator selected={selected} setSelected={setSelected} />
                </div>

            </div>
        </div>
    );

};

export default Dashboard;
