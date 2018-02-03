function player_coll (body, bodyB, shapeA, shapeB, equation) {
	if (body == null){
		return
	}
	// console.log(bodyB.data.id)
	//the id of the collided body that player made contact with 
	var key = body.data.derp; 
	//the type of the body the player made contact with 
	var type = body.type; 
	
	if (key != -1) {
		//send the player collision
		Client.socket.emit('player_collision', {id: key}); 
	}
}