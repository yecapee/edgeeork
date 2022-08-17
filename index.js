const express = require("express");
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const app = express();
const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
// respond with "hello world" when a GET request is made to the homepage

app.get("/html", function (req, res, next) {
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

      res.json({
        list: contentTexts.map((item, i) => ({
          img: contentMedias[i],
          text: item,
        })),
      });
    } else {
      res.json({
        list: [],
      });
    }
  });
});

app.get("/sign", async function (req, res, next) {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  let dom;

  try {
    // await driver.get("https://edgework.soci.vip/");
    await driver.get("https://edgework.soci.vip/");
    let list = await driver.findElement(By.className("list"));
    dom = new JSDOM(await list.getAttribute("innerHTML"));
  } finally {
    await driver.quit();
    const content = dom.window.document.getElementsByTagName("li");
    const list = [];
    for (let i = 0; i < content.length; i++) {
      list.push({
        text: content[i].textContent,
        img: content[i].getElementsByTagName("img")[0].getAttribute("src"),
      });
    }
    res.json({
      list,
    });
  }
});

app.use("/", express.static("public"));

app.listen(process.env.PORT || 3000);
