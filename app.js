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
        socket.broadcast.emit("DemonPush", Type, Direction, Level, PlayerID);
    });

});