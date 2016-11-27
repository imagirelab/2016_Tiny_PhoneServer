var http = require('http');
//サーバインスタンス作成
var server = http.createServer();
var io = require('socket.io').listen(server);

server.listen(process.env.PORT);

var DemonData = {};

//接続確立時の処理
io.sockets.on('connection', function (socket)
{
    // この中でデータのやり取りを行う
    console.log('connected');

    //送られたデーモンのデータ送信
    socket.on("DemonPush", function (Type, Direction, Level, PlayerID)
    {
        socket.broadcast.emit("DemonPush", Type, Direction, Level, PlayerID);
    });

});