var http = require('http');
//サーバインスタンス作成
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

//ローカル使用時
//server.listen(5555);
//グローバル使用時
server.listen(process.env.PORT || 5555);

//var DemonData = {};
var PlayerID = 0;

//接続確立時の処理
io.sockets.on('connection', function (socket)
{
    // この中でデータのやり取りを行う
    console.log('connected');
    
    socket.on("EnterRobby", function()
    {
        console.log("PushPlayerID : " + PlayerID);

        socket.emit("PushPlayerID", { PlayerID: PlayerID });

    	if(PlayerID == 0)
    	{
    	    PlayerID = 1;
    	}
    	else
    	{
    	    PlayerID = 0;
    	}
    });

    socket.on("DeadlyPush", function (DeadlyData)
    {
        console.log("DeadlyFire");
        console.log("PlayerID : " + DeadlyData.PlayerID);

        var PlayerIDstr = DeadlyData.PlayerID.toString();

        //DeadlyData.Deadlyには"Fire"が入っています。PlayerIDにはstringで0か1が入っています。
        socket.broadcast.emit("DeadlyPushed", {Deadly: DeadlyData.Deadly, PlayerID: PlayerIDstr});
    });

    //送られたデーモンのデータ送信
    socket.on("DemonPush", function (DemonData)
    {
        console.log('DemonPushed');
        console.log('Data : ' + DemonData.Type);
        console.log('Direction : ' + DemonData.Direction);
        console.log('Level : ' + DemonData.Level);
        console.log('PlayerID : ' + DemonData.PlayerID);
        
        var PlayerIDstr = DemonData.PlayerID.toString();
        var Levelstr = DemonData.Level.toString();
        
        socket.broadcast.emit("DemonPushed", { Type: DemonData.Type, Direction: DemonData.Direction, Level: Levelstr, PlayerID: PlayerIDstr });
    });

});