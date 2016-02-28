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
	
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];
    var userId = window.localStorage.getItem('user_id');
    var groupId = window.localStorage.getItem("group_id");
    
    /**
     * Initializes the controller module and the other modules that it uses
     * (login handler, request handler).
     */
	function init() {
        console.log("initializing re.controller, nothing to do");
//        //Initialize login handler and request_handler
//        re.loginHandler.init("http://40.114.43.49:5984/");
//		if (!userId){
//			console.log("we couldn't find a UID! need to do FB Login");
//            window.location.hash = "#fb";
//		} else if (!groupId){
//			console.log("we couldn't find a groupID! Need to do Group login!");
//            window.location.hash = "#gl";
//		} else {
//			console.log("we found both a uid and a group id");
//            re.requestHandler.init("http://40.114.43.49:5984/", userId, groupId); 
//		}
     
        //Get intial mapping of uid to names
        //re.requestHandler.getUidToNameMap(groupId, onGetGroupIDs);
        
        // Initalize the reservations and rerender reservation, if it is active
        // TODO: This can't go here, we don't know at init time that request handler exists
        //updateAndRefreshReservationItems(onGetInitialReservations);
	}
    
    
/****************************** "PRIVATE" ****************************************/
    
    /* Callback function for database.addItem
    *is_success: True if the callback was successful, false otherwise
    *revised_item: The revised item returned by the database. Null if failed.
    *error: Describes error if error occured
     */
    function rhAddCallback(is_success, revised_item, error) {
        errorHandler(is_success, error);
        console.log(error);
    }
    
    /* Callback function for database.updateItem
     *
     */
    function rhUpdateCallback(is_success, was_deleted, updated_item, error) {
        if (is_success) {
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
    
    /**
     * Creates a fridge item JSON object that will be added to the database.
     * itemName: Name of the fridge item
     * expiration: Expiration date of item
     * shared: Shared status of item (yes, no, or ask)
     */
    function createFridgeItem(itemName, expiration, shared) {
        return fridgeItem = {
            "type": "fridge_item",
            "item": itemName,
            "expiration_date": expiration,
            "sharable": shared,
            "owner": window.localStorage.getItem("user_id")
        }
    }
    
    /**
     * Creates a reservation JSON object that will be added to the database.
     * name_of_res: The name of the reservation item
     * start_time: the statinf time of the reservation
     * start_date: the date that the reservation starts
     * hours: The number of hours in the reservation
     * minutes: The number of minutes in the reservation
     */
    function createReservation(name_of_res, start_time, start_date, hours, minutes){
        return test_reservations_item = {
            "type": "reservation",
            "name_of_item" : name_of_res,
            "start_time" : start_time,
            "start_date" : start_date,
            "hours" : hours,
            "minutes" : minutes,
            'uid': userId
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

    /**
    *Function called make all of the resources visible to add a new reservation in the Reservation tremplate
    **/

    function makeNewReservation(){
        $('.fixed-action-btn').css("display", "none");
        $('.popupBackground').css('display', 'block');
        
        // Adds the new reservation to the database when the done button is pressed
        $('#create-done').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
            resetButtons();
            var reserveName = $('#name').val();
            var start_time = $('#start-time').val();
            var minutes = $("#reservation-minutes").val();
            var hours = $("#reservation-hours").val();
            var start_date = $("#start-date").val();            
            var newresv = createReservation(reserveName, start_time, start_date, hours, minutes);  
  
            re.requestHandler.addItem(newresv, function(isSuccessAddItem, revised_item, error){
                rhAddCallback(isSuccessReviseReservations,revised_item, error);
            });
            
        });

        // clears the fields in popup & closes it
        $('#create-cancel').click(function() {
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
            resetButtons();
            $('#name').val('');
        });
    }
    
    /**
    *Function called make all of the resources visible to add a new fridge item in the Fridge tremplate
    **/
    function makeNewFridgeItem() {
        // TODO: implement this method, which will bring up the popup to add an item,
        // call createNewFridgeItem to create the JSON, and then make the necessary requesthandler call
        
        $('#new-fridge-item-btn').css('display', 'none');
        $('.popupBackground.main').css('display', 'block');
        
        // TODO: Clear old info from popup
        
        $('#cancel').on('click', function() {
            hidePopup();
            resetFridgeButtons();
        });
        
        // Adds the fridge item to the database when the next item button is pressed
        $('#next-item').on("click", function() {
            var itemName = $('#name').val();
            var expiration = $('#expiration').val();
            var shared;
            if($('#yes-button').is(':checked')) {
                shared = "yes";
            } else {
                shared = "no";
            }

            // Check to see if input was valid
            if(itemName == "") {
                Materialize.toast("Enter an item name", 2000);
                return;
            } else if (expiration == "") {
                 Materialize.toast("Enter a valid expiration", 2000);
                 return;
            }
            
            $('#name').html('');
            $('#expiration').html('');

            resetFridgeButtons();
            hidePopup();
            
            var newItem = createFridgeItem(itemName, expiration, shared);
            re.requestHandler.addItem(newItem, rhAddCallback);
        });
        
        // Adds the fridge item to the database when the done button is pressed and hides the popup
        $('#done').on("click", function() {
            var itemName = $('#name').val();
            var expiration = $('#expiration').val();
            var shared;
            if($('#yes-button').is(':checked')) {
                shared = "yes";
            } else {
                shared = "no";
            }

            // Check to see if input was valid
            if(itemName == "") {
                Materialize.toast("Enter an item name", 2000);
                return;
            } else if (expiration == "") {
                 Materialize.toast("Enter a valid expiration", 2000);
                 return;
            }
            
            $('#name').html('');
            $('#expiration').html('');
            
            resetFridgeButtons();
            hidePopup();
            
            var newItem = createFridgeItem(itemName, expiration, shared);
            re.requestHandler.addItem(newItem, rhAddCallback);
        });
    }
    
    function resetFridgeButtons() {
        $('#cancel').off();
        $('#next-item').off();
        $('#done').off();
    }
    
    /**
     * Function called make all of the resources visible to add a new chore item in the Chores tremplate
     */
    function makeNewChore() {
        // TODO: implement this method, which will bring up the popup to add a chore,
        // call createNewChore to create the JSON, and then make the necessary requesthandler call
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
            var updatedItems = [];
            $('#list-items :input').each(function() {
                if ($(this).val() != '') {
                    updatedItems.push($(this).val());
                }
            });
            var editedList = thisList;
            editedList.items = updatedItems;
            editedList.name_of_list = $('#name').val();
            re.requestHandler.updateItem(editedList, rhUpdateCallback);
        });
        
        $('#delete').click(function() {
            hidePopup();
            re.requestHandler.deleteItem(listId, "list", errorHandler);
        });
    }
    
    //Function called when a reservation item should be edited or deleted in the Reservation template
    function editReservationItem(reservationId){
        $('.fixed-action-btn').css("display", "none");
        $('#delete-reservation-popup').css('display', 'block');
                
        $('#delete-delete').click(function() {
            $('#delete-reservation-popup').css('display', 'none');
            $('.fixed-action-btn').css("display", "block");

            re.requestHandler.deleteItem(reservationId, "reservation", function(is_success, was_deleted, err){
                re.render.route();   
            });
        });

        $('#delete-cancel').click(function() {
            $('.fixed-action-btn').css("display", "block");
            $('#delete-reservation-popup').css("display", "none");

        });            
    }
    
    /**
    *Attemptes to update the reservation_items list with what is most recent in the database
    *callback(isSuccess, error)
    *   isSuccess: True if the list was successfully updated
    *   error: null if no erro occured. Contains string describing an error that occured
    **/
    
    function updateReservationItems(callback){
        var reservations;
        re.requestHandler.getAllItemsOfType('reservation', function(allReservations, error) {
            if(allReservations == null) {
                callback(false, error);
            } else {
                re.controller.reservation_items = allReservations;
                callback(true, null);
            }
        });
    }
    
    /**
    *Creates the diolague to filter reservations based on their type
    **/
    function filterReservations(){
        $('.fixed-action-btn').css("display", "none");
        $('#filter-reservation-popup').css('display', 'block');
        
        $('select').material_select();

    
        var $selectDropdown = $("#dropdownid");
        
        //Clear Contents
        $selectDropdown.empty();
        
         $selectDropdown.append(
                  $("<option></option>")
                    .attr("reservationName", "None")
                    .text("None")
                );

        var seenReservations = [];
        var reservations = re.controller.reservation_items;
        for(var i = 0; i < reservations.length; i++){
            if(seenReservations.indexOf(reservations[i].name_of_item) == -1) {
                $selectDropdown.append(
                  $("<option></option>")
                    .attr("reservationName", reservations[i].name_of_item)
                    .text(reservations[i].name_of_item)
                );
                seenReservations.push(reservations[i].name_of_item);
            }
        }
        
        
        $('select').material_select();


        $('select').on('contentChanged', function() {
            // re-initialize (update)
            $(this).material_select();
        });
        
        $('#filter-select-btn').click(function() {
            $('.fixed-action-btn').css('display', 'block');
            $('#filter-reservation-popup').css('display', 'none');
            
            var displayedReservations = [];
            var selectedValue = $selectDropdown.find(":selected").text();
            if(selectedValue == "None"){
                displayedReservations = re.controller.reservation_items;
            } else {
                for(var i = 0; i < reservations.length; i++){
                    if(reservations[i].name_of_item == selectedValue){
                        displayedReservations.push(reservations[i]);
                    }
                }
            }
            re.render.renderSchedulerView(displayedReservations);

        });
    }
    
    function editFridgeItem(item) {
        if (item.owner != window.localStorage.getItem("user_id") && item.sharable == "ask") {
            $('#cannot-delete-fridge-item-popup').css('display', 'block');
            $('#new-fridge-item-btn').css('display', 'none');
            
            $('#cannot-delete-got-it').click(function() {
                $('#new-fridge-item-btn').css("display", "block");
                $('#cannot-delete-fridge-item-popup').css("display", "none");
            });     
        } else {
            //TODO ask if the user wants to delete this item. implement deletions
        }
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
        $('.fixed-action-btn').css('display', 'block');
        $('#new-list-btn').css('display', 'block');
        $('#new-reservation-btn').css('display', 'block');
        $('#new-fridge-item-btn').css('display', 'block');
        $('.popupBackground').css('display', 'none');
        resetButtons();
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
		'init': init,
        'reservation_items': reservation_items,
        'makeNewList': makeNewList,
        'makeNewReservation': makeNewReservation,
        'makeNewFridgeItem': makeNewFridgeItem,
        'makeNewChore': makeNewChore,
        'editList': editList,
        'changeFocus': changeFocus,
        'hidePopup': hidePopup,
        'editReservationItem':  editReservationItem,
        'editList': editList,
        'filterReservations': filterReservations
	}
})();