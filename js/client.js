var Client = {};
var gameMode = false;
var squishId = null;
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.socket.on('yourId',function(id){
    myId = id;
    console.log("I am " + myId)
});

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
    sprite = Game.playerMap[data.id];
    game.physics.p2.enable(sprite);
    sprite.body.fixedRotation = true; 
    sprite.body.onBeginContact.add(player_coll, this); 
    sprite.body.data.derp = data.id
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        sprite = Game.playerMap[data[i].id];
        game.physics.p2.enable(sprite);
        sprite.body.fixedRotation = true;
        sprite.body.data.derp = data[i].id;

        if(data[i].id == myId) {
            sprite.body.onBeginContact.add(player_coll, this); 
        }
    }

    Client.socket.on('movement',function(data){
        Game.nudgePlayer(data.id, data.direction);
    });

    Client.socket.on('catch', function(id) {
        
        if(gameMode) {
            // um the squish quit gg TODO
            console.log('The squish quit :\'(')
        }

        gameMode = true;
        if(id != myId) {
            setTimeout(function() {
                Game.changeToSquish(id);
                console.log(id + ' is the squish!');
            }, 3000);
        } else {
            console.log(id + ' is the squish!')
            Game.changeToSquish(id);
        }
        squishId = id;
    });

    Client.socket.on('caught', function(data) {
        Game.changeToOrange(squishId);
        id = data.winner;
        console.log(id + ' caught the squish!');
        gameMode = false;
    });


    Client.socket.on('playerMap', function(playerMap) {
        Game.updatePlayers(playerMap);
    });



    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });
});

function start() {
    Client.socket.emit('start', {});
}