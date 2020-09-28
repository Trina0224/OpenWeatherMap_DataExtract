const express = require("express");
// const bodyParser = require("body-parser");
//
// const https = require("https");
const app = express();
const port = 3000;

const fs = require('fs');



// app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
  //console.log(req);
  //res.send("<h1>Hello</h1>");
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, function (){
  console.log("server is running on "+port);
});

app.post("/",function(req,res){
  //code here!!!!
  //import datas from './data/xbn.json';

  //const writeJsonFile = require('write-json-file');
  //import writeJsonFile  from 'write-json-file';

///////////////////////////

  //A link can help debug.
  //https://www.unixtimestamp.com/index.php

  ////Step 0. Current unixtimestamp
  //const current= new Date().getTime();
  //console.log(current/1000);

  //Step.1 Get current timezone
  var offset = new Date().getTimezoneOffset();
  //console.log(offset); //because offset is in minute.

  //Step.2 Generate a Date we desired. Becuase Asia timezone, you will get a number +1
  let startTd = new Date('2018.12.31 23:0:0').getTime() / 1000; //you will get 2019.01.01.00:00:00
  let endTd = new Date('2019.12.31 22:0:0').getTime() / 1000;//You will get 2019.12.31.23:00:00
//debug  let endTd = new Date('2019.01.01 0:0:0').getTime() / 1000;//You will get 2018.12.31.23:00:00
  //console.log(startTd);

  //Step.3 Apply offset to Generated unixtimestamp.
  startTd -= (offset*60);
  endTd -= (offset*60);

  console.log(`Adjusted: ${startTd} and ${endTd}`);


  let rawdata = fs.readFileSync('./Tianjin.json');
  let weatherDetails = JSON.parse(rawdata);
  // console.log(weatherDetails);


  //startTd = 1598918400;
  //endTd = 1600729200;
//////////////////////////
var obj = {
   table: []
};
//  console.log(startTd);
//  console.log(endTd);
    const newdata = weatherDetails.map(function(currentValue, index){
      //console.log(currentValue.dt);
      if(currentValue.dt>= startTd && currentValue.dt <=endTd){
        //console.log(currentValue.main.temp);
        let historicalData = {
            "dryBulbTemp": 0,
            "feels_like": 0,
            "humidity": 0,
            "dt": 0,
            "dt_iso":0,
            "wetBulbTemp":0,
            "dewpoint":0
        }

        historicalData.dt = currentValue.dt;
        historicalData.humidity = currentValue.main.humidity;
        historicalData.dryBulbTemp = currentValue.main.temp;
        historicalData.feels_like = currentValue.main.feels_like;
        historicalData.dt_iso = currentValue.dt_iso;
        //console.log(historicalData);
        //T * arctan[0.151977 * (rh% + 8.313659)^(1/2)]
        //+ arctan(T + rh%) - arctan(rh% - 1.676331) +
        //0.00391838 *(rh%)^(3/2) * arctan(0.023101 * rh%) - 4.686035
        historicalData.wetBulbTemp = (273.15+(
        (1*(historicalData.dryBulbTemp)-273.15)*
        Math.atan(0.151977 *Math.sqrt(8.313659+1*(historicalData.humidity)))+
        Math.atan((1*(historicalData.dryBulbTemp)-273.15)+((1*historicalData.humidity)))-
        Math.atan(((1*historicalData.humidity))-1.676331)+
        0.00391838 *Math.pow(((1*historicalData.humidity)),(1.5))*
        Math.atan(0.023101 *((1*historicalData.humidity)))- 4.686035)).toFixed(2);

        //Td = T - ((100 - RH)/5.)
        historicalData.dewpoint = (1*(historicalData.dryBulbTemp)-
        ((100-(1*historicalData.humidity))/5)).toFixed(2);

        // historicalData.wetBulbTemp = (273.15+(
        // (1*(historicalData.dryBulbTemp)-273.15)*
        // Math.atan(0.151977 *Math.sqrt(8.313659+1*(historicalData.humidity)/100))+
        // Math.atan((1*(historicalData.dryBulbTemp)-273.15)+((1*historicalData.humidity)/100))-
        // Math.atan(((1*historicalData.humidity)/100)-1.676331)+
        // 0.00391838 *Math.pow(((1*historicalData.humidity)/100),(1.5))*
        // Math.atan(0.023101 *((1*historicalData.humidity)/100))- 4.686035)).toFixed(2);


        obj.table.push(historicalData);

        // (async () => {
        //     await writeJsonFile('./data/new.json', currentValue);
        // })();
      }
      //return {key:index, value:currentValue}
    });
    console.log(obj.table);


    var json = JSON.stringify(obj);
    fs.writeFile('./2019.json', json, 'utf8', (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });

    res.send("<h1>new json generated.</h1>");
//Remember taking '{"table":' out from new.json

});
