const axios = require('axios');

async function test() {
  try {
    const resAuth = await axios.post('http://localhost:8000/api/v1/auth/register', {
      name: "Proj Tester", email: `proj2_${Date.now()}@test.com`, password: "password123"
    });
    const token = resAuth.data.access_token;
    const team_id = resAuth.data.user_id;

    const resProj = await axios.post('http://localhost:8000/api/v1/projects/', {
      team_id,
      name: 'Auto Event System',
      problem_statement: 'People hate waiting in line to buy tickets.',
      idea: 'An automated queue app using Next.js and WebSockets.',
      time_budget_value: 24,
      time_budget_unit: "hours"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Project created:", resProj.data);
  } catch (err) {
    console.error("Error:", JSON.stringify(err.response ? err.response.data : err.message, null, 2));
  }
}
test();
