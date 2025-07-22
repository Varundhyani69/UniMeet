import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import "../App.css";
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_BASE_URL);

const Navbar = ({ userData, updateUserData }) => {
    const [searchBox, setSearchBox] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedId, setSelectedId] = useState();
    const [friendData, setFriendData] = useState({});
    const [pending, setPending] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();
    const unreadCount = notifications.filter(n => !n.read).length;


    const toggleSearch = () => {
        setSearchBox(prev => !prev);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length === 0) return setSearchResults([]);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/search?query=${value}`, { withCredentials: true });
            setSearchResults(res.data.users);
        } catch (err) {
            console.error("Search error:", err.message);
        }
    };

    const fetchFriendData = async () => {
        if (!selectedId) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/${selectedId}/getFriendDetails`, { withCredentials: true });
            if (res.status === 200) {
                setFriendData(res.data.friendData);
            }
        } catch (error) {
            console.error("Fetch friend data error:", error.message);
        }
    };

    const sendReqHandler = async (targetId) => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/${targetId}/sendFriendRequest`,
                {},
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                socket.emit("friend-request", {
                    sender: userData,
                    receiverId: targetId,
                });
                await fetchFriendData();
                updateUserData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
            console.error("Send/Cancel/Unfriend error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const respondToRequest = async (targetId, result) => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/acceptRejectRequest`,
                { targetId, result },
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                socket.emit("friend-response", {
                    sender: userData,
                    receiverId: targetId,
                    accepted: result,
                });
                await fetchFriendData();
                updateUserData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
            console.error("Accept/Reject error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFriendRequestResponse = async (result, targetId) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/acceptRejectRequest`,
                { result, targetId },
                { withCredentials: true }
            );
            if (res.status === 200 || res.status === 400) {
                toast.success(res.data.message);
                setShowDropdown(false);
                await getPending();
                updateUserData();
            }
        } catch (err) {
            toast.error(err.response.data.message);
            console.error("Friend request response error:", err.message);
        }
    };

    const getPending = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getPendingReq`, { withCredentials: true });
            if (res.status === 200) {
                setPending(res.data.myPendingReq);
            }
        } catch (error) {
            console.error("Get pending requests error:", error.message);
        }
    };

    useEffect(() => {
        getPending();

        socket.on("friend-request-received", () => {
            getPending();
        });

        return () => socket.off("friend-request-received");
    }, []);
    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getNotifications`, { withCredentials: true });
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("Fetch notifications error:", error.message);
        }
    };

    const markAsRead = async (index) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/user/notification/${index}/markRead`, {}, { withCredentials: true });
            setNotifications((prev) => {
                const updated = [...prev];
                updated[index].read = true;
                return updated;
            });
        } catch (error) {
            console.error("Mark as read error:", error.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchFriendData();
        }
    }, [selectedId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!userData?._id) return;

        socket.emit("setup", userData);

        const handleFriendRequestReceived = (newNotification) => {
            console.log("📥 Received: friend-request-received", newNotification);
            setNotifications(prev => [...prev, newNotification]);
            getPending();
            if (selectedId === newNotification.senderId) {
                fetchFriendData();
            }
            updateUserData();
        };

        const handleFriendRequestAccepted = ({ sender }) => {
            toast.success(`${sender.username} accepted your friend request`);
            setNotifications(prev => [
                ...prev,
                {
                    message: `${sender.username} accepted your friend request`,
                    read: false,
                    timestamp: new Date().toISOString()
                }
            ]);
            if (selectedId === sender._id) {
                fetchFriendData();
            }
            updateUserData();
        };

        const handleFriendRemoved = (data) => {
            console.log("📥 Received: friend-removed", data);
            toast.info(`${data.username} removed you as a friend`);
            if (selectedId === data._id) {
                fetchFriendData();
            }
            updateUserData();
        };

        const handleGenericNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on("friend-request-received", handleFriendRequestReceived);
        socket.on("friend-request-accepted", handleFriendRequestAccepted);
        socket.on("friend-removed", handleFriendRemoved);
        socket.on("notification-received", handleGenericNotification);

        return () => {
            socket.off("friend-request-received", handleFriendRequestReceived);
            socket.off("friend-request-accepted", handleFriendRequestAccepted);
            socket.off("friend-removed", handleFriendRemoved);
            socket.off("notification-received", handleGenericNotification);
        };
    }, [userData, selectedId]);

    return (
        <div className='flex items-center justify-between px-4 py-2 relative z-0'>
            <div className="pfp flex items-center gap-3">
                <i
                    onClick={toggleSearch}
                    className="fa-solid fa-user-plus cursor-pointer transform transition duration-200 hover:scale-105 text-[#FEC674] text-xl"
                ></i>
                <div className="bell flex items-center justify-center">
                    <div className="relative">
                        <i
                            className="fa-solid ml-2 fa-user-group text-xl text-[#FEC674] cursor-pointer"
                            onClick={() => {
                                getPending();
                                setShowDropdown(!showDropdown);
                            }}
                        ></i>

                        {/* 🔴 Badge dot only if pending requests exist */}
                        {pending.length > 0 && (
                            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                        )}

                        {/* Dropdown content */}
                        {showDropdown && (
                            <div className="absolute right-0 left-0 mt-2 w-70 bg-white shadow-xl rounded-lg z-50">
                                <div className="p-3 border-b font-semibold">Friend Requests</div>
                                {pending.length === 0 ? (
                                    <div className="p-3 text-gray-500">No friend requests</div>
                                ) : (
                                    pending.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={user.pfp}
                                                    className="w-8 h-8 object-cover rounded-full mr-3"
                                                    alt="pfp"
                                                />
                                                <span>{user.username}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-green-500 hover:underline"
                                                    onClick={() => handleFriendRequestResponse(true, user._id)}
                                                    disabled={loading}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="text-red-500 hover:underline"
                                                    onClick={() => handleFriendRequestResponse(false, user._id)}
                                                    disabled={loading}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {profileOpen && (
                <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"></div>
            )}
            {profileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div className="relative w-120 max-w-3xl bg-[#FEC674] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div
                            onClick={() => {
                                setProfileOpen(false);
                                setSelectedId('');
                                setFriendData({});
                            }}
                            className="absolute top-4 right-4 text-2xl text-red-600 cursor-pointer"
                        >
                            ×
                        </div>
                        <div className="w-full flex justify-center pt-8">
                            <img
                                src={friendData.pfp}
                                className="h-40 w-40 rounded-full object-cover shadow-2xl"
                                alt="Profile"
                            />
                        </div>
                        <div className="w-full">
                            <div className="bg-[#FFF3E2] mt-4">
                                <h1 className="text-center text-black text-2xl font-keania">@{friendData.username}</h1>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6 text-gray-700 text-sm font-inter">
                                <div className="md:col-span-2">
                                    <b>Bio:</b> <i>{friendData.bio}</i>
                                </div>
                                <div><b>Course:</b> {friendData.course}</div>
                                <div><b>Reg No:</b> {friendData.reg_no}</div>
                                <div><b>Section:</b> {friendData.section}</div>
                                <div><b>Age:</b> {friendData.age}</div>
                                <div><b>Gender:</b> {friendData.gender}</div>
                                <div>
                                    <b>Birthday:</b>{' '}
                                    {new Date(friendData.dob).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div><b>Email:</b> {friendData.email}</div>
                            </div>
                            <div className="flex items-center justify-end pr-5 pb-6">
                                {userData?.friends?.includes(friendData._id) ? (
                                    <button
                                        onClick={() => sendReqHandler(friendData._id)}
                                        className="text-red-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loader mr-2"></span> : "Unfriend"}
                                    </button>
                                ) : friendData?.pendingRequest?.includes(userData._id) ? (
                                    <button
                                        onClick={() => sendReqHandler(friendData._id)}
                                        className="text-yellow-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loader mr-2"></span> : "Cancel"}
                                    </button>

                                ) : userData?.pendingRequest?.includes(friendData._id) ? (
                                    <button
                                        onClick={() => respondToRequest(friendData._id, true)}
                                        className="text-green-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loader mr-2"></span> : "Accept"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => sendReqHandler(friendData._id)}
                                        className="text-blue-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loader mr-2"></span> : "Send Request"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {searchBox && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full sm:w-1/2 md:w-1/3 bg-white rounded-lg shadow-lg">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search users..."
                        className="w-full px-4 py-2 border border-[#FEC674] rounded-t-lg unique-id-123 focus:outline-none"
                    />
                    {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border-t">
                            {searchResults.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => { setProfileOpen(true); setSelectedId(user._id); }}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <img
                                        src={user.pfp || "/default-avatar.png"}
                                        alt="pfp"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-medium">{user.username}</div>
                                        <div className="text-xs text-gray-500">{user.bio}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {searchTerm && searchResults.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
                    )}
                </div>
            )}
            <div className="bell flex items-center justify-center">
                <div className="relative" ref={dropdownRef}>
                    <div onClick={() => setOpen(!open)} className="cursor-pointer relative">
                        <i className="fa-solid fa-bell text-2xl text-[#FEC674]"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-3.5 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 h-3 w-3 rounded-full" />
                        )}
                    </div>

                    {open && (
                        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg p-3 z-50">
                            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">No notifications</p>
                            ) : (
                                notifications.map((notif, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-start ${notif.read ? 'bg-gray-100' : 'bg-yellow-100'
                                            }`}
                                        onClick={() => markAsRead(index)}
                                    >
                                        <div>
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-gray-500">
                                                {notif.timestamp
                                                    ? new Date(notif.timestamp).toLocaleString()
                                                    : 'Just now'}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Navbar;