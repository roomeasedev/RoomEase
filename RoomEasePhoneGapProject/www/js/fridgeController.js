/**
 * re.fridgeController is a module that contains the logic for front-end UI opertaions
 * for the fridge view as well as the communication with the request handler to access
 * the database.
 */
re.fridgeController = (function() {   
/****************************** "PRIVATE" ****************************************/
    var done = false;
    var userIdsToNames = {};
    var isShared = false;
    
    // Grab the value dictionary of fridge names to expiration dates from local storage
    // or set it to an empty Object if there is no locally stored data
    var fridgeNames = JSON.parse(window.localStorage.getItem("fridgeNames"));
    if(!fridgeNames) {
        fridgeNames = {};
    }
    
    /**
     * Creates a fridge item JSON object that will be added to the database.
     * @param {String} itemName     Name of the fridge item
     * @param {String} expiration   Expiration date of item
     * @param {String} shared       Shared status of item (yes or no)
     * @return {Object}             Object representing a new fridge item
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
     * @return {boolean}    True if item was added, false if input was invalid and no item was added.
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
        
        return true;
    }
    
    /** 
     * Callback function for adding a fridge item to the database
     * @param {boolean} is_success      True if the callback was successful, false otherwise
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
                renderFridgeView(true, window.location.hash == '#fridge-shared');
                re.newController.hidePopup();
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
        // Remove listeners for main popup and remove item popup
        $('#cancel').off();
        $('#next-item').off();
        $('#done').off();
        
        $('#cancel-remove').off();
        $('#remove').off();
    }
    
    /**
     * Compares fridge items based on their expiration dates.
     */
    function fridgeItemComparator(item1, item2) {
        var exp1 = item1.expiration_date;
        var exp2 = item2.expiration_date;
        
        return exp1 - exp2;
    }
    
    /**
     * Turns off next-item and done buttons to prevent copies of an item being added and then
     * adds the fridge item to the database based on the information filled in to the popup.
     */
    function doneBtn() {
        $('#next-item').off();
        $('#done').off();
        // Set done flag to true then add the item
        done = true;
        addItem();
    }
    
    /**
     * Hides the popup and clears its fields for the next time it is opened.
     */
    function cancelBtn() {
        // Clear fields of popup
        $('#names').val(function () {
            return '';
        });
        $('#expiration').val(function () {
            return '';
        });
        re.newController.hidePopup();
        resetFridgeButtons();

        render(false, isShared);
    }
    
    /**
     * Processes the fridge items to display the ones that have expired and then renders them.
     * @param   {Array<Object>} fridgeItems     List of all the fridge items
     * @param   {String} error                  String describing an error if one occured, null otherwise.
     */
    function renderFridgeItems (fridgeItems, error) {
        if(fridgeItems == null) {
            $("#loading-icon").css("display", "none");
            console.log(error);
        } else {
            var currItems = [];
            
            // Determine which items will be displayed based on hash
            for(var i = 0; i < fridgeItems.length; i++) {
                var item = fridgeItems[i];
                var ownerId = item.owner;
                item.owner = userIdsToNames[item.owner];
                var expDate = new Date(item.expiration_date);
                var currDate = new Date();
                currDate.setHours(0,0,0,0);

                var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                var diffDays = Math.ceil((expDate.getTime() - currDate.getTime())/oneDay);

                /* Because of the ceiling the diffdays will almost never be 0 to
                 * account for this we set the expiration to 0 if diffdays is -1.
                 * This is in order to show the user that an item is expiring today.
                 * All other items that have expired are set to -1 simply to show the
                 * user that their food has expired.
                 */
                if(diffDays == -1) {
                    item.expiration_date = 0;
                } else if (diffDays < -1) {
                    item.expiration_date = -1;
                } else {
                    item.expiration_date = diffDays;
                }

                if(isShared) {                        
                    if(item.sharable == "yes") {
                        currItems.push(item);
                    }
                } else {
                    if(ownerId == window.localStorage.getItem("user_id")) {
                        currItems.push(item);
                    }
                }
            }

            // Sort the fridge items by expiration date
            currItems.sort(fridgeItemComparator);

            // Compile page and inject into .page in main html view
            $('.page').html(fridgeTemplate(currItems));
            $("#loading-icon").css("display", "none");

            addListeners(currItems);

            autoCompleteSetup();
        }

        // Show add item popup if being rendered from quickAdd shortcut
        if(re.feedController.quickAdd) {
            makeNewFridgeItem();
            re.feedController.quickAdd = false;
        }
    }
    
    /**
     * Adds longpress listeners to the fridge items to allow the user
     * to remove an item when they longpress an item.
     * @param {Array<Object>} currItems     The items currently being displayed
     */
    function addListeners(currItems) {
        // Add longpress listener to fridge items to ask if the user
        // wants to delete them or inform them they don't own the item
        for(var i = 0; i < currItems.length; i++) {
            (function(item) {
                $('#' + item._id).longpress(function () {
                    if(item.owner == window.localStorage.getItem("user_name")) {
                        removeItem(item._id, item.item);
                    } else {
                        Materialize.toast("You can't delete an item you don't own", 2000);
                    }
                });    
            })(currItems[i]);
        }
        
        re.newController.assignXPull('fridge-tiles');
    }
    
    /**
     * Sets up the auto complete functionality of the fridge popup allowing it to predict, what
     * items the user might want to add, giving them a drop down as they type based on their
     * previous entries. If they select an item that they had added previously the popup will then
     * fill in the predicted date of expiration based on their most recent entry of that item.
     */
    function autoCompleteSetup() {
        for(var name in fridgeNames) {
                $('#names-select').append('<option value=' + name.substr(0, 1).toUpperCase() + name.substr(1) + ' />');
            }

            var nativedatalist = !!('list' in document.createElement('input')) && 
            !!(document.createElement('datalist') && window.HTMLDataListElement);

            /* If support for datalist element doesn't exist (iOS, older devices)
            then a jquery ui element w/polyfill is used to make a predective dropdown
            list*/
            if (!nativedatalist) {
                $('input[list]').each(function () {
                    var availableTags = $('#' + $(this).attr("list")).find('option').map(function () {
                        return this.value;
                    }).get();
                    console.log(availableTags);
                    $(this).autocomplete({ source: availableTags });
                });
            }

            // Check to see if the user entered an item that was used previously
            $('#names').on('focusout', function () {
                for(var name in fridgeNames) {
                    if($('#names').val().toLowerCase() == name.toLowerCase()) {
                        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                        var expDate = new Date();
                        expDate.setTime(expDate.getTime() + (oneDay * fridgeNames[name]));

                        $('#expiration').val(expDate.toISOString().substr(0, 10));
                    }
                }
            });
    }
    
/****************************** PUBLIC *********************************/ 
    
    /**
     * Sets the HTML value of the injectable page area to the rendered fridge view.
     * @param {boolean} fullRefresh     Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     * @param {boolean} shared          Indicates which of the "shared" and "mine" views should be rendered
     */
    function render(fullRefresh, shared) {
        isShared = shared;
        
        $('.page-title').html('Fridge');
        $("#loading-icon").css("display", "block");

        re.requestHandler.getUidToNameMap(window.localStorage.getItem("group_id"), function(isSuccess, map, error) {
            if(isSuccess) {
				userIdsToNames = map;
                re.requestHandler.getAllItemsOfType('fridge_item', renderFridgeItems(allItems, error));
            } else {
                $("#loading-icon").css("display", "none");
                console.log(error);
            }
        });
        
        // Initialize tabs
        $(document).ready(function(){
            $('ul.tabs').tabs();
        });
    }
    
    /**
     * Function called make all of the resources visible to add a new fridge item in the Fridge tremplate
     */
    function makeNewFridgeItem() {
        $('.popupBackground.main').css('display', 'block');
        
        // Hides popup and clears fields
        $('#cancel').on('click', cancelBtn);
        
        // Adds the fridge item to the database when the next item button is pressed
        $('#next-item').on('click', addItem);
        
        // Adds the fridge item to the database when the done button is pressed and hides the popup
        $('#done').on('click', doneBtn);
    }
    
    /**
     * Popup that prompts the user if they want to delete an item.
     * @param {String} id   The reference id the item to be removed
     * @param {String} name The name of the fridge item to be removed
     */
    function removeItem(id, name) {
        // Brings up the popup prompting the user if they would like to remove the selected fridge item
        $('#removePopup').css('display', 'block');
        $('#removeHeader').html('Are you sure you want to remove ' + name + '?');
        
        $('#cancel-remove').on('click', function() {
            resetFridgeButtons();
            $('#removePopup').css('display', 'none');
        });
        
        // Removes the fridge item from the database
        $('#remove').on('click', function() {
            resetFridgeButtons();
            $('#removePopup').css('display', 'none');
            re.requestHandler.deleteItem(id, "fridge_item", re.newController.rhDelCallback);
        });
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'render': render,
        'makeNewFridgeItem': makeNewFridgeItem,
        'removeItem': removeItem,
        'fridgeNames': fridgeNames,
        'fridgeItemComparator': fridgeItemComparator
	}
})();