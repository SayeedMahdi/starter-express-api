
import Twilio from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';

const TwilioSID = process.env.TWILIO_SID;
const TwilioToken = process.env.TWILIO_AUTH_TOKEN;

const client = Twilio(TwilioSID, TwilioToken);

const makeCall = (req, res, next) => {

    // client.calls.create({
    //     url: "http://demo.twilio.com/docs/voice.xml",
    //     to: "+93729902688",
    //     from: "+13854696091",
    // })
    //     .then(call => console.log(call))
    //     .catch(err => console.log(err))
    client.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: "+93729902688",
        from: "+13854696091",
    }, function (err, call) {
        if (err)
            console.log(err);
        else
            console.log(call.sid);
    })
    // next()
}

const getCalls = (req, res, next) => {
    // const twiml = new VoiceResponse();
    // console.log(req.body);
    // req.io.emit('callComming', { data: req.body })
    // twiml.say({ voice: 'man', loop: 100 }, 'Thank you for calling this to RahaNet');
    // res.type('text/xml');
    // res.send(twiml.toString())

    let voiceResponse = new VoiceResponse();
    voiceResponse.dial({
        callerId: "+93729902688",
    }, "+13854696091");
    res.type('text/xml');
    res.send(voiceResponse.toString());
}


// Generate a Twilio Client capability token
// app.get('/token', (request, response) => {
//     const capability = new ClientCapability({
//         accountSid: process.env.TWILIO_ACCOUNT_SID,
//         authToken: process.env.TWILIO_AUTH_TOKEN,
//     });

//     capability.addScope(
//         new ClientCapability.OutgoingClientScope({
//             applicationSid: process.env.TWILIO_TWIML_APP_SID
//         })
//     );

//     const token = capability.toJwt();

//     // Include token in a JSON response
//     response.send({
//         token: token,
//     });
// });

// // Create TwiML for outbound calls
// app.post('/voice', (request, response) => {
//     let voiceResponse = new VoiceResponse();
//     voiceResponse.dial({
//         callerId: process.env.TWILIO_NUMBER,
//     }, request.body.number);
//     response.type('text/xml');
//     response.send(voiceResponse.toString());
// });

const callCenter = {
    makeCall,
    getCalls
}

export default callCenter