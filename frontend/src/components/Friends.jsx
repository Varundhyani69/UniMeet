import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
const Friends = ({ userData }) => {
    const [friendList, setFriendList] = useState([]);
    const [friendData, setFriendData] = useState([]);
    const [availableFriends, setAvailableFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (userData?.friends) {
            setFriendList(userData.friends);
        }
    }, [userData]);

    const fetchFriendData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getFriends`, {
                withCredentials: true
            });

            if (res.status === 200 && Array.isArray(res.data.friendData)) {
                console.log("Friend data fetched:", res.data.friendData);
                setFriendData(res.data.friendData);
            }
        } catch (error) {
            console.error("Send req error:", error.message);
        }
    };


    useEffect(() => {
        if (userData?._id) {
            fetchFriendData();
        }
    }, [userData]);

    const parseTime = (time) => {
        const [range, meridian] = time.split(" ");
        const [startHourStr] = range.split("-");
        let hour = parseInt(startHourStr);
        if (meridian === "PM" && hour !== 12) hour += 12;
        if (meridian === "AM" && hour === 12) hour = 0;
        return hour;
    };

    const validTime = (time) => {
        const hour = parseTime(time);
        return hour >= 9 && hour < 17;
    };

    useEffect(() => {

        if (!userData?.timetable || Object.keys(userData.timetable).length === 0) return;

        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

        let mySlots = [];

        if (today === 'Sunday') {
            mySlots = ['SundayFree'];
        } else if (userData.timetable[today]) {
            mySlots = Object.entries(userData.timetable[today])
                .filter(([time, subject]) => validTime(time) && subject === "No class")
                .map(([time]) => time);
        }
        console.log(friendData);
        const matched = friendData
            .map(friend => {
                let friendSlots = [];

                if (today === 'Sunday') {
                    friendSlots = ['SundayFree'];
                } else if (friend.timetable?.[today]) {
                    friendSlots = Object.entries(friend.timetable[today])
                        .filter(([time, subject]) => validTime(time) && subject === "No class")
                        .map(([time]) => time);
                }

                const commonSlots = today === 'Sunday'
                    ? ['SundayFree']
                    : friendSlots.filter(slot => mySlots.includes(slot));

                return { ...friend, commonSlots };
            })
            .filter(friend => friend.commonSlots.length > 0)
            .sort((a, b) => {
                if (a.commonSlots[0] === 'SundayFree') return -1;
                if (b.commonSlots[0] === 'SundayFree') return 1;
                return parseTime(a.commonSlots[0]) - parseTime(b.commonSlots[0]);
            });

        setAvailableFriends(matched);
    }, [friendData, userData]);
    const sendReminder = async (friendId) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/sendReminder/${friendId}`, {}, {
                withCredentials: true
            });

            if (res.status === 200) {
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(err.response.data.message);
            console.error("Send reminder failed:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='ml-2 mb-10'>
            <div className='mb-8'>
                <h1 className='text-2xl sm:text-4xl' style={{ fontFamily: '"Keania One", cursive' }}>
                    <span>Available &nbsp;</span>
                    <span className='text-[#FEC674]'>Friends</span>
                </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableFriends.length > 0 ? (
                    availableFriends.map((friend, i) => (
                        <div
                            key={i}
                            className="w-full h-60 sm:w-45 px-4 py-2 rounded-xl bg-[#FEC674] flex flex-col items-center justify-center gap-2 text-center shadow"
                        >
                            <div className="h-20 w-20 rounded-full">
                                <img src={friend.pfp} alt="pfp" className='h-full w-full rounded-full shadow-xl object-cover' />
                            </div>
                            <h4 className="font-semibold">{friend.username || 'Unknown'}</h4>
                            <h4 className='flex items-center justify-center gap-2'>
                                <span>Slot:</span>
                                <span className='text-white font-bold'>
                                    {friend.commonSlots[0] === 'SundayFree' ? 'Anytime' : friend.commonSlots[0]}
                                </span>
                            </h4>
                            <h4 className='flex items-center justify-center gap-2'>
                                <span>Status:</span>
                                <span className='text-white font-bold'>Available</span>
                                <div className='h-2 w-2 rounded-full bg-green-300'></div>
                            </h4>
                            <button onClick={() => sendReminder(friend._id)} className="bg-[#FFF3E2] p-2 rounded-xl cursor-pointer hover:bg-[#fff3e27f] transform hover:scale-105 transition duration-200">


                                Send Reminder
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center">No friends available at your times today.</p>
                )}
            </div>
        </div>
    );
};

export default Friends;
