const fs = require('fs');
const es = require('event-stream');
const express = require('express');
const router = express.Router({mergeParams: true});

function serverTime(){
  const now = new Date();
  const yy = now.getFullYear();
  const mm = now.getMonth();
  const dd = now.getDate();
  const hh = now.getHours();
  const mi = now.getMinutes();
  const ss = now.getSeconds();
  const ms = now.getMilliseconds();

  function checkZero(x){
    const xx = x.toString();
    if(xx.length == 1){
      return "0" + x.toString();
    }
    return x
  }
  return checkZero(mm)+"/"+checkZero(dd)+"/"+yy+" "+checkZero(hh)+":"+checkZero(mi)+":"+checkZero(ss)+"."+ms;
}

let newArray = [],
    top100   = [],
    type = [],
    comp = [],
    hrs = [],
    mins = [],
    done = true;


router.get("/", function(req, res){
  res.render("pages/home");
})

router.post("/upload", function(req, res){
  console.log("Upload started at: "+serverTime());
    newArray = [];
    top100 = [];
  let info = req.files.datafile.tempFilePath
  let i = 1;
  let check = 1;
  let newline = '';

  if(req.files === ''){
    res.redirect('/data/page1');
  }

  function checkPayload(name, data){
    let payload = '',
        x       = '';
      if(name === 'pay'){
        x = 'Payload'
      }
      if(name === "msg"){
        x = "Message"
      }
      if(name === "result"){
        x = "Result"
      }
    if(data === null || data === ''){
      data = "null"
    }
    payload += x+": "+checkInfo(data)

    if(payload !== ''){
      if(name === 'pay'){
        newline.newPayload = payload
        return newline.newPayload
      }
      if(name === "msg"){
        newline.newMsg = payload
        return newline.newMsg
      }
      if(name === "result"){
        newline.newResult = payload
        return newline.newResult
      }

    }
  }
  const s = fs.createReadStream(info)
  .pipe(es.split())
  .pipe(es.mapSync(function(line){

    // pause the readstream
    s.pause();

    //lineNr += 1;

    // process line here and call s.resume() when rdy
    let checkLine = line.slice(0,7);
    if(checkLine == '{"name"'){
      newline = JSON.parse(line);
      if(newline.payload){
        checkPayload("pay", newline.payload);
      }
      if(newline.message){
        checkPayload("msg", newline.message);
      }
      if(newline.result){
        checkPayload("result", newline.result);
      }
      if(newline.sqlQuery){
        newline.newSql = newline.sqlQuery.toString();
      }
      newline.place = i;
      let yy = newline.time.slice(0,4)
      let mm = newline.time.slice(5,7)
      let dd = newline.time.slice(8,10)
      let hr = newline.time.slice(11,13)
      let min = newline.time.slice(14,16)
      let ss = newline.time.slice(17,19)
      let ms = newline.time.slice(20,23)
      let newTime = mm + '/' + dd + '/' + yy + ' '+ hr + ':' + min + ":" + ss + "." + ms
      newline.newTime = newTime;
      newArray.push(newline);
      i++
    }


    if(newline.place === 5000){
      startData();
      res.redirect("/loading");
    }
    check++
    // function below was for logging memory usage
    //slogMemoryUsage(lineNr);

    // resume the readstream, possibly from a callback
    s.resume();
  })
  .on('error', function(err){
    console.log('Error while reading file.', err);
  })
  .on('end', function(){
    type = [];
    comp = [];
    hrs = [];
    mins = [];
    newArray.forEach(function(value){
      if (type.indexOf(value.type)==-1) type.push(value.type);
      if (comp.indexOf(value.component)==-1) comp.push(value.component);
      if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
      if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));
    });

    function returning(){
      return newArray, type, comp, hrs, mins
    }
    returning();
    if(done === true){
      res.redirect('/data/page1')
    }
    if(done === false){
      dataDone();
    }
  })
)
});
let m = 1

router.get('/loading', function(req, res){
letSee(done);

  function letSee(x){
    if(x == true){
      m = 0;
      res.redirect('/data/page1');
    } else {
      setTimeout(function(){
        res.redirect('/loading')
      }, 2000)
    }
    m++
  }
})

router.get('/data', function(req, res){
  let total = newArray.length;
  res.redirect('/data/page1');
});

  router.get('/data/page:number', function(req, res){
    const directory = 'tmp';
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink( directory+"/"+file, function( err ) {
            if ( err ) return console.log( err );
        });
      }
    });
    let page = req.params.number
    page = Number(page);
    let pageList = [];
    let currentPage = page;
    const numberPerPage = 500;
    let numberOfPages = 1;
    load();
    function load(){
      makeList()
      loadList()
    }
    function makeList() {
        numberOfPages = getNumberOfPages();
    }

    function getNumberOfPages() {
        return Math.ceil(newArray.length / numberPerPage);
    }

    function loadList() {
      if(numberOfPages === 0 || isNaN(page) === true || page < 1 || page > numberOfPages || newArray.length <= 0 || !newArray || newArray === '' || newArray === []){
        let total = newArray.length;
        res.render('pages/error',{total:total});
      }
        var begin = ((currentPage - 1) * numberPerPage);
        var end = begin + numberPerPage;
        pageList = newArray.slice(begin, end);
        console.log("Page being served up at: "+serverTime());
        res.render('pages/show',{data:JSON.stringify(pageList), current:currentPage, total: numberOfPages});
    }
});

router.get('/filter', function(req, res){
  res.render('pages/filter');
})

function startData(){
  done = false;
  return done;
}

function dataDone(){
  done = true;
  return done;
}

function checkInfo(x){
  payload = ''
  let n = 0;
  if(Object.is(x, String(x)) === true || typeof x === 'boolean' || Object.is(x, Number(x)) === true){
    if (n > 0){
      payload += ", "+x
    } else {
      payload += x
    }
  } else if(Array.isArray(x) === true) {
    payload += ": ["
    let a = 0;
    for(let ii = 0; ii < x.length; ii++){
      if(x[ii] === null || x[ii] === ''){
        x[ii] = "null"
      }
      if(a > 0){
        payload += ", " + checkInfo(x[ii]);
      } else {
        payload += checkInfo(x[ii]);
      }
      a++;
    }
    payload+= " ]"
  } else {
    let a = 0;
    payload += "{"
    for (const key of Object.keys(x)) {
      let val = x[key]
      if(val === null || val === ''){
        val = "null";
      }
      if(a > 0){
        payload += ", "+key+": "+ checkInfo(val)
      } else {
        payload += key + ": " + checkInfo(val)
      }
      a++
    }
    payload += "}"
}
return payload
}



module.exports = router;
