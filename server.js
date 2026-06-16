// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse, VoiceResponse } = require('twilio');

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
    'Hi. Sorry we missed your call. Please leave your name, phone number, and what you need help with after the beep. We will get back to you soon.'
  );

  voiceResponse.record({
    maxLength: 60,
    playBeep: true,
    trim: 'trim-silence',
    action: '/recording-complete',
    method: 'POST'
  });

  voiceResponse.hangup();

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// After voicemail recording is complete
app.post('/recording-complete', (req, res) => {
  const voiceResponse = new VoiceResponse();

  voiceResponse.say(
    {
      voice: 'alice',
      language: 'en-US'
    },
    'Thank you. Your message has been received. Goodbye.'
  );

  voiceResponse.hangup();

  console.log('New voicemail received:');
  console.log('From:', req.body.From);
  console.log('Recording URL:', req.body.RecordingUrl);
  console.log('Recording duration:', req.body.RecordingDuration);

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