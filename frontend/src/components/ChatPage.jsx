import axios from "../axios.js";
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
});

const ChatPage = ({ userData }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const containerRef = useRef(null);
    const [friendList, setFriendList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadFriends, setUnreadFriends] = useState([]);
    const [searchBox, setSearchBox] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getFriends`, {
                    withCredentials: true,
                });
                setFriendList(res.data.friendData);
            } catch (err) {
                console.error('Fetch friend list error:', err.message);
            }
        };
        fetchFriends();
    }, [userData]);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/message/unread`, {
                    withCredentials: true,
                });
                setUnreadFriends(res.data.senders);
            } catch (err) {
                console.error("Unread fetch error:", err.message);
            }
        };
        fetchUnread();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setSearchBox(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSearchBox(true);

        if (value.trim().length === 0) return setSearchResults([]);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/searchFriends?query=${value}`, {
                withCredentials: true,
            });
            setSearchResults(res.data.users);
        } catch (err) {
            console.error('Search error:', err.message);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/message/get/${userId}`, {
                withCredentials: true,
            });
            setMessages(res.data.messages);
        } catch (err) {
            console.error('Fetch message error:', err.message);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/message/send`,
                {
                    receiverId: selectedUser._id,
                    text: newMessage,
                },
                { withCredentials: true }
            );
            const sentMsg = res.data.message;
            setMessages(prev => [...prev, sentMsg]);
            socket.emit("send-message", sentMsg);
            setNewMessage('');
        } catch (err) {
            console.error('Send message error:', err.message);
        }
    };

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setSearchTerm('');
        setSearchResults([]);
        setSearchBox(false);
        if (window.innerWidth < 1024) {
            setIsMobileChatOpen(true);
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/message/mark-as-read/${user._id}`,
                {},
                { withCredentials: true }
            );
            setUnreadFriends(prev => prev.filter(id => id !== user._id));
        } catch (err) {
            console.error("Failed to mark messages as read", err.message);
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        socket.on("receive-message", (data) => {
            if (selectedUser && data.sender === selectedUser._id) {
                setMessages((prev) => [...prev, data]);
            } else {
                setUnreadFriends((prev) => [...new Set([...prev, data.sender])]);
            }
        });
        return () => socket.off("receive-message");
    }, [selectedUser]);

    useEffect(() => {
        if (userData?._id) {
            socket.emit("setup", userData);
        }
    }, [userData]);

    return (
        <div className='mb-10'>
            <div className='h-150 flex flex-col lg:flex-row gap-3'>

                {/* Friend List Panel */}
                <div className={`h-150 w-full lg:w-110 bg-[#FFF3E2] relative ${isMobileChatOpen ? 'hidden lg:block' : ''}`} ref={containerRef}>
                    <div className='flex items-center px-2 justify-center mt-5'>
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setSearchBox(true)}
                            placeholder='Search users...'
                            className='w-full px-5 py-2 border border-[#FEC674] rounded-2xl focus:outline-none'
                        />
                    </div>

                    {searchBox && (
                        <div className='absolute top-20 left-1/2 transform -translate-x-1/2 w-[90%] bg-white z-50 rounded-xl shadow-xl'>
                            {searchResults.length > 0 ? (
                                <div className='max-h-60 overflow-y-auto rounded-b-xl'>
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleSelectUser(user)}
                                            className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                        >
                                            <img
                                                src={user.pfp || '/default-avatar.png'}
                                                alt='pfp'
                                                className='w-8 h-8 rounded-full object-cover'
                                            />
                                            <div>
                                                <div className='font-medium'>{user.username}</div>
                                                <div className='text-xs text-gray-500'>{user.bio}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='px-4 py-2 text-sm text-gray-500'>No users found</div>
                            )}
                        </div>
                    )}

                    {/* Friend List */}
                    <div className='mt-4 max-h-132 overflow-y-auto scrollbar-hide'>
                        <div className='grid grid-rows-7 gap-1'>
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                            {friendList.map((user, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectUser(user)}
                                    className='relative cursor-pointer transform hover:scale-105 transition duration-200 w-full h-15 sm:w-70 m-1 shadow-xl ml-3 mr-3 px-4 py-2 rounded-xl bg-[#FEC674] flex items-center justify-left gap-2 text-center'
                                >
                                    <img
                                        src={user.pfp || '/default-avatar.png'}
                                        alt='pfp'
                                        className='h-10 w-10 rounded-full object-cover'
                                    />
                                    <h4 className='font-semibold'>{user.username}</h4>
                                    {unreadFriends.includes(user._id) && (
                                        <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`h-150 w-full ${isMobileChatOpen ? 'block' : 'hidden lg:block'}`}>
                    {!selectedUser ? (
                        <div className='h-150 w-full flex flex-col justify-center text-center'>
                            <i className='fa-solid fa-comments text-5xl mb-4'></i>
                            <h2>Send a message to start a chat</h2>
                        </div>
                    ) : (
                        <div className='h-150 w-full'>
                            {/* Mobile back button */}
                            <div className='lg:hidden flex items-center gap-3 mb-2'>
                                <button
                                    onClick={() => setIsMobileChatOpen(false)}
                                    className='text-[#FEC674] text-xl px-3'
                                >
                                    ← Back
                                </button>
                                <h1 className='font-semibold'>{selectedUser.username}</h1>
                            </div>

                            {/* Header */}
                            <div className='h-15 bg-[#FEC674] rounded-xl w-full flex gap-3 items-center shadow-lg'>
                                <img
                                    src={selectedUser.pfp || '/default-avatar.png'}
                                    className='h-10 w-10 rounded-full ml-3 object-cover'
                                    alt='user'
                                />
                                <div>
                                    <h1 className='text-white text-xl'>{selectedUser.username}</h1>
                                </div>
                            </div>

                            {/* Chat Body */}
                            <div className='h-120 w-full bg-[#FFF3E2] overflow-y-auto scrollbar-hide flex flex-col-reverse'>
                                <div className='px-4 py-2'>
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`w-fit max-w-[55%] mb-2 rounded-2xl px-3 py-2 shadow-md text-sm ${msg.sender === userData._id
                                                ? 'ml-auto bg-[#FEC674]'
                                                : 'mr-auto bg-white'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Input */}
                            <div className='h-15 w-full shadow-xl flex justify-center gap-3 items-center bg-[#FEC674] rounded-xl'>
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className='bg-white h-10 pl-3 w-full ml-3 rounded-xl focus:outline-0 focus:ring-0'
                                    placeholder='Send message'
                                    type='text'
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className='bg-white cursor-pointer hover:scale-105 transform transition duration-200 h-10 w-25 mr-3 rounded-xl'
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
