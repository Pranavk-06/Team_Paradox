require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Import User Model
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-twin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Financial Digital Twin API is running');
});

// Predict Cost of Living Proxy
app.post('/predict-col', async (req, res) => {
    try {
        const { pincode, city_tier } = req.body;
        // Call Python ML Service
        const response = await axios.post('http://localhost:8000/predict_cost_of_living', {
            state: "Unknown", // Placeholder validation
            city_tier: city_tier || "Tier-1"
        });
        res.json(response.data);
    } catch (error) {
        console.error('ML Service Error:', error.message);
        // Graceful degradation: Return default instead of crashing
        res.json({ estimated_cost: 25000, note: "ML Service Unavailable, using default" });
    }
});

// Save User Profile & Classify
app.post('/api/user/save', async (req, res) => {
    try {
        const userData = req.body;
        console.log('Received user data:', userData.email);

        // 1. Save Basic User Data (Upsert)
        let user = await User.findOneAndUpdate(
            { email: userData.email },
            userData,
            { new: true, upsert: true }
        );

        // 2. Call ML Service to Classify User
        try {
            const mlPayload = {
                income: user.monthlyIncome,
                spending: user.monthlySpending,
                investments: user.investments,
                isInvestor: user.isInvestor
            };

            const mlResponse = await axios.post('http://localhost:8000/classify_user', mlPayload);
            console.log('ML Classification:', mlResponse.data);

            user.userClass = mlResponse.data.user_class;
            await user.save();
        } catch (mlError) {
            console.error('ML Classification Failed:', mlError.message);
            // Don't fail the request, just log it
            if (user.userClass === 'Unknown') {
                user.userClass = 'Unknown';
                await user.save();
            }
        }

        res.json({ message: 'User profile saved', user });
    } catch (error) {
        console.error('Save Profile Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Market Alert Proxy
app.post('/api/market/alert', async (req, res) => {
    try {
        // Call Python ML Service
        const response = await axios.post('http://localhost:8000/market_alert', {});
        res.json(response.data);
    } catch (error) {
        console.error('ML Service Error:', error.message);
        res.status(500).json({ error: 'Failed to get market alerts' });
    }
});

// Market Data Proxy
app.get('/api/market/data', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/market_data');
        res.json(response.data);
    } catch (error) {
        console.error('Market Data Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
});

// Wealth Simulation Proxy
app.post('/api/simulate', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8000/simulate_wealth', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Simulation Error:', error.message);
        res.status(500).json({ error: 'Failed to run simulation' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
