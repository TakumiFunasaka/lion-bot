// const imageGenerator = require("./imageGenerator");

// exports.generateImage = imageGenerator.generateImage;

// ↓サンプル
const functions = require("firebase-functions");

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("test!");
});
