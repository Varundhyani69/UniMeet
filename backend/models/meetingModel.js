// meetingModel.js
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Meeting' },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 12:00 PM"
    invitees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    accepted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rejected: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, default: '' }
    }],
    expiresAt: { type: Date, required: true } // Computed from date + timeSlot end
}, { timestamps: true });

// Index for automatic deletion after expiration
meetingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;