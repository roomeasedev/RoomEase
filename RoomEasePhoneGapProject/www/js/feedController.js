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
