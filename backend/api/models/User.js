const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    role: { type: String, enum: ['Student', 'Professional'], default: 'Student' },
    pincode: { type: String },
    monthlyIncome: { type: Number, default: 0 },
    monthlySpending: { type: Number, default: 0 },
    isInvestor: { type: String, enum: ['yes', 'no'], default: 'no' },
    investments: {
        gold: { type: Number, default: 0 },
        fd: { type: Number, default: 0 },
        stocks: { type: Number, default: 0 },
        crypto: { type: Number, default: 0 },
    },
    costOfLiving: { type: Number, default: 0 }, // Predicted value
    userClass: {
        type: String,
        enum: ['YOLO', 'Survivor', 'Saver', 'Investor', 'Unknown'],
        default: 'Unknown'
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
