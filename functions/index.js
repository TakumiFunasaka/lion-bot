// const imageGenerator = require("./imageGenerator");

// exports.generateImage = imageGenerator.generateImage;

// ↓サンプル
const functions = require("firebase-functions");

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("test!");
});

const {verifyRequestSignature} = require("@slack/events-api");
const verifyWebhook = (req) => {
  const signature = {
    signingSecret: process.env.SLACK_SECRET,
    requestSignature: req.headers["x-slack-signature"],
    requestTimestamp: req.headers["x-slack-request-timestamp"],
    body: req.rawBody,
  };
  verifyRequestSignature(signature);
};

exports.slackConnector = functions.https.onRequest((req, res) => {
  try {
    if (req.method !== "POST") {
      const error = new Error("Only POST requests are accepted");
      error.code = 405;
      throw error;
    }
    console.log("SLACK_SECRET: ", process.env.SLACK_SECRET);
    // Slackからの認証かどうか
    verifyWebhook(req);
    // 初期認証対応
    const payload = req.body;
    if (payload.type === "url_verification") {
      res.send("slack test");
      return res.status(200).json({"challenge": payload.challenge});
    }

    // kibela APIにメッセージを投げる

    // 画像生成

    // slackに投稿

    // return Promise.resolve();
  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
    // return Promise.reject(err);
  }
});
