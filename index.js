const express = require('express');
const minimist = require('minimist');
const morgan = require('morgan');
const db = require('./src/services/database.js');
const fs = require('fs');
const crossOrg = require('cors');

const app = express();
const args = minimist(process.argv.slice(2));

app.use(express.static('./public'));
app.use(crossOrg());
app.use(express.json());
args["port","help","debug"]

const HTTP = args.port || 5000;

if (args.help) {
    const msg = (
      ```

--port, -p	Set the port number for the server to listen on. Must be an integer
between 1 and 65535. Defaults to 5000.

--debug, -d If set to true, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws  an error with the message "Error test successful." Defaults to false.

--log, -l   If set to false, no log files are written. Defaults to true. Logs are always written to database.

--help, -h	Return this message and exit.

```)
    console.log(msg)
    process.exit(0)
}

log = true;
debug = false;
if(args.debug) {debug =true;}
if(!args.log) {log=false;}

//------------------------START THE SERVER-----------------------
const server = app.listen(HTTP, () => {
  console.log("Dice Roller listening to port %PORT%".replace('%PORT%', HTTP))
});

//--------------------------------DATABASe----------------------
app.use((req, res, next) => {
    let logdata = {
            remoteaddr: req.ip,
            remoteuser: req.user,
            time: Date.now(),
            method: req.method,
            url: req.url,
            protocol: req.protocol,
            httpversion: req.httpVersion,
            status: res.statusCode,
            referer: req.headers['referer'],
            useragent: req.headers['user-agent']
        };
        const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        const insertInfo = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
        next();
    });

//------------------------------------DEBUg----------------
if (debug != false) {
    app.get('/app/log/access', (req, res) => {
      const select_statement = db.prepare('SELECT * FROM accesslog').all();
      res.status(200).json(select_statement);
  });

  app.get('/app/error', (req, res) => {
    throw new Error('Error test successful.')
  });
}

if (log == true) {
  const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' })
  app.use(morgan('combined', { stream: WRITESTREAM }))
} 

//----------------------------------ENDPOINTS-----------------
app.get('/app/', (req, res) => {
  res.status(200).json({"message":"API functional (200)"});
});

app.get('/app/flip/', (req, res) => {
    let result = coinFlip();
    res.status(200).json({"flip": result});
    console.log(res.getHeaders());
});

app.get('/app/flip/:number', (req, res) => {
    let num = req.params.number;
    let coinFlips = coinFlips(num);
    let flipsCount = countFlips(coinFlips);
    res.status(200).json(
      {"raw":coinFlips, "summary":flipsCount}
    );
    console.log(res.getHeaders());
});

app.get('/app/flip/call/:guess(heads|tails)', (req, res) => {
    let game = flipACoin(req.params.guess);
    res.status(200).json(game);
})

app.post('/app/flip/coins',(req,res,next)=> 
{
  let num = req.params.number;
  let flips = coinFlips(num);
  let count = countFlips(flips);
  res.status(200).json({"raw":flips, "summary":count});
});


app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});


process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})

//--------------------COINFLIP FROM OTHER CLASS---------------------
/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

function coinFlip() {
    let random = Math.floor(Math.random()*2);
    if(random ==1) {
      return "heads";
    }
    return "tails";
  }
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
  function coinFlips(flips) {
    let x = [];
  
    for(let i =0; i<flips; i++) {
      x.push(coinFlip());
    }
    return x;
  }
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
  function countFlips(array) {
     let tailNum = 0;
     let headNum = 0;
  
     for(let i = 0; i< array.length; i++) {
       if(array[i] == "heads"){
         headNum += 1;
       }else {
         tailNum += 1;
       }
     }
     if (headNum ==0) {
       return {
         tails: tailNum
       };
     }
     if (tailNum ==0) {
       return {
         heads: headNum,
       };
     }
     return {
       tails: tailNum,
       heads: headNum
     };
  }
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
  function flipACoin(call) {
     let flip = coinFlip();
     let result = "win";
     
     if(flip != call){
       result = "lose";
     }
  
     const returnSum = {
       call: call,
       flip: flip,
       result: result
     }
     return returnSum;
  }



