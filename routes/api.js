/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
    var dbo = client.db("personalLibrary");
    var db = dbo.collection("personalLibrary");
    app
      .route("/api/books")
      .get(function(req, res) {
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        db.find({}, { title: 1, _id: 1, commentcount: 1 }).toArray(function(
          err,
          cb
        ) {
          res.json(cb);
        });
      })

      .post(function(req, res) {
        var title = req.body.title;
        //response will contain new book object including atleast _id and title
        let bookObj = { title: title, comments: [], commentcount: 0 };
        db.insert(bookObj, function(err, cb) {
          res.json(cb.ops[0]);
        });
      })

      .delete(function(req, res) {
        //if successful response will be 'complete delete successful'

        db.deleteMany({}, function(err, cb) {
          res.json("'complete delete successful");
        });
      });

    app
      .route("/api/books/:id")
      .get(function(req, res) {
        var bookid = req.params.id;
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

        db.findOne(
          { _id: ObjectId(bookid) },
          { title: 1, _id: 1, comments: 1 },
          function(err, cb) {
            if (cb == null) {
              return res.json("no book exists");
            }
            res.json(cb);
          }
        );
      })

      .post(function(req, res) {
        var bookid = req.params.id;
        var comment = req.body.comment;
        //json res format same as .get

        db.findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment }, $inc: { commentcount: 1 } },
          {
            returnOriginal: false,
            projection: { title: 1, _id: 1, comments: 1 }
          },
          function(err, cb) {
            if (cb.value == null) {
              return res.json("no book exists");
            }
            res.json(cb.value);
          }
        );
      })

      .delete(function(req, res) {
        var bookid = req.params.id;
        //if successful response will be 'delete successful'

        db.findOneAndDelete({ _id: ObjectId(bookid) }, function(err, cb) {
          res.json("delete successful");
        });
      });

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res
        .status(404)
        .type("text")
        .send("Not Found");
    });
  });
};
