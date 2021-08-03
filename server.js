const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

require("dotenv").config();

const server = express();

server.use(cors());
server.use(express.json());
const PORT = process.env.PORT || 4005;

mongoose.connect(
  `mongodb://books:${process.env.DBPASS}@cluster0-shard-00-00.uvjqt.mongodb.net:27017,cluster0-shard-00-01.uvjqt.mongodb.net:27017,cluster0-shard-00-02.uvjqt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-h1qilz-shard-0&authSource=admin&retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const colorSchema = mongoose.Schema({
  title: String,
  imageUrl: String,
});

const userSchema = mongoose.Schema({
  email: String,
  colors: [colorSchema],
});

const userModel = mongoose.model("colorsUser", userSchema);

let seed = () => {
  let omar = new userModel({
    email: "omx302@gmail.com",
    colors: [
      {
        title: "blue",
        imageUrl:
          "http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png",
      },
      {
        title: "red",
        imageUrl:
          "http://www.colourlovers.com/img/ADD8C7/100/100/serenity_is_._._..png",
      },
    ],
  });

  let razan = new userModel({
    email: "quraanrazan282@gmail.com",
    colors: [
      {
        title: "sky",
        imageUrl:
          "http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png",
      },
      {
        title: "dark",
        imageUrl:
          "http://www.colourlovers.com/img/ADD8C7/100/100/serenity_is_._._..png",
      },
    ],
  });

  omar.save();
  razan.save();
};

server.get("/", (req, res) => res.send("Welcome Home"));

server.get("/colors", (req, res) => {
  axios
    .get("https://ltuc-asac-api.herokuapp.com/allColorData")
    .then((resultData) => {
      res.send(resultData.data.map((ele) => new Color(ele)));
    })
    .catch((error) => {
      res.send("NOT FOUND");
    });
});

server.get("/getFav", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send("NOT FOUND");
    } else {
      res.send(result.colors);
    }
  });
});

server.post("/addFav", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send("NOT FOUND");
    } else {
      result.colors.push(req.body);
      result.save();
      res.send(result.colors);
    }
  });
});

server.delete("/removeFav/:index", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send("NOT FOUND");
    } else {
      result.colors.splice(Number(req.params.index), 1);
      result.save();
      res.send(result.colors);
    }
  });
});

server.put("/updateFav/:index", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send("NOT FOUND");
    } else {
      result.colors.splice(Number(req.params.index), 1, req.body);
      result.save();
      res.send(result.colors);
    }
  });
});

class Color {
  constructor(obj) {
    this.title = obj.title;
    this.imageUrl = obj.imageUrl;
  }
}

server.listen(PORT, () => console.log(`Live on ${PORT}`));
