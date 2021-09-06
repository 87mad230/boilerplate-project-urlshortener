require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const mongoose = require('mongoose');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
//-----------------------------------------------------------------
app.use(express.urlencoded());
app.use(express.json());

mongoose.connect('mongodb+srv://test:test@cluster0.nxd1a.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
let UrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: {
        type: Number,
        unique: true  
  }
})
let UrlModel = mongoose.model('urls',UrlSchema);


app.post("/api/shorturl", function(req,res,next) {
    console.log(req.body.url);
    let url = req.body.url
    dns.lookup(url.replace(/http?s:\/{2}/, "").replace(/\/.*/gi,''), function(err) {
      if (err) {
        console.log(err);
        res.json({error: "Invalid URL"});
        next()
      }
      else {
        UrlModel.findOne({ original_url: url }, function (err, response) {
              if (err) console.log(err)
              console.log(response);
              if (response) {
                res.json({ original_url: response['original_url'], short_url: response['short_url'] });
              }
              else {
                let short = new Date().valueOf() ;
                let UrlData = new UrlModel({
                  original_url: url,
                  short_url: short
                });
                UrlData.save();
                res.json({original_url: url, short_url: short});
              }
        })
      
      }
    })
})

app.get('/api/shorturl/:short_url', function (req,res) {
    let short = req.params.short_url ;
    UrlModel.findOne({short_url: short}, function(err, response) {
      let original_url = response.original_url ;
      res.redirect(original_url);
    })
})
//-----------------------------------------------------------------
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
