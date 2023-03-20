const express = require("express");
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
// respond with "hello world" when a GET request is made to the homepage
let returnHtmlJson;
function getHtml() {
  request("https://greatfon.com/v/edge_work", function (error, response, body) {
    if (body) {
      const dom = new JSDOM(body.toString());
      const contentText =
        dom.window.document.getElementsByClassName("content__text");
      const contentTexts = [];
      for (let i = 0; i < contentText.length; i++) {
        contentTexts.push(contentText[i].innerHTML);
      }

      const contentMedia =
        dom.window.document.getElementsByClassName("content__img");
      const contentMedias = [];
      for (let i = 0; i < contentMedia.length; i++) {
        contentMedias.push(contentMedia[i].getAttribute("src"));
      }

      if (contentTexts.length > 0) {
        returnHtmlJson = {
          list: contentTexts.map((item, i) => ({
            img: contentMedias[i],
            text: item,
          })),
        };
      } else {
        setTimeout(getHtml, 1000 * 60 * 3);
      }
    }
  });
}
getHtml();
setInterval(getHtml, 1000 * 60 * 60 * 3);

app.get("/html", function (req, res, next) {
  res.json(returnHtmlJson);
});

let returnlist;
async function getSign() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  let dom;
  let body;

  try {
    await driver.get("https://edgework.soci.vip/");
    body = await driver
      .findElement(By.tagName("body"))
      .getAttribute("innerHTML");
    const media = body.match(/media:\[.*?\],/)[0];

    const urls = media.match(/url:".*?"/g);
    const titles = media
      .match(/,title:".*?"/g)
      .map((str) => str.replace(/,/, ""));
    const subTitles = media.match(/subtitle:".*?"/g);

    returnlist = titles.map((item, i) => {
      let result;
      eval(`result = {
        ${urls[i]},
        ${titles[i]},
        ${subTitles[i]},
        imageUrl:''
      }`);

      result.url = decodeURIComponent(result.url);
      return result;
    });

    let list = await driver.findElement(By.className("list"));
    dom = new JSDOM(await list.getAttribute("innerHTML"));
    const content = dom.window.document.getElementsByTagName("li");

    for (let i = 0; i < content.length; i++) {
      if (returnlist[i]) {
        returnlist[i].imageUrl = content[i]
          ?.getElementsByTagName("img")[0]
          ?.getAttribute("src");
      }
    }
  } finally {
    driver.quit();
  }
}
getSign();
setInterval(getSign, 1000 * 60 * 60 * 3);

app.get("/sign", async function (req, res, next) {
  res.json({
    returnlist,
  });
});

app.use("/", express.static("public"));

//--------------web push

app.use(bodyParser.json());
app.use(cors());
app.use(
  cors({
    origin: "https://edgework-events.herokuapp.com",
  })
);
// VAPID公鑰和私鑰
const publicVapidKey =
  "BBECNCswyLSWrb5NKg_BU8Qz_Wm5luZsUJ_d91Dxnde7fyJysLZs_kyiTcF73HGEvQ1ZRUbmaD5iO2klLfsThuY";
const privateVapidKey = "TBDTYnphjzyzQKUfBWeop8D0AyvRa9RNjcgada9KXh4";

// 設置VAPID認證
webpush.setVapidDetails(
  "mailto:yecapee@gmail.com",
  publicVapidKey,
  privateVapidKey
);

// 訂閱集合
const subscriptions = [];

// 訂閱接口
app.post("/subscribe", (req, res) => {
  // 獲取客戶端訂閱對象
  const subscription = req.body;
  // 將訂閱對象存儲到訂閱集合中
  subscriptions.push(subscription);
  // 返回成功響應
  res.status(201).json({});
});

// 推送接口
app.post("/push", (req, res) => {
  // 推送消息內容
  const payload = JSON.stringify({
    title: "Push Notification",
    message: "This is a push notification.",
  });
  // 推送選項
  const options = {
    TTL: 60,
  };
  // 遍歷訂閱集合進行推送
  Promise.all(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, payload, options)
    )
  )
    .then(() => {
      // 返回成功響應
      res.status(200).json({});
    })
    .catch((error) => {
      console.error(error);
      // 返回錯誤響應
      res.status(500).json({});
    });
});

app.listen(process.env.PORT || 3000);