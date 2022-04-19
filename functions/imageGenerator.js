const fs = require("fs");
const functions = require("firebase-functions");
const { createCanvas, Image } = require("canvas");
const base64 = require("urlsafe-base64");

// canvasの横幅
let canvasWidth = 1200;
// canvasの縦幅
let canvasHeight = 630;
let canvas;
let ctx;

const dummyData = {
  data: {
    note: {
      title:
        "FigJamをちょっと便利に使いたい人に向けたTips紹介",
    },
  },
};

// タイトル部分の文字スタイル
const titleFontStyle = {
  font: 'extrabold 60px "Noto Sans"',
  lineHeight: 72,
  color: "#4D4D4D",
};
// kibela部分の文字スタイル
const bodyFontStyle = {
  font: '40px "Noto Sans"',
  lineHeight: 40,
  color: "#4D4D4D",
};

// 画像内側余白
let padding = 50;

// 背景色
let backgroundColor = "#F0F1F4";

exports.caller = functions.https.onRequest((req, res) => {
  let img = generate(dummyData.data.note.title, "test.png");
  res.send(img);
});

function generate(title, fileName) {
  // 空白のcanvasを作成
  canvas = createCanvas(canvasWidth, canvasHeight);
  // コンテキスト取得
  ctx = canvas.getContext("2d");
  // -----
  // タイトル描画
  // -----
  // 行長さ
  let lineWidth = canvasWidth - padding * 2;
  // フォント設定
  ctx.font = titleFontStyle.font;
  // 行数の割り出し
  let titleLines = splitByMeasureWidth(title, lineWidth, ctx);
  let titleLineCnt = titleLines.length;
  // タイトル分の高さ
  let titleHeight = titleLines.length * titleFontStyle.lineHeight;

  // -----
  // kibela部分描画
  // -----
  let titleMargin = 40;
  let body = "kibela";
  // フォント設定
  ctx.font = bodyFontStyle.font;
  // 行数の割り出し
  let bodyLines = splitByMeasureWidth(body, lineWidth, ctx);
  let bodyLineCnt = bodyLines.length;

  // kibela部分の高さ
  let bodyHeight = bodyLines.length * bodyFontStyle.lineHeight;

  // 行高さと余白が最小高さ(630)を上回る場合はカンバスをリサイズする
  let contentHeight = titleHeight + titleMargin + bodyHeight + padding * 2;
  if (canvasHeight < contentHeight) {
    canvasHeight = contentHeight;
    canvas = createCanvas(canvasWidth, contentHeight);
    ctx = canvas.getContext("2d");
  }

  // 取り敢えず背景色をつける
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 鉛筆アイコン描画
  const icon = new Image();
  icon.src =
    "data:image/png;base64,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";

  ctx.drawImage(icon, canvasWidth - 251, canvasHeight - 239);

  // 文字描画のベースラインを設定
  ctx.textBaseline = "top";
  // タイトルを描画
  ctx.fillStyle = titleFontStyle.color;
  ctx.font = titleFontStyle.font;
  for (let index = 0; index < titleLineCnt; index++) {
    const element = titleLines[index];
    let elementWidth = ctx.measureText(element).width;
    ctx.fillText(
      element,
      (canvasWidth - elementWidth) / 2,
      (canvasHeight - contentHeight) / 2 + titleFontStyle.lineHeight * index + 70
    );
  }
  // kibela部分を描画
  ctx.fillStyle = bodyFontStyle.color;
  ctx.font = bodyFontStyle.font;
  for (let index = 0; index < bodyLineCnt; index++) {
    const element = bodyLines[index];
    // タイトル分の高さと余白を加算する
    let elementWidth = ctx.measureText(element).width;
    ctx.fillText(
      element,
      (canvasWidth - elementWidth) / 2,
      (canvasHeight - contentHeight) / 2 +
        (titleHeight + titleMargin) +
        bodyFontStyle.lineHeight * index + 55
    );
  }

  
  let b64 = canvas.toDataURL().split(",");
  let img = base64.decode(b64[1]);

  functions.logger.info(img, { structuredData: true });

  // ファイル保存
  fs.writeFile(fileName, img, function (err) {
    console.log(err);
  });
  console.log("file saved");

  return img;
}

function splitByMeasureWidth(str, maxWidth, context) {
  // サロゲートペアを考慮した文字分割
  let chars = Array.from(str);
  let line = "";
  let lines = [];
  for (let index = 0; index < chars.length; index++) {
    if (maxWidth <= context.measureText(line + chars[index]).width) {
      lines.push(line);
      line = chars[index];
    } else {
      line += chars[index];
    }
  }
  lines.push(line);
  return lines;
}
