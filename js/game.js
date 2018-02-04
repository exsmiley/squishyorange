var myId = null;
var frameCount = 0;
var positionCount = 0;
var Game = {};

Game.moving = [];

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    // game.load.image('sprite','assets/sprites/sprite.png');
    game.load.image('orange','assets/sprites/orange.png');
    game.load.image('squishy','assets/sprites/squishy.png');
    game.load.image('hmm','assets/map/source.gif');
    game.load.image('spring','assets/map/spring.png');
    game.load.image('summer','assets/map/summer.png');
    game.load.image('winter','assets/map/winter.png');
    game.load.spritesheet('snow', 'assets/sprites/snow.png', 1400, 1400, 22);
    game.load.spritesheet('rain', 'assets/sprites/rain.png', 1400, 720, 8);
    game.load.spritesheet('tumble', 'assets/sprites/tumble.png', 1400, 200, 11);
      
};

Game.create = function(){
    Game.playerMap = {};
    game.physics.startSystem(Phaser.Physics.P2JS);
    var hmm = game.add.image(0, 0, 'winter');
    hmm.scale.setTo(1,1);
    cursors = game.input.keyboard.createCursorKeys();
    // var tumble = game.add.image(0,0,'tumble');
    // var action = tumble.animations.add('tumbling');
    // tumble.animations.play('tumbling', 5, true);
    // var rain = game.add.image(0,0,'rain');
    // var action = rain.animations.add('raining');
    // rain.animations.play('raining', 20, true);
    // var snow = game.add.image(0,0,'snow')
    // var action = snow.animations.add('snowing');
    // snow.animations.play('snowing', 10, true);

    Client.askNewPlayer();
    
};

Game.update = function(){
    frameCount += 1;
    positionCount += 1;

    if(positionCount > 50) {
        var data = {};

        for(var id in Game.playerMap) {
            data[id] = {x: Game.playerMap[id]['position']['x'], y: Game.playerMap[id]['position']['y']}
        }
        Client.socket.emit('playerMap', {players: data, id: myId});
        positionCount = 0;
    }

    if(myId == null || !Game.playerMap[myId] || frameCount < 3) {
        return;
    }

    var sprite = Game.playerMap[myId];

    // sprite.body.setZeroVelocity();
    
    var velocity = 400;
    var moved = false;

    if (cursors.left.isDown)
    {
        Client.socket.emit('movement', 'left')
        // sprite.body.moveLeft(velocity);
        moved = true;
    }
    else if (cursors.right.isDown)
    {
        Client.socket.emit('movement', 'right')
        // sprite.body.moveRight(velocity);
        moved = true;
    }

    if (cursors.up.isDown)
    {
        Client.socket.emit('movement', 'up')
        // sprite.body.moveUp(velocity);
        moved = true;
    }
    else if (cursors.down.isDown)
    {
        Client.socket.emit('movement', 'down')
        // sprite.body.moveDown(velocity);
        moved = true;
    }


    if(!moved) {
        Client.socket.emit('movement', 'none')
    }

    frameCount = 0;
}

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'orange');
    Game.playerMap[id].scale.setTo(0.5,0.5)
    // Game.playerMap[id].body.type = "player_body"
};

Game.changeToOrange = function(id) {
    Game.playerMap[id].loadTexture('orange', 0);
}

Game.changeToSquish = function(id) {
    Game.playerMap[id].loadTexture('squishy', 0);
}

Game.nudgePlayer = function(id, direction){
    // console.log()
    var sprite = Game.playerMap[id];

    // TODO figure out diagonal movement in the future...
    sprite.body.setZeroVelocity();
    var velocity = 400;

    if (direction == 'left')
    {
        sprite.body.moveLeft(velocity);
    }
    else if (direction == 'right')
    {
        sprite.body.moveRight(velocity);
    }

    if (direction == 'up')
    {
        sprite.body.moveUp(velocity);
    }
    else if (direction == 'down')
    {
        sprite.body.moveDown(velocity);
    }

    if (direction == 'none')
    {
        sprite.body.setZeroVelocity();
    }
};

Game.updatePlayers = function(playerMap) {
    // console.log('i got here' + JSON.stringify(playerMap))
    for(var id in playerMap) {
        // pigArrives = game.add.tween(Game.playerMap[id]);
        Game.playerMap[id].x = playerMap[id].x;
        Game.playerMap[id].y = playerMap[id].y;
        // pigArrives.to({x:playerMap[id].x, y: playerMap[id].y}, 0, Phaser.Easing.Bounce.Out);
        console.log(Game.playerMap[id].x + ", " + Game.playerMap[id].y + " from " + playerMap[id].x + ", " + playerMap[id].y)
    }
    // frameCount = -10
}

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

