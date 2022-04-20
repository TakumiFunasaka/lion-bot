const functions = require("firebase-functions");
const fetch = require("node-fetch");
const imageGenerator = require("./imageGenerator");
exports.caller = imageGenerator.caller;

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


/**
 * kibelaURLから記事情報を取得
 * @param {*} path
 */
const getKibelaInfo = async (path) => {
  const graphql = `query getNote{note: noteFromPath(path:"${path}") {title}}`;
  const response = await new Promise(function(resolve, reject) {
    fetch(`https://${process.env.TEAM_NAME}.kibe.la/api/v1?query=${graphql}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `bearer ${process.env.KIBELA_TOKEN}`,
            ContentType: "application/json",
          },
        }).then((response)=>{
      response.json().then((json)=>{
        if (Object.prototype.hasOwnProperty.call(json.data, "note")) {
          // console.log("note title::", );
          resolve(json.data.note.title);
        }
      });
    }).catch((err)=>{
      reject(err);
    });
    // response.json().then((json)=>{
    //   if (Object.prototype.hasOwnProperty.call(json.data, "note")) {
    //     // console.log("note title::", json.data.note.title);
    //     resolve(json.data.note.title);
    //   } else {
    //     resolve("");
    //   }
    // });
  });
  console.log("getKibelaInfo response >>>>>", response);
  return response;
};

exports.postSlackMessageTest = functions.https.onRequest(async (req, res) => {
  const channel = "C03BPPZE8LC";
  const ts = "1650388964.568409";
  const unfurlId = "";
  const url = "https://base.kibe.la/notes/52516";
  const title = "配送日設定App改善_企画_ロードマップ";
  const message = `{
    "${url}" : {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "${title}"
          },
          "accessory": {
            "type": "image",
            "image_url": "https://baseu.jp/wp-content/uploads/image.png",
            "alt_text": "${title}"
          }
        }
      ]
    }
  }`;
  const response = await fetch("https://slack.com/api/chat.unfurl",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer ${process.env.SLACK_BOT_TOKEN}",
          ContentType: "application/json",
        },
        data: {
          channel: channel,
          ts: ts,
          unfurl_id: unfurlId,
          unfurls: JSON.parse(message),
        },
      });
  response.json().then( (json)=>{
    console.log("### slackPost >> ", json);
  });
});

/**
 * slackに投稿する
 * @param {*} event
 * @param {*} title
 */
const postSlackMessage = async (event, title) => {
  console.log("### postSlackMessage start >>>");
  const channel = event.channel;
  const ts = event.message_ts;
  const url = event.links[0].url;
  const unfurlId = event.unfurl_id;
  const source = event.source;
  console.log("channel ====", channel);
  console.log("ts ====", ts);
  console.log("unfurlId ====", unfurlId);
  console.log("source ====", source);
  const unfurls = {};
  const unfurlData = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: title,
        },
      },
      {
        type: "image",
        title: {
          type: "plain_text",
          text: title,
        },
        image_url: "https://baseu.jp/wp-content/uploads/image.png",
        alt_text: title,
      },
    ],
  };
  unfurls[url] = unfurlData;
  const paylod = {
    unfurl_id: unfurlId,
    source: source,
    unfurls: unfurls,
  };
  // channel: channel,
  // ts: ts,
  console.log("post data >>>>>>>>>", paylod);
  const response = await fetch("https://slack.com/api/chat.unfurl",
      {
        method: "POST",
        body: JSON.stringify(paylod),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      });
  response.json().then( (json)=>{
    console.log("### slackPost >> ", json);
  });
};


exports.slackConnector = functions.https.onRequest(async (req, res) => {
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
      // kibela APIにメッセージを投げる
      if (payload.event.type === "link_shared" &&
        payload.event.channel === "C03BPPZE8LC") {
        const title = await getKibelaInfo(payload.event.links[0].url);
        console.log("### success:getKibelaInfo >> ", title);

        // 画像生成

        // slackに投稿
        postSlackMessage(payload.event, title);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
  }
});
