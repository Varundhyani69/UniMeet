import React, { useState, useEffect } from 'react';
import Header from './Header';
import Timetable from './Timetable';
import Friends from './Friends';
import MeetingPopup from './MeetingPopup';
import MeetingDetails from './MeetingDetails';
import Meetings from './Meetings';
import axios from 'axios';
import { io } from 'socket.io-client';

const Home = ({ userData }) => {
    const [meetings, setMeetings] = useState({
        created: [],
        pending: [],
        accepted: [],
        rejected: []
    });
    const [isMeetingPopupOpen, setIsMeetingPopupOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInstance = io(import.meta.env.VITE_API_BASE_URL, {
            withCredentials: true
        });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            socketInstance.emit('setup', userData);
        });

        socketInstance.on('meeting-invitation', () => {
            fetchMeetings();
        });

        socketInstance.on('meeting-update', () => {
            fetchMeetings();
        });

        socketInstance.on('meeting-deleted', () => {
            fetchMeetings();
        });

        return () => socketInstance.disconnect();
    }, [userData]);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/meeting/my`, { withCredentials: true });
            if (res.data.success) {
                setMeetings({
                    created: res.data.created,
                    pending: res.data.pending,
                    accepted: res.data.accepted,
                    rejected: res.data.rejected
                });
            }
        } catch (err) {
            console.error("Error fetching meetings:", err);
        }
    };

    const handleMeetingCreated = () => {
        fetchMeetings();
    };

    return (
        <div>
            <div className="mb-4">
                <Header userData={userData} />
            </div>
            <div className="mb-4">
                <Meetings
                    meetings={meetings}
                    userData={userData}
                    setIsMeetingPopupOpen={setIsMeetingPopupOpen}
                    handleMeetingCreated={handleMeetingCreated}
                    setSelectedMeeting={setSelectedMeeting}
                />
            </div>

            <MeetingPopup
                isOpen={isMeetingPopupOpen}
                setIsOpen={setIsMeetingPopupOpen}
                userData={userData}
                onMeetingCreated={handleMeetingCreated}
            />
            <div className="mb-4">
                <Friends userData={userData} />
            </div>
            <div className="mb-4">
                <Timetable userData={userData} />
            </div>
            {selectedMeeting && (
                <MeetingDetails
                    isOpen={!!selectedMeeting}
                    setIsOpen={() => setSelectedMeeting(null)}
                    meetingId={selectedMeeting}
                    userId={userData._id}
                    onUpdate={fetchMeetings}
                />
            )}
        </div>
    );
};

export default Home;