const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const OpenAI = require("openai");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.send("AI Receptionist is running");
});

// =======================
// VOICE (AI RECEPTIONIST)
// =======================
app.post("/voice", async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  try {
    console.log("📞 VOICE HIT");

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI receptionist for a local service business (roofing, plumbing, construction, cleaning).

Rules:
- Be natural and conversational
- Keep responses 1–2 short sentences
- Try to help the caller or ask what they need
- Your goal is to help book an appointment or capture intent
          `,
        },
        {
          role: "user",
          content: "A customer is calling a business right now.",
        },
      ],
    });

    const text = aiResponse.choices[0].message.content;

    console.log("🤖 AI RESPONSE:", text);

    // Speak AI response (slower voice feel via pause + pacing)
    response.say(
      {
        voice: "alice"
      },
      text
    );

    // Prevent instant hang-up
    response.pause({ length: 3 });

    response.say(
      {
        voice: "alice"
      },
      "If you would like to leave a message, please speak after the tone."
    );

    response.record({
      maxLength: 30,
      action: "/voice",
      transcribe: true
    });

  } catch (err) {
    console.log("❌ AI ERROR:", err);

    response.say(
      {
        voice: "alice"
      },
      "Sorry, we missed your call. Please leave a message and we will get back to you."
    );

    response.record({
      maxLength: 20,
      action: "/voice"
    });
  }

  res.type("text/xml");
  res.send(response.toString());
});

// =======================
// SMS (basic fallback for now)
// =======================
app.post("/sms", (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const response = new MessagingResponse();

  response.message(
    "Hi! Thanks for contacting us. We will respond shortly."
  );

  res.type("text/xml");
  res.send(response.toString());
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});