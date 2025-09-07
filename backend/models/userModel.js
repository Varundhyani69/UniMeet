import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pfp: { type: String, default: 'https://i.pinimg.com/736x/dc/26/2f/dc262f1cd78130b972c5dbd8643ad972.jpg' },
    age: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    reg_no: { type: Number, default: 0 },
    timetable: { type: Object, default: {} },
    course: { type: String, default: 'Btech-cse' },
    section: { type: String, default: 'K23RX' },
    gender: { type: String, enum: ['Male', 'Female', 'Fighter jet', 'We have more??'], default: 'Fighter jet' },
    dob: { type: Date, default: null },
    otp: { type: String, default: '' },
    otp_expiry: { type: Date, required: false },
    verified: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notifications: [
        {
            message: String,
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            meetingId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meeting',
                default: null
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            read: {
                type: Boolean,
                default: false
            }
        }
    ],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' }
}, { timestamps: true });

const User = mongoose.model('User', userModel);

export default User;