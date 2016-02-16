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
    
    /* Onclick function for new list button
     *
     */
    function makeNewList() {
        $('#new-list-btn').css('display', 'none');
        $('.new-list-popup').css('display', 'block');
                
        // stores the new list in the database on "Save" button click
        $('#store').click(function() {
            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            var listName = $('#name').val();
            var items = $('#items').val();
            var text = $('#descrip-text').val();
            re.controller.addListToDatabase(listName, items, text);
            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
        });

        // clears the fields in popup & closes it
        $('#cancel').click(function() {
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            $('#name').val('');
            $('#items').val('');
            $('#descrip-text').val('');
        });
    }
    
    /* creates a JSON list object to add to database & handles any resulting errors
     * name: the name of the list
     * items: string of items to put into list
     */
    function addListToDatabase(listName, items, text) {
        var newlist = re.controller.createList(listName, items, text);        
        re.requestHandler.addItem(newlist, function(is_success, revised_item, error) { 
            if (is_success) {
                console.log("successfully added list");
                // TODO: reload
                re.renderListView();
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
    
    /* Creates a JSON list object with listName, items, & text
     *
     */
    function createList(listName, items, text) {
        return list = {
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
    }
    
    /* the longpress function
     *
     */
    function editList(listID) {
        window.alert("about to edit");
    }
    
	return {
		'init': init,
        'makeNewList': makeNewList,
        'addListToDatabase': addListToDatabase,
        'createList': createList,
        'editList': editList
	}
})();