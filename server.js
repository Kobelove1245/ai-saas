// server.js

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const VoiceResponse = twilio.twiml.VoiceResponse;
const MessagingResponse = twilio.twiml.MessagingResponse;

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const OWNER_PHONE = process.env.OWNER_PHONE;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Incoming calls
app.post('/voice', (req, res) => {
  const voiceResponse = new VoiceResponse();

  voiceResponse.say(
    { voice: 'alice', language: 'en-US' },
    'Hi, thanks for calling. I am the virtual receptionist. Please leave your full name, phone number, the service you need, your address if needed, and the best time to reach you. Take your time. When you are finished, simply hang up.'
  );

  voiceResponse.record({
    maxLength: 900,
    timeout: 0,
    playBeep: true,
    trim: 'do-not-trim',
    action: '/recording-complete',
    method: 'POST',
    transcribe: true,
    transcribeCallback: '/transcription-complete'
  });

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// Recording finished
app.post('/recording-complete', async (req, res) => {
  const voiceResponse = new VoiceResponse();

  const caller = req.body.From || 'Unknown';
  const recordingUrl = req.body.RecordingUrl || 'No recording URL';
  const duration = req.body.RecordingDuration || 'Unknown';

  console.log('New lead recording received:');
  console.log('Caller:', caller);
  console.log('Recording:', recordingUrl);
  console.log('Duration:', duration);

  try {
    if (OWNER_PHONE && TWILIO_PHONE_NUMBER) {
      await client.messages.create({
        body:
`NEW CALL LEAD

Caller: ${caller}
Duration: ${duration} seconds

Recording:
${recordingUrl}.mp3

Transcript will send separately if available.`,
        from: TWILIO_PHONE_NUMBER,
        to: OWNER_PHONE
      });
    }
  } catch (error) {
    console.error('Error sending owner SMS:', error.message);
  }

  res.type('text/xml');
  res.send(voiceResponse.toString());
});

// Transcription finished
app.post('/transcription-complete', async (req, res) => {
  const transcriptionText = req.body.TranscriptionText || 'No transcription text received.';
  const recordingUrl = req.body.RecordingUrl || 'No recording URL';

  console.log('Transcription received:');
  console.log(transcriptionText);

  try {
    if (OWNER_PHONE && TWILIO_PHONE_NUMBER) {
      await client.messages.create({
        body:
`CALL LEAD TRANSCRIPT

${transcriptionText}

Recording:
${recordingUrl}.mp3`,
        from: TWILIO_PHONE_NUMBER,
        to: OWNER_PHONE
      });
    }
  } catch (error) {
    console.error('Error sending transcript SMS:', error.message);
  }

  res.sendStatus(200);
});

// Incoming texts
app.post('/sms', (req, res) => {
  const smsResponse = new MessagingResponse();
  smsResponse.message('Hi! Thanks for texting. We received your message and will reply shortly.');
  res.type('text/xml');
  res.send(smsResponse.toString());
});

// Test route
app.get('/', (req, res) => {
  res.send('AI Receptionist server is running.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});