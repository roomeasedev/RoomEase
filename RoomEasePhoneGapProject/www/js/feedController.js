"use strict"

/**
 * re.feedController is a module which contains the logic for front-end UI operations
 * for the feed screen, as well as functions which perform all necessary wrapping of
 * request handler calls.
 */
re.feedController = (function() {
/****************************** "PRIVATE" ****************************************/
	var feedItems = [];
    var fridgeItems = [];
    var reservationItems = [];
    var quickAdd = false;

	/**
	 * Creates the JSON representing a feed item, which will not be added to the
	 * Database, but will be rendered using the Handlebars template for the feed view.
	 * @param  {Object} input   JSON object with the properties from which to build the new feed item
	 * @return {Object}         JSON object with the proper format of a feed item, or null if
	 *                          the wrong type of item was passed as an argument.
	 */
	function createFeedItem(input) {
        if (input.type == "fridge_item") {
			return {
                '_id': input._id,
				'type': "fridge_item",
				'item': input.item,
                'owner': input.owner
			};
        } else if (input.type == "reservation") {
			return {
                '_id': input._id,
				'type': "reservation",
				'item': input.name_of_item,
				'time': input.start_time
			};
		} else {
			console.log("Feed error, unknown item type");
			return null;
        }
	}

	/**
	 * Removes the given food item with the given ID from the group's
	 * food database (should only be called if the food has expired).
	 * @param  {String} foodId  The DB id number of the food item to be removed
     * @param  {String} name    The name of the fridge item to be removed
	 */
	function removeExpiredFood(foodId, name) {
        // Popup to confirm deletion of food
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
        
        // Remove item from local list of feed items
        // Hide the item
	}
    
    /**
     * Processes the fridge items to display the ones that have expired and then renders them.
     * @param   {Array<Object>} allItems    List of all the fridge items
     * @param   {String} error              String describing an error if one occured, null otherwise.
     */
    function renderFridgeItems(allItems, error) {
        allItems.sort(re.fridgeController.fridgeItemComparator);
        fridgeItems = allItems;
        for (var i = 0; i < fridgeItems.length; i++) {
            var item = fridgeItems[i];
            
            var expDate = new Date(item.expiration_date);
            expDate.setUTCHours(24,0,0,0);
            
            var currDate = new Date();
            currDate.setUTCHours(24,0,0,0);

            // Make expired items into feed items
            if(expDate < currDate) {
                feedItems.push(createFeedItem(item));
            }
        }
            
        var reservationItems = re.requestHandler.getAllItemsOfType("reservation", renderReservationItems);
    }
    
    /**
     * Processes the reservation items to display the ones the current user has upcoming today and then renders them.
     * @param   {Array<Object>} allItems    List of all the reservation items for the group
     * @param   {String} error              String describing an error if one occured, null otherwise.
     */
    function renderReservationItems(allItems, error) {
        // Sort reservations by time of day
        allItems.sort(function(reserve1, reserve2) {
            var time1 = reserve1.start_time.split(':');
            var time2 = reserve2.start_time.split(':');
            var hours1 = parseInt(time1[0]);
            var hours2 = parseInt(time2[0]);
            var minutes1 = parseInt(time1[1]);
            var minutes2 = parseInt(time2[1]);

            if(hours1 == hours2) {
                return minutes1 - minutes2;
            } else {
                return hours1 - hours2;
            }
        });
        
        reservationItems = allItems;
        for (var i = 0; i < reservationItems.length; i++) {
            var item = reservationItems[i];

            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            var currDate = new Date();
            var reserveTime = new Date(item.start_date);
            reserveTime.setHours(item.start_time.substr(0, 2));
            reserveTime.setMinutes(item.start_time.substr(3));

            if(reserveTime.getTime() - currDate.getTime() < oneDay && item.uid == window.localStorage.getItem('user_id')) {
                feedItems.push(createFeedItem(item));
            }
        }

        $('.page').html(re.render.feedTemplate(feedItems));

        addListeners();
        
        $("#loading-icon").css("display", "none");
    }
    
    /**
     * Adds onClick and longpress listeners to the feed items
     */
    function addListeners() {
        re.newController.assignXPull('feed-container');

        // Add longpress listeners to fridge items to allow them to be removed
        for(var i in fridgeItems) {
            (function(fridgeItem) {
                $('#' + fridgeItem._id).longpress(function() {
                    removeExpiredFood(fridgeItem._id, fridgeItem.item);
                });
            })(fridgeItems[i]);
        }

        // Add onclick shortcut from reservation items to their corresponding area of reservation view
        for(var i in reservationItems) {
            (function(reservation) {
                $('#' + reservation._id).on('click', function() {
                    re.reserveController.setFilterValue(reservation.name_of_item);
                    window.location.hash = "#reservations";
                });
            })(reservationItems[i]);
        }
    }
    
/****************************************** PUBLIC ************************************************/

    /**
     * Sets the HTML value of the injectable page area to the rendered feed view.
     */
    function render() {
        feedItems = [];
        $("#loading-icon").css("display", "block");
        $('.page-title').html('Feed');
        
        // Store fridge and reservation items separately to add longpress listeners later
        var fridgeItems = re.requestHandler.getAllItemsOfType("fridge_item", renderFridgeItems);
    }

    /*
     * Shortcut to the add popup of the list module
     */
    function listModuleButton() {
        setQuickAdd(true);
        window.location.hash = '#list';
    }
    
    /*
     * Shortcut to the add popup of the reservation module
     */
    function reservationModuleButton() {
        setQuickAdd(true);
        window.location.hash = '#reservations';
    }
    
    /*
     * Shortcut to the add popup of the fridge module
     */
    function fridgeModuleButton() {
        setQuickAdd(true);
        window.location.hash = '#fridge-mine';
    }
    
    /**
     * Set's the quickAdd boolean flag
     * @param {boolean} flag    Value to set quickAdd to
     */
    function setQuickAdd(flag) {
        quickAdd = flag;
    }
    
	/* Return the public API of re.feedController, which allows the fields
	 * and methods listed in this object to be visible to the other modules.
     */
	return {
        'render': render,
		'listModuleButton': listModuleButton,
		'reservationModuleButton': reservationModuleButton,
		'fridgeModuleButton':	fridgeModuleButton,
        'quickAdd': quickAdd,
        'setQuickAdd': setQuickAdd
	};
})();
