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
        var userId = window.localStorage.getItem('user_id');
        var groupId = window.localStorage.getItem("group_id");
		if (!userId){
			console.log("we couldn't find a UID! need to do FB Login");
		} else if (!groupId){
			console.log("we couldn't find a groupID! Need to do Group login!");
		} else {
			console.log("we found both a uid and a group id");
            re.requestHandler.init("http://40.114.43.49:5984/", userId, groupId);
            
		}
        // Example group and user ID are chosen from DB. These values are hard coded so request
        // handler cooperates.

		console.log("re.controller init finished!");
	}
    
    
/****************************** "PRIVATE" ****************************************/
    
    /* Callback function for database.addItem
     */
    function rhAddCallback(is_success, revised_item, error) {
        errorHandler(is_success, error);
    }
    
    /* Callback function for database.updateItem
     *
     */
    function rhUpdateCallback(is_success, was_deleted, updated_item, error) {
        if (is_success) {
            console.log("success");
            list_items[updated_item._id] = updated_item;
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
    
    /* Callback function for database.deleteItem. Also functions as the base
     * code for callbacks that return something not used
     *
     */
    function errorHandler(is_success, error) {
        if (is_success) {
            console.log("success");
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
        
    /* Creates a JSON list object with listName, & items. Used only when we want to add a new
     * list to the database
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
        $('#name').val('');
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
    
    /* Takes the items in JSON list object thisList & fills in the popup items section with them
     *
     */
    function loadListItems(thisList) {
        $('#name').val(thisList.name_of_list);
        for (var i in thisList.items) {
            $('#next-item').val(thisList.items[i]);    
            changeFocus();
        }        
    }
    
    
/****************************** PUBLIC *********************************/    
    
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
            
            var newresv = createReservation(reservation_name, start_time, start_date, hours, minutes);  
            console.log("New res:");
            console.log(newresv);
            re.requestHandler.addItem(newresv, rhAddCallback);
        });

        // clears the fields in popup & closes it
        $('#create-cancel').click(function() {
            console.log("Pressed cancel!");
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
            resetButtons();
            $('#name').val('');
        });
    }
    
    /* Brings up a popup that lets user edit an existing list with id listId. 
     * User can delete the list, or edit the name & items of the list
     */
    function editList(listId) {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // Clear old list items from popup
        clearItems('list-items');
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
        
        thisList = list_items[listId];
        loadListItems(thisList);
        
        $('#done').click(function() {
            hidePopup();
            var listName = $('#name').val();
            var updatedItems = [];
            $('#list-items :input').each(function() {
                if ($(this).val() != '') {
                    updatedItems.push($(this).val());
                }
            });
            var editedList = thisList;
            editedList.items = updatedItems;
            console.log("edited list: " + JSON.stringify(editedList));
            re.requestHandler.updateItem(editedList, rhUpdateCallback);
        });
        
        $('#delete').click(function() {
            hidePopup();
            console.log("deleting list");
            re.requestHandler.deleteItem(listId, "list", errorHandler);
        });
    }
    
    function editReservationItem(reservationId){
        console.log("Here!");
        
        $('#delete-reservation-btn').css('display', 'none');
        $('.delete-reservation-popup').css('display', 'block');
        //$('#' + reservationId).css('display', 'block');
                
        $('#delete-delete').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.delete-reservation-popup').css('display', 'none');
            re.requestHandler.deleteItem(reservationId, "reservation", function(is_success, was_deleted, err){
                re.render.renderSchedulerView();   
            });
        });

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
    
    /* Brings user back to whatever main module screen they're on (usually the onclick for a cancel button)
     *
     */
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