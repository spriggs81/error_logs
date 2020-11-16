const fs = require('fs');
const es = require('event-stream');
const express = require('express');
const sqlFormatter = require('sql-formatter');
const router = express.Router({mergeParams: true});

let debug_mode = false;

const checkSize = (x) =>{
  const b = x;
  if(b >= 1000){
    const kb = b / 1000;
    if(kb >= 1000){
      const mb = kb / 1000;
      if(mb >= 1000){
        const gb = mb / 1000;
        return gb+" Gigabytes file!"
      } else {
        return mb+" Megabytes file!"
      }
    }  else {
      return kb+" Kilobytes file!"
    }
  } else {
    return b+" Bytes file!"
  }
}

const serverTime = () =>{
  const now = new Date();
  const yy = now.getFullYear();
  const mm = now.getMonth();
  const dd = now.getDate();
  const hh = now.getHours();
  const mi = now.getMinutes();
  const ss = now.getSeconds();
  const ms = now.getMilliseconds();

  const checkZero = (x) =>{
    const xx = x.toString();
    if(xx.length == 1){
      return "0" + x.toString();
    }
    return x
  }
  return checkZero(mm)+"/"+checkZero(dd)+"/"+yy+" "+checkZero(hh)+":"+checkZero(mi)+":"+checkZero(ss)+"."+ms;
}

let newArray = [],
    rawArray = [],
    filteredData = [],
    customData = [],
    type = [],
    comp = [],
    hrs = [],
    mins = [],
    lev = [],
    done = true;

    const addData = (x) =>{
      rawArray.push(JSON.parse(x))
    }

    const addFailed = (x) =>{
      const failedLine = {
        name: "Failure",
        type: "Failure",
        component: "Failure",
        level: "Special",
        msg: String(x),
        time: "0000-00-00T00:00:00.000Z"
      }
      rawArray.push(failedLine);
    }
router.get("/", (req, res) =>{
  if(debug_mode === true){
    console.log("Reached / at: "+serverTime());
  }
  newArray = [],
  rawArray = [],
  filteredData = [],
  customData = [],
  type = [],
  comp = [],
  hrs = [],
  mins = [],
  lev = [];
  res.render("pages/home");
})

router.post("/upload",(req, res) =>{
  if(debug_mode === true){
    console.log("Upload started at: "+serverTime());
    console.log(checkSize(req.files.datafile.size));
  }
  rawArray = [];
  let info = req.files.datafile.tempFilePath
  let i = 1;
  let j = 1;
  let check = 1;
  let newline = '';
  const s = fs.createReadStream(info)
  .pipe(es.split())
  .pipe(es.mapSync((line) =>{

    // pause the readstream
    s.pause();

    // process line here and call s.resume() when rdy
    let checkLine = line.slice(0,2);
    let checkLine2 = line.slice(0,8);
    if(checkLine == '{"'){
      const data = line;
      addData(data);

    }
    if(checkLine2 == 'Failure:'){
      addFailed(line);
    }

    check++
      s.resume();
    // }
  })
  .on('error', (err) =>{
    res.send('Error while reading file. ' + err + "<br> <a href='/'>Start Over!</a>");
    return
  })
  .on('end', () =>{
    if(done === true){
      if(debug_mode === true){
        console.log("Redirecting to data at: "+serverTime());
      }
      res.redirect('/data/page1');
    }
    if(done === false){
      dataDone();
    }
  })
)
});

router.get('/data/page:number', (req, res) =>{
  if(debug_mode === true){
    console.log("Reached data at: "+serverTime());
  }
  type = [];
  comp = [];
  lev = [];
  hrs = [];
  mins = [];

  const checkPayload = (name, data) =>{
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
      if(name === "err"){
        x = "Error"
      }
    if(data === null || data === ''){
      data = "null"
    }
    payload += x+": "+checkInfo(data)

    if(payload !== ''){
      if(name === 'pay'){
        return payload;
      }
      if(name === "msg"){
        return payload;
      }
      if(name === "result"){
        return payload;
      }
      if(name === "err"){
        return payload
      }
    }
  }
  if(newArray.length <= 0){
    for(let i = 0; i < rawArray.length; i++){
      if(rawArray[i].payload){
        rawArray[i].newPayload = checkPayload("pay", rawArray[i].payload);
      }
      if(rawArray[i].message){
        rawArray[i].newMsg = checkPayload("msg", rawArray[i].message);
      }
      if(rawArray[i].result){
        rawArray[i].newResult = checkPayload("result", rawArray[i].result);
      }
      if(rawArray[i].err){
        rawArray[i].newErr = checkPayload("err", rawArray[i].err);
      }
      if(rawArray[i].sqlQuery){
        rawArray[i].newSql = rawArray[i].sqlQuery.toString();
      }
      rawArray[i].place = i + 1;
      let yy = rawArray[i].time.slice(0,4)
      let mm = rawArray[i].time.slice(5,7)
      let dd = rawArray[i].time.slice(8,10)
      let hr = rawArray[i].time.slice(11,13)
      let min = rawArray[i].time.slice(14,16)
      let ss = rawArray[i].time.slice(17,19)
      let ms = rawArray[i].time.slice(20,23)
      let newTime = mm + '/' + dd + '/' + yy + ' '+ hr + ':' + min + ":" + ss + "." + ms
      rawArray[i].newTime = newTime;
      newArray.push(rawArray[i])
    }
    rawArray.forEach((value) =>{
      if (type.indexOf(value.type)==-1) type.push(value.type);
      if (comp.indexOf(value.component)==-1) comp.push(value.component);
      if (lev.indexOf(value.level)==-1) lev.push(value.level);
      if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
      if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));

    });
    const returning = () =>{
      return newArray, type, comp, hrs, mins, lev
    }
    returning();
  } else {
    newArray.forEach((value) =>{
      if (type.indexOf(value.type)==-1) type.push(value.type);
      if (comp.indexOf(value.component)==-1) comp.push(value.component);
      if (lev.indexOf(value.level)==-1) lev.push(value.level);
      if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
      if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));
    });
    const returningNew = () =>{
      return newArray, type, comp, hrs, mins, lev
    }
    returningNew
  }


  const directory = './tmp'
  if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
  }
    fs.readdir(directory, (err, files) => {
      if (err){
        console.log(err);
        res.redirect('/')
      } else {
        if(files.length > 0){
          for (const file of files) {
            fs.unlink( directory+"/"+file, function( err ) {
                if ( err ) return console.log( err );
            });
          }
        }
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
   function makeList(){
      numberOfPages = getNumberOfPages();
  }

  function getNumberOfPages() {
      return Math.ceil(newArray.length / numberPerPage);
  }

  function loadList() {
    if(numberOfPages === 0 || isNaN(page) === true || page < 1 || page > numberOfPages || newArray.length <= 0 || !newArray || newArray === '' || newArray === []){
      console.log("Serving up errors at: "+serverTime());
      let total = newArray.length;
      res.render('pages/error',{total:total});
    } else {
      console.log("Serving up Data page at: "+serverTime());
      var begin = ((currentPage - 1) * numberPerPage);
      var end = begin + numberPerPage;
      pageList = newArray.slice(begin, end);
      console.log(newArray.length);
      res.render('pages/show',{data:JSON.stringify(pageList), current:currentPage, total: numberOfPages, type:type.sort(), comp:comp.sort(), hrs:hrs.sort(), mins:mins.sort(), lev:lev.sort(), rows:newArray.length});
    }
  }
});

router.post('/filter', function(req,res){
  filteredData = [];
  let selectTypes = req.body.selectType || null,
      selectComps = req.body.selectComp || null,
      selectLevs = req.body.selectLev || null,
      selectHrs = req.body.selectHrs || null,
      selectMins = req.body.selectMins || null;

    function checkTypes(a){
      let aa = [];
      let b = ''

      if(selectTypes !== null){
        for(let main = 0; main < a.length; main++){
          if(Array.isArray(selectTypes) === true){
            for(let i = 0; i < selectTypes.length; i++){
              if(a[main].type == selectTypes[i]){
                aa.push(a[main]);
              }
            }
          } else {
            if(a[main].type == selectTypes){
              aa.push(a[main]);
            }
          }
        }
        checkComps(aa);
      } else {
        checkComps(a);
      }
    }
    function checkComps(a){
      let aa = [];
      if(selectComps !== null){
        for(let main = 0; main < a.length; main++){
          if(Array.isArray(selectComps) === true){
            for(let i = 0; i < selectComps.length; i++){
              if(a[main].component == selectComps[i]){
                aa.push(a[main]);
              }
            }
          } else {
            if(a[main].component == selectComps){
              aa.push(a[main]);
            }
          }
        }
        checkLevs(aa);
      } else {
        b = a;
        checkLevs(b);
      }
    }
    function checkLevs(a){
      let aa = [];
      if(selectLevs !== null){
        for(let main = 0; main < a.length; main++){
          if(Array.isArray(selectLevs) === true){
            for(let i = 0; i < selectLevs.length; i++){
              if(a[main].level == selectLevs[i]){
                aa.push(a[main]);
              }
            }
          } else {
            if(a[main].level == selectLevs){
              aa.push(a[main]);
            }
          }
        }
        checkHrs(aa);
      } else {
        checkHrs(a);
      }
    }
    function checkHrs(a){
      let aa = [];
      if(selectHrs !== null){
        for(let main = 0; main < a.length; main++){
          if(Array.isArray(selectHrs) === true){
            for(let i = 0; i < selectHrs.length; i++){
              if(a[main].time.slice(11,13) == selectHrs[i]){
                aa.push(a[main]);
              }
            }
          } else {
            if(a[main].time.slice(11,13) == selectHrs){
              aa.push(a[main]);
            }
          }
        }
        checkMins(aa);
      } else {
        checkMins(a);
      }
    }
    function checkMins(a){
      let aa = [];
      if(selectMins !== null){
        for(let main = 0; main < a.length; main++){
          if(Array.isArray(selectMins) === true){
            for(let i = 0; i < selectMins.length; i++){
              if(a[main].time.slice(14,16) == selectMins[i]){
                aa.push(a[main]);
              }
            }
          } else {
            if(a[main].time.slice(14,16) == selectMins){
              aa.push(a[main]);
            }
          }
        }
        filteredData = aa;
      } else {
        filteredData = a;
      }
      return filteredData
    }
  checkTypes(newArray);
  res.redirect("/filter/page1");
})

router.get('/filter/page:number', function(req, res){
  let page = req.params.number
  page = Number(page);
  let pageList = [];
  let currentPage = page;
  const numberPerPage = 500;
  let numberOfPages = 1;

  newArray.forEach((value) =>{
    if (type.indexOf(value.type)==-1) type.push(value.type);
    if (comp.indexOf(value.component)==-1) comp.push(value.component);
    if (lev.indexOf(value.level)==-1) lev.push(value.level);
    if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
    if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));
  });
  const returningNew = () =>{
    return newArray, type, comp, hrs, mins, lev
  }
  returningNew

  load();
  function load(){
    makeList()
    loadList()
  }
  function makeList() {
      numberOfPages = getNumberOfPages();
  }

  function getNumberOfPages() {
      return Math.ceil(filteredData.length / numberPerPage);
  }

  function loadList() {
    if(numberOfPages === 0 || isNaN(page) === true || page < 1 || page > numberOfPages || filteredData.length <= 0 || !filteredData || filteredData === '' || filteredData === []){
      let total = filteredData.length;
      res.render('pages/error',{total:total});
    } else {
      var begin = ((currentPage - 1) * numberPerPage);
      var end = begin + numberPerPage;
      pageList = filteredData.slice(begin, end);

      console.log( type.length+"/"+ comp.length+"/"+ hrs.length+"/"+ mins.length+"/"+ lev.length);
      res.render('pages/filter',{data:JSON.stringify(pageList), current:currentPage, total: numberOfPages, type:type.sort(), comp:comp.sort(), hrs:hrs.sort(), mins:mins.sort(), lev:lev.sort(), rows:filteredData.length});
    }
  }
});

router.post('/custom', function(req, res){
  let customSearch = String(req.body.selectCustom).toLowerCase();
  customData = [];
    function searchingNow(a){
      let aa = [],
          bb = [... a];

      for(let i = 0; i < bb.length; i++){
        function checkingE(){
          if(bb[i].newErr){
            if(bb[i].newErr.toLowerCase().search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            } else {
              //send to next function
              checkingQ();
            }
          } else {
            //Send to next function
            checkingQ();
          }
        }

        function checkingQ(){
          if(bb[i].sqlQuery){
            if(bb[i].sqlQuery.toLowerCase().search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            } else {
              //send to next function
              checkingNm();
            }
          } else {
            //Send to next function
            checkingNm();
          }
        }

        function checkingNm(){
          if(bb[i].newMsg){
            if(bb[i].newMsg.toLowerCase().search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            } else {
              //send to next function
              checkingNr();
            }
          } else {
            //send to next function
            checkingNr();
          }
        }

        function checkingNr(){
          if(bb[i].result){
            if(bb[i].newResult.toLowerCase().search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            } else {
              checkingNp();
            }
          } else {
            checkingNp();
          }
        }

        function checkingNp(){
          if(bb[i] .newPayload){
            if(bb[i].newPayload.toLowerCase().search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            } else {
              checkingM();
            }
          } else {
            checkingM();
          }
        }

        function checkingM(){
          if(bb[i].message){
            let mess = String(bb[i].message).toLowerCase()
            if(mess.search(customSearch) !== -1){
              aa.push(bb[i]);
              bb.splice(i,1);
              i--;
            }
          }
        }
        checkingE();
      }
      customData = [... aa];
      return customData;
    }
  searchingNow(newArray);
  if(customData.length <= 0){
    res.send("Your Search Returned Nothing <a href='/data/page1'>Go Back to the Data!</a>");
  } else {
    res.redirect("/custom/page1");
  }
})

router.get('/custom/page:number', function(req,res){
  let page = req.params.number
  page = Number(page);
  let pageList = [];
  let currentPage = page;
  const numberPerPage = 500;
  let numberOfPages = 1;

  newArray.forEach((value) =>{
    if (type.indexOf(value.type)==-1) type.push(value.type);
    if (comp.indexOf(value.component)==-1) comp.push(value.component);
    if (lev.indexOf(value.level)==-1) lev.push(value.level);
    if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
    if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));
  });
  const returningNew = () =>{
    return newArray, type, comp, hrs, mins, lev
  }
  returningNew

  load();
  function load(){
    makeList()
    loadList()
  }
  function makeList() {
      numberOfPages = getNumberOfPages();
  }

  function getNumberOfPages() {
      return Math.ceil(customData.length / numberPerPage);
  }

  function loadList() {
    if(numberOfPages === 0 || isNaN(page) === true || page < 1 || page > numberOfPages){
        let total = customData.length;
        res.render('pages/error',{total:total});
    } else if(customData.length <= 0 || !customData || customData === '' || customData === []){
      res.redirect('/data/page1')
    } else {
      var begin = ((currentPage - 1) * numberPerPage);
      var end = begin + numberPerPage;
      pageList = customData.slice(begin, end);
      console.log( type.length+"/"+ comp.length+"/"+ hrs.length+"/"+ mins.length+"/"+ lev);
      res.render('pages/filter',{data:JSON.stringify(pageList), current:currentPage, total: numberOfPages, type:type.sort(), comp:comp.sort(), hrs:hrs.sort(), mins:mins.sort(), lev:lev.sort(), rows:customData.length});
    }
  }
})

router.get('/*',function(req, res){
  let total = newArray.length;
  res.render('pages/error',{total:total});
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
  if(Object.is(x, String(x)) === true){
    if (n > 0){
      payload += ', "'+x+'"'
    } else {
      payload += '"'+x+'"'
    }
  } else if(typeof x === 'boolean' || Object.is(x, Number(x)) === true){
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
        x[ii] = String(x[ii])
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
        val = String(val)
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

function resetAll(){

}

module.exports = router;
