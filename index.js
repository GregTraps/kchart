/**
 * Created by greg on 17-7-21.
 */
//通过require将http库包含到程序中
var http = require('http');
//引入url模块解析url字符串
var url = require('url');
//创建新的HTTP服务器
var server = http.createServer();

// var app = require('express');
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
var kdata = {
    btc : {
        '1min' : [],
        '5min' : [],
        '15min' : [],
        '30min' : [],
        '60min' : [],
        '1day' : [],
        '1week' : [],
        '1mon' : [],
        '1year' : []
    },
    eth : {
        '1min' : [],
        '5min' : [],
        '15min' : [],
        '30min' : [],
        '60min' : [],
        '1day' : [],
        '1week' : [],
        '1mon' : [],
        '1year' : []
    }
};
var wsTick = {};
var tickHelper = {
    'btccny':{
        '1min' : 'ok_sub_spot_btc_kline_1min',
        '5min' : 'ok_sub_spot_btc_kline_5min',
        '15min' : 'ok_sub_spot_btc_kline_15min',
        '30min' : 'ok_sub_spot_btc_kline_30min',
        '60min' : 'ok_sub_spot_btc_kline_1hour',
        '1day' : 'ok_sub_spot_btc_kline_1day',
        '1week' : 'ok_sub_spot_btc_kline_1week',
        '1mon' : 'ok_sub_spot_btc_kline_1mon',
        '1year' : 'ok_sub_spot_btc_kline_1year'
    },
    'ethcny':{
        '1min' : 'ok_sub_spot_eth_kline_1min',
        '5min' : 'ok_sub_spot_eth_kline_5min',
        '15min' : 'ok_sub_spot_eth_kline_15min',
        '30min' : 'ok_sub_spot_eth_kline_30min',
        '60min' : 'ok_sub_spot_eth_kline_1hour',
        '1day' : 'ok_sub_spot_eth_kline_1day',
        '1week' : 'ok_sub_spot_eth_kline_1week',
        '1mon' : 'ok_sub_spot_eth_kline_1mon',
        '1year' : 'ok_sub_spot_eth_kline_1year'
    }
};

var huobiHelper = {
    'market.btccny.kline.1min' : {
        'symbol':'btccny',
        'period':'1min'
    },
    'market.btccny.kline.5min' : {
        'symbol':'btccny',
        'period':'5min'
    },
    'market.btccny.kline.15min' : {
        'symbol':'btccny',
        'period':'15min'
    },
    'market.btccny.kline.30min' : {
        'symbol':'btccny',
        'period':'30min'
    },
    'market.btccny.kline.60min' : {
        'symbol':'btccny',
        'period':'60min'
    },
    'market.btccny.kline.1day' : {
        'symbol':'btccny',
        'period':'1day'
    },
    'market.btccny.kline.1mon' : {
        'symbol':'btccny',
        'period':'1mon'
    },
    'market.btccny.kline.1week' : {
        'symbol':'btccny',
        'period':'1week'
    },
    'market.btccny.kline.1year' : {
        'symbol':'btccny',
        'period':'1year'
    },
    'market.ethcny.kline.1min' : {
        'symbol':'ethcny',
        'period':'1min'
    },
    'market.ethcny.kline.5min' : {
        'symbol':'ethcny',
        'period':'5min'
    },
    'market.ethcny.kline.15min' : {
        'symbol':'ethcny',
        'period':'15min'
    },
    'market.ethcny.kline.30min' : {
        'symbol':'ethcny',
        'period':'30min'
    },
    'market.ethcny.kline.60min' : {
        'symbol':'ethcny',
        'period':'60min'
    },
    'market.ethcny.kline.1day' : {
        'symbol':'ethcny',
        'period':'1day'
    },
    'market.ethcny.kline.1mon' : {
        'symbol':'ethcny',
        'period':'1mon'
    },
    'market.ethcny.kline.1week' : {
        'symbol':'ethcny',
        'period':'1week'
    },
    'market.ethcny.kline.1year' : {
        'symbol':'ethcny',
        'period':'1year'
    }
};
var wsPush = {};



//websocket请求火币
const WebSocket = require('ws');
//gzip
var pako = require('pako');
// var symbol = 'ethcny';// btccny
const socketEth = new WebSocket('wss://be.huobi.com/ws'); //如果symbol = 'btccny'或者'ltccny' 请使用wss://api.huobi.com/ws ,eth  wss://be.huobi.com/ws
const socketBtc = new WebSocket('wss://api.huobi.com/ws'); //如果symbol = 'btccny'或者'ltccny' 请使用wss://api.huobi.com/ws ,eth  wss://be.huobi.com/ws

socketEth.binaryType = 'arraybuffer';
socketBtc.binaryType = 'arraybuffer';
socketEth.onopen = function (event) {
    console.log('WebSocket ETH connect at time: ' + new Date());
    //1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
    for (var channel in huobiHelper) {
        if (huobiHelper[channel].symbol === 'ethcny') {
            socketEth.send(JSON.stringify({'sub': channel,'id': huobiHelper[channel].period+' ' + new Date()}));
        }
    }
};
socketBtc.onopen = function (event) {
    console.log('WebSocket BTC connect at time: ' + new Date());
    //1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
    for (var channel in huobiHelper) {
        if (huobiHelper[channel].symbol === 'btccny') {
            socketBtc.send(JSON.stringify({'sub': channel,'id': huobiHelper[channel].period+' ' + new Date()}));
            // console.log({'sub': channel,'id': huobiHelper[channel].period});
        }
    }
    // socketBtc.send(JSON.stringify({'sub': 'market.btccny.kline.1min','id': '1min ' + new Date()}));
};
socketEth.onmessage = function keepEth(event) {
    var raw_data = event.data;
    var json = pako.inflate(new Uint8Array(raw_data), {to: 'string'});
    var data = JSON.parse(json);
    // console.log('WebSocket receive message at time: ' + new Date());
    // console.log(data);

    /* deal with server heartbeat */
    if (data['ping']) {
        // console.log('WebSocket receive ping and return pong at time: ' + new Date());
        socketEth.send(JSON.stringify({'pong': data['ping']}));
    }else if (!!data.ch){

        // data如下
        //    { ch: 'market.ethcny.kline.15min',
        //     ts: 1501749973778,
        //     tick:
        //     { amount: 189.3413,
        //         open: 1506.3,
        //         close: 1506,
        //         high: 1507,
        //         id: 1501749900,
        //         count: 14,
        //         low: 1506,
        //         vol: 285155.58574 } }

        if (!huobiHelper[data.ch]) return;
        var symbol = huobiHelper[data.ch].symbol;
        var period = huobiHelper[data.ch].period;
        var tick = [];
        //数据格式[毫秒数，开，高，低，收，量]
        tick.push(parseInt(data.tick.id.toString()));
        tick.push(data.tick.amount,data.tick.open,data.tick.high,data.tick.low,data.tick.close);
        // console.log('save data, channel:'+tickHelper[[symbol][period]]+' tick : '+tick);
        //整理并储存来自火币的更新数据
        var pushChannelName = tickHelper[symbol][period];
        wsTick[pushChannelName] = tick;
        console.log('save BTC data tick,'+tick);
        //对应频道广播
        if (wsPush.hasOwnProperty(pushChannelName)&&wsPush[pushChannelName].length !== 0){   //广播列表
            console.log('广播Eth,channel:'+pushChannelName);
            for (var i=0;i<wsPush[pushChannelName].length;i++) {
                console.log('i='+i);
                var client = wsPush[pushChannelName][i];
                if (client.readyState === 1) {
                    // if client.isBinary 判断加密
                    client.send(JSON.stringify({
                        'data': tick,
                        'channel': pushChannelName
                    }));
                    console.log('send Eth data:'+JSON.stringify({
                            'data': tick,
                            'channel': pushChannelName
                        }));
                }else{
                    wsPush[pushChannelName].splice(i,1);
                }
            }
        }
    }

    };
socketBtc.onmessage = function keepBtc(event) {
    var raw_data = event.data;
    var json = pako.inflate(new Uint8Array(raw_data), {to: 'string'});
    var data = JSON.parse(json);
    // console.log('WebSocket receive message at time: ' + new Date());
    // console.log(data);

    /* deal with server heartbeat */
    if (data['ping']) {
        // console.log('WebSocket receive ping and return pong at time: ' + new Date());
        socketBtc.send(JSON.stringify({'pong': data['ping']}));
    }else if (!!data.ch){

        // data如下
        //    { ch: 'market.ethcny.kline.15min',
        //     ts: 1501749973778,
        //     tick:
        //     { amount: 189.3413,
        //         open: 1506.3,
        //         close: 1506,
        //         high: 1507,
        //         id: 1501749900,
        //         count: 14,
        //         low: 1506,
        //         vol: 285155.58574 } }

        if (!huobiHelper[data.ch]) return;
        var symbol = huobiHelper[data.ch].symbol;
        var period = huobiHelper[data.ch].period;
        var tick = [];
        //数据格式[毫秒数，开，高，低，收，量]
        tick.push(parseInt(data.tick.id.toString()));
        tick.push(data.tick.amount,data.tick.open,data.tick.high,data.tick.low,data.tick.close);
        // console.log('save data, channel:'+tickHelper[[symbol][period]]+' tick : '+tick);
        //整理并储存来自火币的更新数据
        var pushChannelName = tickHelper[symbol][period];
        wsTick[pushChannelName] = tick;
        // console.log('save BTC data tick,'+tick);
        //对应频道广播
        if (wsPush.hasOwnProperty(pushChannelName)&&wsPush[pushChannelName].length !== 0){   //广播列表
            console.log('广播BTC,channel:'+pushChannelName);
            for (var i=0;i<wsPush[pushChannelName].length;i++) {
                console.log('i='+i);
                var client = wsPush[pushChannelName][i];
                if (client.readyState === 1) {
                    // if client.isBinary 判断加密
                    client.send(JSON.stringify({
                        'data': tick,
                        'channel': pushChannelName
                    }));
                    console.log('send BTC data:'+JSON.stringify({
                            'data': tick,
                            'channel': pushChannelName
                        }));
                }else{
                    wsPush[pushChannelName].splice(i,1);
                }
            }
        }
    }

};




socketEth.onclose = function(event) {
    console.log('WebSocket ETH close at time: ' + new Date());
};
socketBtc.onclose = function(event) {
    console.log('WebSocket BTC close at time: ' + new Date());
};


const wss = new WebSocket.Server({ port: 3300 });


wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('message', function keeping(message) {
        var data = eval('(' + message + ')');
        // console.log('received client req:'+JSON.stringify(data));
        //data like : {"event":"addChannel","channel":"ok_sub_spot_btc_ticker","binary":0}
        if (data.hasOwnProperty('event')) {
            this.isAlive = true;
            if (data.event === 'ping') {
                ws.send(JSON.stringify({'event': 'pong'}));
            } else if (data.event === 'addChannel') {
                // [{"data":{"result":true,"channel":"ok_sub_spot_btc_kline_1min"},"channel":"addChannel"}]
                ws.isBinary = data.hasOwnProperty('isBinary') ? data.isBinary : false;
                if (data.hasOwnProperty('channel')) {
                    if (!wsPush.hasOwnProperty(data.channel)) {
                        wsPush[data.channel] = [];
                    }
                    wsPush[data.channel].push(ws);
                }
                ws.send(JSON.stringify([{"data": {"result": true, "channel": data.channel}, "channel": "addChannel"}]));
            } else if (data.event === 'removeChannel') {
                if (data.hasOwnProperty('channel')) {
                    if (wsPush.hasOwnProperty(data.channel)) {
                        for (var i = 0; i < wsPush[data.channel].length; i++) {
                            if (wsPush[data.channel][i] === ws) {
                                wsPush[data.channel].splice(i, 1);
                                console.log('remove channel successed : channel:' + data.channel);
                            }
                        }
                        ws.send(JSON.stringify([{
                            "data": {"result": true, "channel": data.channel},
                            "channel": "removeChannel"
                        }]));
                    }
                }
            }
        }
    });
});

//关闭失效ws客户端
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false){
            console.log('closed a client');
            return ws.terminate();
        }
        ws.isAlive = false;
        console.log('marked WSserver.client isAlive false');
        // ws.ping('', false, true);
    });
}, 20000);




//获取分时图data
//ETH period参数
// 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
function upKlineData(period) {
    //period 按照ETH period参数标准
//ETH period参数
// 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
// btc period 参数	说明
        //     001	1分钟线
        //     005	5分钟
        //     015	15分钟
        //     030	30分钟
        //     060	60分钟
        //     100	日线
        //     200	周线
        //     300	月线
        //     400	年线
    var btcPeriod = '';
    switch (period) {
        case '1min' :
            btcPeriod = '001';
            break;
        case '5min' :
            btcPeriod = '005';
            break;
        case '15min' :
            btcPeriod = '015';
            break;
        case '30min' :
            btcPeriod = '030';
            break;
        case '60min' :
            btcPeriod = '060';
            break;
        case '1day' :
            btcPeriod = '100';
            break;
        case '1week' :
            btcPeriod = '200';
            break;
        case '1mon' :
            btcPeriod = '300';
            break;
        case '1year' :
            btcPeriod = '400';
            break;
        default:
            console.log('更新数据period参数传入错误');
            return false;
    }

    var getBTCOptions = {
        host: 'api.huobi.com',
        // port: 8080,
        path: '/staticmarket/btc_kline_'+btcPeriod+'_json.js',
        method: 'GET',
        headers:{
            "Content-Type": 'application/javascript'
            // "Content-Length": data.length
        }
    };
//eth
    var getETHOptions = {
        host: 'be.huobi.com',
        // port: 8080,
        path: '/market/history/kline?symbol=ethcny&period='+period+'&size=300',
        method: 'GET',
        headers:{
            "Content-Type": 'application/json'
        }
    };

//发送请求
    var reqBtc = http.request(getBTCOptions,function(res){
        res.setEncoding('utf8');
        // var buffers = [];
        var chunks = '';
        res.on('data',function(chunk){
            // var returnData = JSON.parse(chunk);//如果服务器传来的是json字符串，可以将字符串转换成json
            chunks += chunk;
            // buffers.push(chunk);
        });
        res.on('end', function(){
            // var buf= Buffer.concat(buffers);
            var dataArr = JSON.parse(chunks);
            for (var i=0;i<dataArr.length;i++) {
                var str = dataArr[i][0];
                var yyyy = parseInt(str.substr(0,4));
                var mth = parseInt(str.substr(4,2))-1;
                var dd = parseInt(str.substr(6,2));
                var hh = parseInt(str.substr(8,2));
                var mm = parseInt(str.substr(10,2));
                var ss = parseInt(str.substr(12,2));
                var ssTime = new Date(yyyy,mth,dd,hh,mm,ss);
                dataArr[i][0] = ssTime.getTime();
            }
            kdata.btc[period] = dataArr;
        })
    });
    //如果有错误会输出错误
    reqBtc.on('error', function(e){
        console.log('错误：' + e.message);
    });
    reqBtc.end();

    var reqEth = http.request(getETHOptions,function(res){
        res.setEncoding('utf8');
        // var buffers = [];
        var chunks = '';
        res.on('data',function(chunk){
            // var returnData = JSON.parse(chunk);//如果服务器传来的是json字符串，可以将字符串转换成json
            chunks += chunk;
            // buffers.push(chunk);
        });
        res.on('end', function(){
            // var buf= Buffer.concat(buffers);
            //eth 返回数据格式
            //{ id: 1498924800,
            // open: 1971,
            //     close: 1722,
            //     low: 1616,
            //     high: 2050,
            //     amount: 790448.5003,
            //     count: 347144,
            //     vol: 1474914696.451631 }
            var dataArr = JSON.parse(chunks).data;
            var buffArr = [];
            for (var i=0;i < dataArr.length;i++) {
                var arr = dataArr[i];
                //数据格式[毫秒数，开，高，低，收，量]
                buffArr[i]=[];
                buffArr[i].push(parseInt(arr.id+'000'),arr.open,arr.high,arr.low,arr.close,arr.amount);
            }
            kdata.eth[period] = buffArr;
        })
    });
    reqEth.on('error', function(e){
        console.log('错误：' + e.message);
    });
    reqEth.end();
}
var periodArr = ['1min', '5min', '15min', '30min', '60min', '1day', '1mon', '1week', '1year'];
function upAllKlineData(periodArr) {
    for (var i=0;i < periodArr.length;i++) {
        upKlineData(periodArr[i]);
    }
}

upAllKlineData(periodArr);
setInterval(upKlineData,1000*60,'1min');
setInterval(upKlineData,1000*60*5,'5min');
setInterval(upKlineData,1000*60*15,'15min');
setInterval(upKlineData,1000*60*30,'30min');
setInterval(upKlineData,1000*60*60,'60min');
setInterval(upAllKlineData,1000*60*60*24,['1day', '1mon', '1week', '1year']);

//jsonp
//通过request事件来响应request请求
server.on('request',function(req, res){
    var urlPath = url.parse(req.url,true);

    //如果urlPath为'jsonp'，就认定该请求为携带jsonp方法的http请求
    //客户端请求格式
    //https://www.okcoin.cn/api/klineData.do?marketFrom=36&type=4&limit=1000&coinVol=0
    if(urlPath.pathname === '/test/klineData'){
        //调试
        // console.log(urlPath);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        var resType = urlPath.query.type || false;
        var resData;
        //client　请求参数　btc marketFrom 0 eth marketFrom 36
        // type 0 对应1min |  1/5min  |  2/15min  |  9/30min  |  10/60min  |  13/六小时  | 　3/1day  |  4/1week

        if (resType && urlPath.query.marketFrom === '0') {
            //btc
            switch (resType) {
                case '0' :
                    resData = kdata.btc['1min'];
                    break;
                case '1' :
                    resData = kdata.btc['5min'];
                    break;
                case '2' :
                    resData = kdata.btc['15min'];
                    break;
                case '9' :
                    resData = kdata.btc['30min'];
                    break;
                case '10' :
                    resData = kdata.btc['60min'];
                    break;
                case '3' :
                    resData = kdata.btc['1day'];
                    break;
                case '4' :
                    resData = kdata.btc['1week'];
                    break;
                default :
                    console.log('解析请求时未查询到对应分时period');
            }
        }else if (resType && urlPath.query.marketFrom === '3') {
            //eth
            switch (resType) {
                case '0' :
                    resData = kdata.eth['1min'];
                    break;
                case '1' :
                    resData = kdata.eth['5min'];
                    break;
                case '2' :
                    resData = kdata.eth['15min'];
                    break;
                case '9' :
                    resData = kdata.eth['30min'];
                    break;
                case '10' :
                    resData = kdata.eth['60min'];
                    break;
                case '3' :
                    resData = kdata.eth['1day'];
                    break;
                case '4' :
                    resData = kdata.eth['1week'];
                    break;
                default :
                    console.log('解析请求时未查询到对应分时period');
            }
        }else {
            resData = {
                type : 'errors'
            };
            console.log('解析请求时未查询到对应市场marketFrom，');
        }

        resData = JSON.stringify(resData);
        //假设我们定义的回调函数名为test
        // var callback = 'test'+'('+data+');';
        res.end(resData);
    }
    else{
        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
        res.end('Hell World\n');
    }
});
//监听8080端口
server.listen('3200');
//用于提示我们服务器启动成功

console.log('Server running!');
