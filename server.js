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
var rooms = {}

// socket handler
io.on('connection',function(socket){

    socket.on('newplayer',function(room){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400),
            color: {
                r: randomInt(120, 255),
                g: randomInt(90, 255),
                b: randomInt(90, 255)
            },
            type: "player_body"
        };
        
        // way to make rooms
        socket.join(room)
        socket.room = room

        if(!rooms.hasOwnProperty(room)) {
            rooms[room] = {
                playersMap: {},
                scores: {},
                names: {},
                squishies: [],
                gameGoing: false,
                selectedId: socket.player.id,
                catchSquishMode: true,
                startTime: 0,
                lastSquish: null
            }
        }

        rooms[room]['playersMap'][socket.player.id] = socket.player;
        rooms[room]['scores'][socket.player.id] = {capture: 0, survival: 0}
        rooms[room]['names'][socket.player.id] = socket.player.id;

        socket.emit('yourId', socket.player.id);
        socket.emit('allplayers', getAllPlayers(room));
        socket.emit('mode', rooms[room]['catchSquishMode']);
        io.to(room).emit('scores', rooms[room]['scores']);
        io.to(room).emit('names', rooms[room]['names'])

        // TODO depends on game mode
        if(rooms[room]['squishies'].length > 0) {
            socket.emit('catch', rooms[room]['squishies'][0])
        }
        socket.broadcast.to(socket.room).emit('newplayer', socket.player);

        socket.on('movement', function(direction) {
            io.to(socket.room).emit('movement', {id: socket.player.id, direction: direction})
        });

        socket.on('updateName', function(name) {
            rooms[socket.room]['names'][socket.player.id] = name;
            io.to(socket.room).emit('names', rooms[socket.room]['names'])
        });

        socket.on('playerMap', function(data) {
            var room = socket.room;
            if(rooms[room]['selectedId'] == data.id) {
                // socket.broadcast.emit('playerMap', data.players);
                for(var id in data.players) {
                    if(rooms[room]['playersMap'].hasOwnProperty(id)) {
                        rooms[room]['playersMap'][id].x = data.players[id].x
                        rooms[room]['playersMap'][id].y = data.players[id].y
                    }
                }
                socket.broadcast.to(socket.room).emit('allplayers', getAllPlayers(socket.room));
            }
            var players = getAllPlayers(room);
            var squishIndex = randomInt(0, players.length);
            rooms[room]['selectedId'] = players[squishIndex].id;
        })

        socket.on('disconnect',function(){
            io.to(socket.room).emit('remove', socket.player.id);
            delete io.sockets.connected[socket.id];
            delete rooms[socket.room]['playersMap'][socket.player.id]
            delete rooms[socket.room]['scores'][socket.player.id]
            delete rooms[socket.room]['names'][socket.player.id]

            io.to(socket.room).emit('scores', rooms[socket.room]['scores']);
            io.to(socket.room).emit('names', rooms[socket.room]['names'])

            // check if the squish disconnected
            var squishies = rooms[socket.room]['squishies'];
            var i = squishies.indexOf(socket.player.id);
            if(i != -1) {
                squishies.pop(i);
                if (squishies.length == 0) {
                    chooseSquish(socket.room)
                }
            }
        });
        socket.on('player_collision', function(data) {
            if(rooms[socket.room]['gameGoing'] && rooms[socket.room]['catchSquishMode'] && data.id == rooms[socket.room]['squishies'][0]) {
                rooms[socket.room]['scores'][socket.player.id]['capture'] += 1;
                // seconds survived gives you survival points minus 3 seconds startup
                rooms[socket.room]['scores'][data.id]['survival'] += Math.floor((Date.now()-rooms[room]['startTime'])/1000-3);
                io.to(socket.room).emit('caught', {winner: socket.player.id, scores: rooms[socket.room]['scores']});
                rooms[socket.room]['squishies'] = [];
                rooms[socket.room]['gameGoing'] = false;
                io.to(socket.room).emit('scores', rooms[socket.room]['scores']);
                chooseSquish(socket.room);
            }
        })
    });

    socket.on('start', function(blank){
        chooseSquish(socket.room)
    });
});

function chooseSquish(room) {
    var players = getAllPlayers(room);
    if(players.length == 0) {
        rooms[room]['gameGoing'] = false;
        return;
    }
    var squishIndex = randomInt(0, players.length);
    var squishId = players[squishIndex].id;

    if(rooms[room]['lastSquish'] == squishId) {
        return chooseSquish(room);
    }

    rooms[room]['lastSquish'] = squishId;
    var squishies = rooms[room]['squishies']
    squishies.push(squishId);

    if(rooms[room]['catchSquishMode']) {
        io.to(room).emit('catch', squishId);
    }
    rooms[room]['startTime'] = Date.now();
    setTimeout(function(){rooms[room]['gameGoing'] = true;}, 3000);
}

function getAllPlayers(room){
    var playersList = [];

    for(var id in rooms[room]['playersMap']) {
        playersList.push(rooms[room]['playersMap'][id]);
    }
    return playersList;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
