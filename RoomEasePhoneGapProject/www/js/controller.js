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
     */
    function addList(listName, items, text) {
        var newlist = {
            "type": "list",
            "name_of_list": listName,
            "text": text,
            // TODO: not sure what to split on -- all whitespace may be incorrect
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
                // TODO: reload the page
            } else {
                console.log(error);
                // let user know an error occurred and prompt them to try again
                $('.error-popup').css('display', 'block');
                $('#exit-error').click(function() {
                    $('.error-popup').css('display', 'none');
                    $('.new-list-popup').css('display', 'block');
                });
            }
        });
    }
    
    /* the onclick function called by a list item
     *
     */
    function editList(listID) {
        window.alert("about to edit");
    }
    
    /* registers a Handlebars helper 
     *
     */
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

	return {
		'init': init,
        'addList': addList
	}
})();