/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

// Client.sendClick = function(x,y){
//   Client.socket.emit('click',{x:x,y:y});
// };

Client.socket.on('yourId',function(id){
    myId = id;
});

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
    sprite = Game.playerMap[data.id];
        game.physics.p2.enable(sprite);
        // sprite.body.setZeroDamping();
        sprite.body.fixedRotation = true; 
});

Client.socket.on('allplayers',function(data){

    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        sprite = Game.playerMap[data[i].id];
        game.physics.p2.enable(sprite);
        // sprite.body.setZeroDamping();
        sprite.body.fixedRotation = true;
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

