var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/img',express.static(__dirname + '/img'));
app.use('/vendor',express.static(__dirname + '/vendor'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

app.get('/classic',function(req,res){
    console.log(__dirname);
    res.sendFile(__dirname+'/play.html');
});

app.get('/spring',function(req,res){
    res.sendFile(__dirname+'/play.html');
});

app.get('/summer',function(req,res){
    res.sendFile(__dirname+'/play.html');
});

app.get('/winter',function(req,res){
    res.sendFile(__dirname+'/play.html');
});
server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

// game variables
var catchSquishMode = true;
var squishies = [];
var playersMap = {};
var scores = {};
var gameGoing = false;
var startTime;
var selectedId = 0;

// socket handler
io.on('connection',function(socket){

    socket.on('newplayer',function(room){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400),
            type: "player_body"
        };
        
        // way to make rooms
        socket.join(room)
        socket.room = room
        playersMap[socket.player.id] = socket.player;
        scores[socket.player.id] = {capture: 0, survival: 0}
        socket.emit('yourId', socket.player.id);
        socket.emit('allplayers',getAllPlayers());

        // TODO depends on game mode
        if(squishies.length > 0)
            socket.emit('catch', squishies[0])
        socket.broadcast.to(socket.room).emit('newplayer', socket.player);

        socket.on('movement', function(direction) {
            io.to(socket.room).emit('movement', {id: socket.player.id, direction: direction})
        })

        socket.on('playerMap', function(data) {
            if(selectedId == data.id) {
                // socket.broadcast.emit('playerMap', data.players);
                for(var id in data.players) {
                    if(playersMap.hasOwnProperty(id)) {
                        playersMap[id].x = data.players[id].x
                        playersMap[id].y = data.players[id].y
                    }
                }
            }
            var players = getAllPlayers();
            var squishIndex = randomInt(0, players.length);
            selectedId = players[squishIndex].id;
        })

        socket.on('disconnect',function(){
            io.to(socket.room).emit('remove', socket.player.id);
            delete io.sockets.connected[socket.id];
            delete playersMap[socket.player.id]

            // check if the squish disconnected
            var i = squishies.indexOf(socket.player.id);
            if(i != -1) {
                squishies.pop(i);
                if (squishies.length == 0) {
                    chooseSquish()
                }
            }
        });
        socket.on('player_collision', function(data) {
            if(gameGoing && catchSquishMode && data.id == squishies[0]) {
                scores[socket.player.id]['capture'] += 1;
                // seconds survived gives you survival points
                scores[data.id]['survival'] += Math.floor((Date.now()-startTime)/1000);
                io.to(socket.room).emit('caught', {winner: socket.player.id, scores: scores});
                squishies = [];
                gameGoing = false;
                chooseSquish();
            }
        })
    });

    socket.on('start', function(blank){
        chooseSquish()
    });
});

function chooseSquish() {
    var players = getAllPlayers();
    if(players.length == 0) {
        return;
    }
    var squishIndex = randomInt(0, players.length);
    var squishId = players[squishIndex].id;
    squishies.push(squishId);

    if(catchSquishMode) {
        io.emit('catch', squishId);
    }
    startTime = Date.now();
    setTimeout(function(){gameGoing = true;}, 3000);
}

function getAllPlayers(){
    var playersList = [];

    for(var id in playersMap) {
        playersList.push(playersMap[id]);
    }
    return playersList;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
