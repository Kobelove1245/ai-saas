const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const OpenAI = require("openai");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// OpenAI setup (uses Render environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("AI Receptionist is running");
});

// VOICE WEBHOOK (AI receptionist)
app.post("/voice", async (req, res) => {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    const callerMessage = "A customer just called a service business.";

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI receptionist for a local service business (like roofing, plumbing, construction, cleaning).

Rules:
- Be friendly, professional, and short (1–2 sentences max)
- Try to understand what the caller needs
- Offer help or ask a follow-up question
- Sound natural when spoken out loud
          `,
        },
        {
          role: "user",
          content: callerMessage,
        },
      ],
    });

    const text = aiResponse.choices[0].message.content;

    response.say({ voice: "alice" }, text);

    res.type("text/xml");
    res.send(response.toString());
  } catch (err) {
    console.log("VOICE ERROR:", err);

    const fallback = new twilio.twiml.VoiceResponse();
    fallback.say(
      "Sorry, we missed your call. Please leave a message and we will get back to you."
    );

    res.type("text/xml");
    res.send(fallback.toString());
  }
});

// SMS WEBHOOK (basic for now)
app.post("/sms", (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const response = new MessagingResponse();

  response.message(
    "Hi! Thanks for contacting us. We will respond shortly."
  );

  res.type("text/xml");
  res.send(response.toString());
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});