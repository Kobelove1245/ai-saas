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

// Incoming Calls
app.post('/voice', (req, res) => {
const response = new VoiceResponse();

response.say(
{
voice: 'alice',
language: 'en-US'
},
'Thank you for calling. Please leave your full name, phone number, address, service needed, and the best time to contact you after the beep. Take your time. When you are finished, simply hang up.'
);

response.record({
maxLength: 900,
timeout: 0,
playBeep: true,
trim: 'do-not-trim',
action: '/recording-complete',
method: 'POST'
});

res.type('text/xml');
res.send(response.toString());
});

// Recording Complete
app.post('/recording-complete', async (req, res) => {
const response = new VoiceResponse();

const caller = req.body.From || 'Unknown';
const recordingUrl = req.body.RecordingUrl || '';
const duration = req.body.RecordingDuration || 'Unknown';

console.log('NEW LEAD RECEIVED');
console.log('Caller:', caller);
console.log('Recording URL:', recordingUrl);
console.log('Duration:', duration);

try {
await client.messages.create({
body:
`NEW LEAD RECEIVED

Caller: ${caller}

Duration: ${duration} seconds

Recording:
${recordingUrl}.mp3

Listen to the recording and contact the customer as soon as possible.`,
from: TWILIO_PHONE_NUMBER,
to: OWNER_PHONE
});

```
console.log('Lead text sent successfully.');
```

} catch (error) {
console.error('FAILED TO SEND SMS');
console.error(error.message);
}

res.type('text/xml');
res.send(response.toString());
});

// Incoming SMS
app.post('/sms', (req, res) => {
const smsResponse = new MessagingResponse();

smsResponse.message(
'Thank you for contacting us. We received your message and will respond shortly. Reply STOP to opt out.'
);

res.type('text/xml');
res.send(smsResponse.toString());
});

// Home Route
app.get('/', (req, res) => {
res.send('Receptionist Pro server is running.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});
