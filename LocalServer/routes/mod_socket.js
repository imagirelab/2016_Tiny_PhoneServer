var http = require('http');
//サーバインスタンス作成
var server = http.createServer(function (request, response) {

    var Response = {
        "200": function (file, filename) {
            var extname = path.extname(filename);
            var header = {
                "Access-Control-Allow-Origin": "*",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }

            response.writeHead(200, header);
            response.write(file, "binary");
            response.end();
        },
        "404": function () {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found\n");
            response.end();

        },
        "500": function (err) {
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.write(err + "\n");
            response.end();
        }
    }


    var uri = url.parse(request.url).pathname
	, filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        console.log(filename + " " + exists);
        if (!exists) { Response["404"](); return; }
        if (fs.statSync(filename).isDirectory()) { filename += '/index.html'; }

        fs.readFile(filename, "binary", function (err, file) {
            if (err) { Response["500"](err); return; }
            Response["200"](file, filename);
        });

    });


});
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 5555);//5555番ポートで起動

//プレイヤーID管理
var PlayerID = 0;

//秒間取得コスト
var secondPerCost = 25;

var PushCostFlag = true;

//接続確立時の処理
io.sockets.on('connection', function (socket) {
    // この中でデータのやり取りを行う
    console.log('connected');

    //ロビーに入った時の処理
    socket.on("EnterRobby", function () {
        console.log("PushPlayerID : " + PlayerID);

        var PlayerIDstr = PlayerID.toString();

        socket.emit("PushPlayerID", { PlayerID: PlayerIDstr });
        socket.broadcast.emit("PushRobbyID", { PlayerID: PlayerIDstr });

        if (PlayerID == 0) {
            PlayerID = 1;
        }
        else {
            PlayerID = 0;
        }
    });

    //ポーズ開始の送信
    socket.on("StopRequest", function () {
        PushCostFlag = false;
        socket.emit("PushStopRequest");
        socket.broadcast.emit("PushStopRequest");
        console.log("PushStop");
    });
    //ポーズ終了の送信
    socket.on("StopEndRequest", function () {
        PushCostFlag = true;
        socket.emit("PushStopEndRequest");
        socket.broadcast.emit("PushStopEndRequest");
        console.log("PushStopEnd");
    });

    //試合が終了したときに送る
    socket.on("GameEndRequest", function () {
        socket.emit("PushGameEndRequest");
        socket.broadcast.emit("PushGameEndRequest");
    });

    //リザルト終了を送信
    socket.on("PhoneFinalEnd", function () {
        socket.broadcast.emit("FinalEnd");
    });

    //一定間隔でコストを送信
    setInterval(function ()
    {
        if (PushCostFlag)
        {
            io.to(socket.id).emit("PushSecondCost", { Cost: secondPerCost });
        }
    }, 1500);

    //マッチング終了を送信
    socket.on("MatchingEndRequest", function ()
    {
        socket.broadcast.emit("PushMatchingEnd");
    });

    //送られた必殺技リクエストのデータ送信
    socket.on("DeadlyPush", function (DeadlyData) {
        console.log("Deadly : " + DeadlyData.Deadly);
        console.log("PlayerID : " + DeadlyData.PlayerID);

        var Deadlystr = DeadlyData.Deadly.toString();
        var PlayerIDstr = DeadlyData.PlayerID.toString();

        //DeadlyData.Deadlyには"Fire"が入っています。PlayerIDにはstringで0か1が入っています。
        socket.broadcast.emit("DeadlyPushed", { Deadly: Deadlystr, PlayerID: PlayerIDstr });
    });

    //送られたデーモンのデータ送信
    socket.on("DemonPush", function (DemonData) {
        var DemonTypestr = DemonData.Type.toString();
        var Directionstr = DemonData.Direction.toString();
        var PlayerIDstr = DemonData.PlayerID.toString();
        var Levelstr = DemonData.Level.toString();

        socket.broadcast.emit("DemonPushed", { Type: DemonTypestr, Direction: Directionstr, Level: Levelstr, PlayerID: PlayerIDstr });

        console.log('DemonPushed');
        console.log('Data : ' + DemonData.Type);
        console.log('Direction : ' + DemonData.Direction);
        console.log('Level : ' + DemonData.Level);
        console.log('PlayerID : ' + DemonData.PlayerID);
    });

    //魂が送られた時のデータ送信
    socket.on("SpiritPush", function (SpiritData) {
        var Typestr = SpiritData.Type.toString();
        var PlayerIDstr = SpiritData.PlayerID.toString();

        socket.broadcast.emit("SpiritPushed", { Type: Typestr, PlayerID: PlayerIDstr });
        socket.emit("SpiritPushed", { Type: Typestr, PlayerID: PlayerIDstr });

        console.log("SpiritPushed");
        console.log('Type : ' + SpiritData.Type);
        console.log('PlayerID : ' + SpiritData.PlayerID);
    });

    //コストの送信
    socket.on("AddCost", function (CostData) {
        var Coststr = CostData.Cost.toString();
        var PlayerIDstr = CostData.PlayerID.toString();

        socket.broadcast.emit("PushAddCost", { Cost: Coststr, PlayerID: PlayerIDstr });

        console.log("CostPushed");
        console.log('PushCost : ' + Coststr);
        console.log('PlayerID : ' + PlayerIDstr);
    });

});