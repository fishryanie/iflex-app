require('dotenv/config');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sendSMS = async (to, otp) => {
  const message = await client.messages.create({
    body: 'Your verification code is ' + otp,
    from: '+84979955925',
    to: '+84' + to.slice(1)
  })
  console.log("🚀 ~ file: twlio.js ~ line 14 ~ sendSMS ~ message", message.sid)  
}

module.exports = sendSMS 

