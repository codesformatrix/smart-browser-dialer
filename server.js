require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(express.json());
app.use(cors());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Test endpoint
app.get("/", (req, res) => {
  res.send("Dialer backend is running");
});

// Make call
app.post("/call", async (req, res) => {
  try {
    const { number } = req.body;

    const call = await client.calls.create({
      to: number,
      from: process.env.TWILIO_NUMBER,
      url: "https://twimlets.com/holdmusic?Bucket=com.twilio.music.classical"
    });

    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Hang up
app.post("/hangup", async (req, res) => {
  try {
    await client.calls(req.body.callSid).update({ status: "completed" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server (Render uses PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
