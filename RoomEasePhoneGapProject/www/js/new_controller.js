/**
 * re.controller is a module that contains much of the UI-driven logic of the application.
 * Contains functions that are tied to various buttons and interactive elements that drive
 * events such as adding or updating database items. This modules serves as a wrapper and
 * middle man of the request handler calls, so that error handling and results from the DB
 * can be properly transferred to the front end.
 * @return {Object} the re.controller object, which has a public API containing functions
 *     for various buttons and interactive elements within the application. 
 */
re.new_controller = (function() {

    // TODO: Refactor these into a different module (localstorage)
	var list_items = {};
	var fridge_items = [];
	var reservation_items = [];
	var chores_items = [];
    var user_ids_to_names = {};
    var userId = window.localStorage.getItem('user_id');
    var groupId = window.localStorage.getItem("group_id");
    
    /**
     * Initializes the controller module and the other modules that it uses
     * (login handler, request handler).
     */
	function init() {
        console.log("Bar!");
        //Initialize login handler and request_handler
        re.loginHandler.init("http://40.114.43.49:5984/");
		if (!userId){
			console.log("we couldn't find a UID! need to do FB Login");
            window.location.hash = "#fb";
		} else if (!groupId){
			console.log("we couldn't find a groupID! Need to do Group login!");
            window.location.hash = "#gl";
		} else {
			console.log("we found both a uid and a group id");
            re.requestHandler.init("http://40.114.43.49:5984/", userId, groupId);  
		}
        
        
        var onGetGroupIDs = function(isSucces, map, error){
            if(isSucces) {
                user_ids_to_names = map;
                console.log("Map set!");
                console.log("Map");
                console.log(map);
            } else {
                console.log(error);
            }
        }
        
        re.requestHandler.getUidToNameMap(groupId, onGetGroupIDs);
        console.log("re.controller init finished!");
	}
    
    
/****************************** "PRIVATE" ****************************************/
    
    /**  
     *
     */
    function displayError(error) {
        console.log(error);
        // let user know an error occurred and prompt them to try again
        $('.error-popup').css('display', 'block');
        $('#exit-error').click(function() {
            $('.error-popup').css('display', 'none');
        });
    }
    
/****************************** PUBLIC *********************************/ 
    
    /**
     * Returns the module's map of user IDs to String names
     */
    function getUIDsMap(){
        return user_ids_to_names;
    }
    
    /** 
     * Brings user back to whatever main module screen they're on
     */
    function hidePopup() {
        // clears the fields in popup & closes it
        $('.fixed-action-btn').css('display', 'block');
        $('#new-list-btn').css('display', 'block');
        $('#new-reservation-btn').css('display', 'block');
        $('#new-fridge-item-btn').css('display', 'block');
        $('.popupBackground').css('display', 'none');
    }
    
    /** 
     * Callback function for database.addItem
     * @param: is_success: True if the callback was successful, false otherwise
     *         revised_item: The revised item returned by the database. Null if failed.
     *         error: Describes error if error occured
     */
    function rhAddCallback(is_success, revised_item, error) {
        if (is_success) {
            console.log("success");
            re.render.route();
            // TODO: scroll to where the new list is
        } else {
            displayError(error);            
        }
    }
    
    /** 
     * Callback function for database.deleteItem
     * @param: is_success: True if the callback was successful, false otherwise
     *         error: Describes error if error occured
     */
    function rhDelCallback(is_success, error) {
        rhAddCallback(is_success, null, error);
    }
    
    /** 
     * Callback function for database.updateItem
     * @param: is_success: True if the callback was successful, false otherwise
     *         error: Describes error if error occured
	 *         was_deleted: True if the item was not updated for it was not located in the DB (Most likely due ot deletion)
	 *         updated_item: The item with the updated parameters
     */
    function rhUpdateCallback(is_success, was_deleted, updated_item, error) {
        if (is_success) {
            console.log("success");
            list_items[updated_item._id] = updated_item;
            re.render.route();
            // TODO: scroll to where the new list is
        } else {
            displayError(error);
        }  
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
		'init': init,
        'list_items': list_items,
        'reservation_items': reservation_items,
        'getUIDsMap': getUIDsMap,
        'hidePopup': hidePopup,
        'rhAddCallback': rhAddCallback,
        'rhDelCallback': rhDelCallback,
        'rhUpdateCallback': rhUpdateCallback
	}
})();