const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post("/missed-call", (req, res) => {
  console.log("📞 Missed call from:", req.body.From);
  res.send(`<Response><Say>Sorry we missed your call. We will text you shortly.</Say></Response>`);
});

app.post("/incoming-text", (req, res) => {
  console.log("💬 Text received:", req.body.Body);
  res.send(`<Response><Message>Thanks! We got your message.</Message></Response>`);
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
version: 3
agent:
  authtoken: 3BVHJ2kaPlkhfWIU4UCjDYGk2ka_6U1ofAbS49xPXrfhEwLzm