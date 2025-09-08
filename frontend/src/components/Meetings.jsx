import React from "react";
import MeetingPopup from "./MeetingPopup";
import { CalendarPlus, Calendar, Clock, MapPin, User } from "lucide-react";

const Meetings = ({
    meetings,
    userData,
    setIsMeetingPopupOpen,
    handleMeetingCreated,
    setSelectedMeeting,
}) => {
    const renderMeetingCard = (meeting, category) => {
        const colors = {
            pending: "border-yellow-400 bg-yellow-50",
            created: "border-blue-400 bg-blue-50",
            accepted: "border-green-400 bg-green-50",
            rejected: "border-red-400 bg-red-50",
        };

        return (
            <div
                key={meeting._id}
                className={`flex flex-col justify-between p-5 rounded-2xl shadow-md border ${colors[category]} cursor-pointer hover:shadow-xl hover:scale-105 transform transition duration-200 w-64`}
                onClick={() => setSelectedMeeting(meeting._id)}
            >
                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {meeting.title || "Untitled"}
                </h3>
                {meeting.creator && (
                    <p className="text-sm text-gray-600 truncate">
                        by {meeting.creator.username}
                    </p>
                )}

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-gray-700 truncate">
                            {meeting.location}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-gray-700 truncate">
                            {new Date(meeting.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-gray-700 truncate">
                            {meeting.timeSlot}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                        <User className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-gray-700 truncate">Attendee</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="ml-2 mb-10">
            {/* Heading */}
            <div className="flex items-center justify-between mb-8">
                <h1
                    className="text-2xl sm:text-4xl"
                    style={{ fontFamily: '"Keania One", cursive' }}
                >
                    <span>My&nbsp;</span>
                    <span className="text-[#FEC674]">Meetings</span>
                </h1>
                <button
                    onClick={() => setIsMeetingPopupOpen(true)}
                    className="p-3 bg-[#FEC674] text-white rounded-full shadow hover:scale-110 transform transition"
                >
                    <CalendarPlus size={20} />
                </button>
            </div>

            {/* Meetings List */}
            <div className="flex flex-wrap gap-6 justify-start">
                {meetings.pending.map((m) => renderMeetingCard(m, "pending"))}
                {meetings.created.map((m) => renderMeetingCard(m, "created"))}
                {meetings.accepted.map((m) => renderMeetingCard(m, "accepted"))}
                {meetings.rejected.map((m) => renderMeetingCard(m, "rejected"))}

                {meetings.created.length === 0 &&
                    meetings.pending.length === 0 &&
                    meetings.accepted.length === 0 &&
                    meetings.rejected.length === 0 && (
                        <p className="text-gray-500 text-center w-full">
                            No meetings yet. Click the + button to create one!
                        </p>
                    )}
            </div>

            {/* Meeting Popup
            <MeetingPopup
                isOpen={false}
                setIsOpen={() => { }}
                userData={userData}
                onMeetingCreated={handleMeetingCreated}
            /> */}
        </div>
    );
};

export default Meetings;
