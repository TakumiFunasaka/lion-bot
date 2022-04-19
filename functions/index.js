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

// exports.kibelaTest = functions.https.onRequest((req, res) => {
//   const path = "https://base.kibe.la/notes/51934";
//   graphql = `query getNote{note: noteFromPath(path:"${path}") {title}}`;
//   graphql = `query getNote{note: noteFromPath(path:"${path}") {title}}`;
//   const options = {
//     method: "GET",
//     headers: {
//       "Accept": "application/json",
//       "Authorization": `bearer ${process.env.KIBELA_TOKEN}`,
//     },
//     payload: {"query": graphql},
//   };
//   console.log("options::", options);
//   fetch(`https://${process.env.TEAM_NAME}.kibe.la/api/v1`, options)
//       .then((response)=>{
//         const test = response.json().then((json)=>{
//           console.log("json'()::", json);
//         });
//       // console.log("response ::",response)
//       // console.log("json ::",json)
//       // console.log("data ::",json.data)
//       // const title = json.data.note.title;
//       // response.send(title);
//       });
// });

const getKibelaInfo = async (url) => {
  const graphql = `query getNote{note: noteFromPath(path:"${url}") {title}}`;
  const options = {
    method: "get",
    headers: {
      Accept: "application/json",
      Authorization: `bearer ${process.env.KIBELA_TOKEN}`,
    },
    payload: {"query": graphql},
  };
  const res = await fetch(`https://${process.env.TEAM_NAME}.kibe.la/api/v1`, options);
  const json = await res.json();
  console.log(json);
  const title = json.data.note.title;
  return title;
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
