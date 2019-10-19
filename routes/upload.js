const fs = require('fs');
//const readline = require('readline');
//const LineByLineReader = require('line-by-line');
const es = require('event-stream');
const express = require('express');
const router = express.Router({mergeParams: true})

router.get("/", function(req, res){
  res.render("pages/home");
})

router.post("/upload", function(req, res){
  let info = req.files.datafile.tempFilePath
  let newArray = [];
  let i = 0;

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
    if(checkLine == '{"name"'){
      console.log("made it x: "+i);
      newArray.push(JSON.parse(line));
      i++
    }
    // function below was for logging memory usage
    //slogMemoryUsage(lineNr);

    // resume the readstream, possibly from a callback
    s.resume();
  })
  .on('error', function(err){
    fs.unlink( info, function( err ) {
        if ( err ) return console.log( err );
    });
    console.log('Error while reading file.', err);
  })
  .on('end', function(){
    fs.unlink( info, function( err ) {
        if ( err ) return console.log( err );
    });
    const type = [];
    const comp = [];
    const hrs = [];
    const mins = [];
    newArray.forEach(function(value){
      if (type.indexOf(value.type)==-1) type.push(value.type);
      if (comp.indexOf(value.component)==-1) comp.push(value.component);
      if (hrs.indexOf(value.time.slice(11,13))==-1) hrs.push(value.time.slice(11,13));
      if (mins.indexOf(value.time.slice(14,16))==-1) mins.push(value.time.slice(14,16));
    });

    console.log('Read entire file.')
    if(newArray.length === i || newArray === 1000){
      res.render('pages/show',{data:newArray, type:type, comp:comp, hrs:hrs, mins:mins})
    }
  })
)
});


router.get('/data', function(req, res){
  fs.readFile('json/data.JSON', function(err,data){
    if(err){
      return err;
    }
    let newData = JSON.parse(data);
    res.render('pages/show',{data: newData});
  });
});


module.exports = router;
