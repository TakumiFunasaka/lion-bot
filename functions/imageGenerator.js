const fs = require("fs");
const functions = require("firebase-functions");
const { createCanvas, Image, registerFont } = require("canvas");
const base64 = require("urlsafe-base64");
const ImageKit = require("imagekit");

// canvasの横幅
const canvasWidth = 1200;
// canvasの縦幅
let canvasHeight = 630;
let canvas;
let ctx;

const dummyData = {
  data: {
    note: {
      title: "FigJamをちょっと便利に使いたい人に向けたTips紹介",
    },
  },
};

// タイトル部分の文字スタイル
const titleFontStyle = {
  font: 'bold 60px "NotoSansJP"',
  lineHeight: 72,
  color: "#4D4D4D",
};
// kibela部分の文字スタイル
const bodyFontStyle = {
  font: '40px "NotoSansJP"',
  lineHeight: 40,
  color: "#4D4D4D",
};

// 画像内側余白
const padding = 50;

// 背景色
const backgroundColor = "#F0F1F4";

exports.generate = (title) => {

registerFont(__dirname + "/NotoSansJP-Bold.otf", { family: "NotoSansJP", weight: "bold"});
registerFont(__dirname + "/NotoSansJP-Medium.otf", { family: "NotoSansJP"});

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
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAj8SURBVHgB7d2BcdtGGobhn5kU4A6O6UAdRK7g3MHpKjh3YLkCKxXYqeB8FYipQOoA6MDu4Lv9A8JBuBRFErvALvA+MxjNJLYImni1CwJabgyYiKQ34cu7sN2E7dewbcP2Zv+/v4etDdtz2P4I29fNZvPdgKULYWzD9hC2b7rMZ/+7BixVOMA/XBHGoQ8GLMl+1HhWOo0YTbAE+zgapdcQCaqWMQ4iQd0miINIUKcJ4yAS1GWGOIgEdZgxjkki2Rhwpf2B+WjdFfE5tWF7G668t5YYgeAqBcXRay1DJASCixUYR6+1xJEQCC5ScBy91hJGQiA4WwVx9FpLFAmB4CwVxdFrLUEkBIJXZY7j4/5rjjt2W8v07hbwJ+W9znE/eJx75dGIi4nIQRPFMXg8IkEdNHEcg8clEpRNM8UxeHwiQZk0cxyD/SASlEWFxDHYHyJBGVRYHIP9IhLMS4XGMdg/IsE8VHgcg/0kEkxLlcQx2F8iwTRUWRyD/SYS5KVK4xjsP5EgD1Uex+B55IrkSd0i21gbLSSOwfPJFcm9YV20sDgGzytXJFvDOihvHJ9sZsoTyYNh+bSStXKVPhL/yAbORZZMK1srV+kjuTMsk1a6Vq7SRvLZsDxa+Vq5ShfJk2FZtPC1ci/4d0gRyTfDcmj+OHqNFhLJT4ZFUFnrVm3D9lhAJDJA5YwchxrNFIm6T9cdiylW7VRuHL1GE0eiNHG4R6ZYFVMdy4FubcLplrrPVL+3NFpDnVT+yHGoUeZIlG7k6L0z1EeZbzwM2xfl0ShTJEofB7ea1EjTrZVbTSRKH4fjKnptNP1aucVHojxxSAVcx8EFNN9aucVGonxx3BvqofnXyi0uEuWLozHUQ+WslVtMJMoYh5ha1UPlrZU7eyQiDjiVu1bubJGIOOBU/lq5k0ci4oBTPWvlThaJiANO9a2Vmz0SEQec6l0rN2ckn5RHI+Koh+pfKzdXJDk0Io56aDlr5dYQSSPiqIeWt1ZuyZE0Io56aGFxDJ5XiZE0Io56aKFxDJ5fSZE0Io56aOFx9FRGJI2Iox5aSRw9zRtJI+Koh1YWR0/zRNKIOOqhlcbR07SRNCKOemjlcfQ0TSSNiKMeIo6/Ud5IGmWIg4XjMlHeRd0+bjabe6tPrl9nbcP2NvybtIbyiZEjIu7KhRNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQccCKOiIgDTsQREXHAiTgiIg44EUdExAEn4oiIOOBEHBERB5yIIyLigBNxREQc6IUX7Fn5PIXtjVVExIFexoNhqJpIRBzohRfsVtMpPhIRB4aU77zjJcVGIuLAkKaZWh1TXCQiDgwp77tW5ygmEhEHDmm+0WNo9khEHDhG844eQ7NFIuLAMeHFu1NZJo9ExIGXhBfwq8ozWSQiDrxE3cl5qbJHIuJYhZ/serc2Xhu2Z0vvJmyPuSLxOMKXe0uvDdvbzWbTGuoWDpJHjefnMG/U/cTPIflIIkYOvEZpplfN4PtVEYmIA+cIL+Z7jfdw8D2LjkTEgXMpzbWP7ZHvW2QkIg6cK7ygNxrv6cT3LyoSEQcuEV7ULxrv7pXHKCISEQcupUzTqyOPM2skIg5cSml+KerxgsebJRIRB66hCaZXRx5z0khEHLiGugP1m8bxv3/xO0maKBIRB66lNHfufrYrKX8kn5RHI+JYPqW5teTWRlDeSHJoRBxV25zzh/YvcmPjtJvN5hcbSd10yE/0b6xsrXHjYfXOvZv31sbbWQLhgPsevry1PHcBp9IacayH0kxrkv7EV7nTrUZMqxbj1SmWCppeHVJ5063WGDkW5Zwp1nsb7zfLoLDpVmvEsT6a6NaSkfs493SrEdOq9dHEt5aM3Ne5ImlEHIv12hTrzsb73SYw03SrNaZV66UKpldH9nmqkaQRI8d6hRf/ncb7ajNQ/kgaEccqnJpivbPxZgnEun3fWh6tMa1aNyVetWTCff6g8Xccn3xOYuRYlZ9f+O+3Nt7OMlN3ofAubP+0NPt8SmuMHHAq4M7dE/vm5xd3ifbxXI0YOeBU6PRK3TWZz8o7hTr6XEQcq3VsinVr4+0sAXWjkJ9w/ytsc3z2R2tMq1Ytullx/9N/a+P8cu1Bpe684j/WhTHnTYitEcfq/W0EUXdL+tbGeb70oNK0J9vnaI04YPEUa7I7d/dReJAf9l9L+bTa1ogDe4eB/Grj7U79zwLOK05pjTgw8COQ/YG7tXF2xw6u/ff2+HyEKi2KXmvEgQPDEeTOxvtx526B5xWn7ML2b+LAoR/vYvn1BRv/091/rdanTzVE0fsthJHi3AsL9OcIom450LFx+O9jPFm5U6hDrXWjxs6AF/RTrBR37tYShofs77Q97H/JCnjRRmlWLakBYeBiPoLc2rLtwvbRuguYhIGLeCApplel2YXtf2H7QhQYwwP5hy1Da93bzF94uxap+DmIrF4+OngUX3k3Cjn8bPXxKPx33X8nCuTmgfgBV8NbtDv7a7TgvAKT8ECerdx3snbGyTZm5IH8YWUF0l+v8JGi5M8AwQps9nfaTrJ+7gmcbKNcmnaFkN63/ePe6opPvgUmEw7QG03nMWzviQJV2R+0OaO4JwpUbX8Qp+JTqAdlWkAOmMXISIgCy6dudcXHC8LwP+vLgTKFwnrsQ3nYBzBc8rMJ23/FyTYW7v+xzbkkqddf+gAAAABJRU5ErkJggg==";

  ctx.drawImage(icon, canvasWidth - 230, canvasHeight - 230);

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
      (canvasHeight - contentHeight) / 2 +
        titleFontStyle.lineHeight * index +
        70
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
        bodyFontStyle.lineHeight * index +
        55
    );
  }

  let b64 = canvas.toDataURL().split(",");
  let img = base64.decode(b64[1]);

  functions.logger.info(img, { structuredData: true });

  return b64[1];

  //環境変数を読み込む
  const imagekit = new ImageKit({
    // publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    // privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    // urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    publicKey: "public_BS1F5+9dNQMsbNVFn3//2f1fKD0=",
    privateKey: "private_m5OVtf3x5PD0H58cvauv0DSL8rw=",
    urlEndpoint: "https://ik.imagekit.io/takumi/ogpgenerator",
  });

  let imageUrl = "";
  // 画像アップロード
  imagekit
    .upload({
      file: b64[1],
      fileName: "kibela_OGP.jpg",
    })
    .then((res) => {
      imageUrl = res.url;
    });

  return imageUrl;
};

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
