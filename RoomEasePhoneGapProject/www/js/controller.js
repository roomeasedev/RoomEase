re.controller = (function() {

	var list_items = [];
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];

	function init() {
        //Initialize login handler and request_handler
        re.loginHandler.init("http://40.114.43.49:5984/");

		if (window.localStorage.getItem("user_id") == null){
			//Facebook Login
		} else if (window.localStorage.getItem("group_id") == null){
			//Add group window
		} else {
			//Splash screen
		}
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
            var items = $('#items').val();
            re.controller.addListToDatabase(listName, items, text);
            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
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

    function makeNewReservation( ){
        $('#new-reservation-btn').css('display', 'none');
        $('.new-reservation-popup').css('display', 'block');
        
        // Hide Delete button and resize Cancel and Done buttons
        $('#delete').css('display', 'none');
        $('#cancel').css('width', '49%');
        $('#done').css('width', '49%');
        
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
            $('#new-reservation-btn').css('display', 'block');
            $('.new-reservation-popup').css('display', 'none');
            resetButtons();
            var listName = $('#name').val();
            var start_time = $('#start-time').val();
            var end_time = $("#end-time").val();
            console.log("Start time: " +start_time);
            console.log("End time: " + end_time);
            //re.controller.addListToDatabase(listName, items, text);
            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
        });

        // clears the fields in popup & closes it
        $('#cancel').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.new-reservation-popup').css('display', 'none');
            resetButtons();
            $('#name').val('');
            $('#items').val('');
        });
    }
    
    /* Resets the sizes of the Cancel and Done buttons and makes the
     * delete button visible again.
     */
    function resetButtons() {
        $('#delete').css('display', 'block');
        $('#cancel').css('width', '30%');
        $('#done').css('width', '30%');
    }
    
    /* Creates a JSON list object to add to database & handles any resulting errors
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

    function addReservationToDatabase(reservation_name, start_time, end_time, uid){
        //TODO: Implement
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
    
    /* The longpress function
     *
     */
    function editList(listID) {
        $('#new-list-btn').css('display', 'none');
        $('.new-list-popup').css('display', 'block');
        
        //TODO: Have this update the list item in the database
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            $('#new-list-btn').css('display', 'block');
            $('.new-list-popup').css('display', 'none');
            
            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
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


    
	return {
		'init': init,
        'makeNewList': makeNewList,
        'makeNewReservation': makeNewReservation,
        'addListToDatabase': addListToDatabase,
        'addReservationToDatabase': addReservationToDatabase, 
        'createList': createList,
        'editList': editList
	}
})();