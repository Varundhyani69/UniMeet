import { useState, useEffect } from 'react';
import axios from "../axios.js";

import { toast } from 'react-toastify';

const MeetingPopup = ({ isOpen, setIsOpen, userData, onMeetingCreated }) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');

    // cooldown state
    const [cooldown, setCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown, timeLeft]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getFriends`, { withCredentials: true });
                if (res.data.success) {
                    setFriends(res.data.friendData);
                }
            } catch (err) {
                console.error("Error fetching friends:", err);
            }
        };
        if (isOpen) fetchFriends();
    }, [isOpen]);

    const handleFriendSelect = (e) => {
        const friendId = e.target.value;
        if (friendId && !selectedFriends.includes(friendId)) {
            setSelectedFriends([...selectedFriends, friendId]);
            e.target.value = '';
        }
    };

    const handleRemoveFriend = (friendId) => {
        setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    };

    const handleSubmit = async () => {
        if (cooldown) {
            toast.error("Please wait before creating another meeting!");
            return;
        }

        try {
            if (!selectedFriends.length || !location || !date || !startTime || !endTime) {
                setError('Please fill all required fields');
                return;
            }

            const timeSlot = `${startTime} - ${endTime}`;
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/meeting/create`,
                { friends: selectedFriends, title, location, description, date, timeSlot },
                { withCredentials: true }
            );

            if (res.data.success) {
                setIsOpen(false);
                onMeetingCreated();
                setSelectedFriends([]);
                setTitle('');
                setLocation('');
                setDescription('');
                setDate('');
                setStartTime('');
                setEndTime('');
                setError('');

                // trigger cooldown with countdown
                setCooldown(true);
                setTimeLeft(10);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating meeting');
            console.error("Create meeting error:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-51 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 z-0 bg-black/40 transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl z-1 shadow-lg p-4 max-w-sm w-full mx-4 my-4 text-sm">
                <h2 className="text-base font-semibold mb-2">Create Meeting</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}

                {/* Title */}
                <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title (Optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Team Meetup"
                    />
                </div>

                {/* Friends */}
                <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Friends</label>
                    <select
                        onChange={handleFriendSelect}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        defaultValue=""
                    >
                        <option value="" disabled>Select a friend</option>
                        {friends
                            .filter(friend => !selectedFriends.includes(friend._id))
                            .map(friend => (
                                <option key={friend._id} value={friend._id}>
                                    {friend.username}
                                </option>
                            ))}
                    </select>
                    <div className="flex overflow-x-auto gap-1.5 py-1 px-2 bg-gray-50 rounded-lg">
                        {selectedFriends.map(friendId => {
                            const friend = friends.find(f => f._id === friendId);
                            return friend ? (
                                <div
                                    key={friend._id}
                                    className="flex items-center bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs shadow-sm"
                                >
                                    <span>{friend.username}</span>
                                    <button
                                        onClick={() => handleRemoveFriend(friend._id)}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>

                {/* Location */}
                <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Chai Sutta Bar"
                    />
                </div>

                {/* Date */}
                <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Time */}
                <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">End</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={1}
                        placeholder="e.g., Let's catch up over coffee!"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={cooldown}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${cooldown ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                    >
                        {cooldown ? `Wait (${timeLeft}s)` : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingPopup;
