import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from '../cloudinary.js';

dotenv.config();
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Something is missing" });
        }
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.status(400).json({ success: false, message: "Username not available" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                email: newUser.email,
                pfp: newUser.pfp
            }
        })
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ success: false, message: "Registeration error" });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Something is missing" });
        }

        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: "User not registered" });
        }

        const checkPass = await bcrypt.compare(password, user.password);
        if (!checkPass) {
            return res.status(400).json({ success: false, message: "Wrong Password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const cleanUser = await User.findById(user._id).select('-password -otp -otp_expiry -verified -pendingRequest -createdAt -updatedAt');

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,        // ✅ REQUIRED
            sameSite: "None",    // ✅ REQUIRED
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: `Welcome back ${user.username}`,
            user: cleanUser
        });

    } catch (error) {
        console.error("Login error :", error);
        return res.status(500).json({ success: false, message: "Login error" });
    }
};



export const getUserDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('friends', '_id username pfp course reg_no');;
        if (!user) {
            return res.status(400).json({ success: false, message: 'Cant find user data' })
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Data error:", error);
        return res.status(500).json({ success: false, message: "Data error" });
    }
}

export const getFriendDetails = async (req, res) => {
    try {
        const { selectedId } = req.params;
        if (!selectedId) return res.status(400).json({ message: "Id is required" });

        const friendData = await User.findById(selectedId)
            .select("-password -otp -otp_expiry -verified")
            .populate("friends", "username pfp timetable");

        if (!friendData) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ success: true, friendData });
    } catch (error) {
        console.error("Data error:", error);
        return res.status(500).json({ success: false, message: "Data error" });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        }).json({ success: true, message: "Logout successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: "Logout error" });
    }
}

export const sendChangePasswordOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "Not authenticated" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otp_expiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Your UNIMEET OTP Code",
            html: `<h2>Your OTP is: ${otp}</h2><p>It expires in 5 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "OTP sent" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error while changing password" });
    }
};

export const verifyChangePasswordOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ success: false, message: "Enter OTP" });
        }
        const userId = req.userId;
        const user = await User.findById(userId);
        const checkOtp = otp === user.otp ? true : false;
        if (!checkOtp) {
            return res.status(400).json({ success: false, message: "Wrong OTP" });
        }
        user.otp = '';
        user.otp_expiry = 0;
        user.verified = true;
        await user.save();
        return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (error) {
        console.error("Error while entering otp:", error);
        return res.status(500).json({ success: false, message: "Error while entering otp" });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        const updatePassword = await bcrypt.hash(newPassword, 10);
        user.password = updatePassword;
        user.save();
        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Error while changing password", error);
        return res.status(500).json({ success: false, message: "Error while changing password" });
    }
}

export const sendVerificationNewEmail = async (req, res) => {
    try {
        const { email: newEmail } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "Not authenticated" });
        }
        const checkEmail = await User.findOne({ email: newEmail });
        if (checkEmail) {
            console.log("email already registered");
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otp_expiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: newEmail,
            subject: "Your UNIMEET OTP Code",
            html: `<h2>Your OTP is: ${otp}</h2><p>It expires in 5 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "OTP sent" });
    } catch (error) {
        console.error("Error while sending otp:", error);
        return res.status(500).json({ success: false, message: "Error while sending otp" });
    }
}

export const verifyNewEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!otp || !email) {
            return res.status(400).json({ success: false, message: "Enter OTP" });
        }
        const userId = req.userId;
        const user = await User.findById(userId);
        const checkOtp = otp === user.otp ? true : false;
        if (!checkOtp) {
            return res.status(400).json({ success: false, message: "Wrong OTP" });
        }
        user.otp = '';
        user.otp_expiry = 0;
        user.verified = true;
        user.email = email;
        await user.save();
        return res.status(200).json({ success: true, message: "Eamil verified" });
    } catch (error) {
        console.error("Error while verifying otp:", error);
        return res.status(500).json({ success: false, message: "Error while verifying otp" });
    }
}



export const editProfile = async (req, res) => {
    try {
        const { username, bio, reg_no, age, section, course, gender, dob } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);

        user.username = username;
        user.bio = bio;
        user.reg_no = reg_no;
        user.course = course;
        user.section = section;
        user.gender = gender;
        user.dob = dob;
        user.age = age;

        user.save();
        return res.status(200).json({ success: true, message: "Successfully edited profile" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Error while editing profile" });
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const targetId = req.params.id;

        if (userId === targetId) {
            return res.status(400).json({ success: false, message: "You cannot send request to yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);

        if (!user || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isFriend = user.friends.includes(targetId);
        const isPending = targetUser.pendingRequest.includes(userId);

        if (isFriend) {
            await User.updateOne({ _id: userId }, { $pull: { friends: targetId } });
            await User.updateOne({ _id: targetId }, { $pull: { friends: userId } });
            return res.status(200).json({ success: true, message: "Removed from friends" });
        } else if (isPending) {
            await User.updateOne({ _id: targetId }, { $pull: { pendingRequest: userId } });
            return res.status(200).json({ success: true, message: "Friend request canceled" });
        } else {
            await User.updateOne({ _id: targetId }, { $push: { pendingRequest: userId } });
            return res.status(200).json({ success: true, message: "Friend request sent" });
        }
    } catch (error) {
        console.error("Can't send friend request:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const acceptRejectRequest = async (req, res) => {
    try {
        const { result, targetId } = req.body;
        const userId = req.userId;
        if (result === false) {
            await User.updateOne({ _id: userId }, { $pull: { pendingRequest: targetId } });
            return res.status(400).json({ success: false, message: "Friend request rejected" });
        }
        else {
            await User.updateOne({ _id: userId }, { $push: { friends: targetId } });
            await User.updateOne({ _id: targetId }, { $push: { friends: userId } });
            await User.updateOne({ _id: userId }, { $pull: { pendingRequest: targetId } });
            return res.status(200).json({ success: true, message: "Friend added successfully" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error while adding friend" });
    }
}

export const uploadTimeTable = async (req, res) => {
    try {
        const { timetable } = req.body;
        const { userId } = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "error while authenticating user" });
        }
        user.timetable = timetable;
        await user.save();
        return res.status(200).json({ success: true, message: "Timetable saved succesfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "error while uploading timetable" });
    }
}

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await User.findById({ id });
        if (!profile) {
            return res.status(400).json({ success: false, message: "user doesn't exist" });
        }
        return res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ success: false, message: "Can't get profile" });
    }
}

export const getFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password -otp -otp_expiry -verified")
            .populate("friends", "username pfp timetable");
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid user" });
        }
        const myFriends = user.friends;
        return res.status(200).json({ success: true, friendData: myFriends });

    } catch (error) {
        console.error("Get friends error:", error);
        res.status(500).json({ success: false, message: "Can't get friends" });
    }
}

export const searchFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const query = req.query.query?.trim();

        if (!query) {
            return res.status(400).json({ success: false, message: "Search query required" });
        }

        const user = await User.findById(userId).populate("friends", "_id username friends");
        if (!user) return res.status(400).json({ success: false, message: "Invalid user" });

        const mutualFriends = user.friends.filter(friend =>
            friend.friends.map(f => f.toString()).includes(userId.toString())
        );

        const mutualFriendIds = mutualFriends.map(f => f._id);

        const results = await User.find({
            _id: { $in: mutualFriendIds },
            username: { $regex: query, $options: "i" }
        }).select("username pfp bio");

        res.status(200).json({ success: true, users: results });
    } catch (error) {
        console.error("Search mutual friends error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getPendingReq = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password -otp -otp_expiry -verified")
            .populate('pendingRequest', 'username pfp');
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid user" });
        }
        return res.status(200).json({ success: true, myPendingReq: user.pendingRequest });

    } catch (error) {
        console.error("Get friends error:", error);
        res.status(500).json({ success: false, message: "Can't get friends" });
    }
}
export const deleteUser = async (req, res) => {
    try {
        const userId = req.userId;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await User.updateMany(
            {},
            {
                $pull: {
                    friends: userId,
                    pendingRequest: userId,
                    notifications: { from: userId }
                }
            }
        );

        await Message.deleteMany({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: "Account and related data deleted successfully" });

    } catch (error) {
        console.error("Delete User error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete account" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const users = await User.find({
            username: { $regex: query, $options: "i" }
        }).limit(10).select("username email pfp");

        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const sendReminder = async (req, res) => {
    try {
        const { toUserId } = req.params;
        const fromUserId = req.userId;

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newNotification = {
            message: `${fromUser.username} sent you a reminder to meet!`,
            from: fromUserId
        };

        toUser.notifications.unshift(newNotification);
        toUser.notifications = toUser.notifications.slice(0, 10); // Keep only 10
        await toUser.save();

        res.status(200).json({ success: true, message: "Reminder sent!" });
    } catch (error) {
        console.error("Reminder error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getNotifications = async (req, res) => {
    const user = await User.findById(req.userId)
        .populate("notifications.from", "username pfp");

    res.status(200).json({ success: true, notifications: user.notifications });
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= user.notifications.length) {
            return res.status(400).json({ success: false, message: "Invalid index" });
        }

        user.notifications[index].read = true;
        await user.save();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Read error:", error.message);
        res.status(500).json({ success: false });
    }
};

export const uploadPfp = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'Unimeet_pfps',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        const result = await streamUpload(file.buffer);

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.pfp = result.secure_url;
        await user.save();

        res.status(200).json({ message: "PFP uploaded", pfp: result.secure_url });
    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ message: "Internal error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -otp -otp_expiry');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}