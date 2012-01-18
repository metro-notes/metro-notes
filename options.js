var loadDefault = function(){
	localStorage['toggle_key'] = 27;
	//other defaults
	//should only be called once
}

var loadCurrent = function(){
	//loads current/saved settings
}

var getKey = function(){
	$('#toggle-key').keyup(function(e){
		if(e.which){
			var toggle_key = e.which;
			console.log(toggle_key + " is hit!");
			return true;
		}
		else return false;
	});
/*	{
		//if(e.which == toggle_key){
			console.log(e.which + " key hit!");
		//}
		return true;	
	}
	return false;
*/
}


$('#toggle-key').mouseup(function(){
	//console.log('toggle-key clicked!');
	//$('#toggle-key').replaceWith("<span id='toggle-key'>meow meow</span>");
	var keyPressed = false;
	
	do{
		console.log("waiting for user to hit key");
		
		//key press logic
		if(getKey()){
			keyPressed = true;
		}
	}while(!keyPressed);
});