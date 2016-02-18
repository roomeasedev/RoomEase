re.controller = (function() {

	var list_items = [];
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];

	function init() {
		if (window.localStorage.getItem("user_id") == null){
			//Facebook Login
		} else if (window.localStorage.getItem("group_id") == null){
			//Add group window
		} else {
			//Splash screen
		}

        //Initialize login handler and request_handler
        re.loginHandler.init("http://40.114.43.49:5984/");

        // Example group and user ID are chosen from DB. These values are hard coded so request
        // handler cooperates.
        re.requestHandler.init("http://40.114.43.49:5984/",
                        "893308038", "089d6e77903ccfb44b5bcad1f7157b47");
		console.log("re.controller init finished!");
	}
    
    /* Onclick function for new list button
     *
     */
    function makeNewList() {
        $('#new-list-btn').css('display', 'none');
        $('.new-list-popup').css('display', 'block');
        
        // Clear old list items from popup
        clearItems('list-items');
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
        
        // Hide Delete button and resize Cancel and Done buttons
        $('#delete').css('display', 'none');
        $('#cancel').css('width', '49%');
        $('#done').css('width', '49%');
        
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            resetButtons();
            var listName = $('#name').val();
            var listItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                listItems.push($(this).val());
            });
            var newlist = createList(listName, listItems);
            // TO DO: refactor out the callback function
            re.requestHandler.addItem(newlist, function(is_success, revised_item, error) { 
                if (is_success) {
                    console.log("successfully added list");
                    re.render.renderListView();
                    // TODO: scroll to where the new list is
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
        });

        // clears the fields in popup & closes it
        $('#cancel').click(function() {
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            resetButtons();
            $('#name').val('');
            $('#items').val('');
        });
    }
    
    /* Edits an existing list
     *
     */
    function editList(listId) {
        $('#new-list-btn').css('display', 'none');
        $('.new-list-popup').css('display', 'block');
        
        // Clear old list items from popup
        clearItems('list-items');
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
        
        //TODO: Have this update the list item in the database
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            var listName = $('#name').val();
            var listItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                listItems.push($(this).val());
            });
            var editedList = createList(listName, listItems);
            re.requestHandler.updateItem(editedList, function(is_success, revised_item, error) { 
                if (is_success) {
                    console.log("successfully added list");
                    re.render.renderListView();
                    // TODO: scroll to where the new list is
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
        });

        //TODO: Have this clear fields
        // clears the fields in popup & closes it
        $('#cancel').click(function() {
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            $('#name').val('');
            $('#items').val('');
        });
    }
    
    /* Switches the onfocus method from the previous next-item input field to a new one
     */
    function changeFocus() {
        $('#next-item').off('focus');
        $('#next-item').attr('id', 'list-item');
        $('#list-items').append(
            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
    }
    
/********************* "PRIVATE" METHODS **************************/
    
    /* Creates a JSON list object to add to database & handles any resulting errors
     * name: the name of the list
     * items: string of items to put into list
     */
    function addListToDatabase(newlist) {    
    }
    
    function updateList(editedList) {
    }
    
    /* Creates a JSON list object with listName, & items
     *
     */
    function createList(listName, items) {
        return list = {
            "type": "list",
            "name_of_list": listName,
            "text": "",
            "items": items,
            "visible_users":
                ["12345567878", //Hardcoding in IDs for now
                    "124444433333"], 
            "modifiable_users":
                ["12344444", //Hardcoded
                "1124444444"]
        }
    }
        
    function reqHandCallback(is_success, revised_item, error) { 
        if (is_success) {
            console.log("successfully added list");
            re.render.renderListView();
            // TODO: scroll to where the new list is
        } else {
            console.log(error);
            // let user know an error occurred and prompt them to try again
            $('.error-popup').css('display', 'block');
            $('#exit-error').click(function() {
                $('.error-popup').css('display', 'none');
                $('.new-list-popup').css('display', 'block');
            });
        }
    }
    
    /* Clears the list elements from a popup
     * @param containerId The id of the text container in the popup to be emptied
     */
    function clearItems(containerId) {
        $('#' + containerId).empty().html(
            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
    }
    
    /* Resets the sizes of the Cancel and Done buttons and makes the
     * delete button visible again.
     */
    function resetButtons() {
        $('#delete').css('display', 'block');
        $('#cancel').css('width', '30%');
        $('#done').css('width', '30%');
    }
    
	return {
		'init': init,
        'makeNewList': makeNewList,
        'editList': editList,
        'changeFocus': changeFocus,
        'list_items': list_items
	}
})();