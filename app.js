const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const route = require('./routes/upload')
const app = express();

let port = process.env.PORT,
    ip = process.env.IP;

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

app.listen(port, ip, function(){
  console.log('Server Online!');
})
