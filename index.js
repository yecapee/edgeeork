const express = require("express");
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const app = express();

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

app.use("/", express.static("public"));

app.listen(process.env.PORT || 3000);
