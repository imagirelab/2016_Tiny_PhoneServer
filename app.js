var http = require('http');
//�T�[�o�C���X�^���X�쐬
var server = http.createServer();
var io = require('socket.io').listen(server);

server.listen(process.env.PORT);

var DemonData = {};

//�ڑ��m�����̏���
io.sockets.on('connection', function (socket)
{
    // ���̒��Ńf�[�^�̂������s��
    console.log('connected');

    //����ꂽ�f�[�����̃f�[�^���M
    socket.on("DemonPush", function (Type, Direction, Level, PlayerID)
    {
        var _id = PlayerID.message;
        var _Type = Type.message;
        var _Level = Level.message;
        var _Direction = Direction.message;

        console.log("DemonData: " + id);
        socket.broadcast.emit("DemonPush", _Type, _Direction, _Level, _id);
    });

});