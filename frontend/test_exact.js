const axios = require('axios');

async function test() {
  try {
    const resAuth = await axios.post('http://localhost:8000/api/v1/auth/register', {
      name: "Proj Tester", email: `proj_${Date.now()}@test.com`, password: "password123"
    });
    const token = resAuth.data.access_token;
    const team_id = resAuth.data.user_id; // Using user_id as team_id to mimic frontend

    const resProj = await axios.post('http://localhost:8000/api/v1/projects', {
      name: 'Auto Event System',
      problem_statement: 'People hate waiting in line to buy tickets.',
      idea: 'An automated queue app using Next.js and WebSockets.',
      time_budget: {
        value: 24,
        unit: "hours"
      },
      team_id: team_id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Project created:", resProj.data);
  } catch (err) {
    console.error("Error status:", err.response?.status);
    console.error("Error data:", JSON.stringify(err.response?.data, null, 2));
  }
}
test();
