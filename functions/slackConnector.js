const functions = require('firebase-functions');
exports.slackConnector = functions.https.onRequest((req, res) => {
  // ...
  const payload = req.body;
  if (payload.type === 'url_verification') {
      return res.status(200).json({ 'challenge': payload.challenge });
  }  
});


