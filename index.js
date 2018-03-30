const express = require('express');
const PORT = 2001;
const axios = require('axios');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const shapefile = require("shapefile");

app.use(cors());
app.use(bodyParser.json());

app.get('/getshapes/', function (req, res) { 
  console.log(req.query.category) ;
  var shapejson = {
    type: "FeatureCollection",
    features: []
  };
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // overcome cert issues
  
  shapefile
    .open(`./shapefiles/${req.query.category}/${req.query.category}`)
    .then(source => source.read().then(function log(result) {
      if (result.done) {
        res.send(shapejson);
      }
      shapejson
        .features
        .push(result.value);
      return source
        .read()
        .then(log);
    }))
    .catch(error => console.error(error.stack));
});

app.listen(PORT, function (err) {
  if (err) 
    console.log(err);
  console.log(`Server running on ${PORT}`);
});
