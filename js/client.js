var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.socket.on('yourId',function(id){
    myId = id;
});

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
    sprite = Game.playerMap[data.id];
    game.physics.p2.enable(sprite);
    sprite.body.fixedRotation = true; 
    sprite.body.onBeginContact.add(player_coll, this); 
    sprite.body.id = data.id
});

Client.socket.on('allplayers',function(data){

    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        sprite = Game.playerMap[data[i].id];
        game.physics.p2.enable(sprite);
        sprite.body.fixedRotation = true;
        sprite.body.onBeginContact.add(player_coll, this); 
        sprite.body.id = data[i].id;
    }

    // Client.socket.on('move',function(data){
    //     Game.movePlayer(data.id,data.x,data.y);
    // });
    Client.socket.on('movement',function(data){
        Game.nudgePlayer(data.id, data.direction);
    });

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });
});


