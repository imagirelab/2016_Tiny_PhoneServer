var http = require('http');
//�T�[�o�C���X�^���X�쐬
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

server.listen(process.env.PORT || 5555);//5555�ԃ|�[�g�ŋN��

//�v���C���[ID�Ǘ�
var PlayerID = 0;

//�ڑ��m�����̏���
io.sockets.on('connection', function (socket) {
    // ���̒��Ńf�[�^�̂������s��
    console.log('connected');

    //���r�[�ɓ��������̏���
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

    socket.on("StopStatRequest", function () {
        socket.broadcast.emit("PushStopRequest");
    });

    socket.on("StopEndRequest", function () {
        socket.broadcast.emit("PushStopEndRequest");
    });

    socket.on("GameEndRequest", function () {
        socket.broadcast.emit("PushGameEndRequest");
    });

    socket.on("MatchingEndRequest", function ()
    {
        socket.broadcast.emit("PushMatchingEnd");
    });

    //����ꂽ�K�E�Z���N�G�X�g�̃f�[�^���M
    socket.on("DeadlyPush", function (DeadlyData) {
        console.log("Deadly : " + DeadlyData.Deadly);
        console.log("PlayerID : " + DeadlyData.PlayerID);

        var Deadlystr = DeadlyData.Deadly.toString();
        var PlayerIDstr = DeadlyData.PlayerID.toString();

        //DeadlyData.Deadly�ɂ�"Fire"�������Ă��܂��BPlayerID�ɂ�string��0��1�������Ă��܂��B
        socket.broadcast.emit("DeadlyPushed", { Deadly: Deadlystr, PlayerID: PlayerIDstr });
    });

    //����ꂽ�f�[�����̃f�[�^���M
    socket.on("DemonPush", function (DemonData) {
        console.log('DemonPushed');
        console.log('Data : ' + DemonData.Type);
        console.log('Direction : ' + DemonData.Direction);
        console.log('Level : ' + DemonData.Level);
        console.log('PlayerID : ' + DemonData.PlayerID);

        var DemonTypestr = DemonData.Type.toString();
        var Directionstr = DemonData.Direction.toString();
        var PlayerIDstr = DemonData.PlayerID.toString();
        var Levelstr = DemonData.Level.toString();

        socket.broadcast.emit("DemonPushed", { Type: DemonTypestr, Direction: Directionstr, Level: Levelstr, PlayerID: PlayerIDstr });
    });

    //��������ꂽ���̃f�[�^���M
    socket.on("SpiritPush", function (SpiritData) {
        console.log("SpiritPushed");
        console.log('Type : ' + SpiritData.Type);
        console.log('PlayerID : ' + SpiritData.PlayerID);

        var Typestr = SpiritData.Type.toString();
        var PlayerIDstr = SpiritData.PlayerID.toString();

        socket.emit("SpiritPushed", { Type: Typestr, PlayerID: PlayerIDstr });
    });

});