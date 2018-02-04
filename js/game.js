var myId = null;
var frameCount = 0;
var Game = {};

Game.moving = [];

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    // game.load.image('sprite','assets/sprites/sprite.png');
    game.load.image('sprite','assets/sprites/orange.png');
    game.load.image('squish','assets/sprites/squishy.png');
    game.load.image('hmm','assets/map/source.gif');
    game.load.image('spring','assets/map/spring.png');
    game.load.image('summer','assets/map/summer.png');
    game.load.image('winter','assets/map/winter.png');
};

Game.create = function(){
    Game.playerMap = {};
    game.physics.startSystem(Phaser.Physics.P2JS);
    var hmm = game.add.image(0, 0, 'hmm');
    hmm.scale.setTo(0.5,0.5)
    // var map = game.add.tilemap('map');
    cursors = game.input.keyboard.createCursorKeys();
    // map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    // var layer;
    // for(var i = 0; i < map.layers.length; i++) {
    //     layer = map.createLayer(i);
    // }

    Client.askNewPlayer();
};

Game.update = function(){
    frameCount += 1;

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
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    Game.playerMap[id].scale.setTo(0.5,0.5)
    // Game.playerMap[id].body.type = "player_body"
    
    
};

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

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

