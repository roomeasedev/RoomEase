/**
 * re.fridge_controller is a module that contains 
 */

re.fridge_controller = (function() {
    
/****************************** "PRIVATE" ****************************************/
    
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
    
/****************************** PUBLIC *********************************/ 
    
    /**
    *Function called make all of the resources visible to add a new fridge item in the Fridge tremplate
    **/
    function makeNewFridgeItem() {
        // TODO: implement this method, which will bring up the popup to add an item,
        // call createNewFridgeItem to create the JSON, and then make the necessary requesthandler call
        
        $('#new-fridge-item-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // TODO: Clear old info from popup
        
        // Adds the fridge item to the database when the next item button is pressed
        $('#next-item').click(function() {
            var itemName = $('#name').val();
            var expiration = $('expiration').val();
            var shared;
            if($('#yes_button').is(':checked')) {
                shared = "yes";
            } else if($('#no_button').is(':checked')) {
                shared = "no";
            } else {
                shared = "ask";
            }
            
            var newItem = createFridgeItem(itemName, expiration, shared);
            re.requestHandler.addItem(newItem, re.controller.rhAddCallback);
        });
        
        // Adds the fridge item to the database when the done button is pressed and hides the popup
        $('#done').click(function() {
            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
            hidePopup();
            var itemName = $('#name').val();
            var expiration = $('expiration').val();
            var shared;
            if($('#yes_button').is(':checked')) {
                shared = "yes";
            } else if($('#no_button').is(':checked')) {
                shared = "no";
            } else {
                shared = "ask";
            }
            
            var newItem = createFridgeItem(itemName, expiration, shared);
            re.requestHandler.addItem(newItem, re.controller.rhAddCallback);
        });
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'makeNewFridgeItem': makeNewFridgeItem,
	}
})();