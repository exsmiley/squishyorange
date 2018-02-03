/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

var myId = null;
var Game = {};

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
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.Up);
    testKey.onDown.add(Client.sendTest, this);
    var map = game.add.tilemap('map');
    cursors = game.input.keyboard.createCursorKeys();
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(Game.getCoordinates, this);

    Client.askNewPlayer();
};

Game.update = function(){

    if(myId == null || !Game.playerMap[myId]) {
        return;
    }
    sprite = Game.playerMap[myId];

    sprite.body.setZeroVelocity();
    var velocity = 200;

    if (cursors.left.isDown)
    {
        sprite.body.moveLeft(velocity);
    }
    else if (cursors.right.isDown)
    {
        sprite.body.moveRight(velocity);
    }

    if (cursors.up.isDown)
    {
        sprite.body.moveUp(velocity);
    }
    else if (cursors.down.isDown)
    {
        sprite.body.moveDown(velocity);
    }
}

Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    Game.playerMap[id].onBeginContact.add(player_coll, this);
};

Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};