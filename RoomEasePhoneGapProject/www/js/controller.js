/**
 * re.controller is a module that contains much of the UI-driven logic of the application.
 * Contains functions that are tied to various buttons and interactive elements that drive
 * events such as adding or updating database items. This modules serves as a wrapper and
 * middle man of the request handler calls, so that error handling and results from the DB
 * can be properly transferred to the front end.
 * @return {Object} the re.controller object, which has a public API containing functions
 *     for various buttons and interactive elements within the application. 
 */
// TODO: refactor controller.js into a separate, smaller controller for each module
re.controller = (function() {

    // TODO: Refactor these into a different module (localstorage)
	var list_items = {};
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];

    /**
     * Initializes the controller module and the other modules that it uses
     * (login handler, request handler).
     */
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
    
    
/********************* "PRIVATE" FUNCTIONS **************************/
    
    /* Callback function for database
     */
    function rhAddCallback(is_success, revised_item, error) { 
        errorHandler(is_success, error);
    }
    
    function errorHandler(is_success, error) {
        if (is_success) {
            console.log("successfully added list");
            re.render.route();
            // TODO: scroll to where the new list is
        } else {
            console.log(error);
            // let user know an error occurred and prompt them to try again
            $('.error-popup').css('display', 'block');
            $('#exit-error').click(function() {
                $('.error-popup').css('display', 'none');
            });
        }        
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
    
    function createReservation(name_of_res, start_time, end_time, start_date, end_date){
        return test_reservations_item = {
            "type": "reservation",
            "name_of_item" : name_of_res,
            "start_time" : start_time,
            "end_time" : end_time,
            "start_date" : start_date,
            "end_date" : end_date,
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
    
    
/********************* PUBLIC FUNCTIONS ************************/    
    
    /* Onclick function for new list button
     *
     */
    function makeNewList() {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
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
            hidePopup();
            var listName = $('#name').val();
            var listItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                listItems.push($(this).val());
            });
            var newlist = createList(listName, listItems);
            re.requestHandler.addItem(newlist, rhAddCallback);


            
        });
    }

    function makeNewReservation(){
        $('#new-reservation-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
//        // Hide Delete button and resize Cancel and Done buttons
//        $('#delete').css('display', 'none');
//        $('#cancel').css('width', '49%');
//        $('#done').css('width', '49%');
        
        // Adds the new reservation to the database when the done button is pressed
        $('#create-done').click(function() {
            console.log("hi trying to fix things");
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
            resetButtons();
            var reserveName = $('#name').val();
            var start_time = $('#start-time').val();
            var minutes = $("#reservation-minutes").val();
            var hours = $("#reservation-hours").val();
            var start_date = $("#start-date").val();
            console.log("Hours: " + hours);
            console.log("Minutes: " + minutes);
            
            addReservationToDatabase(reserveName, start_time, start_date, hours, minutes, function(is_success, error){
                re.render.renderSchedulerView();
            });

            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
        });

        // clears the fields in popup & closes it
        $('#create-cancel').click(function() {
            console.log("Pressed cancel!");
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
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
                    $('.popupBackground').css('display', 'block');
                });
            }
        });
    }

    //callback(is_success, error)
    function addReservationToDatabase(reservation_name, start_time,start_date, hours, minutes, callback){
        var newlist = createReservation(reservation_name, start_time, start_date, hours, minutes);  
        console.log("New res:");
        console.log(newlist);
        re.requestHandler.addItem(newlist, function(is_success, revised_item, error) { 
            if (is_success) {
                console.log("successfully added schedule item");
                callback(true, null);
            } else {
                console.log(error);
                callback(false, error);
                // let user know an error occurred and prompt them to try again
                $('.error-popup').css('display', 'block');
                $('#exit-error').click(function() {
                    $('.error-popup').css('display', 'none');
                    $('.popupBackground').css('display', 'block');
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
    
    function createReservation(name_of_res, start_time, start_date, hours, minutes){
        return test_reservations_item = {
            "type": "reservation",
            "name_of_item" : name_of_res,
            "start_time" : start_time,
            "start_date" : start_date,
            "hours" : hours,
            'minutes': minutes
        }
    }
    
    /* Edits an existing list
     *
     */
    function editList(listId) {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // Clear old list items from popup
        clearItems('list-items');
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
        
        // TODO: populates popup with current items in list
        //       --> currently can't grab an item with just the id, either in database or in local copy
        /*   thisList = list_items[listId]
             $('#name').val(listId.name);
             for (let item of thisList.items) {
                $('#next-item')
             }
        */
        
        // TODO: Have this update the list item in the database
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            hidePopup();
            var listName = $('#name').val();
            var editedItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                editedItems.push($(this).val());
            });
            var editedList = createList(listName, listItems);
            re.requestHandler.updateItem(editedList, rhAddCallback);
        });
        
        // TODO: doesn't really function atm but shouldn't be a big change
        // ALSO: we should probably be able to delete without having to go into editing mode first
        $('#delete').click(function() {
            re.requestHandler.deleteItem(list_items[listId], errorHandler);
        });
    }
    function editReservationItem(reservationId){
        console.log("Here!");
        
        $('#delete-reservation-btn').css('display', 'none');
        $('.delete-reservation-popup').css('display', 'block');
        //$('#' + reservationId).css('display', 'block');
                
        //TODO: Have this update the list item in the database
        // Adds the new list to the database when the done button is pressed
        $('#delete-delete').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.delete-reservation-popup').css('display', 'none');
            re.requestHandler.deleteItem(reservationId, "reservation", function(is_success, was_deleted, err){
                re.render.renderSchedulerView();   
            });
            // TODO: put in some form of reloading
            //       location.reload() doesn't work; lists won't ever be displayed even if in database
        });

        //TODO: Have this clear fields
        // clears the fields in popup & closes it
        $('#delete-cancel').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.delete-reservation-popup').css('display', 'none');
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
    
    // TODO: make this function general --> be able to pass in id of popup to change
    function hidePopup() {
        // clears the fields in popup & closes it
        $('#new-list-btn').css('display', 'block');
        $('#new-reservation-btn').css('display', 'block');
        $('.popupBackground').css('display', 'none');
        resetButtons();
    }
    
	return {
		'init': init,
        'list_items': list_items,
        'makeNewList': makeNewList,
        'makeNewReservation': makeNewReservation,
        'editList': editList,
        'changeFocus': changeFocus,
        'hidePopup': hidePopup,
        'editReservationItem':  editReservationItem,
        'editList': editList
	}
})();