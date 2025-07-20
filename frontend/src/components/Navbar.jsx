import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Navbar = ({ userData }) => {
    const [searchBox, setSearchBox] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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
            const res = await axios.get(`/user/search?query=${value}`, { withCredentials: true });
            setSearchResults(res.data.users);
        } catch (err) {
            console.error("Search error:", err.message);
        }
    };

    const sendReqHandler = async (targetId) => {
        try {
            const res = await axios.post(`/api/user/${targetId}/sendFriendRequest`, {}, { withCredentials: true });
            console.log(res.data.message);
        } catch (error) {
            console.error("Send/Cancel/Unfriend error:", error.message);
        }
    };
    const respondToRequest = async (targetId, result) => {
        try {
            const res = await axios.post(`/api/user/acceptRejectRequest`, { targetId, result }, { withCredentials: true });
            console.log(res.data.message);

        } catch (error) {
            console.error("Accept/Reject error:", error.message);
        }
    };

    const handleFriendRequestResponse = async (result, targetId) => {
        try {
            const res = await axios.post(
                `/api/user/acceptRejectRequest`,
                { result, targetId },
                { withCredentials: true }
            );

            if (res.status === 200 || res.status === 400) {
                console.log(res.data.message);
                setShowDropdown(false);
                window.location.reload();
            }
        } catch (err) {
            console.error("Friend request response error:", err.message);
        }
    };




    const [profileOpen, setProfileOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedId, setSelectedId] = useState();
    const [friendData, setFriendData] = useState({});
    const fetchFriendData = async () => {
        try {

            console.log(friendData);
            const res = await axios.get(`/api/user/${selectedId}/getFriendDetails`, { withCredentials: true });
            if (res.status === 200) {
                setFriendData(res.data.friendData);
            }
        } catch (error) {
            console.error("Send req error:", error.message);
        }
    }
    useEffect(() => {
        if (selectedId) {
            fetchFriendData();
        }
    }, [selectedId]);
    const [pending, setPending] = useState([]);
    const getPending = async () => {
        try {
            const res = await axios.get('/api/user/getPendingReq', { withCredentials: true });
            if (res.status === 200) {
                setPending(res.data.myPendingReq);
            }
        } catch (error) {

        }
    }
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await axios.get('/api/user/getNotifications', { withCredentials: true });
            setNotifications(res.data.notifications || []);
        };
        fetchNotifications();
    }, []);

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (index) => {
        await axios.patch(`/api/user/notification/${index}/markRead`, {}, { withCredentials: true });
        setNotifications((prev) => {
            const updated = [...prev];
            updated[index].read = true;
            return updated;
        });
    };

    return (
        <div className='flex items-center justify-between px-4 py-2  relative z-0'>
            <div className="pfp flex items-center gap-3">
                <i
                    onClick={toggleSearch}
                    className="fa-solid fa-user-plus cursor-pointer transform transition duration-200 hover:scale-105 text-[#FEC674] text-xl"
                ></i>
                <div className="bell flex items-center justify-center">
                    <div className="relative">
                        <i
                            className="fa-solid ml-2 fa-user-group text-xl text-[#FEC674] cursor-pointer"
                            onClick={() => { getPending(), setShowDropdown(!showDropdown) }}
                        ></i>

                        {showDropdown && (
                            <div className="absolute right-0 left-0 mt-2  w-70 bg-white shadow-xl rounded-lg z-50">
                                <div className="p-3 border-b font-semibold">Friend Requests</div>

                                {pending.length === 0 ? (
                                    <div className="p-3 text-gray-500">No friend requests</div>
                                ) : (
                                    pending.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center" >
                                                <img
                                                    src={user.pfp}
                                                    className="w-8 h-8 object-cover rounded-full mr-3"
                                                />
                                                <span>{user.username}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    className="text-green-500 hover:underline"
                                                    onClick={() => handleFriendRequestResponse(true, user._id)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="text-red-500 hover:underline"
                                                    onClick={() => handleFriendRequestResponse(false, user._id)}
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
            {profileOpen && (<div className="fixed z-44 inset-0 bg-black/30 backdrop-blur-sm"></div>)}
            {profileOpen &&
                (
                    <div className="fixed z-45 left-80 top-12 rounded-2xl shadow-2xl bg-[#FEC674] h-125 w-100 inset-0 ">
                        <div onClick={() => { setProfileOpen(false); setSelectedId(''); setFriendData({}) }} className='cursor-pointer fixed right-76 top-12 text-2xl text-red-600'>x</div>
                        <div className='h-45 w-full flex items-center justify-center'>
                            <img src={friendData.pfp} className='h-40 w-40 rounded-full object-cover shadow-2xl' alt="huehue" />
                        </div>
                        <div className='h-75 w-full '>
                            <div className='bg-[#FFF3E2]'>
                                <h1 className='text-center text-black text-2xl' style={{ fontFamily: '"Keania One", cursive' }}>@{friendData.username}</h1>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 p-5 gap-y-4 text-gray-700 text-sm">
                                <div className="md:col-span-2"><b>Bio:</b> <i>{friendData.bio}</i></div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Course:</b> {friendData.course}</div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Reg No:</b> {friendData.reg_no}</div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Section:</b> {friendData.section}</div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Age:</b> {friendData.age}</div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Gender:</b> {friendData.gender}</div>

                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Birthday:</b> {new Date(friendData.dob).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric',
                                })}
                                </div>
                                <div style={{ fontFamily: "'Inter', sans-serif" }}><b>Email:</b> {friendData.email}</div>
                            </div>
                            <div className='flex items-center justify-end pr-5 '>
                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"></div>

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
                                                                className="text-red-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl"
                                                            >
                                                                Unfriend
                                                            </button>
                                                        ) : friendData?.pendingRequest?.includes(userData._id) ? (
                                                            <button
                                                                onClick={() => sendReqHandler(friendData._id)}
                                                                className="text-yellow-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl"
                                                            >
                                                                Cancel
                                                            </button>
                                                        ) : userData?.pendingRequest?.includes(friendData._id) ? (
                                                            <button
                                                                onClick={() => respondToRequest(friendData._id, true)}
                                                                className="text-green-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl"
                                                            >
                                                                Accept
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => sendReqHandler(friendData._id)}
                                                                className="text-blue-500 hover:scale-105 transition transform bg-white px-5 py-1 rounded-xl shadow-xl"
                                                            >
                                                                Send Request
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>




                        </div>
                    </div>



                )
            }
            {searchBox && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full sm:w-1/2 md:w-1/3 bg-white rounded-lg shadow-lg">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search users..."
                        className="w-full px-4 py-2 border border-[#FEC674] rounded-t-lg focus:outline-none"
                    />

                    {searchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border-t">
                            {searchResults.map((user) => (
                                <div
                                    key={user._id} onClick={() => { setProfileOpen(true); setSelectedId(user._id); }}
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

            {/* Right - Bell Icon */}
            <div className="bell flex items-center justify-center">
                <div className="relative" ref={dropdownRef}>
                    <div onClick={() => setOpen(!open)} className="cursor-pointer relative">
                        <i className="fa-solid fa-bell text-2xl text-[#FEC674]"></i>
                        {notifications.some(n => !n.read) && (
                            <span className="absolute top-4  right-0 left-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {notifications.filter(n => !n.read).length}
                            </span>
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
                                        className={`p-2 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-start ${notif.read ? 'bg-gray-100' : 'bg-yellow-100'}`}
                                        onClick={() => markAsRead(index)}
                                    >
                                        <div>
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-gray-500">{new Date(notif.timestamp).toLocaleString()}</p>
                                        </div>
                                        {!notif.read && <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">New</span>}
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
