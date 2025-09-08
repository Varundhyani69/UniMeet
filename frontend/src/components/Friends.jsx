import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Friends = ({ userData }) => {
    const [friendList, setFriendList] = useState([]);
    const [friendData, setFriendData] = useState([]);
    const [availableFriends, setAvailableFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [friendTimetablePop, setFriendTimetablePop] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        if (userData?.friends) {
            setFriendList(userData.friends);
        }
    }, [userData]);

    const fetchFriendData = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/getFriends`,
                { withCredentials: true }
            );

            if (res.status === 200 && Array.isArray(res.data.friendData)) {
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
        if (!userData?.timetable || Object.keys(userData.timetable).length === 0)
            return;

        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

        let mySlots = [];

        if (today === "Sunday") {
            mySlots = ["SundayFree"];
        } else if (userData.timetable[today]) {
            mySlots = Object.entries(userData.timetable[today])
                .filter(([time, subject]) => validTime(time) && subject === "No class")
                .map(([time]) => time);
        }

        const matched = friendData
            .map((friend) => {
                let friendSlots = [];

                if (today === "Sunday") {
                    friendSlots = ["SundayFree"];
                } else if (friend.timetable?.[today]) {
                    friendSlots = Object.entries(friend.timetable[today])
                        .filter(([time, subject]) => validTime(time) && subject === "No class")
                        .map(([time]) => time);
                }

                const commonSlots =
                    today === "Sunday"
                        ? ["SundayFree"]
                        : friendSlots.filter((slot) => mySlots.includes(slot));

                return { ...friend, commonSlots };
            })
            .filter((friend) => friend.commonSlots.length > 0)
            .sort((a, b) => {
                if (a.commonSlots[0] === "SundayFree") return -1;
                if (b.commonSlots[0] === "SundayFree") return 1;
                return parseTime(a.commonSlots[0]) - parseTime(b.commonSlots[0]);
            });

        setAvailableFriends(matched);
    }, [friendData, userData]);

    const sendReminder = async (friendId) => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/sendReminder/${friendId}`,
                {},
                { withCredentials: true }
            );

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

    // -------------------------
    // Modal helpers
    const openFriendTimetable = (friend) => {
        setSelectedFriend(friend);
        setFriendTimetablePop(true);
    };

    const closeFriendTimetable = () => {
        setSelectedFriend(null);
        setFriendTimetablePop(false);
    };
    // -------------------------

    // For timetable rendering
    const getSortedSlots = (timetable) => {
        if (!timetable) return [];
        const allDays = Object.keys(timetable);
        const allSlots = new Set();
        allDays.forEach((day) => {
            Object.keys(timetable[day] || {}).forEach((slot) => allSlots.add(slot));
        });
        return [...allSlots].sort((a, b) => parseTime(a) - parseTime(b));
    };

    const getFilteredDays = (timetable) => {
        if (!timetable) return [];
        return Object.keys(timetable);
    };

    return (
        <div className="ml-2 mb-10">
            <div className="mb-8">
                <h1
                    className="text-2xl sm:text-4xl"
                    style={{ fontFamily: '"Keania One", cursive' }}
                >
                    <span>Available &nbsp;</span>
                    <span className="text-[#FEC674]">Friends</span>
                </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableFriends.length > 0 ? (
                    availableFriends.map((friend, i) => (
                        <div
                            key={i}
                            className="w-full h-60 px-4 py-2 rounded-xl bg-[#FEC674] flex flex-col items-center justify-center gap-2 text-center shadow"
                        >
                            <div
                                className="h-20 w-20 rounded-full cursor-pointer"
                                onClick={() => openFriendTimetable(friend)}
                            >
                                <img
                                    src={friend.pfp}
                                    alt="pfp"
                                    className="h-full w-full rounded-full shadow-xl object-cover"
                                />
                            </div>
                            <h4
                                className="font-semibold cursor-pointer"
                                onClick={() => openFriendTimetable(friend)}
                            >
                                {friend.username || "Unknown"}
                            </h4>
                            <h4 className="flex items-center justify-center gap-2">
                                <span>Slot:</span>
                                <span className="text-white font-bold">
                                    {friend.commonSlots[0] === "SundayFree"
                                        ? "Anytime"
                                        : friend.commonSlots[0]}
                                </span>
                            </h4>
                            <h4 className="flex items-center justify-center gap-2">
                                <span>Status:</span>
                                <span className="text-white font-bold">Available</span>
                                <div className="h-2 w-2 rounded-full bg-green-300"></div>
                            </h4>
                            <button
                                onClick={() => sendReminder(friend._id)}
                                className="bg-[#FFF3E2] p-2 rounded-xl cursor-pointer hover:bg-[#fff3e27f] transform hover:scale-105 transition duration-200"
                            >
                                Send Reminder
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center">
                        No friends available at your times today.
                    </p>
                )}
            </div>

            {/* Friend Timetable Modal */}
            {friendTimetablePop && selectedFriend && (
                <>
                    <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full overflow-auto relative">
                            <span
                                onClick={closeFriendTimetable}
                                className="absolute top-2 right-2 text-red-600 cursor-pointer text-2xl"
                            >
                                ×
                            </span>

                            {!selectedFriend.timetable ||
                                Object.keys(selectedFriend.timetable).length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                        {selectedFriend.username} has no timetable.
                                    </h2>
                                    <p className="text-gray-600">
                                        No timetable data available for this user.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-lg font-semibold text-center text-gray-700 mb-4 p-2 bg-white/50 rounded-t-lg">
                                        {selectedFriend.username}'s Weekly Overview
                                    </h4>
                                    <div className="max-h-[65vh] overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                            <thead className="bg-[#FFF3E2] text-gray-800 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                                                        Time / Day
                                                    </th>
                                                    {getFilteredDays(selectedFriend.timetable).map((day) => (
                                                        <th
                                                            key={day}
                                                            className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider"
                                                        >
                                                            {day}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {getSortedSlots(selectedFriend.timetable).map(
                                                    (timeSlot, index) => (
                                                        <tr
                                                            key={timeSlot}
                                                            className={
                                                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                            }
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-white/70">
                                                                {timeSlot}
                                                            </td>
                                                            {getFilteredDays(selectedFriend.timetable).map(
                                                                (day) => {
                                                                    const currentClass =
                                                                        selectedFriend.timetable[day]?.[timeSlot] ||
                                                                        "No class";
                                                                    const isNoClass = currentClass === "No class";

                                                                    return (
                                                                        <td
                                                                            key={`${day}-${timeSlot}`}
                                                                            className={`px-2 py-3 text-sm ${isNoClass
                                                                                    ? "text-gray-500 italic bg-gray-100/50"
                                                                                    : "text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200"
                                                                                }`}
                                                                        >
                                                                            {currentClass}
                                                                        </td>
                                                                    );
                                                                }
                                                            )}
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Friends;
