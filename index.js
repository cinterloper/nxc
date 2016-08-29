var EventBus = require('vertx3-eventbus-client');
var program = require('commander');
var encoding = 'utf-8';
var data;

program
	.version('0.0.1')
	.option('-c, --connect <value>',	'connect to host:port')
	.option('-n, --channel <value>',	'connect channel name')
	.option('-l, --listen ', 		'listen')
	.option('-p, --publish ', 		'publish')
	.parse(process.argv);



if(process.env.CHANLIST)
{
  program.chanlist=process.env.CHANLIST
}
if(!program.connect)
  program.connect='http://localhost:6500/eb/';


data = '';


var eb = new EventBus(program.connect);
function send(msg){
  if(program.publish)
    eb.publish(program.channel,msg);
  else
    eb.send(program.channel,msg)
}








eb.onopen=function(){
  if(!process.stdin.isTTY) {

  process.stdin.setEncoding(encoding);
  process.stdin.on('readable', function() {
    var dat = process.stdin.read()
    if( dat !== null )
      send(dat)
  });

  process.stdin.on('end', function () {
    if (!program.listen)
      process.exit(0)
  });
}


  if(program.listen){
    eb.registerHandler(program.channel, function (e, mes) {

        if (e) console.error(e);
        else {

            var m = mes.body;

            console.log(m);

        }

    });
  }
};

function onerrorEventBus(error) {
    console.error("Problem with event bus " + JSON.stringify(error))
}

eb.onerror = onerrorEventBus;

