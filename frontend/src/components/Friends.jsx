import axios from "../axios.js";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
const SLOT_ORDER = [
    "09-10 AM", "10-11 AM", "11-12 AM", "12-01 PM",
    "01-02 PM", "02-03 PM", "03-04 PM", "04-05 PM", "05-06 PM"
];
const formatHour = (slot) => {
    const [range, meridian] = slot.split(" "); // "11-12", "AM"
    let hour = parseInt(range.split("-")[0]); // 11

    // Convert to 24h base
    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    // Convert back to pretty 12h
    const displayHour = ((hour + 11) % 12) + 1;
    const displayMeridian = hour >= 12 ? "PM" : "AM";

    return `${displayHour} ${displayMeridian}`;
};

const formatHourEnd = (slot) => {
    const [range, meridian] = slot.split(" "); // "12-01", "PM"
    let hour = parseInt(range.split("-")[1]); // second part of the range

    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    const displayHour = ((hour + 11) % 12) + 1;
    const displayMeridian = hour >= 12 ? "PM" : "AM";

    return `${displayHour} ${displayMeridian}`;
};

const getToday = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

const parseHour = (slot) => {
    const [range, meridian] = slot.split(" ");
    const [start] = range.split("-");
    let hour = parseInt(start);
    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;
    return hour; // ✅ REAL hour (0–23)
};

const getCurrentSlot = () => {
    const hour = new Date().getHours(); // REAL current hour in 24h
    return SLOT_ORDER.find(slot => {
        const slotHour = parseHour(slot);
        return hour >= slotHour && hour < slotHour + 1;
    }) || null;
};


const getTodayClasses = (timetable) => {
    const today = getToday();
    return timetable?.[today] || {};
};

const getFirstAndLastClass = (daySlots) => {
    const classSlots = SLOT_ORDER.filter(s => daySlots[s] && daySlots[s] !== "No class");

    if (classSlots.length === 0) return { first: null, last: null };

    return {
        first: classSlots[0],
        last: classSlots[classSlots.length - 1]
    };
};



const Friends = ({ userData }) => {
    const [friendData, setFriendData] = useState([]);
    const [availableFriends, setAvailableFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal
    const [friendTimetablePop, setFriendTimetablePop] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        if (!userData?._id) return;
        fetchFriendData();
    }, [userData]);

    const fetchFriendData = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/getFriends`,
                { withCredentials: true }
            );
            if (res.data.success) setFriendData(res.data.friendData);
        } catch (error) {
            console.error("Fetch friend error:", error.message);
        }
    };


    const getFreeBlocks = (timetable) => {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        if (!timetable?.[today]) return [];

        const freeSlots = Object.entries(timetable[today])
            .filter(([_, subject]) => subject === "No class")
            .map(([slot]) => slot)
            .sort((a, b) => parseHour(a) - parseHour(b));

        if (freeSlots.length === 0) return [];

        const blocks = [];
        let temp = [freeSlots[0]];

        for (let i = 1; i < freeSlots.length; i++) {
            const prev = parseHour(freeSlots[i - 1]);
            const curr = parseHour(freeSlots[i]);
            if (curr === prev + 1) temp.push(freeSlots[i]);
            else {
                blocks.push(temp);
                temp = [freeSlots[i]];
            }
        }
        blocks.push(temp);
        return blocks;
    };

    const getChillingStatus = (blocks1, blocks2) => {
        const all = [...blocks1.flat(), ...blocks2.flat()].map(parseHour);
        if (all.length === 0) return null;

        const min = Math.min(...all);
        const max = Math.max(...all);

        if (min > 9) return "Chilling (Before 9 AM)";
        if (max < 17) return "Chilling (After 5 PM)";
        return null;
    };
    useEffect(() => {
        if (!friendData.length) return;

        const nowHour = new Date().getHours();

        const processed = friendData.map(friend => {
            const today = getTodayClasses(friend.timetable);
            const { first, last } = getFirstAndLastClass(today);

            const freeBlocks = getFreeBlocks(friend.timetable);

            // ✅ No classes today
            if (!first && !last) {
                return { ...friend, status: "Free all day", dot: "green", priority: 3 };
            }

            // ✅ Before first class
            if (nowHour < parseHour(first)) {
                return {
                    ...friend,
                    status: `Chilling before ${formatHour(first)}`,
                    dot: "green",
                    priority: 2
                };
            }

            // ✅ After last class
            if (nowHour >= parseHour(last) + 1) {
                return {
                    ...friend,
                    status: "Free now (classes over)",
                    dot: "green",
                    priority: 1
                };
            }

            // ✅ Free right now → combine continuous free block fully
            const currentBlock = freeBlocks.find(block =>
                block.some(slot => parseHour(slot) === nowHour)
            );

            if (currentBlock) {
                const startSlot = currentBlock[0];
                const endSlot = currentBlock[currentBlock.length - 1];

                return {
                    ...friend,
                    status: `Free ${formatHour(startSlot)} to ${formatHourEnd(endSlot)}`,
                    dot: "green",
                    priority: 0
                };
            }

            // ✅ Free later today
            const upcomingBlock = freeBlocks.find(block =>
                parseHour(block[0]) > nowHour
            );

            if (upcomingBlock) {
                return {
                    ...friend,
                    status: `Free at ${formatHour(upcomingBlock[0])}`,
                    dot: "yellow",
                    upcomingStart: upcomingBlock[0],
                    priority: 4
                };
            }

            // ❌ Busy rest of day — hide
            return null;
        })
            .filter(Boolean)
            .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                if (a.upcomingStart && b.upcomingStart)
                    return parseHour(a.upcomingStart) - parseHour(b.upcomingStart);
                return 0;
            });

        setAvailableFriends(processed);
    }, [friendData]);





    const sendReminder = async (id) => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/sendReminder/${id}`,
                {},
                { withCredentials: true }
            );
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    const getSortedSlots = (timetable) => {
        if (!timetable) return [];
        return [...new Set(Object.values(timetable).flatMap(day => Object.keys(day)))]
            .sort((a, b) => parseHour(a) - parseHour(b));
    };

    const getDays = (timetable) => Object.keys(timetable || {});

    return (
        <div className="ml-2 mb-10">
            <h1 className="text-2xl sm:text-4xl mb-8" style={{ fontFamily: '"Keania One", cursive' }}>
                Available <span className="text-[#FEC674]">Friends</span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableFriends.length > 0 ? availableFriends.map((f, i) => (
                    <div
                        key={i}
                        className="w-full h-60 px-4 py-2 rounded-xl bg-[#FEC674] flex flex-col items-center justify-center gap-2 text-center shadow cursor-pointer"
                        onClick={() => (setSelectedFriend(f), setFriendTimetablePop(true))}
                    >
                        <img src={f.pfp} className="h-20 w-20 rounded-full object-cover shadow-xl" />
                        <h4 className="font-semibold">{f.username}</h4>

                        {/* NEW STATUS LABEL */}
                        <h4 className="font-bold text-white text-sm">{f.status}</h4>

                        {/* ✅ Only show green dot if Available Now */}
                        <h4 className="flex items-center gap-2 text-white font-bold">
                            {f.dot === "green" && <div className="h-2 w-2 rounded-full bg-green-300"></div>}
                            {f.dot === "yellow" && <div className="h-2 w-2 rounded-full bg-yellow-300"></div>}


                        </h4>

                        <button
                            onClick={(e) => { e.stopPropagation(); sendReminder(f._id); }}
                            className="bg-[#FFF3E2] p-2 rounded-xl hover:bg-[#fff3e27f] transition"
                        >
                            Send Reminder
                        </button>
                    </div>
                )) : (

                    <p className="text-gray-500 col-span-full text-center">No matching availability today.</p>
                )}
            </div>

            {/* 🔥 ORIGINAL MODAL KEPT EXACTLY AS YOU HAD */}
            {friendTimetablePop && selectedFriend && (
                <>
                    <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full overflow-auto relative">
                            <span onClick={() => setFriendTimetablePop(false)}
                                className="absolute top-2 right-2 text-red-600 cursor-pointer text-2xl">×</span>

                            {!selectedFriend.timetable ? (
                                <div className="py-10 text-center text-gray-600">No timetable found.</div>
                            ) : (
                                <>
                                    <h4 className="text-lg font-semibold text-center mb-4">
                                        {selectedFriend.username}'s Weekly Overview
                                    </h4>
                                    <div className="max-h-[65vh] overflow-y-auto border rounded-lg">
                                        <table className="min-w-full">
                                            <thead className="bg-[#FFF3E2] text-gray-800 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-sm font-semibold">Time</th>
                                                    {getDays(selectedFriend.timetable).map(d => (
                                                        <th key={d} className="px-4 py-3 text-sm font-semibold">{d}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getSortedSlots(selectedFriend.timetable).map((slot, idx) => (
                                                    <tr key={slot} className={idx % 2 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-3 text-sm font-medium">{slot}</td>
                                                        {getDays(selectedFriend.timetable).map(day => (
                                                            <td key={day} className="px-2 py-3 text-sm">
                                                                {selectedFriend.timetable[day][slot] || "No class"}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
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
