#!/usr/bin/env nodejs
var EventBus = require('vertx3-eventbus-client');
var program = require('commander');
var encoding = 'utf-8';
var data;
var eb;
program
    .version('0.0.1')
    .option('-c, --connect <value>', 'connect to host:port')
    .option('-n, --channel <value>', 'connect channel name')
    .option('-l, --listen ', 'listen')
    .option('-d, --debug ', 'debug')
    .option('-p, --publish ', 'publish')
    .parse(process.argv);

if (process.env.CHANLIST) {
    program.chanlist = process.env.CHANLIST
}
if (!program.connect)
    try {
        program.connect = 'http://localhost:6500/eb/';
    } catch (e) {
        _debug('error?')
        onerrorEventBus(e)
    }


function send(msg) {
    if (program.publish)
        eb.publish(program.channel, msg);
    else
        eb.send(program.channel, msg)
}

function onerrorEventBus(error) {
    console.error("Problem with event bus " + JSON.stringify(error))
}


var request = require('request');
_debug("connect: " + program.connect)
var ropts= {
  followRedirect: false
}

request.get(program.connect, ropts, function (error, response, body) {
    _debug("inital resp " + JSON.stringify(response,null,4))
    if (error) {
        console.log("error " + JSON.stringify(error))
        console.log(body);
        process.exit(-1)
    }
    _debug("status:" + response.statusCode)
    if (response.statusCode == 302  ) {
        program.connect = response.headers['location'];
        _debug("redirecting " + program.connect)
        response.statusCode = 299
    }
    runEBConn(program.connect);
})

function runEBConn(connect)
{
    _debug("enter runEBConn")
    eb = new EventBus(connect);

    eb.onopen = function () {
    _debug("eb open")
        if (!process.stdin.isTTY) {
            eb.onerror = onerrorEventBus;

            process.stdin.setEncoding(encoding);
            process.stdin.on('readable', function () {
                var dat = process.stdin.read();
                if (dat !== null)
                    send(dat)
            });

            process.stdin.on('end', function () {
                if (!program.listen)
                    process.exit(0)
            });
        }

        if (program.listen) {
            _debug("registering " + program.listen)
            eb.registerHandler(program.channel, function (e, mes) {
                if (e) console.error(e);
                else {
                    var m = mes.body;
                    console.log(JSON.stringify(m));
                }
            });
        }
    };



}
function _debug(msg){
  if (program.debug){
    console.log(msg)
  }
}
