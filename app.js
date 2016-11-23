var http = require('http');
//サーバインスタンス作成
var server = http.createServer();
var io = require('socket.io').listen(server);

server.listen(3000);//8888番ポートで起動

//接続確立時の処理
io.sockets.on('connection', function (socket) {
    // この中でデータのやり取りを行う
    console.log('connected');
});