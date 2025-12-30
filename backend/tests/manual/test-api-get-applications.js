const axios = require('axios');

const testApi = async () => {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@tripvenza.com', // Trying admin first
            password: 'password123' // Common dev password? Or I should try agent
        }).catch(async () => {
            // Fallback to agent if admin fails
            console.log('Admin login failed, trying agent...');
            return await axios.post('http://localhost:5000/api/auth/login', {
                email: 'agent@tripvenza.com',
                password: 'password123' // pass from seeder?
            });
        });

        const token = loginRes.data.token;
        console.log('Got Token:', token ? 'Yes' : 'No');

        // 2. Call Get Applications
        console.log('Calling GET /api/applications...');
        const res = await axios.get('http://localhost:5000/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success! Status:', res.status);
        console.log('Data count:', res.data.length);

    } catch (error) {
        console.log('-------------------------------------------');
        console.log('API Request Failed!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
            console.log('Stack:', error.response.data.stack);
        } else {
            console.log('Error:', error.message);
        }
        console.log('-------------------------------------------');
    }
};

testApi();
