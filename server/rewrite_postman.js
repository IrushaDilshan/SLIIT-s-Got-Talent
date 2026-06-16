const fs = require('fs');

const data = JSON.parse(fs.readFileSync('d:/project/SLIIT-s-Got-Talent/server/SLIIT_Got_Talent_Postman_Collection.json', 'utf8'));

// 1. Update Variables
data.variable = [
  { key: "base_url", value: "http://localhost:5000/api", type: "string" },
  { key: "admin_token", value: "", type: "string" },
  { key: "judge_token", value: "", type: "string" },
  { key: "student_token", value: "", type: "string" },
  { key: "contestant_id", value: "", type: "string" }
];

// Remove collection level auth to prevent accidents
delete data.auth;

// 2. Auth Endpoints
data.item[0].item = [
  {
    name: "Login Admin (Send OTP)",
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "admin@sliit.lk"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/login", host: ["{{base_url}}"], path: ["auth", "login"] }
    }
  },
  {
    name: "Verify Admin OTP",
    event: [{ listen: "test", script: { exec: ["const responseJson = pm.response.json();", "if (responseJson.token) {", '    pm.collectionVariables.set("admin_token", responseJson.token);', '    console.log("Token captured and set to collection variable \'admin_token\'");', "}"], type: "text/javascript" } }],
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "admin@sliit.lk",\n    "otp": "123456"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/verify", host: ["{{base_url}}"], path: ["auth", "verify"] }
    }
  },
  {
    name: "Login Judge (Send OTP)",
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "judge@sliit.lk"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/login", host: ["{{base_url}}"], path: ["auth", "login"] }
    }
  },
  {
    name: "Verify Judge OTP",
    event: [{ listen: "test", script: { exec: ["const responseJson = pm.response.json();", "if (responseJson.token) {", '    pm.collectionVariables.set("judge_token", responseJson.token);', '    console.log("Token captured and set to collection variable \'judge_token\'");', "}"], type: "text/javascript" } }],
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "judge@sliit.lk",\n    "otp": "123456"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/verify", host: ["{{base_url}}"], path: ["auth", "verify"] }
    }
  },
  {
    name: "Login Student (Send OTP)",
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "student@my.sliit.lk"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/login", host: ["{{base_url}}"], path: ["auth", "login"] }
    }
  },
  {
    name: "Verify Student OTP",
    event: [{ listen: "test", script: { exec: ["const responseJson = pm.response.json();", "if (responseJson.token) {", '    pm.collectionVariables.set("student_token", responseJson.token);', '    console.log("Token captured and set to collection variable \'student_token\'");', "}"], type: "text/javascript" } }],
    request: {
      method: "POST", header: [], body: { mode: "raw", raw: '{\n    "email": "student@my.sliit.lk",\n    "otp": "123456"\n}', options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/verify", host: ["{{base_url}}"], path: ["auth", "verify"] }
    }
  }
];

const authObj = (tokenVar) => ({ type: "bearer", bearer: [{ key: "token", value: "{{" + tokenVar + "}}", type: "string" }] });

// 3. Inject explicit Auth to all protected endpoints
// Contestants
data.item[1].item.forEach(req => {
  if (req.name.startsWith("Admin:")) {
    req.request.auth = authObj("admin_token");
  } else if (req.name.startsWith("Judge:")) {
    req.request.auth = authObj("judge_token");
  } else if (req.name === "Get My Application (Private)") {
    req.request.auth = Object.assign({}, authObj("student_token")); // could be student
  } // Register Contestant is public? Wait, get my app requires token.
});

// Settings
data.item[2].item.forEach(req => {
  if (req.name.includes("Admin")) {
    req.request.auth = authObj("admin_token");
  }
});

// Votes
data.item[3].item.forEach(req => {
  if (req.name.includes("Student")) {
    req.request.auth = authObj("student_token");
  }
});

fs.writeFileSync('d:/project/SLIIT-s-Got-Talent/server/SLIIT_Got_Talent_Postman_Collection.json', JSON.stringify(data, null, 2), 'utf8');
console.log("SUCCESS");
