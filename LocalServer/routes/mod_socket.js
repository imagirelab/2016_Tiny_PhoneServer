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

//�b�Ԏ擾�R�X�g
var secondPerCost = 25;

var PushCostFlag = true;

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

    //�|�[�Y�J�n�̑��M
    socket.on("StopRequest", function () {
        PushCostFlag = false;
        socket.emit("PushStopRequest");
        socket.broadcast.emit("PushStopRequest");
        console.log("PushStop");
    });
    //�|�[�Y�I���̑��M
    socket.on("StopEndRequest", function () {
        PushCostFlag = true;
        socket.emit("PushStopEndRequest");
        socket.broadcast.emit("PushStopEndRequest");
        console.log("PushStopEnd");
    });

    //�������I�������Ƃ��ɑ���
    socket.on("GameEndRequest", function () {
        socket.emit("PushGameEndRequest");
        socket.broadcast.emit("PushGameEndRequest");
    });

    //���U���g�I���𑗐M
    socket.on("PhoneFinalEnd", function () {
        socket.broadcast.emit("FinalEnd");
    });

    //���Ԋu�ŃR�X�g�𑗐M
    setInterval(function ()
    {
        if (PushCostFlag)
        {
            io.to(socket.id).emit("PushSecondCost", { Cost: secondPerCost });
        }
    }, 1500);

    //�}�b�`���O�I���𑗐M
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

    //��������ꂽ���̃f�[�^���M
    socket.on("SpiritPush", function (SpiritData) {
        var Typestr = SpiritData.Type.toString();
        var PlayerIDstr = SpiritData.PlayerID.toString();

        socket.broadcast.emit("SpiritPushed", { Type: Typestr, PlayerID: PlayerIDstr });
        socket.emit("SpiritPushed", { Type: Typestr, PlayerID: PlayerIDstr });

        console.log("SpiritPushed");
        console.log('Type : ' + SpiritData.Type);
        console.log('PlayerID : ' + SpiritData.PlayerID);
    });

    //�R�X�g�̑��M
    socket.on("AddCost", function (CostData) {
        var Coststr = CostData.Cost.toString();
        var PlayerIDstr = CostData.PlayerID.toString();

        socket.broadcast.emit("PushAddCost", { Cost: Coststr, PlayerID: PlayerIDstr });

        console.log("CostPushed");
        console.log('PushCost : ' + Coststr);
        console.log('PlayerID : ' + PlayerIDstr);
    });

});