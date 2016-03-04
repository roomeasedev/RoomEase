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
     * Sets the HTML value of the injectable page area to the rendered fridge view.
     * @param {boolean} fullRefresh Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     * @param {boolean} shared Whether the "shared" view or the "mine" view will be rendered
     */
    function renderFridgeView(fullRefresh, shared) {
        $('.page-title').html('Fridge');
        $("#loading-icon").css("display", "block");
        var user_ids_to_names = {};

        re.requestHandler.getUidToNameMap(window.localStorage.getItem("group_id"), function(isSuccess, map, error) {
            console.log(isSuccess);
            if(isSuccess) {
				user_ids_to_names = map;
                
                re.requestHandler.getAllItemsOfType('fridge_item', function(allItems, error) {
                    if(allItems == null) {
                        $("#loading-icon").css("display", "none");
                        console.log(error);
                    } else {
                        var currItems = [];
                        // Determine which items will be displayed based on hash
                        for(var i = 0; i < allItems.length; i++) {
                            var item = allItems[i];
                            var ownerId = item.owner;
                            item.owner = user_ids_to_names[item.owner];
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

                            if(shared) {                        
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
                        currItems.sort(re.fridgeController.fridgeItemComparator);

                        // Compile page and inject into .page in main html view
                        $('.page').html(fridgeTemplate(currItems));
                        $("#loading-icon").css("display", "none");

                        // Add longpress listener to fridge items to ask if the user wants to delete them
                        // or potentially inform them they don't own the item
                        for(var i = 0; i < currItems.length; i++) {
                            var item = currItems[i];
                            $('#' + item._id).longpress(function () {
                                if(item.owner == window.localStorage.getItem("user_name")) {
                                    re.fridgeController.removeItem(item._id, item.item);
                                } else {
                                    Materialize.toast("You can't delete an item you don't own", 2000);
                                }
                            });
                        }
                        
                        for(var name in re.fridgeController.fridgeNames) {
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


                        // Check to see if the user entered a item that was used previously
                        $('#names').on('focusout', function () {

                            for(var name in re.fridgeController.fridgeNames) {

                                if($('#names').val().toLowerCase() == name.toLowerCase()) {

                                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                                    var expDate = new Date();
                                    expDate.setTime(expDate.getTime() + (oneDay * re.fridgeController.fridgeNames[name]));

                                    $('#expiration').val(expDate.toISOString().substr(0, 10));
                                }
                            }
                        });
                         $('#fridge-tiles').xpull({
                            'paused': false,  // Is the pulling paused ?
                            'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                            'callback':function(){
                                re.render.route();
                            }
                        });
                    }

                    // Show add item popup if being rendered from quickAdd shortcut
                    if(quickAdd) {
                        re.fridgeController.makeNewFridgeItem();
                        quickAdd = false;
                    }
                });
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