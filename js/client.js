var Client = {};
var gameMode = false;
var squishId = null;
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer', room);
};

Client.socket.on('yourId',function(id){
    myId = id;
    $('#myId').html(myId);
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
            game.camera.follow(sprite);
        }
    }

    Client.socket.on('movement',function(data){
        Game.nudgePlayer(data.id, data.direction);
    });

    Client.socket.on('catch', function(id) {
        $('#startButton').html('')
        if(gameMode) {
            // um the squish quit gg TODO
            $('#newSquish').remove();
            $('#warnings').append('<div class="alert alert-dark" role="alert" id="quitter">The squish quit!</div>');
            setTimeout(function() {
                $('#quitter').remove();
            }, 2000)
        }

        gameMode = true;
        if(id != myId) {
            setTimeout(function() {
                Game.changeToSquish(id);
                $('#warnings').append('<div class="alert alert-warning" role="alert" id="newSquish">' + id + ' is the squish!</div>');
                setTimeout(function() {
                    $('#newSquish').remove();
                }, 2000)
            }, 3000);
        } else {
            $('#warnings').append('<div class="alert alert-danger" role="alert" id="newSquish">You are the squish!</div>');
            Game.changeToSquish(id);
        }
        squishId = id;
    });

    Client.socket.on('caught', function(data) {
        Game.changeToOrange(squishId);
        id = data.winner;
        $('#newSquish').remove();
        $('#warnings').append('<div class="alert alert-primary" role="alert" id="caught">' + id + ' caught the squish!</div>');
        setTimeout(function() {
            $('#caught').remove();
        }, 2000)
        gameMode = false;
    });


    Client.socket.on('playerMap', function(playerMap) {
        Game.updatePlayers(playerMap);
    });

    Client.socket.on('scores', function(scores) {
        var s = '<table class="table table-sm"><thead class="thead-inverse"><tr><th>Id</th><th>Capture</th><th>Survival</th>';
        s += '</tr></thead><tbody>';
        for(var id in scores) {
            s += '<tr><td>' + id + '</td>';
            s += '<td>' + scores[id]['capture'] + '</td>';
            s += '<td>' + scores[id]['survival'] + '</td>';
            s += '</tr>'
        }
        s += '</tbody></table>';
        $('#scores').html(s);
    });



    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });
});

function start() {
    Client.socket.emit('start', {});
}