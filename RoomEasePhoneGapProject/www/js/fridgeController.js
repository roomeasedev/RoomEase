/**
 * re.fridgeController is a module that contains 
 */

re.fridgeController = (function() {   
/****************************** "PRIVATE" ****************************************/
    
    // Grab the value dictionary of fridge names to expiration dates from local storage
    // or set it to an empty Object if there is no locally stored data
    var fridge_names = JSON.parse(window.localStorage.getItem("fridge_names"));
    if(!fridge_names) {
        fridge_names = {};
    }
    
    /**
     * Creates a fridge item JSON object that will be added to the database.
     * @param itemName      Name of the fridge item
     * @param expiration    Expiration date of item
     * @param shared        Shared status of item (yes or no)
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
    
    function addItem() {
        var itemName = $('#names').val();
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
            return false;
        } else if (expiration == "") {
            Materialize.toast("Enter a valid expiration", 2000);
            return false;
        }
        
        // Clear fields of popup
        $('#names').html('');
        $('#expiration').html('');

        var newItem = createFridgeItem(itemName, expiration, shared);
        re.requestHandler.addItem(newItem, re.newController.rhAddCallback);
        
        var expDate = new Date(expiration);        
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.ceil(Math.abs((expDate.getTime() - new Date().getTime())/oneDay));
        
        fridge_names[itemName.toLowerCase()] = diffDays;
        
        window.localStorage.setItem("fridge_names", JSON.stringify(fridge_names));
        
        var tmp = JSON.parse(window.localStorage.getItem("fridge_names"));
        
        return true;
    }
    
    function resetFridgeButtons() {
        $('#cancel').off();
        $('#next-item').off();
        $('#done').off();
    }
    
/****************************** PUBLIC *********************************/ 
    
    /**
     * Function called make all of the resources visible to add a new fridge item in the Fridge tremplate
     **/
    function makeNewFridgeItem() {
        $('#new-fridge-item-btn').css('display', 'none');
        $('.popupBackground.main').css('display', 'block');
        
        $('#cancel').on('click', function() {
            re.controller.hidePopup();
            resetFridgeButtons();
        });
        
        // Adds the fridge item to the database when the next item button is pressed
        $('#next-item').click(function() {
            addItem();
        });
        
        // Adds the fridge item to the database when the done button is pressed and hides the popup
        $('#done').click(function() {
            if(addItem()) {
                re.controller.hidePopup();
                re.render.renderFridgeView(false);
                resetFridgeButtons();
            }
        });
    }
    
    /**
     * Popup that prompts the user if they want to delete an item.
     * @param {String} id   The reference id the item to be removed
     * @param {String} name The name of the fridge item to be removed
     */
    function removeItem(id, name) {
        
        $('#new-fridge-item-btn').css('display', 'none');
        $('#removePopup').css('display', 'block');
        
        $('#removeHeader').html('Are you sure you want to remove ' + name + '?');
        
        $('#cancel-remove').on('click', function() {
            $('#cancel-remove').off();
            $('#remove').off();
            $('#removePopup').css('display', 'none');
            $('#new-fridge-item-btn').css('display', 'block');
        });
        
        $('#remove').on('click', function() {
            $('#cancel-remove').off();
            $('#remove').off();
            $('#removePopup').css('display', 'none');
            $('#new-fridge-item-btn').css('display', 'block');
            re.requestHandler.deleteItem(id, "fridge_item", re.newController.rhDelCallback);
        });
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'makeNewFridgeItem': makeNewFridgeItem,
        'removeItem': removeItem,
        'fridge_names': fridge_names,
	}
})();