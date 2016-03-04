/**
 * re.fridgeController is a module that contains 
 */

re.fridgeController = (function() {   
/****************************** "PRIVATE" ****************************************/
    var done = false;
    
    // Grab the value dictionary of fridge names to expiration dates from local storage
    // or set it to an empty Object if there is no locally stored data
    var fridgeNames = JSON.parse(window.localStorage.getItem("fridgeNames"));
    if(!fridgeNames) {
        fridgeNames = {};
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
    
    /**
     * Adds a fridge item to the database by reading the user's input in the addItem popup.
     */
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
            $('#next-item').on('click', function() {
                addItem();
            });
            $('#done').on('click', doneBtn);
            done = false;
            Materialize.toast("Enter an item name", 2000);
            return false;
        } else if (expiration == "") {
            $('#next-item').on('click', function() {
                addItem();
            });
            $('#done').on('click', doneBtn);
            done = false;
            Materialize.toast("Enter a valid expiration", 2000);
            return false;
        }
        
        

        var newItem = createFridgeItem(itemName, expiration, shared);
        re.requestHandler.addItem(newItem, fridgeAddCallBack);
        
        
        
        var expDate = new Date(expiration);        
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.ceil(Math.abs((expDate.getTime() - new Date().getTime())/oneDay));
        
        fridgeNames[itemName.toLowerCase()] = diffDays;
        
        window.localStorage.setItem("fridgeNames", JSON.stringify(fridgeNames));
        
        var tmp = JSON.parse(window.localStorage.getItem("fridgeNames"));
        
        return true;
    }
    
    /** 
     * Callback function for adding a fridge item to the database
     * @param {Boolean} is_success      True if the callback was successful, false otherwise
     * @param {Object} revised_item     The revised item returned by the database. Null if failed.
     * @param {String} error            Describes error if error occured
     */
    function fridgeAddCallBack(isSuccess, revisedItem, error) {
        if(isSuccess) {
            // Clear fields of popup
            $('#names').val(function () {
                return '';
            });
            $('#expiration').val(function () {
                return '';
            });
            
            if(done) {
                re.render.renderFridgeView(true, window.location.hash == '#fridge-shared');
                re.controller.hidePopup();
                resetFridgeButtons();
                done = false;
            }
        } else {
            re.newController.displayError(error);
        }
    }
    
    /**
     * Removes the click listeners from the buttons in the fridge view popup.
     */
    function resetFridgeButtons() {
        $('#cancel').off();
        $('#next-item').off();
        $('#done').off();
    }
    
    function fridgeItemComparator(item1, item2) {
        var exp1 = item1.expiration_date;
        var exp2 = item2.expiration_date;
        
        return exp1 - exp2;
    }
    
    function doneBtn() {
        $('#next-item').off();
        $('#done').off();
        // Set done flag to true then add the item
        done = true;
        addItem();
    }
    
/****************************** PUBLIC *********************************/ 
    
    /**
     * Function called make all of the resources visible to add a new fridge item in the Fridge tremplate
     **/
    function makeNewFridgeItem() {
        $('#new-fridge-item-btn').css('display', 'none');
        $('.popupBackground.main').css('display', 'block');
        
        $('#cancel').on('click', function() {
            // Clear fields of popup
            $('#names').val(function () {
                return '';
            });
            $('#expiration').val(function () {
                return '';
            });
            re.controller.hidePopup();
            resetFridgeButtons();
            re.render.renderFridgeView(true, window.location.hash == '#fridge-shared');
        });
        
        // Adds the fridge item to the database when the next item button is pressed
        $('#next-item').on('click', function() {
            addItem();
        });
        
        // Adds the fridge item to the database when the done button is pressed and hides the popup
        $('#done').on('click', doneBtn);
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
        'renderFridgeView': renderFridgeView,
        'makeNewFridgeItem': makeNewFridgeItem,
        'removeItem': removeItem,
        'fridgeNames': fridgeNames,
        'fridgeItemComparator': fridgeItemComparator
	}
})();