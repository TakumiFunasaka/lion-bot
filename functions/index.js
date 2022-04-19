const functions = require("firebase-functions");
const fetch = require("node-fetch");
// const imageGenerator = require("./imageGenerator");
// exports.generateImage = imageGenerator.generateImage;

// ↓サンプル


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

exports.kibelaTest = functions.https.onRequest((req, res) => {
  const path = "https://base.kibe.la/notes/51934";
  const graphql = `query getNote{note: noteFromPath(path:"${path}") {title}}`;
  fetch(`https://${process.env.TEAM_NAME}.kibe.la/api/v1?query=${graphql}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `bearer ${process.env.KIBELA_TOKEN}`,
      ContentType: "application/json",
    },
    // body: JSON.stringify({query: graphql,variables:{}})
  })
      .then((response)=>{
        response.json().then((json)=>{
          if (Object.prototype.hasOwnProperty.call(json.data, "note")) {
            console.log("note title::", json.data.note.title);
          }
        });
      }).catch((err)=>{
        console.log("err::", err);
      });
});

const getKibelaInfo = async (path) => {
  const graphql = `query getNote{note: noteFromPath(path:"${path}") {title}}`;
  const response = await fetch(`https://${process.env.TEAM_NAME}.kibe.la/api/v1?query=${graphql}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `bearer ${process.env.KIBELA_TOKEN}`,
          ContentType: "application/json",
        },
      });
  response.json().then((json)=>{
    if (Object.prototype.hasOwnProperty.call(json.data, "note")) {
      console.log("note title::", json.data.note.title);
      return json.data.note.title;
    } else {
      return "";
    }
  });
};

exports.slackConnector = functions.https.onRequest((req, res) => {
  try {
    if (req.method !== "POST") {
      const error = new Error("Only POST requests are accepted");
      error.code = 405;
      throw error;
    }
    // Slackからの認証かどうか
    verifyWebhook(req);

    const payload = req.body;
    if (payload.type === "url_verification") {
      // 初期認証対応
      return res.status(200).json({"challenge": payload.challenge});
    } else {
      if (payload.event.type === "link_shared") {
        const title = getKibelaInfo(payload.event.links[0].url);
        console.log(title);
      }
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
