re.controller = (function () {

	var list_items = [];
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];

	function init() {
		if (window.localStorage.getItem("facebook_id") == null){
			//Facebook Login
		} else if (window.localStorage.getItem("group_id") == null){
			//Add group window
		} else {
			//Splash screen
		}
		console.log("init finished!");
	}

	return {

		'init': init
	}

})();