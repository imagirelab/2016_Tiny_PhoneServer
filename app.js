var http = require('http');
//�T�[�o�C���X�^���X�쐬
var server = http.createServer(function(request, response) {
 
	var Response = {
		"200":function(file, filename){
			var extname = path.extname(filename);
			var header = {
				"Access-Control-Allow-Origin":"*",
				"Pragma": "no-cache",
				"Cache-Control" : "no-cache"	   
			}
 
			response.writeHead(200, header);
			response.write(file, "binary");
			response.end();
		},
		"404":function(){
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
		
		},
		"500":function(err){
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
		
		}
	}
 
  
	var uri = url.parse(request.url).pathname
	, filename = path.join(process.cwd(), uri);
 
	fs.exists(filename, function(exists){
		console.log(filename+" "+exists);
		if (!exists) { Response["404"](); return ; }
		if (fs.statSync(filename).isDirectory()) { filename += '/index.html'; }
 
		fs.readFile(filename, "binary", function(err, file){
		if (err) { Response["500"](err); return ; }
			Response["200"](file, filename);   
		}); 
 
	});
 
   
});

var io = require('socket.io').listen(server);

//���[�J���g�p��
//server.listen(5555);
//�O���[�o���g�p��
server.listen(process.env.PORT);

//var DemonData = {};
var PlayerID = 0;

//�ڑ��m�����̏���
io.sockets.on('connection', function (socket)
{
    // ���̒��Ńf�[�^�̂������s��
    console.log('connected');
    
    socket.on("EnterRobby", function()
    {
    	console.log(PlayerID);
    	socket.emit("PushPlayerID", {PlayerID : PlayerID});
    	++PlayerID;
    });

    //����ꂽ�f�[�����̃f�[�^���M
    socket.on("DemonPush", function (DemonData)
    {
        console.log('called');
        console.log('Data : ' + DemonData.Type);
        console.log('PlayerID : ' + DemonData.PlayerID);
        
        var PlayerIDstr = DemonData.PlayerID.toString();
        var Levelstr = DemonData.Level.toString();
        
        socket.broadcast.emit("DemonPushed", { Type: DemonData.Type, Direction: DemonData.Direction, Level: Levelstr, PlayerID: PlayerIDstr });
    });

});