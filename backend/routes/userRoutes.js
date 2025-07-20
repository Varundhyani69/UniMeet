import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { acceptRejectRequest, changePassword, deleteUser, editProfile, getFriendDetails, getFriends, getMe, getNotifications, getPendingReq, getProfile, getUserDetails, login, logout, markNotificationAsRead, register, searchFriends, searchUsers, sendChangePasswordOtp, sendFriendRequest, sendReminder, sendVerificationNewEmail, uploadPfp, uploadTimeTable, verifyChangePasswordOtp, verifyNewEmail } from "../controllers/userController.js";
import upload from '../multer.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/sendChangePasswordOtp', isAuthenticated, sendChangePasswordOtp);
router.post('/verifyChangePasswordOtp', isAuthenticated, verifyChangePasswordOtp);
router.post('/changePassword', isAuthenticated, changePassword);
router.post('/editProfile', isAuthenticated, editProfile);
router.post('/:id/sendFriendRequest', isAuthenticated, sendFriendRequest);
router.post('/acceptRejectRequest', isAuthenticated, acceptRejectRequest);
router.post('/uploadTimeTable', isAuthenticated, uploadTimeTable);
router.post('/sendVerificationNewEmail', isAuthenticated, sendVerificationNewEmail);
router.post('/verifyNewEmail', isAuthenticated, verifyNewEmail);
router.post('/sendReminder/:toUserId', isAuthenticated, sendReminder);
router.patch('/notification/:index/markRead', isAuthenticated, markNotificationAsRead);
router.post('/uploadPfp', isAuthenticated, upload.single('pfp'), uploadPfp);

router.get('/getUserDetails', isAuthenticated, getUserDetails);
router.get('/:id/getProfile', isAuthenticated, getProfile);
router.get('/getFriends', isAuthenticated, getFriends);
router.get('/getPendingReq', isAuthenticated, getPendingReq);
router.get('/search', isAuthenticated, searchUsers);
router.get('/:selectedId/getFriendDetails', isAuthenticated, getFriendDetails);
router.get('/getNotifications', isAuthenticated, getNotifications);
router.get('/searchFriends', isAuthenticated, searchFriends);

router.get('/me', isAuthenticated, getMe);

router.delete('/deleteUser', isAuthenticated, deleteUser);

export default router;