function player_coll (body, bodyB, shapeA, shapeB, equation) {
	console.log("collision");
	if (body == null){
		return
	}
	console.log(body)
	//the id of the collided body that player made contact with 
	var key = body.data.id; 
	//the type of the body the player made contact with 
	var type = body.data.type; 
	console.log(key + " " + type)
	
	if (key != -1) {
		//send the player collision
		Client.socket.emit('player_collision', {id: key}); 
	}
}