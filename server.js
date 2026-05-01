const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Voice webhook
app.post('/voice', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say("Hi! Sorry we missed your call. We will get back to you soon!");

  res.type('text/xml');
  res.send(response.toString());
});

// SMS webhook
app.post('/sms', (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const response = new MessagingResponse();

  response.message("Hi! Thanks for texting us. We will reply shortly.");

  res.type('text/xml');
  res.send(response.toString());
});

// Health check
app.get('/', (req, res) => {
  res.send('Twilio bot is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});