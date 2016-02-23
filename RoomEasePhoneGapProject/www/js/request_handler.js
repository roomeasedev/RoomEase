"use strict";
/**
*TODO: Make a high level description of what this does
**/
re.requestHandler = (function(){
	var database_location = null;
	var user_id = null;
	var group_id = null;
	var databases = {};
	
	var type_to_table = {
		"chore":'chores',
		"fridge_item": 'fridge_items',
		"group":'groups',
		"list":'lists',
		"reservation":'reservations',
		"user":'users'
	};

	/**
	*initializes the reuired fields of the request handler. The db_location MUST be
	*the location of a DB of type CouchDB
	*datbase_location: The ip/host and port combination of the location of the database
	*usr_id: The Facebook id of the client
	*group_id: The group id of the client
	**/
	function init(db_location, u_id, grp_id) {
        console.log("initializing RH with u_id: " + u_id + " and grp_id: " + grp_id);
		database_location = db_location;
		user_id = u_id;
		group_id = grp_id;

		for (var key in type_to_table) {
			databases[type_to_table[key]] = 
			new PouchDB(database_location + type_to_table[key]);
		}
		return true;
	}

	/**
	*Adds an item of type item to the database. Calls callback on error or on success.
	*NOTE: An item CANNOT have an _id or _rev associated when it is added. The item returned in 
	*the callback will have these fields added in.
	*	item: The item to be added.
	*	callback(is_success, revised_item, error)	
	*		is_success: True if the item was properly added to the database, false otherwise.
	*		revised_item: An item identical to the item passed as input, but with identifiers added
	*		error: null if item was added successfully. String describing error if error occured.
	**/
	function addItem(item, callback) {
		if (user_id == null || group_id == null) {
			callback(null, "Error: no valid user_id and/or group_id assigned to user object");
			return;
		} else if(item == null || item.type == null){
			callback(false, null, "Error: item or item_type are null");
			return;
		} else if (type_to_table[item.type] == null) {
			callback(false, null, "Invalid item type");
			return;
		}
		
		databases[type_to_table[item.type]].post(item)
		.then(function(response){
			if (response.ok) {
				databases["groups"].get(group_id)
				.then(function(grp_response) {
					//TODO: check error type
					grp_response[item.type].push(response.id);
					return grp_response;
				})
				.then(function(grp_response){
					return databases["groups"].post(grp_response);
				}).then(function(post_response){
					var returnItem = JSON.parse(JSON.stringify(item));
					returnItem["_id"] = response.id;
					returnItem["_rev"] = response.rev;
					callback(true, returnItem, null);
				});
			}
		}).catch(function(err) {
			callback(false, null, null);
		});
	}

	/**
	* Returns all items of the given type that are assocated with a particular group. Calls callback on error or on success.
	*	type: The type of item that will be fetched from the database
	*	callback(list_of_items, error)
	*		list_of_items: a list containing every item of the given type associated with the group
	*		error: null of item was added successfully. String describing error if error occured.
	**/
	function getAllItemsOfType(type, callback) {
		if (user_id == null || group_id == null) {
			callback(null, "Error: no valid user_id and/or group_id assigned to user object");
			return;
		}

		var response_array = [];

		databases["groups"].get(group_id)
		.then(function(response){
			if (response[type] === null ) {
				//TODO: MAke sure this actually fails properly
				throw "Error: Type of item not found in the database";
			} else {

				var ids = [];
		 		for (var i = 0; i < response[type].length; i++) {
		 			ids.push(response[type][i]);
		 		}

		 		databases[type_to_table[type]].allDocs({
		 			include_docs: true,
		 			attachments: true,
		 			keys: ids 
		 		}).then(function(result){
		 			console.log("Result rows");
		 			console.log(result.rows);
		 			for (var i = 0; i < result.rows.length; i++){
		 				response_array.push(result.rows[i].doc);
		 			}
		 			callback(response_array, null);
		 		})
			}
		})
		.catch(function(err){
			callback(null, err);
		});
	}
    
    
    /*
    *Gets the name that correlates to the user ID
    *
    *callback(is_success, name, error)
    *   is_success: true if the request was successful, false otherwise
    *   name: null if unsuccesssful. Name that correlates to the user ID
    *   error: null is fuccessful. Description of error if error has occured.
    */
    function uidToName(uid, callback){
        databases["users"].query('get_by_uids/uids_to_name', {
            key: uid,
            include_docs: true,
            attachments: true
        })
		.then(function(response){
            callback(true, response.rows[0].doc.name, null);
        })
        .catch(function(err){
            callback(false, null, err);
        });
    }
    
	/**
	*Updates the item in the database to the new version of the item. Calls callack on success or on error.
	*	item: The item to be updated 
	*	callback(is_success, was_deleted, error):
	*		is_success: True if update was successful, false otherwise.
	*		was_deleted: True if the item was not updated for it was not located in the DB (Most likely due ot deletion)
	*		updated_item: The item with the updated parameters
	*		error: null if item was updated successfully. String describing the error if error occured.
	**/	
	function updateItem(item, callback){
		if (user_id == null || group_id == null) {
			callback(false, false, null, "Error: no valid user_id and/or group_id assigned to user object");
			return;
		} else if(item == null || item.type == null){
			callback(false, false, null, "Error: item or item_type are null");
			return;
		} else if (type_to_table[item.type] == null) {
			callback(false, false, null, "Invalid item type");
			return;
		}

		databases["groups"].get(group_id)
		.then(function(response){
			if (response[item.type] === null ) {
				//TODO: MAke sure this actually fails properly
				throw "Error: Type of item not found in the database";
			} else if (!contains_id(response[item.type], item._id)){
				callback(false, true, null, "Item was already deleted");
				return null;
			}

			return databases[type_to_table[item.type]].post(item);

		}).then(function(response) {
			if(response != null){
				var item_copy = JSON.parse(JSON.stringify(item)); //This does a deep copy
				item_copy._id = response.id;
				item_copy._rev = response.rev;
				callback(true, false, item_copy, null);
			}
		}).catch(function(error){
			callback(false, false, null, error);
		});

	}

	/**
	*Deletes the record of the item in the database. Calls callback on success or on error.
	*	item: The item to be deleted
	*	callback(is_sucess, error)
	*		is_success: True if item was deleted successfully. String describing error if error occured.
	**/
	function deleteItem(item_id, item_type, callback) {
		
		if (user_id == null || group_id == null) {
			callback(null, "Error: no valid user_id and/or group_id assigned to user object");
			return;
		}

		databases["groups"].get(group_id)
		.then(function (result){

			if (result[item_type] == null) {
				throw "Error";
			}
			
			if (!contains_id(result[item_type], item_id)){
				callback(true, null);//In the case where an intem has already been deleted, just say it succeeded
				return;
			}
			var index = result[item_type].indexOf(item_id);
			var removed_item_id = result[item_type].splice(index, 1);
			databases["groups"].post(result);
		
		}).then(function(result){

			databases[type_to_table[item_type]].get(item_id)
			.then(function(get_result){
				databases[type_to_table[item_type]].remove(get_result);
				callback(true, null);
			});

		})
		.catch(function(err){
			callback(false, err);
		});
	}

	/**
	 * Returns true if a list contains the given id, false otherwise
	 * @param list {Array} The list the potentially contains id
	 * @param id {String} The id we are searching for in the given list.
	 */	
	function contains_id(list, id) {
		for (var i = 0; i < list.length; i++) {
			if (list[i] === id) {
				return true;
			} 
		}
		return false;
	}

    // Return the public API of this module, only making
    // the following functions visible to other modules.
	return {
		'addItem': addItem,
		'updateItem': updateItem,
		'getAllItemsOfType': getAllItemsOfType,
		'deleteItem': deleteItem,
		'init': init,
		'u_id': user_id,
		'grp_id': group_id,
        'uidToName': uidToName
	}
})();