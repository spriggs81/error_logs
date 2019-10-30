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

  console.log(req.files)

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
    if(name !== "result"){
      if(Array.isArray(data) === true){
        payload += x+": [++++++An Array was found in payload. (More Testing Needed(1st Level))+++++++]"
      } else {
        payload += x+": {"
          let a = 0
          for (const key of Object.keys(data)) {
            let val = data[key]
            if(val === null || val === ''){
              val = "null"
            }
            if(Object.is(val, String(val)) === true || typeof val === 'boolean' || Object.is(val, Number(val)) === true){
              if(a > 0){
                payload += ", " + key + ": " + val;
              } else {
                payload += key + ": " + val;
              }
            } else if(Array.isArray(val) === true) {
              payload+= key + ": ["
              let a = 0;
              for(let ii = 0; ii < val.length; ii++){
                if(val[ii] === null || val[ii] === ''){
                  val[ii] = "null"
                }
                if(a > 0){
                  payload += ", "+val[ii];
                } else {
                  payload += val[ii];
                }
                a++;
              }
              payload+= " ]"
            } else {
              if(a > 0){
                payload += ", " + key + ": {"
              } else {
                payload += key + ": {"
              }
              let b = 0
              for (const key1 of Object.keys(data[key])) {
                let val1 = data[key][key1]
                if(val1 === null || val1 === ''){
                  val1 = "null"
                }
                if(Object.is(val1, String(val1))===true || typeof val1 === 'boolean' || Object.is(val1, Number(val1)) === true){
                  if(b > 0){
                    payload += ", " + key1 + ": " + val1
                  } else {
                    payload += key1 + ": " + val1
                  }
                } else if(Array.isArray(val1) === true){
                  payload += key1 + '[++++++An Array was found in '+x+'. (More Testing Needed(real 2nd Level))+++++++]'
                } else {
                  let c = 0
                  if(b > 0){
                    payload += ", " + key1 + ": {"
                  } else {
                    payload += key1 + ": {"
                  }
                  for (const key2 of Object.keys(data[key][key1])) {
                    let val2 = data[key][key1][key2]
                    if(val2 === null || val2 === ''){
                      val2 = "null"
                    }
                    if(c > 0){
                      payload += ", " + key2 + ": " + val2
                    } else {
                      payload += key2 + ": " + val2
                    }
                    c++
                  }
                  payload += "}"
                }
                b++
              }
              payload += "}"
            }
            a++
          }
        payload += "}"
        }
      } else if(name === 'result'){
        if(data === null || data === ''){
          data = "null";
        }
        if(Object.is(data, String(data)) === true || typeof data === 'boolean' || Object.is(data, Number(data)) === true){
          payload += "Result: " + data
        } else if(Array.isArray(data) === true){
          payload += "Result: ["
          let i = 0
          data.forEach(function(arrayResult){
            if(arrayResult === null || arrayResult === ''){
              if(i > 0){
                payload += ", null"
              } else {
                payload += "null"
              }
            } else {
              if(i > 0){
                payload += ", Payload was sent here!"
              } else {
                payload += "Payload was sent here!"
              }
            }
            i++
          })
          payload += "]"
        } else {
          let a = 0;
          payload += "Result:{"
          for (const key of Object.keys(data)) {
            let val = data[key]
            if(val === null || val === ''){
              val = "null";
            }
            if(a > 0){
              payload += ", "+key+": "+val
            } else {
              payload += key + ": " + val
            }
            a++
          }
          payload += "}"
      }

    }

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
    // console.log(checkLine);
    // i++
    // console.log('Reading line: '+i);
    if(checkLine == '{"name"'){
      //console.log("made it x: "+i);
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
      return top100, newArray, type, comp, hrs, mins
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
  res.render('pages/error',{total:total});
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

function startData(){
  done = false;
  return done;
}

function dataDone(){
  done = true;
  return done;
}



module.exports = router;
