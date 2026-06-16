// server.js

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const MessagingResponse = twilio.twiml.MessagingResponse;
const VoiceResponse = twilio.twiml.VoiceResponse;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Handle incoming voice calls
app.post('/voice', (req, res) => {
  const voiceResponse = new VoiceResponse();

  voiceResponse.say(
    {
      voice: 'alice',
      language: 'en-US'
    },
    'Hi. Sorry we missed your call. Please leave your name, phone number, and what you need help with after the beep. You can take your time. When you are finished, simply hang up.'
  );

  voiceResponse.record({
    maxLength: 600,
    timeout: 60,
    playBeep: true,
    trim: 'do-not-trim',
    action: '/recording-complete',
    method: 'POST'
  });

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// After voicemail recording is complete
app.post('/recording-complete', (req, res) => {
  console.log('New voicemail received:');
  console.log('From:', req.body.From);
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Recording duration:', req.body.RecordingDuration);

  const voiceResponse = new VoiceResponse();

  // Do not say anything here. Let the caller hang up naturally.
  // Twilio will end this only after the caller hangs up or the maxLength is reached.

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// Handle incoming SMS messages
app.post('/sms', (req, res) => {
  const smsResponse = new MessagingResponse();

  smsResponse.message('Hi! Thanks for texting us. We will reply shortly.');

  res.type('text/xml');
  res.send(smsResponse.toString());
});

// Test route
app.get('/', (req, res) => {
  res.send('AI Receptionist server is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});