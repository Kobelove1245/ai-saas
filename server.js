const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse, VoiceResponse } = require('twilio');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  try {
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const voiceResponse = new VoiceResponse();

    voiceResponse.say('Hi! Sorry we missed your call. We will get back to you soon!');

    res.type('text/xml');
    res.send(voiceResponse.toString());
  } catch (error) {
    console.log('VOICE ERROR:', error);
    res.status(500).send('Error');
  }
}); 
});

app.post('/sms', (req, res) => {
  const smsResponse = new MessagingResponse();
  smsResponse.message('Hi! Thanks for texting us. We will reply shortly.');
  res.type('text/xml');
  res.send(smsResponse.toString());
});

app.get('/', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
