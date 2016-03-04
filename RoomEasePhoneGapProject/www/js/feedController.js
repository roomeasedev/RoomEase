"use strict"

/**
 * re.feedController is a module which contains the logic for front-end UI operations
 * for the feed screen, as well as functions which perform all necessary wrapping of
 * request handler calls.
 */
re.feedController = (function() {
	var feedItems = {};
    
	/**
	 * Creates the JSON representing a feed item, which will not be added to the
	 * Database, but will be rendered using the Handlebars template for the feed view.
	 * @param //TODO: ADD PARAM COMMENTS
	 * @return {Object} JSON object with the proper format of a feed item, or null if
	 *    the wrong type of item was passed as an argument
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
	 * @param {String} foodId  The DB id number of the food item to be removed
     * @param {String} name The name of the fridge item to be removed
	 */
	function removeExpiredFood(foodId, name) {
		// TODO: implement this function
        	
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
     * Sets the HTML value of the injectable page area to the rendered feed view.
     * @param {boolean} fullRefresh Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     */
    function renderFeedView(fullRefresh) {
        $("#loading-icon").css("display", "block");
        $('.page-title').html('Feed');
        
        // Store fridge and reservation items separately to add longpress listeners later
        var feedItems = [];
        var fridgeItems = re.requestHandler.getAllItemsOfType("fridge_item", function(allItems, error) {
            for (var i = 0; i < allItems.length; i++) {
                var item = allItems[i];

                var expDate = new Date(item.expiration_date);
                var currDate = new Date();

                var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                var diffDays = Math.ceil((expDate.getTime() - currDate.getTime())/oneDay);

                /* Because of the ceiling the diffdays will almost never be 0 to
                 * account for this we set the expiration to 0 if diffdays is -1.
                 * This is in order to show the user that an item is expiring today.
                 * All other items that have expired are set to -1 simply to show the
                 * user that their food has expired.
                 */
                if(diffDays == -1) {
                    feedItems.push(re.feedController.createFeedItem(item));
                }
            }
            var reservationItems = re.requestHandler.getAllItemsOfType("reservation", function(allItems, error) {
                for (var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    
                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    var currDate = new Date();
                    var reserveTime = new Date(item.start_date);
                    reserveTime.setHours(item.start_time.substr(0, 2));
                    reserveTime.setMinutes(item.start_time.substr(3));
                    
                    if(reserveTime.getTime() - currDate.getTime() < oneDay && item.uid == window.localStorage.getItem('user_id')) {
                        feedItems.push(re.feedController.createFeedItem(item));
                    }
                }
                
                $('.page').html(feedTemplate(feedItems));
                
                $('#feed-container').xpull({
                    'paused': false,  // Is the pulling paused ?
                    'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                    'callback':function(){
                        re.render.route();
                    }
                });
                
                // Add longpress listeners to fridge items to allow them to be removed
                for(var i in fridgeItems) {
                    (function(fridgeItem) {
                        $('#' + fridgeItem._id).longpress(function() {
                            re.feedController.removeExpiredFood(item._id, item.item);
                        });
                    })(fridgeItems[i]);
                }
                
                // Add onclick shortcut from reservation items to their corresponding area of reservation view
                for(var i in allItems) {
                    var reservation = allItems[i];
                    $('#' + reservation._id).on('click', function() {
                        re.reserveController.modifyCurrentFilterValue(reservation.name_of_item);
                        window.location.hash = "#reservations";
                    });
                }
                
                $("#loading-icon").css("display", "none");
            });
        });
    }
    
	/**
	 * Interaction function for the reservation items in the feed.
	 * Sends the user to the reservtion module with the filter set to
	 * the proper value so they can see the relevant reservation immediately.
	 * @param {String} reservationId   The DB id number of the reservation item from feed
	 */
	function reservationInteract(reservationId) {
        window.location.hash = '#reservations';
	}

    function listModuleButton() {
        re.render.setQuickAdd(true);
        window.location.hash = '#list';
    }
    
    function reservationModuleButton() {
        re.render.setQuickAdd(true);
        window.location.hash = '#reservations';
    }
    
    function fridgeModuleButton() {
        re.render.setQuickAdd(true);
        window.location.hash = '#fridge-mine';
    }
    
	// Return the public API of re.feedController, which allows the fields
	// and methods listed in this object to be visible to the other modules.
	return {
		'feedItems': feedItems,
		'createFeedItem': createFeedItem,
		'removeExpiredFood': removeExpiredFood,
		'reservationInteract': reservationInteract,
		//'updateFeedItems': updateFeedItems,
		'listModuleButton': listModuleButton,
		'reservationModuleButton': reservationModuleButton,
		'fridgeModuleButton':	fridgeModuleButton
	};
})();
