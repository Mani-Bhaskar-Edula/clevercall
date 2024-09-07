require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = new twilio(accountSid, authToken);

// AWS S3 configuration
AWS.config.update({
  region: process.env.AWS_REGION, 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME; 

app.post('/send-call', (req, res) => {
  const { message, numbers } = req.body;

  // Create a unique ID for the TwiML file
  const id = Date.now();
  const twimlFileName = `twiml-${id}.xml`;
  const twimlContent = `<Response><Say>${message}</Say></Response>`;

  // Upload TwiML content to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: twimlFileName,
    Body: twimlContent,
    ContentType: 'application/xml',
  };

  s3.putObject(uploadParams, (err, data) => {
    if (err) {
      console.error('Error uploading file to S3:', err);
      return res.status(500).send('Error uploading file to S3');
    }

    // Construct the URL for the uploaded file
    const s3Url = `https://${bucketName}.s3.amazonaws.com/${twimlFileName}`;

    console.log(`TwiML file uploaded to ${s3Url}`);

    // Make the call for each number
    numbers.forEach((number) => {
      client.calls
        .create({
          url: s3Url,
          to: number,
          from: '+19549512062',
        })
        .then((call) => console.log(`Call SID: ${call.sid}`))
        .catch((error) => console.error('Error:', error));
    });

    res.status(200).send('Calls initiated successfully!');
  });
});

// Start the Express server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
