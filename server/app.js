require("dotenv").config();
const express = require("express");
const db = require("./lib/db");
const cors = require('cors');
const mongoose = require("mongoose");
const Post = require('./lib/models/post')

/*
  We create an express app calling
  the express function.
*/
const app = express();
app.use(cors());
app.use((req, res, next)=>{
  const {method, url} = req;
  console.log("custom middleware");
  console.log(`${method} ${url}`);
  next();
})

/*
  We setup middleware to:
  - parse the body of the request to json for us
  https://expressjs.com/en/guide/using-middleware.html
*/
app.use(express.json());

/*
  Endpoint to handle GET requests to the root URI "/"
*/
app.get("/", (req, res) => {
  Post.find()
  .then((posts) => {
    res.status(200);
    res.json(posts);
  })
  .catch((error) =>{
    res.status(500);
    res.json({
      error:`Internal server error: ${error}`,
    });
  });
});


app.post("/posts", (req, res) => {
  Post.create(req.body)
  .then(newPost => {
    res.status(200);
    res.json(newPost);
  })
  .catch(error =>{
    res.status(500);
    res.json({
      error:"internal server error",
    })
  })
})

app.get('/posts/:id', (req, res) => {
  const {id} = req.params;
  Post.find()
    .then((post) => {
      if (post) {
        res.status(200);
        res.json(post);
      } else {
        res.status(404);
        res.json({
          error: `Post with id: ${id} not found`,
        });
      }
    })
    .catch((error) => {
      res.status(500);
      res.json({
        error: "Internal Server Error",
      });
    });
});

app.patch('/posts/:id', (req, res) => {
  const {id} = req.params;
  Post.findByIdAndUpdate(id, req.body, {new:true})
    .then((foundPost) => {
        res.status(200);
        res.json(foundPost);
      })
      .catch((error) => {
        res.status(500);
        res.json({
          error: "Internal Server Error",
      });
    });
});

app.delete('/posts/:id', (req, res) => {
  const {id} = req.params;
  Post.findByIdAndDelete(id)
  .then(post => {
    res.status(204);
    res.json(post);
    console.log(`Id ${id} deleted`);
  })
  .catch((error) =>{
    res.status(500);
    res.json({
      error: "internal server error"
    });
  })
})

/*
  We have to start the server. We make it listen on the port 4000

*/

const {PORT, MONGO_URL} = process.env;

mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const mongodb = mongoose.connection;

mongodb.on("open", ()=> {
  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
  
});

