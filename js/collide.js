function player_coll (body, bodyB, shapeA, shapeB, equation) {
	console.log("collision");
	
	//the id of the collided body that player made contact with 
	var key = body.sprite.id; 
	//the type of the body the player made contact with 
	var type = body.sprite.type; 
	console.log(type)
	
	if (type == "player_body") {
		//send the player collision
		Client.socket.emit('player_collision', {id: key}); 
	}
}