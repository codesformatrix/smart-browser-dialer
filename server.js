require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

// Load ENV variables
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;

// Secure Twilio Client (modern method)
const client = twilio(API_KEY_SID, API_KEY_SECRET, { accountSid: ACCOUNT_SID });

// Home route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Dialer backend running successfully.");
});

// Make a call
app.post("/call", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Phone number missing" });
    }

    const call = await client.calls.create({
      to: number,
      from: TWILIO_NUMBER,
      url: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical"
    });

    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error("CALL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Hang up a call
app.post("/hangup", async (req, res) => {
  try {
    const { callSid } = req.body;

    if (!callSid) {
      return res.status(400).json({ error: "Call SID missing" });
    }

    await client.calls(callSid).update({ status: "completed" });

    res.json({ success: true });
  } catch (err) {
    console.error("HANGUP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
