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
    socket.on("DemonPush", function (DemonData)
    {
        console.log('called');
        console.log('Data : ' + DemonData.Type);
        socket.broadcast.emit("DemonPushed", { Type: DemonData.Type, Direction: DemonData.Direction, Level: DemonData.Level, PlayerID: DemonData.PlayerID })
    });

});