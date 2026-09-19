const axios = require('axios');

async function test() {
  try {
    console.log("Testing POST /api/v1/auth/register...");
    const res = await axios.post('http://127.0.0.1:8000/api/v1/auth/register', {
      name: "Test User",
      email: "test4@test.com",
      password: "password123"
    });
    console.log("Register successful:", res.data);
    
    console.log("Testing GET /api/v1/projects...");
    const projRes = await axios.get('http://127.0.0.1:8000/api/v1/projects?team_id=' + res.data.user_id, {
      headers: { Authorization: `Bearer ${res.data.access_token}` }
    });
    console.log("Projects successful:", projRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
