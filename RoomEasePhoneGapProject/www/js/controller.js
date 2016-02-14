re.controller = (function() {

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
		console.log("re.controller init finished!");
	}
    
    /* creates a JSON list object to add to database & handles any resulting errors
     * name: the name of the list
     * items: string of items to put into list
     * return value: null on error & the newly created item on success
     */
    function addList(listName, items, text) {
        var newlist = {
            "type": "list",
            "name_of_list": listName,
            "text": text,
            "items": items.split(" "),
            "visible_users":
                ["12345567878", //Hardcoding in IDs for now
                    "124444433333"], 
            "modifiable_users":
                ["12344444", //Hardcoded
                "1124444444"]
        }

        re.requestHandler.addItem(newlist, function(is_success, revised_item, error) {
            if (is_success) {
                console.log("successfully added list");
                return revised_item;
            } else {
                // process the error as alert to user
                console.log(error);
                $('.error-popup').css('display', 'block');
                $('#error-close').click(function() {
                   $('.error-popup').css('display', 'none');  
                });
                return null;
            }
        });
    }

	return {
		'init': init,
        'addList': addList
	}
})();