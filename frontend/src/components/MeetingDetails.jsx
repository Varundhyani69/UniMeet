import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, MapPin, User, Users, Trash2 } from "lucide-react";

const MeetingDetails = ({ isOpen, setIsOpen, meetingId, userId, onUpdate }) => {
    const [meeting, setMeeting] = useState(null);
    const [rejectMessage, setRejectMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/meeting/${meetingId}`,
                    { withCredentials: true }
                );
                if (res.data.success) {
                    setMeeting(res.data.meeting);
                }
            } catch (err) {
                console.error("Error fetching meeting details:", err);
            }
        };
        if (isOpen && meetingId) fetchMeeting();
    }, [isOpen, meetingId]);

    const handleAccept = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/meeting/${meetingId}/accept`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setMeeting((prev) => ({
                    ...prev,
                    invitees: prev.invitees.filter((u) => u._id !== userId),
                    accepted: [...prev.accepted, { _id: userId, username: "You" }],
                }));
                onUpdate();
            }
        } catch (err) {
            setError("Error accepting meeting");
            console.error("Accept meeting error:", err);
        }
    };

    const handleReject = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/meeting/${meetingId}/reject`,
                { message: rejectMessage },
                { withCredentials: true }
            );
            if (res.data.success) {
                setMeeting((prev) => ({
                    ...prev,
                    invitees: prev.invitees.filter((u) => u._id !== userId),
                    rejected: [
                        ...prev.rejected,
                        { user: { _id: userId, username: "You" }, message: rejectMessage },
                    ],
                }));
                setRejectMessage("");
                onUpdate();
            }
        } catch (err) {
            setError("Error rejecting meeting");
            console.error("Reject meeting error:", err);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Cancel this meeting permanently?")) return;
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/meeting/${meetingId}/delete`,
                { withCredentials: true }
            );
            if (res.data.success) {
                setIsOpen(false);
                onUpdate();
            }
        } catch (err) {
            setError("Error canceling meeting");
            console.error("Cancel meeting error:", err);
        }
    };

    if (!meeting) return null;

    const isInvitee = meeting.invitees.some((u) => u._id === userId);
    const isAccepted = meeting.accepted.some((u) => u._id === userId);
    const isRejected = meeting.rejected.some((r) => r.user._id === userId);
    const isCreator = meeting.creator._id === userId;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 relative"
                    >
                        {/* Header */}
                        <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
                            {meeting.title || "Untitled Meeting"}
                        </h2>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2">
                                <User size={16} className="text-gray-500" />{" "}
                                <span className="font-medium">Creator:</span>{" "}
                                {meeting.creator.username}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-500" />{" "}
                                <span className="font-medium">Location:</span>{" "}
                                {meeting.location}
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-500" />{" "}
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(meeting.date).toLocaleDateString()}
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-500" />{" "}
                                <span className="font-medium">Time:</span> {meeting.timeSlot}
                            </p>
                            {meeting.description && (
                                <p className="text-gray-700 italic">
                                    “{meeting.description}”
                                </p>
                            )}
                        </div>

                        {/* Status Section */}
                        <div className="mt-4 space-y-2">
                            <p className="font-semibold flex items-center gap-1">
                                <Users size={16} /> Participants
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                    <p className="font-medium text-green-600 flex items-center gap-1">
                                        <CheckCircle size={14} /> Accepted
                                    </p>
                                    <p className="text-xs">
                                        {meeting.accepted.map((u) => u.username).join(", ") || "None"}
                                    </p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                    <p className="font-medium text-yellow-600 flex items-center gap-1">
                                        <Clock size={14} /> Pending
                                    </p>
                                    <p className="text-xs">
                                        {meeting.invitees.map((u) => u.username).join(", ") || "None"}
                                    </p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-2 col-span-2">
                                    <p className="font-medium text-red-600 flex items-center gap-1">
                                        <XCircle size={14} /> Rejected
                                    </p>
                                    {meeting.rejected.length > 0 ? (
                                        meeting.rejected.map((r) => (
                                            <p key={r.user._id} className="text-xs ml-2">
                                                {r.user.username}
                                                {r.message ? `: ${r.message}` : ""}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-xs">None</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {isInvitee && !isAccepted && !isRejected && (
                            <div className="mt-4">
                                <textarea
                                    value={rejectMessage}
                                    onChange={(e) => setRejectMessage(e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm mb-2"
                                    placeholder="Optional rejection message"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleAccept}
                                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Creator Actions */}
                        {isCreator && (
                            <div className="mt-4">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm hover:bg-red-200"
                                >
                                    <Trash2 size={16} /> Cancel Meeting
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-sm hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MeetingDetails;
