import Meeting from "../models/meetingModel.js";
import User from "../models/userModel.js";

const lastCreated = {};

const computeExpiresAt = (date, timeSlot) => {
    const [start, end] = timeSlot.split(' - ');
    const endTime = end.trim();
    const [hours, minutes] = endTime.split(':').map(part => parseInt(part));
    const ampm = endTime.split(' ')[1];
    let endHour = hours;
    if (ampm === 'PM' && hours !== 12) endHour += 12;
    if (ampm === 'AM' && hours === 12) endHour = 0;
    const expires = new Date(date);
    expires.setHours(endHour, minutes, 0, 0);
    return expires;
};

export const createMeeting = async (req, res) => {
    try {
        const { friends, location, description, date, timeSlot, title } = req.body;
        const creatorId = req.userId;

        if (!friends || friends.length === 0 || !location || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // cooldown check
        const now = Date.now();
        if (lastCreated[creatorId] && now - lastCreated[creatorId] < 10000) {
            return res.status(429).json({ success: false, message: "Please wait 10 seconds before creating another meeting." });
        }
        lastCreated[creatorId] = now;

        const expiresAt = computeExpiresAt(date, timeSlot);

        const meeting = new Meeting({
            creator: creatorId,
            title,
            location,
            description,
            date: new Date(date),
            timeSlot,
            invitees: friends,
            expiresAt
        });

        await meeting.save();

        // Send notifications to invitees
        const creator = await User.findById(creatorId);
        for (const inviteeId of friends) {
            const invitee = await User.findById(inviteeId);
            if (invitee) {
                invitee.notifications.unshift({
                    message: `You have a meeting invitation from ${creator.username}: ${title || 'Untitled Meeting'}`,
                    from: creatorId,
                    meetingId: meeting._id
                });
                invitee.notifications = invitee.notifications.slice(0, 10);
                await invitee.save();
            }
        }

        // Emit socket event for real-time notifications
        req.io.to(friends).emit("meeting-invitation", {
            meetingId: meeting._id,
            message: `New meeting invitation from ${creator.username}: ${title || 'Untitled Meeting'}`
        });

        res.status(201).json({ success: true, message: "Meeting created and invitations sent", meeting });
    } catch (error) {
        console.error("Create meeting error:", error);
        res.status(500).json({ success: false, message: "Error creating meeting" });
    }
};

export const getMyMeetings = async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();

        const meetings = await Meeting.find({
            $or: [
                { creator: userId },
                { invitees: userId },
                { accepted: userId },
                { 'rejected.user': userId }
            ],
            expiresAt: { $gt: now }
        }).populate('creator invitees accepted rejected.user', 'username pfp');

        const created = meetings.filter(m => m.creator._id.toString() === userId.toString());
        const pending = meetings.filter(m => m.invitees.some(u => u._id.toString() === userId.toString()));
        const accepted = meetings.filter(m => m.accepted.some(u => u._id.toString() === userId.toString()));
        const rejected = meetings.filter(m => m.rejected.some(r => r.user._id.toString() === userId.toString()));

        res.status(200).json({ success: true, created, pending, accepted, rejected });
    } catch (error) {
        console.error("Get meetings error:", error);
        res.status(500).json({ success: false, message: "Error fetching meetings" });
    }
};

export const getMeetingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id)
            .populate('creator invitees accepted rejected.user', 'username pfp');

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, meeting });
    } catch (error) {
        console.error("Get meeting details error:", error);
        res.status(500).json({ success: false, message: "Error fetching meeting details" });
    }
};

export const acceptMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const meeting = await Meeting.findById(id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        meeting.invitees = meeting.invitees.filter(u => u.toString() !== userId.toString());
        if (!meeting.accepted.includes(userId)) {
            meeting.accepted.push(userId);
        }
        await meeting.save();

        const acceptingUser = await User.findById(userId).select('username');
        const creator = await User.findById(meeting.creator);
        if (creator) {
            creator.notifications.unshift({
                message: `${acceptingUser.username} accepted your meeting: ${meeting.title || 'Untitled Meeting'}`,
                from: userId
            });
            creator.notifications = creator.notifications.slice(0, 10);
            await creator.save();
            req.io.to(meeting.creator.toString()).emit("meeting-update", {
                meetingId: meeting._id,
                message: `${acceptingUser.username} accepted your meeting`
            });
        }

        res.status(200).json({ success: true, message: "Meeting accepted" });
    } catch (error) {
        console.error("Accept meeting error:", error);
        res.status(500).json({ success: false, message: "Error accepting meeting" });
    }
};

export const rejectMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = req.userId;

        const meeting = await Meeting.findById(id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        meeting.invitees = meeting.invitees.filter(u => u.toString() !== userId.toString());
        meeting.rejected.push({ user: userId, message });
        await meeting.save();

        const rejectingUser = await User.findById(userId).select('username');
        const creator = await User.findById(meeting.creator);
        if (creator) {
            creator.notifications.unshift({
                message: `${rejectingUser.username} rejected your meeting: ${meeting.title || 'Untitled Meeting'}${message ? ` - ${message}` : ''}`,
                from: userId
            });
            creator.notifications = creator.notifications.slice(0, 10);
            await creator.save();
            req.io.to(meeting.creator.toString()).emit("meeting-update", {
                meetingId: meeting._id,
                message: `${rejectingUser.username} rejected your meeting${message ? `: ${message}` : ''}`
            });
        }

        res.status(200).json({ success: true, message: "Meeting rejected" });
    } catch (error) {
        console.error("Reject meeting error:", error);
        res.status(500).json({ success: false, message: "Error rejecting meeting" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const meeting = await Meeting.findById(id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
        if (meeting.creator.toString() !== userId.toString()) return res.status(403).json({ success: false, message: "Only creator can cancel the meeting" });

        // Notify all participants
        const participants = [...meeting.invitees, ...meeting.accepted, ...meeting.rejected.map(r => r.user)];
        const creator = await User.findById(userId).select('username');

        for (const participantId of participants) {
            const participant = await User.findById(participantId);
            if (participant) {
                participant.notifications.unshift({
                    message: `${creator.username} canceled the meeting: ${meeting.title || 'Untitled Meeting'}`,
                    from: userId
                });
                participant.notifications = participant.notifications.slice(0, 10);
                await participant.save();
                req.io.to(participantId.toString()).emit("meeting-deleted", {
                    meetingId: meeting._id,
                    message: `${creator.username} canceled the meeting`
                });
            }
        }

        await Meeting.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Meeting canceled" });
    } catch (error) {
        console.error("Delete meeting error:", error);
        res.status(500).json({ success: false, message: "Error canceling meeting" });
    }
};