const fs = require('fs');
//const readline = require('readline');
//const LineByLineReader = require('line-by-line');
const es = require('event-stream');
const express = require('express');
const router = express.Router({mergeParams: true});
const Tabulator = require('tabulator-tables');

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
    newArray = [];
    top100 = [];
  let info = req.files.datafile.tempFilePath
  let i = 1;
  let check = 1;
  let newline = '';

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
      newline.place = i
      if(newline.place <= 200){
        top100.push(newline);
      }
      newArray.push(newline);
      i++
    }
    if(newline.place === 1000){
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
    console.log('Read entire file.')
    if(done === true){
      res.redirect('/data')
      //res.render('pages/show',{data:top100, allData:newArray, type:type, comp:comp, hrs:hrs, mins:mins})
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
    console.log('checking done :'+m);
    if(x == true){
      res.redirect('/data');
    } else {
      setTimeout(function(){
        res.redirect('/loading')
      }, 1000)
    }
    m++
  }
})

router.get('/data', function(req, res){
  const directory = '/tmp';
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink( directory+"/"+file, function( err ) {
          if ( err ) return console.log( err );
      });
    }
  });



    res.render('pages/show2',{data:newArray, allData:newArray, type:type, comp:comp, hrs:hrs, mins:mins});
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
