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
    
    /**
     *
     */
    function getUIDsMap(){
        return user_ids_to_names;
    }
    
    /** Brings user back to whatever main module screen they're on (usually the onclick for a cancel button)
     *
     */
    function hidePopup() {
        // clears the fields in popup & closes it
        $('.fixed-action-btn').css('display', 'block');
        $('#new-list-btn').css('display', 'block');
        $('#new-reservation-btn').css('display', 'block');
        $('#new-fridge-item-btn').css('display', 'block');
        $('.popupBackground').css('display', 'none');
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
		'init': init,
        'getUIDsMap': getUIDsMap,
        'hidePopup': hidePopup,
	}
})();