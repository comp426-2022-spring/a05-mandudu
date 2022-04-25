app.use(express.json());

const express = require('express');
const minimist = require('minimist');
const arg = minimist(process.argv.slice(2))


const app = express();

const fs = require('fs');
const db = require('./src/services/database.js');

const morgan = require('morgan');

app.use(express.static('./public'));

args["help","port","debug","log"]
if (args.help || args.h) {
    const help = (`
    server.js [options]
    
    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
    
    --debug	If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    
    --log		If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    
    --help	Return this message and exit.
    `)
    console.log(help)
    process.exit(0)
}

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


var port = 'port'
const HTTP = args.port || process.env.PORT || 5000

const log = args.log || true
if (log != "false") {
    const accesslog = fs.createWriteStream('access.log',{flags:'a'})
    app.use(morgan('combined',{stream:accesslog}))
}
const debug = args.debug || false
const server = app.listen(HTTP, () => {
  console.log("App listening on port %PORT%".replace('%PORT%', HTTP))
});

//ENDPOINTS etc

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
        const table_info = stmt.run(String(logdata.remoteaddr), String(logdata.remoteuser), String(logdata.time), String(logdata.method), String(logdata.url), String(logdata.protocol), String(logdata.httpversion), String(logdata.status), String(logdata.referrer), String(logdata.useragent))
        next();
    });

app.get('/app/', (req, res) => {
      res.statusCode = 200;
      res.statusMessage = 'OK';
      res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
      res.end(res.statusCode+ ' ' +res.statusMessage)
    });

app.get('/app/flip', (req, res) => {
    res.status(200)
    res.type('text/plain')
    res.json({'flip': coinFlip()})
})

app.get('/app/flips/:number', (req, res) => {
    res.status(200)
    var flipsArray = coinFlips(req.body.number)
    res.json({'raw': flipsArray, 'summary': countFlips(flipsArray)})
})

app.get('/app/flip/call/heads', (req, res) => {
    res.status(200)
    res.json(flipACoin("heads"))
})

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200)
    res.json(flipACoin("tails"))
})

app.post('/app/flips/coins',(req,res,next)=> 
{
const result = coinFlips(parseInt(req.body.number))
const count = countFlips(result)
res.status(200).json({"raw":result, "summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})


app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
  res.type('text/plain')
});


process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})

if (debug != "false") {
    app.get("/app/log/access", (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all();
            res.status(200).json(stmt)
        } catch {
            console.error(e)
        }
    });
    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.')
    });
}
