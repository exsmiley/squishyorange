var myId = null;
var frameCount = 0;
var positionCount = 0;
var Game = {};
var room = window.location.href.split('/')[3];
$('#map').html(room[0].toUpperCase() + room.substring(1));

Game.moving = [];

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('orange','assets/sprites/orange.png');
    game.load.image('squishy','assets/sprites/squishy.png');
    game.load.image('classic','assets/map/source.gif');
    game.load.image('spring','assets/map/spring.png');
    game.load.image('summer','assets/map/summer.png');
    game.load.image('winter','assets/map/winter.png');
    game.load.spritesheet('snow', 'assets/sprites/snow.png', 1400, 1400, 22);
    game.load.spritesheet('rain', 'assets/sprites/rain.png', 1400, 720, 8);
    game.load.spritesheet('tumble', 'assets/sprites/tumble.png', 1400, 200, 11);
    game.load.image('test', 'assets/map/test.jpg');
      
};

Game.create = function(){
    Game.playerMap = {};
    game.physics.startSystem(Phaser.Physics.P2JS);
    if (room=='classic'){
        game.add.tileSprite(0,0,2048,2048, 'classic');
        game.world.setBounds(0,0,1000,700);
    }
    else{
    game.add.tileSprite(0,0,1700, 850, room);
    game.world.setBounds(0,0,1700,850);
    }
    cursors = game.input.keyboard.createCursorKeys();
    if(room == 'summer') {
        var tumble = game.add.image(0,50,'tumble');
        var action = tumble.animations.add('tumbling');
        tumble.animations.play('tumbling', 5, true);
    }
    else if(room == 'spring') {
        var rain = game.add.image(0,0,'rain');
        var action = rain.animations.add('raining');
        rain.animations.play('raining', 20, true);
    }

    else if(room == 'winter') {
        var snow = game.add.image(0,0,'snow')
        var action = snow.animations.add('snowing');
        snow.animations.play('snowing', 10, true);
    }
    

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

Game.addNewPlayer = function(id,x,y, color){
    Game.playerMap[id] = game.add.sprite(x,y,'orange');
    var r = color.r;
    var g = color.g;
    var b = color.b;
    var colorString = '0x' + r.toString(16) + g.toString(16) + b.toString(16);
    Game.playerMap[id].tint = parseInt(colorString)
    Game.playerMap[id].scale.setTo(0.5,0.5)
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

    if(id ==myId) {
        // camera mvmt

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

// Game.render = function(){
//     game.debug.cameraInfo(game.camera, 32, 32);
// }
