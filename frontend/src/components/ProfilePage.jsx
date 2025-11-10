
import axios from "../axios.js";

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_BASE_URL);

const ProfilePage = ({ userData: initialUserData, setUserData: setParentUserData }) => {
    const [selectedFileType, setSelectedFileType] = useState("excel");
    const navigate = useNavigate();
    const timetableFileInputRef = useRef(null);
    const [updateData, setUpdateData] = useState({});
    const [loading, setLoading] = useState(false);
    const [editPop, setEditPop] = useState(false);
    const [deleteBox, setDeleteBox] = useState(false);
    const [passwordBox, setPasswordBox] = useState(false);
    const [emailBox, setEmailBox] = useState(false);
    const [timetablePop, setTimetablePop] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [localTimetableData, setLocalTimetableData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [friendsPop, setFriendsPop] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [friendData, setFriendData] = useState({});
    const [friendTimetablePop, setFriendTimetablePop] = useState(false);

    useEffect(() => {
        if (initialUserData) {
            setUpdateData({
                username: initialUserData.username || '',
                course: initialUserData.course || '',
                reg_no: initialUserData.reg_no || '',
                section: initialUserData.section || '',
                age: initialUserData.age || '',
                gender: initialUserData.gender || '',
                dob: initialUserData.dob || '',
                bio: initialUserData.bio || '',
                pfp: initialUserData.pfp || ''
            });
            setLocalTimetableData(JSON.parse(JSON.stringify(initialUserData.timetable || {})));
        }
    }, [initialUserData]);

    const logout = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/logout`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setUpdateData({ ...updateData, [e.target.name]: e.target.value });
    };

    const handleSubmitProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/editProfile`,
                updateData,
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                if (setParentUserData) {
                    setParentUserData(prev => ({
                        ...prev,
                        ...updateData
                    }));
                }
                setEditPop(false);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Profile update error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const displayDate = initialUserData.dob ? new Date(initialUserData.dob).toISOString().split('T')[0] : '00-00-00';

    const deleteHandler = async () => {
        setLoading(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/user/deleteUser`, { withCredentials: true })
            if (res.status === 200) {
                toast.success(res.data.message);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Profile delete error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/sendChangePasswordOtp`,
                {},
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                setOtpSent(true);
                setOtpError('');
            }
        } catch (error) {
            toast.error(error.response.data.message);
            setOtpError(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/verifyChangePasswordOtp`,
                { otp },
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                setOtpVerified(true);
                setOtpError('');
            }
        } catch (error) {
            toast.error(error.response.data.message);
            setOtpError(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const changePasswordSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/user/changePassword`,
                { newPassword },
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                setPasswordSuccess(true);
                setTimeout(() => {
                    setPasswordBox(false);
                    setOtpSent(false);
                    setOtp('');
                    setNewPassword('');
                    setOtpVerified(false);
                    setPasswordSuccess(false);
                }, 2000);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            setOtpError(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const sendOtpToNewEmail = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/sendVerificationNewEmail`, { email: newEmail }, { withCredentials: true });
            if (res.status === 200) {
                toast.success(res.data.message);
                setEmailOtpSent(true);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyNewEmailOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/verifyNewEmail`, { email: newEmail, otp: emailOtp }, { withCredentials: true });
            if (res.status === 200) {
                toast.success(res.data.message);
                setEmailSuccess(true);
                setEmailBox(false);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('timetable', file);
        formData.append('fileType', selectedFileType || 'excel');

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/timetable/upload-timetable`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                let structuredTimetable = res.data.timetable;

                if (!structuredTimetable["Sunday"]) {
                    structuredTimetable["Sunday"] = {
                        "09-10 AM": "No class",
                        "10-11 AM": "No class",
                        "11-12 AM": "No class",
                        "12-01 PM": "No class",
                        "01-02 PM": "No class",
                        "02-03 PM": "No class",
                        "03-04 PM": "No class",
                        "04-05 PM": "No class",
                        "05-06 PM": "No class"
                    };
                }

                setLocalTimetableData(structuredTimetable);

                if (setParentUserData) {
                    setParentUserData(prev => ({ ...prev, timetable: structuredTimetable }));
                }

                setEditMode(false);
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.error("Upload failed:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManualTimetableChange = (day, timeSlot, newValue) => {
        const updatedTimetable = JSON.parse(JSON.stringify(localTimetableData));

        if (!updatedTimetable[day]) {
            updatedTimetable[day] = {};
        }
        updatedTimetable[day][timeSlot] = newValue.trim() === '' ? 'No class' : newValue;

        setLocalTimetableData(updatedTimetable);
    };

    const handleTimetableSubmit = async () => {
        setLoading(true);
        try {
            const updatedTimetable = { ...localTimetableData };

            if (!updatedTimetable["Sunday"]) {
                updatedTimetable["Sunday"] = {
                    "09-10 AM": "No class",
                    "10-11 AM": "No class",
                    "11-12 AM": "No class",
                    "12-01 PM": "No class",
                    "01-02 PM": "No class",
                    "02-03 PM": "No class",
                    "03-04 PM": "No class",
                    "04-05 PM": "No class",
                    "05-06 PM": "No class"
                };
            }

            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/timetable/editTimetable`,
                { timetable: updatedTimetable },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setEditMode(false);
                if (setParentUserData) {
                    setParentUserData(prev => ({ ...prev, timetable: res.data.timetable }));
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Manual timetable update error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // User timetable processing
    const { sortedTimeSlots, days, isTimetableEmpty, filteredDays } = useMemo(() => {
        const timetableToProcess = localTimetableData;

        const allTimeSlots = new Set();
        for (const day in timetableToProcess) {
            for (const timeSlot in timetableToProcess[day]) {
                allTimeSlots.add(timeSlot);
            }
        }

        const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
            const parseTime = (timeStr) => {
                const parts = timeStr.split(' ')[0].split('-');
                const [startHourStr, startMinuteStr] = parts[0].split(':');
                let startHour = parseInt(startHourStr, 10);
                const startMinute = parseInt(startMinuteStr, 10) || 0;
                const period = timeStr.includes('AM') ? 'AM' : 'PM';

                if (period === 'PM' && startHour !== 12) startHour += 12;
                if (period === 'AM' && startHour === 12) startHour = 0;

                return startHour * 60 + startMinute;
            };
            return parseTime(a) - parseTime(b);
        });

        const days = Object.keys(timetableToProcess).sort((a, b) => {
            const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            return order.indexOf(a) - order.indexOf(b);
        });

        const filteredDays = days.filter(day => day !== "Sunday");

        const isTimetableEmpty = Object.keys(timetableToProcess).length === 0 ||
            Object.values(timetableToProcess).every(day => Object.keys(day).length === 0);

        return { sortedTimeSlots, days, filteredDays, isTimetableEmpty };
    }, [localTimetableData]);

    // Friend timetable processing
    const friendTimetableData = useMemo(() => {
        if (!friendData?.timetable) return {};
        return JSON.parse(JSON.stringify(friendData.timetable || {}));
    }, [friendData]);

    const { friendSortedTimeSlots, friendDays, isFriendTimetableEmpty, friendFilteredDays } = useMemo(() => {
        const timetableToProcess = friendTimetableData || {};

        const allTimeSlots = new Set();
        for (const day in timetableToProcess) {
            for (const timeSlot in timetableToProcess[day]) {
                allTimeSlots.add(timeSlot);
            }
        }

        const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
            const parseTime = (timeStr) => {
                const parts = timeStr.split(' ')[0].split('-');
                const [startHourStr, startMinuteStr] = parts[0].split(':');
                let startHour = parseInt(startHourStr, 10);
                const startMinute = parseInt(startMinuteStr, 10) || 0;
                const period = timeStr.includes('AM') ? 'AM' : 'PM';

                if (period === 'PM' && startHour !== 12) startHour += 12;
                if (period === 'AM' && startHour === 12) startHour = 0;

                return startHour * 60 + startMinute;
            };
            return parseTime(a) - parseTime(b);
        });

        const days = Object.keys(timetableToProcess).sort((a, b) => {
            const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            return order.indexOf(a) - order.indexOf(b);
        });

        const filteredDays = days.filter(day => day !== "Sunday");

        const isTimetableEmpty = Object.keys(timetableToProcess).length === 0 ||
            Object.values(timetableToProcess).every(day => Object.keys(day).length === 0);

        return { friendSortedTimeSlots: sortedTimeSlots, friendDays: days, friendFilteredDays: filteredDays, isFriendTimetableEmpty: isTimetableEmpty };
    }, [friendTimetableData]);

    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setSelectedFile(file);
    };

    const handleClose = () => {
        setPreview('');
    };

    const uploadPfp = async () => {
        if (!selectedFile) return toast.error("No file selected");

        const formData = new FormData();
        formData.append("pfp", selectedFile);
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/uploadPfp`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 200) {
                toast.success(res.data.message);
                setPreview('');
                setSelectedFile(null);
                if (setParentUserData) {
                    setParentUserData(prev => ({ ...prev, pfp: res.data.pfp }));
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Upload error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFriendClick = async (friend) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/${friend._id}/getFriendDetails`, {
                withCredentials: true
            });
            if (res.status === 200) {
                setSelectedId(friend._id);
                setFriendData(res.data.friendData);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load friend profile");
            console.log('Friend profile fetch error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };







    return (
        <div className="mb-15 font-[Inter]">
            <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
                MY PROFILE
            </h1>

            {/* Friends List Popup */}
            {friendsPop && (
                <>
                    <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-[#FEC674]">Friends List</h3>
                                <button onClick={() => setFriendsPop(false)} className="text-red-600 text-2xl hover:scale-105 transition">
                                    ×
                                </button>
                            </div>
                            {initialUserData?.friends?.length > 0 ? (
                                <div className="space-y-4">
                                    {initialUserData.friends.map(friend => (
                                        <div
                                            key={friend._id}
                                            onClick={() => handleFriendClick(friend)}
                                            className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                                        >
                                            <img
                                                src={friend.pfp || "/default-avatar.png"}
                                                alt={friend.username}
                                                className="w-12 h-12 rounded-full object-cover shadow-md"
                                            />
                                            <span className="text-gray-800 font-semibold">{friend.username}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center">No friends yet.</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Friend Profile Popup */}
            {selectedId && friendData._id && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                        <div className="relative w-120 max-w-3xl bg-[#FEC674] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div
                                onClick={() => {
                                    setSelectedId(null);
                                    setFriendData({});
                                }}
                                className="absolute top-4 right-4 text-2xl text-red-600 cursor-pointer"
                            >
                                ×
                            </div>
                            <div className="w-full flex justify-center pt-8">
                                <img
                                    src={friendData.pfp || "/default-avatar.png"}
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
                                        <b>Bio:</b> <i>{friendData.bio || 'No bio'}</i>
                                    </div>
                                    <div><b>Course:</b> {friendData.course || 'N/A'}</div>
                                    <div><b>Reg No:</b> {friendData.reg_no || 'N/A'}</div>
                                    <div><b>Section:</b> {friendData.section || 'N/A'}</div>
                                    <div><b>Age:</b> {friendData.age || 'N/A'}</div>
                                    <div><b>Gender:</b> {friendData.gender || 'N/A'}</div>
                                    <div>
                                        <b>Birthday:</b>{' '}
                                        {friendData.dob ? new Date(friendData.dob).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }) : 'N/A'}
                                    </div>
                                    <div><b>Email:</b> {friendData.email || 'N/A'}</div>
                                </div>
                                <div className="flex items-center justify-end pr-5 pb-6 space-x-3">
                                    <button
                                        onClick={() => setFriendTimetablePop(true)}
                                        className="text-white bg-blue-600 hover:scale-105 transition transform px-5 py-1 rounded-xl shadow-xl cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="loader mr-2"></span> : "View Timetable"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Friend Timetable Modal */}
            {friendTimetablePop && friendData._id && (
                <>
                    <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full overflow-auto relative">
                            <span onClick={() => setFriendTimetablePop(false)} className="absolute top-2 right-2 text-red-600 cursor-pointer text-2xl">×</span>
                            {isFriendTimetableEmpty ? (
                                <div className="text-center py-10 px-4">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{friendData.username} has no timetable.</h2>
                                    <p className="text-gray-600">No timetable data available for this user.</p>
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-lg font-semibold text-center text-gray-700 mb-4 p-2 bg-white/50 rounded-t-lg">
                                        {friendData.username}'s Weekly Overview
                                    </h4>
                                    <div className="max-h-[65vh] overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                            <thead className="bg-[#FFF3E2] text-gray-800 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                                                        Time / Day
                                                    </th>
                                                    {friendFilteredDays.map((day) => (
                                                        <th key={day} className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                                            {day}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {friendSortedTimeSlots.map((timeSlot, index) => (
                                                    <tr key={timeSlot} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-white/70">
                                                            {timeSlot}
                                                        </td>
                                                        {friendFilteredDays.map((day) => {
                                                            const currentClass = friendTimetableData[day]?.[timeSlot] || 'No class';
                                                            const isNoClass = currentClass === "No class";

                                                            return (
                                                                <td
                                                                    key={`${day}-${timeSlot}`}
                                                                    className={`px-2 py-3 text-sm ${isNoClass ? 'text-gray-500 italic' : 'text-gray-800 font-semibold'} ${isNoClass ? 'bg-gray-100/50' : 'hover:bg-gray-100 transition-colors duration-200'}`}
                                                                >
                                                                    {currentClass}
                                                                </td>
                                                            );
                                                        })}
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

            {/* Edit Pop Up */}
            {editPop && (
                <>
                    <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>
                    <div className="z-50 fixed inset-0 flex items-center justify-center">
                        <div className="w-full lg:w-2/3 bg-[#FFF3E2] shadow-xl rounded-2xl p-6 border border-white/40">
                            <h3 className="text-xl font-bold flex items-center justify-between text-[#FEC674] mb-6 border-b pb-2">
                                <span>Edit Information</span>
                                <span className="text-rose-600 font-medium cursor-pointer" onClick={() => setEditPop(false)}>×</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-sm">
                                {[
                                    { label: "Username", name: "username" },
                                    { label: "Course", name: "course" },
                                    { label: "Registration No", name: "reg_no" },
                                    { label: "Section", name: "section" },
                                    { label: "Age", name: "age", type: "number" },
                                ].map(({ label, name, type = "text" }) => (
                                    <div key={name}>
                                        <label><b>{label}:</b></label>
                                        <input
                                            className="bg-white h-8 w-full rounded-xl pl-4 shadow-xl mt-1"
                                            type={type}
                                            name={name}
                                            value={updateData[name]}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label><b>Gender:</b></label>
                                    <select
                                        name="gender"
                                        value={updateData.gender}
                                        onChange={handleChange}
                                        className="bg-white h-8 w-full rounded-xl pl-4 shadow-xl mt-1"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Fighter jet">Fighter jet</option>
                                        <option value="We have more??">We have more??</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label><b>Birthday:</b></label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={updateData.dob}
                                        onChange={handleChange}
                                        className="bg-white h-8 w-full rounded-xl pl-4 shadow-xl mt-1"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label><b>Bio:</b></label>
                                    <textarea
                                        className="bg-white w-full rounded-xl pl-4 shadow-xl mt-1"
                                        rows={3}
                                        name="bio"
                                        value={updateData.bio}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSubmitProfile}
                                    className="px-6 py-2 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition"
                                >
                                    {loading ? "Loading..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* PASSWORD CHANGE */}
            {passwordBox && <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>}
            {passwordBox && (
                <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white shadow-xl p-6 rounded-lg z-50 w-96">
                    <h2 className="text-lg font-bold text-[#FEC674] mb-4">Change Password</h2>

                    {!otpSent && (
                        <>
                            <p className="text-sm mb-4 text-gray-600">Click to receive an OTP on your registered email.</p>
                            <button
                                onClick={sendOtp}
                                className="w-full bg-[#FEC674] text-white font-bold py-2 rounded hover:scale-105 transition"
                            >
                                {loading ? "Loading..." : "Send OTP"}
                            </button>
                        </>
                    )}

                    {otpSent && !otpVerified && (
                        <>
                            <label className="block mb-1 mt-4 text-sm font-medium">Enter OTP:</label>
                            <input
                                type="number"
                                className="w-full mb-3 px-3 py-2 rounded border shadow"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setPasswordBox(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={verifyOtp}
                                    className="bg-[#FEC674] text-white font-bold px-4 py-2 rounded"
                                >
                                    {loading ? "Loading..." : "Verify OTP"}
                                </button>
                            </div>
                            {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
                        </>
                    )}

                    {otpVerified && (
                        <>
                            <label className="block mb-1 mt-4 text-sm font-medium">New Password:</label>
                            <input
                                type="password"
                                className="w-full mb-3 px-3 py-2 rounded border shadow"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setPasswordBox(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={changePasswordSubmit}
                                    className="bg-[#FEC674] text-white font-bold px-4 py-2 rounded"
                                >
                                    {loading ? "Loading..." : "Update Password"}
                                </button>
                            </div>
                            {passwordSuccess && <p className="text-green-600 mt-2">Password changed successfully!</p>}
                        </>
                    )}
                </div>
            )}

            {/* EMAIL CHANGE */}
            {emailBox && <div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>}
            {emailBox && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Change Email</h2>

                        {!otpSent && !otpVerified && (
                            <>
                                <p className="text-sm">Send OTP to your current email to proceed.</p>
                                <button onClick={sendOtp} className="mt-3 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">
                                    {loading ? "Loading..." : "Send OTP"}
                                </button>
                            </>
                        )}

                        {otpSent && !otpVerified && (
                            <>
                                <input type="number" placeholder="Enter OTP" className="w-full px-3 py-2 border rounded mt-3" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                <button onClick={verifyOtp} className="mt-2 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">
                                    {loading ? "Loading..." : "Verify OTP"}
                                </button>
                            </>
                        )}

                        {otpVerified && !emailOtpSent && (
                            <>
                                <input type="email" placeholder="Enter new email" className="w-full px-3 py-2 border rounded mt-3" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                <button onClick={sendOtpToNewEmail} className="mt-2 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">
                                    {loading ? "Loading..." : "Send OTP to new email"}
                                </button>
                            </>
                        )}

                        {emailOtpSent && (
                            <>
                                <input type="number" placeholder="Enter OTP from new email" className="w-full px-3 py-2 border rounded mt-3" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
                                <button onClick={verifyNewEmailOtp} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                                    {loading ? "Loading..." : "Verify & Save"}
                                </button>
                            </>
                        )}

                        <button className="mt-4 text-sm underline text-gray-600" onClick={() => setEmailBox(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Confirmation for Delete */}
            {deleteBox && (<div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>)}
            {deleteBox && (
                <div className="fixed top-50 left-1/2 transform -translate-x-1/2 bg-white shadow-xl p-6 rounded-lg z-50">
                    <h2 className="text-lg mb-4">Do you really want to delete your account?</h2>
                    <div className="flex gap-4 justify-end">
                        <button onClick={() => setDeleteBox(false)} className="bg-gray-300 px-4 py-1 rounded cursor-pointer transition transform duration-200 hover:scale-105">Cancel</button>
                        <button onClick={deleteHandler} className="bg-red-500 text-white px-4 py-1 rounded cursor-pointer transform hover:scale-105">
                            {loading ? "Loading..." : "Delete"}
                        </button>
                    </div>
                </div>
            )}

            {/* TimeTable Modal */}
            {timetablePop && (<div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>)}
            {timetablePop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full overflow-auto relative">
                        <span onClick={() => setTimetablePop(false)} className="absolute top-2 right-2 text-red-600 cursor-pointer text-2xl">×</span>
                        {isTimetableEmpty ? (
                            <div className="text-center py-10 px-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">No timetable found.</h2>
                                <p className="text-gray-600 mb-6">
                                    Upload your timetable in <b>Excel (preferred)</b> or PDF format.
                                </p>

                                <select
                                    value={selectedFileType}
                                    onChange={(e) => setSelectedFileType(e.target.value)}
                                    className="p-2 rounded-lg border border-gray-300 shadow"
                                >
                                    <option value="excel">📊 Excel (Preferred)</option>
                                    <option value="pdf">📄 PDF</option>
                                </select>

                                <input
                                    type="file"
                                    accept={selectedFileType === "pdf" ? ".pdf" : ".xlsx,.xls"}
                                    onChange={handleFileUpload}
                                    ref={timetableFileInputRef}
                                    className="hidden"
                                />

                                <button
                                    onClick={() => timetableFileInputRef.current?.click()}
                                    className="px-8 py-3 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 cursor-pointer shadow-md"
                                >
                                    UPLOAD TIMETABLE
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end gap-4 mb-4">
                                    <select
                                        value={selectedFileType}
                                        onChange={(e) => setSelectedFileType(e.target.value)}
                                        className="p-2 rounded-lg border border-gray-300 shadow"
                                    >
                                        <option value="excel">📊 Excel (Preferred)</option>
                                        <option value="pdf">📄 PDF</option>
                                    </select>

                                    <input
                                        type="file"
                                        accept={selectedFileType === "pdf" ? ".pdf" : ".xlsx,.xls"}
                                        onChange={handleFileUpload}
                                        ref={timetableFileInputRef}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() => timetableFileInputRef.current?.click()}
                                        className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md cursor-pointer hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                                    >
                                        <i className="fas fa-upload mr-2"></i> Reupload Timetable
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditMode(!editMode);
                                            if (editMode) {
                                                handleTimetableSubmit();
                                            }
                                        }}
                                        className={`px-4 py-2 text-white font-semibold rounded-md transition-colors duration-200 cursor-pointer shadow-sm ${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                    >
                                        {editMode ? (
                                            <>
                                                <i className="fas fa-save mr-2"></i> Done Editing
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-edit mr-2"></i> Edit Timetable
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="max-h-[65vh] overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                    <h4 className="text-lg font-semibold text-center text-gray-700 mb-4 p-2 bg-white/50 rounded-t-lg">
                                        Weekly Overview
                                    </h4>
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                        <thead className="bg-[#FFF3E2] text-gray-800 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                                                    Time / Day
                                                </th>
                                                {filteredDays.map((day) => (
                                                    <th key={day} className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                                        {day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {sortedTimeSlots.map((timeSlot, index) => (
                                                <tr key={timeSlot} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-white/70">
                                                        {timeSlot}
                                                    </td>
                                                    {filteredDays.map((day) => {
                                                        const currentClass = localTimetableData[day]?.[timeSlot] || 'No class';
                                                        const isNoClass = currentClass === "No class";

                                                        return (
                                                            <td
                                                                key={`${day}-${timeSlot}`}
                                                                className={`px-2 py-3 text-sm ${isNoClass ? 'text-gray-500 italic' : 'text-gray-800 font-semibold'} ${isNoClass ? 'bg-gray-100/50' : 'hover:bg-gray-100 transition-colors duration-200'} ${editMode ? 'border border-dashed border-gray-400' : ''}`}
                                                            >
                                                                {editMode ? (
                                                                    <input
                                                                        type="text"
                                                                        value={isNoClass ? '' : currentClass}
                                                                        onChange={(e) => handleManualTimetableChange(day, timeSlot, e.target.value)}
                                                                        className="w-full bg-transparent text-center focus:outline-none border-b border-gray-300"
                                                                        placeholder="Add Class"
                                                                    />
                                                                ) : (
                                                                    currentClass
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MAIN PROFILE LAYOUT */}
            {preview && (<div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>)}
            {preview && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    <div className="w-[90vw] max-w-md bg-white rounded-2xl p-5 shadow-2xl">
                        <div className="flex justify-end">
                            <button onClick={handleClose}>
                                <p className="text-red-600 text-2xl hover:scale-105 transition">×</p>
                            </button>
                        </div>
                        <div className="flex justify-center mt-2 mb-4 relative">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-36 h-36 rounded-full object-cover shadow-md"
                                />
                            ) : (
                                <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-md">
                                    No Image
                                </div>
                            )}
                            <button
                                onClick={handleClick}
                                className="absolute bottom-0 right-[30%] bg-[#FEC674] p-2 rounded-full shadow hover:scale-105 transition"
                            >
                                <i className="fa-solid fa-camera text-lg"></i>
                            </button>
                        </div>
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{initialUserData.username}</h2>
                            <p
                                className="text-sm text-gray-500 cursor-pointer hover:underline"
                                onClick={() => setFriendsPop(true)}
                            >
                                Friends: <b>{initialUserData?.friends?.length || 0}</b>
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={uploadPfp}
                                className="bg-[#FEC674] px-6 py-2 rounded-xl shadow-md hover:scale-105 transition"
                            >
                                {loading ? "Loading..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-center w-full max-w-6xl mx-auto">
                <div className="w-full z-1 lg:w-1/3 bg-white/30 backdrop-blur-lg shadow-xl rounded- p-6 flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
                        <img
                            src={initialUserData.pfp || "/default-avatar.png"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={handleClick}
                        className="bg-[#FEC674] absolute h-10 w-10 right-18 bottom-78 rounded-full hover:scale-105 transition duration-200"
                    >
                        <i className="fa-solid text-xl fa-camera"></i>
                    </button>
                    <h2 className="mt-5 text-xl font-bold text-gray-700">{initialUserData.username}</h2>
                    <p
                        className="text-sm text-gray-500 cursor-pointer hover:underline"
                        onClick={() => setFriendsPop(true)}
                    >
                        Friends: <b>{initialUserData?.friends?.length || 0}</b>
                    </p>
                    <div className="w-full mt-8">
                        <h3 className="font-bold text-gray-700 mb-3">⚙️ Settings</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="cursor-pointer hover:text-black" onClick={() => setEmailBox(!emailBox)}>Change Email</li>
                            <li className="cursor-pointer hover:text-black" onClick={() => setPasswordBox(!passwordBox)}>Change Password</li>
                            <li
                                className="text-red-600 font-bold cursor-pointer hover:underline"
                                onClick={() => setDeleteBox(true)}
                            >
                                Delete Account
                            </li>
                        </ul>
                        <button
                            className="w-full mt-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-semibold cursor-pointer transform hover:scale-105 duration-200"
                            onClick={logout}
                        >
                            {loading ? "Loading..." : "Logout"}
                        </button>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 bg-white/30 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/40">
                    <h3 className="text-xl font-bold text-[#FEC674] mb-6 border-b pb-2">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-sm">
                        <div><b>Username:</b> {initialUserData.username}</div>
                        <div><b>Course:</b> {initialUserData.course}</div>
                        <div><b>Registration No:</b> {initialUserData.reg_no}</div>
                        <div><b>Section:</b> {initialUserData.section}</div>
                        <div><b>Age:</b> {initialUserData.age}</div>
                        <div><b>Gender:</b> {initialUserData.gender}</div>
                        <div><b>Birthday:</b> {displayDate}</div>
                        <div><b>Email:</b> {initialUserData.email}</div>
                        <div className="md:col-span-2"><b>Bio:</b> <i>{initialUserData.bio}</i></div>
                    </div>
                    <div className="mt-8 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                        <button
                            onClick={() => setEditPop(true)}
                            className="w-full md:w-auto px-6 py-2 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition cursor-pointer"
                        >
                            {loading ? "Loading..." : "Edit Profile"}
                        </button>
                        <button
                            onClick={() => {
                                setTimetablePop(true);
                                setEditMode(false);
                            }}
                            className="w-full md:w-auto px-6 py-2 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition cursor-pointer"
                        >
                            View/Edit Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
