var http = require('http');
//�T�[�o�C���X�^���X�쐬
var server = http.createServer();
var io = require('socket.io').listen(server);

server.listen(3000);//8888�ԃ|�[�g�ŋN��

//�ڑ��m�����̏���
io.sockets.on('connection', function (socket) {
    // ���̒��Ńf�[�^�̂������s��
    console.log('connected');
});