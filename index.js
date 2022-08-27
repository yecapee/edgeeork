const express = require("express");
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
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

app.listen(process.env.PORT || 3000);
