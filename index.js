const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Start is running.....");
});

app.get("/images", (req, res) => {
  let { tags, pageSize = 4, currentPage = 1 } = req.query;
  currentPage = +currentPage;
  pageSize = +pageSize;
  let url = tags
    ? `https://api.flickr.com/services/feeds/photos_public.gne?tags=${tags}&tagmode=any&format=json`
    : "https://api.flickr.com/services/feeds/photos_public.gne?format=json";
  const startAt = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
  axios
    .get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    })
    .then((response) => {
      let { data } = response;
      data = data.replace("jsonFlickrFeed(", "");
      data = data.substring(0, data.length - 1);
      data = JSON.parse(data);
      const images = data.items.slice(startAt, startAt + pageSize);
      const totalData = data.items.length;
      const totalPage =
        ~~(totalData / pageSize) === 0 ? 1 : ~~(totalData / pageSize);
      const { modified } = data;
      res.json({
        data: images,
        meta: {
          currentPage,
          totalPage,
          pageSize,
          totalData,
          modified,
        },
      });
    })
    .catch((error) => {
      res.status(500).send("Error fetching data");
    });
});

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
