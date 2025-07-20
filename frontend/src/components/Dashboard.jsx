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
                const res = await axios.get('http://localhost:8080/api/user/getUserDetails', { withCredentials: true })
                if (res.data.success) {
                    setUserData(res.data.user);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, [])
    useEffect(() => {
        console.log("Updated user data:", userData);
    }, [userData]);
    const [selected, setSelected] = useState("dashboard");
    return (
        <div className="min-h-screen bg-[#FFF3E2] px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-4 relative z-1">
                    <Navbar userData={userData} />
                </div>
                <div>
                    {selected === 'dashboard' && <Home userData={userData} />}
                    {selected === 'profile' && <ProfilePage userData={userData} />}
                    {selected === 'chat' && <ChatPage userData={userData} />}
                </div>
                <div>
                    <Navigator selected={selected} setSelected={setSelected} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
