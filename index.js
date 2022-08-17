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
  let body = "";
  try {
    await driver.get("https://edgework.soci.vip/");
    body = await driver.findElement(By.LocatorStrategy(body));
  } finally {
    await driver.quit();
    res.json(body.toString());
  }
  // request(
  //   {
  //     url: "https://edgework.soci.vip/",
  //     headers: {
  //       host: "https://edgework.soci.vip/",
  //       ...req,
  //     },
  //   },
  //   function (error, response, body) {
  //     if (body) {
  //       const dom = new JSDOM(body.toString());
  //       const contentText = dom.window.document.getElementsByTagName("li");

  //       const contentTexts = [];
  //       for (let i = 0; i < contentText.length; i++) {
  //         contentTexts.push({
  //           text: contentText[i].contentText,
  //           img: contentText[i].getElementsByTagName("img").getAttribute("src"),
  //         });
  //       }

  //       console.log("dom", body.toString());
  //       res.json(contentTexts);
  //     } else {
  //       res.json({
  //         list: [],
  //       });
  //     }
  //   }
  // );
});

app.use("/", express.static("public"));

app.listen(process.env.PORT || 3000);
