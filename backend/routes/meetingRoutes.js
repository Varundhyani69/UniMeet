// meetingRoutes.js
import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { acceptMeeting, createMeeting, getMeetingDetails, getMyMeetings, rejectMeeting, deleteMeeting } from "../controllers/meetingController.js";

const router = express.Router();

router.post('/create', isAuthenticated, createMeeting);
router.get('/my', isAuthenticated, getMyMeetings);
router.get('/:id', isAuthenticated, getMeetingDetails);
router.post('/:id/accept', isAuthenticated, acceptMeeting);
router.post('/:id/reject', isAuthenticated, rejectMeeting);
router.delete('/:id/delete', isAuthenticated, deleteMeeting); // Added

export default router;