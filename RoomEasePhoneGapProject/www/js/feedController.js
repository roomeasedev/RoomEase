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
				'type': "fridge_item",
				'item': input.item
			};
	        } else if (input.type == "reservation") {
			return {
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
	 */
	function removeExpiredFood(foodId) {
		// TODO: implement this function
        	
	        // Popup to confirm deletion of food
	        $('#removePopup).css('display', 'block');
	        // Make a call on DB to get fridge item with given ID and delete it
	        re.requestHandler.removeItem(foodId, "fridge_item", newController.rhDelCallback);
	        // Remove item from local list of feed items
	        // Hide the item  
	}

	/**
	 * Interaction function for the reservation items in the feed.
	 * Sends the user to the reservtion module with the filter set to
	 * the proper value so they can see the relevant reservation immediately.
	 * @param {String} reservationID   The DB id number of the reservation item from feed
	 */
	function reservationInteract(reservationID) {
        window.location.hash = '#reservations';
	}

    function listModuleButton() {
        window.location.hash = '#list';
    }
    
    function reservationModuleButton() {
        window.location.hash = '#reservations';
    }
    
    function fridgeModuleButton() {
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
