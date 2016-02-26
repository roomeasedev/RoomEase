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
	 */
	function createFeedItem(type, date, content) {
		// TODO: implement the feed item creation
	}

	/**
	 * Removes the given food item with the given ID from the group's
	 * food database (should only be called if the food has expired).
	 * @param {String} foodID the DB id number of the food item to be removed
	 */
	function removeExpiredFood(foodID) {
		// TODO: implement this function
	}

	/**
	 * Interaction function for the reservation items in the feed.
	 * Sends the user to the reservtion module with the filter set to
	 * the proper value so they can see the relevant reservation immediately.
	 * @param {String} reservationID the DB id number of the reservation item from feed
	 */
	function reservationInteract(reservationID) {
		// TODO: implement this function
	}

	/**
	 * Gets the most recent feed items for the current user by grabbing
	 * their upcoming reservations and any expired food items for the
	 * entire group.
	 */
	function updateFeedItems() {
		// TODO: get the relevant items to 
	}

	/**
	 * Onclick function for the button which will take the user to the
	 * list view of the application.
	 */
	function listModuleButton() {
	
	}

	/**
	 * Onclick function for the button which will take the user to the
	 * reservation view of the application.
	 */
	function reservationModuleButton() {

	}

	/**
	 * Onclick function for the button which will take the user to the
	 * fridge view of the application.
	 */
	function fridgeModuleButton() {
	
	}

	// Return the public API of re.feedController, which allows the fields
	// and methods listed in this object to be visible to the other modules.
	return {
		'feedItems': feedItems,
		'createFeedItem': createFeedItem,
		'removeExpiredFood': removeExpiredFood,
		'reservationInteract': reservationInteract,
		'updateFeedItems': updateFeedItems,
		'listModuleButton': listModuleButton,
		'reservationModuleButton': reservationModuleButton,
		'fridgeModuleButton':	fridgeModuleButton
	};
})();
