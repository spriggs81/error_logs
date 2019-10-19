const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const route = require('./routes/upload')
const app = express();

//const testMods = require("../mods/testMod")
app.use(fileUpload({
  useTempFiles: true,
  temoFileDir: '/tmp/'
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/',route);

app.listen('411', 'localhost', function(){
  console.log('Server Online!');
})
