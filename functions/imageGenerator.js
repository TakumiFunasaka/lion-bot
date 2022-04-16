// const fs = require("fs");
// const functions = require("firebase-functions");
// const { createCanvas, loadImage } = require("canvas");

// const dummyData = {
//   data: {
//     note: {
//       title: "利用規約・プライバシーポリシーページの更新について",
//       author: {
//         id: "VXNlci8xNjg",
//         realName: "Muneaki Hayakawa",
//         avatarImage: {
//           url: "https://cdn.kibe.la/media/private/7504/W1siZiIsInRlYW1fNzUwNC8yMDE4LzExLzIwLzhnNWVyNmoyaGpfNjFHcnRNQTNVc0wuX1NZNDUwXy5qcGciXSxbInAiLCJhdXRvX29yaWVudCJdLFsicCIsInRodW1iIiwiNDB4NDAjIl1d/8826578b26fe1b2c/61GrtMA3UsL._SY450_.jpg",
//         },
//       },
//     },
//   },
// };

// exports.ogp = async (req, res) => {
//   const { text } = req.query;
//   const url = await createOgp(text);
//   res.redirect(url);
// };

// const fontStyle = {
//   font: 'bold 85px "Noto Sans CJK JP"',
//   lineHeight: 100,
//   color: "#FFFFFF",
// };

// const createOgp = async (text) => {
//   const loaclTargetPath = `/tmp/target.png`;
//   const localBasePath = "/tmp/base.png";
//   const targetPath = `ogps/${text}.png`;
//   const basePath = "ogps/base.png";

//   // 背景画像のダウンロード
//   await bucket.file(basePath).download({ destination: localBasePath });

//   const canvas = createCanvas(1280, 670);
//   const ctx = canvas.getContext("2d");
//   // 背景画像の描画
//   const baseImage = await loadImage(localBasePath);
//   ctx.drawImage(baseImage, 0, 0, 1280, 670);

//   // 文字列の書き込み
//   ctx.font = fontStyle.font;
//   ctx.fillStyle = fontStyle.color;
//   ctx.textBaseline = "top";
//   const topPadding = 60;
//   const leftPadding = 50;
//   const rightPadding = 600;
//   const lineWidth = 1280 - leftPadding - rightPadding;
//   const lines = splitByMeasureWidth(name, lineWidth, ctx);
//   const lineCount = lines.length;

//   for (let index = 0; index < lineCount; index++) {
//     const element = lines[index];
//     ctx.fillText(
//       element,
//       leftPadding,
//       topPadding + fontStyle.lineHeight * index
//     );
//   }

//   // tmpディレクトリへの書き込み
//   const buf = canvas.toBuffer();
//   fs.writeFileSync(loaclTargetPath, buf);

//   // Storageにアップロード
//   await bucket.upload(loaclTargetPath, { destination: targetPath });

//   // tmpファイルの削除
//   fs.unlinkSync(localBasePath);
//   fs.unlinkSync(loaclTargetPath);

//   return getUrl(targetPath);
// };

// const splitByMeasureWidth = (str, maxWidth, context) => {
//   // サロゲートペアを考慮した文字分割
//   const chars = Array.from(str);
//   let line = "";
//   const lines = [];
//   for (let index = 0; index < chars.length; index++) {
//     if (maxWidth <= context.measureText(line + chars[index]).width) {
//       lines.push(line);
//       line = chars[index];
//     } else {
//       line += chars[index];
//     }
//   }
//   lines.push(line);
//   return lines;
// };
