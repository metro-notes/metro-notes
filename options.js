var loadDefault = function(){
	localStorage['toggle_key'] = 27;
	//other defaults
	//should only be called once
}

var loadCurrent = function(){
	//loads current/saved settings
}

/*var getKey = function(){
	$('#toggle-key').keyup(){
		//if(e.which == toggle_key){
			console.log(e.which + " key hit!");
		//}
		return true;	
	}
	return false;
}*/

$('#toggle-key').mouseup(function(){
	console.log('toggle-key clicked!');
	//while(getKey()){
	//	console.log(e.which + " key hit in function!");
	//}
});