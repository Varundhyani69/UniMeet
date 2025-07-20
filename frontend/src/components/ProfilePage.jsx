import axios from "axios";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';


const ProfilePage = ({ userData: initialUserData, setUserData: setParentUserData }) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

    const navigate = useNavigate();
    const timetableFileInputRef = useRef(null);

    // Local state for profile data (editable fields)
    const [updateData, setUpdateData] = useState({});


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

    // States for email change
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpVerified, setEmailOtpVerified] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);



    const [localTimetableData, setLocalTimetableData] = useState({});
    const [editMode, setEditMode] = useState(false); // State to toggle edit mode for timetable


    // Initialize updateData and localTimetableData when initialUserData changes
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
        try {
            const res = await axios.post(
                'http://localhost:8080/api/user/logout',
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                navigate('/');
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleChange = (e) => {
        setUpdateData({ ...updateData, [e.target.name]: e.target.value });
    };

    const handleSubmitProfile = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8080/api/user/editProfile',
                updateData,
                { withCredentials: true }
            );
            if (res.status === 200) {
                if (setParentUserData) {
                    setParentUserData(prev => ({
                        ...prev,
                        ...updateData
                    }));
                }
                setEditPop(false);
            }
        } catch (err) {
            console.log('Profile update error:', err.response?.data || err.message);
        }
    };

    const displayDate = initialUserData.dob ? new Date(initialUserData.dob).toISOString().split('T')[0] : '00-00-00';
    const deleteHandler = async () => {
        try {
            const res = await axios.delete('http://localhost:8080/api/user/deleteUser', { withCredentials: true })
            if (res.status === 200) {
                navigate('/');
                console.log("Account deleted");
            }
        } catch (err) {
            console.log('Profile update error:', err.response?.data || err.message);
        }
    }


    const sendOtp = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8080/api/user/sendChangePasswordOtp',
                {},
                { withCredentials: true }
            );
            if (res.status === 200) {
                setOtpSent(true);
                setOtpError('');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || "Failed to send OTP");
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8080/api/user/verifyChangePasswordOtp',
                { otp },
                { withCredentials: true }
            );
            if (res.status === 200) {
                setOtpVerified(true);
                setOtpError('');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || "Invalid OTP");
        }
    };

    const changePasswordSubmit = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8080/api/user/changePassword',
                { newPassword },
                { withCredentials: true }
            );
            if (res.status === 200) {
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
        } catch (err) {
            setOtpError(err.response?.data?.message || "Failed to change password");
        }
    };

    const sendEmailOtp = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/user/sendChangePasswordOtp', {}, { withCredentials: true });
            if (res.status === 200) {
                setOtpSent(true);
                setOtpError('');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || "Failed to send OTP");
        }
    };

    const verifyEmailOtp = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/user/verifyChangePasswordOtp', { otp }, { withCredentials: true });
            if (res.status === 200) {
                setOtpVerified(true);
                setOtpError('');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || "Invalid OTP");
        }
    };

    const sendOtpToNewEmail = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/user/sendVerificationNewEmail', { email: newEmail }, { withCredentials: true });
            if (res.status === 200) setEmailOtpSent(true);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const verifyNewEmailOtp = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/user/verifyNewEmail', { email: newEmail, otp: emailOtp }, { withCredentials: true });
            if (res.status === 200) {
                setEmailSuccess(true);
                setEmailBox(false);
            }
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };


    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('timetable', file);

        try {
            const res = await axios.post('http://localhost:8080/api/timetable/upload-timetable',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (res.data.success) {
                let structuredTimetable = res.data.timetable;

                // ✅ Add Sunday if missing
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

                console.log("Structured Timetable from upload:", structuredTimetable);
                setLocalTimetableData(structuredTimetable);

                if (setParentUserData) {
                    setParentUserData(prev => ({ ...prev, timetable: structuredTimetable }));
                }

                setEditMode(false);
                alert("Timetable uploaded/reuploaded successfully!");
            } else {
                console.error("Upload failed with success: false", res.data.message);
                alert(`Upload failed: ${res.data.message || "Unknown error"}`);
            }

        } catch (err) {
            console.error("Upload failed:", err.response?.data || err.message);
            alert(`Timetable upload failed: ${err.response?.data?.message || err.message}`);
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
        try {
            const updatedTimetable = { ...localTimetableData };

            // ✅ Add Sunday if missing before sending to backend
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
                'http://localhost:8080/api/timetable/editTimetable',
                { timetable: updatedTimetable },
                { withCredentials: true }
            );

            if (res.data.success) {
                setEditMode(false);
                console.log('Manually updated timetable saved:', res.data.timetable);
                if (setParentUserData) {
                    setParentUserData(prev => ({ ...prev, timetable: res.data.timetable }));
                }
            } else {
                console.log("Manual update failed:", res.data.message);
            }
        } catch (err) {
            console.log('Manual timetable update error:', err.response?.data || err.message);
        }
    };


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
        setSelectedFile(file); // Save actual file
    };
    const handleClose = () => {
        setPreview('');
    }
    const uploadPfp = async () => {
        if (!selectedFile) return alert("No file selected");

        const formData = new FormData();
        formData.append("pfp", selectedFile);

        try {
            const res = await axios.post('http://localhost:8080/api/user/uploadPfp', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 200) {
                alert("Profile picture uploaded successfully");
                setPreview('');
                setSelectedFile(null);
            }
        } catch (err) {
            console.log('Upload error:', err.response?.data || err.message);
        }
    };

    return (
        <div className="mb-2 font-[Inter]">
            <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
                MY PROFILE
            </h1>

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
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* PASSWORD CHANGE */}
            {passwordBox && <div className="fixed z-40 inset-0  bg-black/30 backdrop-blur-sm"></div>}
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
                                Send OTP
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
                                    Verify OTP
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
                                    Update Password
                                </button>
                            </div>
                            {passwordSuccess && <p className="text-green-600 mt-2">Password changed successfully!</p>}
                        </>
                    )}
                </div>
            )}

            {/* EMAIL CHANGE */}
            {emailBox && <div className="fixed z-40 inset-0  bg-black/30 backdrop-blur-sm"></div>}
            {emailBox && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Change Email</h2>

                        {!otpSent && !otpVerified && (
                            <>
                                <p className="text-sm">Send OTP to your current email to proceed.</p>
                                <button onClick={sendEmailOtp} className="mt-3 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">Send OTP</button>
                            </>
                        )}

                        {otpSent && !otpVerified && (
                            <>
                                <input type="number" placeholder="Enter OTP" className="w-full px-3 py-2 border rounded mt-3" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                <button onClick={verifyEmailOtp} className="mt-2 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">Verify OTP</button>
                            </>
                        )}

                        {otpVerified && !emailOtpSent && (
                            <>
                                <input type="email" placeholder="Enter new email" className="w-full px-3 py-2 border rounded mt-3" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                <button onClick={sendOtpToNewEmail} className="mt-2 bg-yellow-400 text-white px-4 py-2 rounded-full font-bold">Send OTP to new email</button>
                            </>
                        )}

                        {emailOtpSent && (
                            <>
                                <input type="number" placeholder="Enter OTP from new email" className="w-full px-3 py-2 border rounded mt-3" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
                                <button onClick={verifyNewEmailOtp} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full font-bold">Verify & Save</button>
                            </>
                        )}

                        <button className="mt-4 text-sm underline text-gray-600" onClick={() => setEmailBox(false)}>Cancel</button>
                    </div>
                </div>
            )}


            {/* Confirmation for Delete */}
            {deleteBox && (<div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>)}
            {deleteBox && (

                <div className="fixed top-50 left-1/2 transform -translate-x-1/2 bg-white shadow-xl p-6 rounded-lg z-50 ">

                    <h2 className="text-lg mb-4">Do you really want to delete your account?</h2>
                    <div className="flex gap-4 justify-end">
                        <button onClick={() => setDeleteBox(false)} className="bg-gray-300 px-4 py-1 rounded cursor-pointer transition transform duration-200 hover:scale-105">Cancel</button>
                        <button onClick={deleteHandler} className="bg-red-500 text-white px-4 py-1 rounded cursor-pointer transform hover:scale-105">Delete</button>
                    </div>
                </div>
            )}

            {/* TimeTable Modal */}
            {timetablePop && (
                <>
                    <div className="fixed z-40  inset-0 bg-black/30 backdrop-blur-sm  " onClick={() => setTimetablePop(false)}></div>

                    <div className="z-50 h-110 top-20 fixed inset-0 flex items-center justify-center p-4 ">
                        <div className="relative w-full max-w-5xl h-140 bg-white/30 backdrop-blur-lg shadow-2xl rounded-2xl p-6 border border-white/40 overflow-hidden">
                            <h3 className="text-2xl font-bold flex items-center justify-between text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
                                <span>Your Timetable</span>
                                <button
                                    className="text-rose-600 font-medium text-3xl leading-none hover:text-rose-800 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setTimetablePop(false);
                                        setEditMode(false);
                                    }}
                                    aria-label="Close timetable"
                                >
                                    &times;
                                </button>
                            </h3>

                            {isTimetableEmpty ? (
                                <div className="text-center py-10 px-4">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">No timetable found.</h2>
                                    <p className="text-gray-600 mb-6">It looks like you haven't uploaded your timetable yet. Upload a PDF to get started!</p>
                                    <input
                                        type="file"
                                        accept="application/pdf"
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
                                        <input
                                            type="file"
                                            accept="application/pdf"
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
                                            className={`px-4 py-2 ${editMode ? 'bg-green-600' : 'bg-purple-600'} text-white font-semibold rounded-md hover:${editMode ? 'bg-green-700' : 'bg-purple-700'} transition-colors duration-200 cursor-pointer shadow-sm`}
                                        >
                                            {editMode ? (<><i className="fas fa-save mr-2"></i> Done Editing</>) : (<><i className="fas fa-edit mr-2"></i> Edit Timetable</>)}
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


                                                    <th className="rounded-tr-lg"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {sortedTimeSlots.map((timeSlot, index) => (
                                                    <tr key={timeSlot} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-white/70">
                                                            {timeSlot}
                                                        </td>
                                                        {filteredDays.map((day) => {
                                                            const currentClass = localTimetableData[day]?.[timeSlot];
                                                            const isNoClass = currentClass === "No class" || !currentClass;

                                                            return (
                                                                <td
                                                                    key={`${day}-${timeSlot}`}
                                                                    className={`px-2 py-3 text-sm ${isNoClass ? 'text-gray-500 italic' : 'text-gray-800 font-semibold'
                                                                        } ${isNoClass ? 'bg-gray-100/50' : 'hover:bg-gray-100 transition-colors duration-200'}
                                                                    ${editMode ? 'border border-dashed border-gray-400' : ''}`}
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
                                                                        isNoClass ? '' : currentClass
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
                </>
            )}

            {/* MAIN PROFILE LAYOUT */}
            {
                preview && (<div className="fixed z-40 inset-0 bg-black/30 backdrop-blur-sm"></div>)
            }
            {preview && (
                <div className="fixed inset-0 z-40 flex  items-center justify-center">
                    <div className="w-[90vw] max-w-md bg-white rounded-2xl p-5 shadow-2xl">

                        {/* Close Button */}
                        <div className="flex justify-end">
                            <button onClick={handleClose}>
                                <p className="text-red-600 text-2xl hover:scale-105 transition">×</p>
                            </button>
                        </div>

                        {/* Profile Image Preview */}
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

                            {/* Camera Icon Button */}
                            <button
                                onClick={handleClick}
                                className="absolute bottom-0 right-[30%] bg-[#FEC674] p-2 rounded-full shadow hover:scale-105 transition"
                            >
                                <i className="fa-solid fa-camera text-lg"></i>
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{initialUserData.username}</h2>
                            <p className="text-sm text-gray-500">
                                Friends: <b>{initialUserData?.friends?.length || 0}</b>
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={uploadPfp}
                                className="bg-[#FEC674] px-6 py-2 rounded-xl shadow-md hover:scale-105 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-center w-full max-w-6xl mx-auto">
                {/* LEFT CARD */}
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
                    ><i className="fa-solid text-xl fa-camera"></i></button>




                    <h2 className="mt-5 text-xl font-bold text-gray-700">{initialUserData.username}</h2>
                    <p className="text-sm text-gray-500">Friends: <b>{initialUserData?.friends?.length || 0}</b></p>

                    <div className="w-full mt-8">
                        <h3 className="font-bold text-gray-700 mb-3">⚙️ Settings</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="cursor-pointer hover:text-black" onClick={() => setEmailBox(!emailBox)} >Change Email</li>
                            <li className="cursor-pointer hover:text-black" onClick={() => setPasswordBox(!passwordBox)} >Change Password</li>
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
                            Logout
                        </button>
                    </div>
                </div>

                {/* RIGHT CARD */}
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

                    <div className="mt-8">
                        <button
                            onClick={() => setEditPop(true)}
                            className="px-6 py-2 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition cursor-pointer"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => {
                                setTimetablePop(true);
                                setEditMode(false);
                            }}
                            className="px-6 py-2 ml-3 bg-[#FEC674] text-white font-bold rounded-full hover:scale-105 transition cursor-pointer"
                        >
                            View/Edit Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProfilePage;