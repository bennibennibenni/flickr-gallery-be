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

app.get("/images", async (req, res) => {
  let { tags, pageSize = 4, currentPage = 1 } = req.query;
  currentPage = +currentPage;
  pageSize = +pageSize;
  const startAt = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
  try {
    const response = await axios(
      `https://www.flickr.com/services/feeds/photos_public.gne?id=76499814&format=json&${
        tags && `&tags=${tags}`
      }`
    );
 
    console.log(response)
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
  } catch (error) {
    console.log(error.message);
    res.json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
