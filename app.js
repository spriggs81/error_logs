const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const route = require('./routes/upload')
const app = express();

let port = process.env.PORT,// || 411,
    ip = process.env.IP;// || 'localhost';

    var dir = '/tmp';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

app.use(fileUpload({
  useTempFiles: true,
  temoFileDir: 'c:/nodeapps/errorLogs/tmp'
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/',route);

app.listen(port, ip, function(){
  console.log('Server Online! Please goto: '+ip+":"+port);
})
