/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

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
    game.load.image('sprite','assets/sprites/sprite.png');
};

Game.create = function(){
    Game.playerMap = {};
    game.physics.startSystem(Phaser.Physics.P2JS);
    // var testKey = game.input.keyboard.addKey(Phaser.Keyboard.Up);
    // testKey.onDown.add(Client.sendTest, this);
    var map = game.add.tilemap('map');
    cursors = game.input.keyboard.createCursorKeys();
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    // layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    // layer.events.onInputUp.add(Game.getCoordinates, this);

    Client.askNewPlayer();
};

Game.update = function(){

    // for(var id in Game.playerMap) {
    //     var sprite = Game.playerMap[id];

    //     sprite.body.setZeroVelocity();
    // }

    if(myId == null || !Game.playerMap[myId]) {
        return;
    }

    var sprite = Game.playerMap[myId];

    sprite.body.setZeroVelocity();
    
    var velocity = 400;

    if (cursors.left.isDown)
    {
        Client.socket.emit('movement', 'left')
        sprite.body.moveLeft(velocity);
    }
    else if (cursors.right.isDown)
    {
        Client.socket.emit('movement', 'right')
        sprite.body.moveRight(velocity);
    }

    if (cursors.up.isDown)
    {
        Client.socket.emit('movement', 'up')
        sprite.body.moveUp(velocity);
    }
    else if (cursors.down.isDown)
    {
        Client.socket.emit('movement', 'down')
        sprite.body.moveDown(velocity);
    }

    // lets it move a little bit before stopping it
    if(Game.moving.length > 0 && frameCount > 6) {
        for(var i = 0; i < Game.moving.length; i++) {
            var id = Game.moving.shift();
            var sprite = Game.playerMap[id];
            sprite.body.setZeroVelocity();
        }

        frameCount = 0;
    }

    frameCount += 1;
}

Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    // Game.playerMap[id].body.type = "player_body"
    
    
};

Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

Game.nudgePlayer = function(id, direction){
    sprite = Game.playerMap[id];

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

    Game.moving.push(id);
    // console.log(sprite)
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

