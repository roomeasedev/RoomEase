/**
*Creates a RquestHandler object that is able to take and receive 
*requests at the database located at database_location. The database MUST be
*of type CouchDB
*datbase_location: The ip/host and port combination of the location of the database
*usr_id: The Facebook id of the client
*group_id: The group id of the client
**/
function RequestHandler(database_location, user_id, group_id) {

	this.databases = {};
	this.user_id = user_id;
	this.group_id = group_id;

	//Public functions
	this.addItem = addItem;
	this.getAllItemsOfType = getAllItemsOfType;
	this.updateItem = updateItem;
	this.deleteItem = deleteItem;

	this.__init = __init;
	this.__init(database_location);
}

/**
*Only called by the RequestHandler constructor. 
*Used to run all start up tasks when a RequestHandler object is first created
**/
function __init(database_location) {
	var table_names = ['chores',
					'fridge_items',
					'groups',
					'lists',
					'reservations',
					'users']

	//KV mapping from the type of an item to the table it belongs to

	var type_to_table = {
		"chore":'chores',
		"fridge_item": 'fridge_items',
		"group":'groups',
		"list":'lists',
		"reservation":'reservations',
		"user":'users'
	};

	for (var key in type_to_table) {
		this.databases[type_to_table[key]] = 
		new PouchDB(type_to_table[key] + table_names[i]);
	}
}


/**
*Adds an item of type item to the database. Calls callback on error or on success.
*	item: The item to be added.
*	callback(is_success, item_id, error)	
*		is_success: True if the item was properly added to the database, false otherwise.
*		item_id: The unique_id of the item that was added to the database if successfully added.
*		error: null if item was added successfully. String describing error if error occured.
**/
function addItem(item, callback) {
	if(item == null || item_type == null){
		throw "Error: item or item_type are null";
	} else if (type_to_table[item_type] == null) {
		throw "Invalid item type";
	}
	
	databases = this.databases;
	databases["groups"].get(this.group_id)
	.then(function(response) {
		if (response.item_type == null){
			throw "Error: Incorrect item type";
		} else {
			response.item_type.push(user_id);
		}
		return response;
	}).then(function(response){
		databases["groups"].post(response)
		.then (function(response){
			//TODO: Check for OK
			callback(true, response._id, null);
		});
	}).catch(function(err){
		callback(false, "-1", err);
	});

	callback(false, -1, "Unimplemented");
	return null;
}

/**
* Returns all items of the given type that are assocated with a particular group. Calls callback on error or on success.
*	type: The type of item that will be fetched from the database
*	callback(list_of_items, error)
*		list_of_items: a list containing every item of the given type associated with the group
*		error: null of item was added successfully. String describing error if error occured.
**/
function getAllItemsOfType(type, callback) {
	if (this.user_id == null || this.group_id == null) {
		callback(null, "Error: no valid user_id and/or group_id assigned to user object");
		return;
	}

	databases = this.databases;
	databases["groups"].get(this.group_id)
	.then(function(response){
		if (response[type] === null ) {
			//TODO: MAke sure this actually fails properly
			throw "Error: Type of item not found in the database";
		} else {

			json_objects = [];
	 		for (values in response[type]) {

 				console.log("{ _id: " + values + "}");
 				json_objects.push(JSON.parse("{ _id: " + values + "}"));
	 		}
		}
	})
	.catch(function(err){
		callback(null, err);
	});
}

/**
*Updates the item in the database to the new version of the item. Calls callack on success or on error.
*	item: The item to be updated 
*	callback(is_success, error):
*		is_success: True if update was successful, false otherwise.
*		error: null if item was updated successfully. String describing the error if error occured.
**/	
function updateItem(item, callback){
	//TODO: Implement
	callback(false, "Unimplemented");
	return null;
}

/**
*Deletes the record of the item in the database. Calls callback on success or on error.
*	item: The item to be deleted
*	callback(is_success, error)
*		is_success: True if item was deleted successfully. String describing error if error occured.
**/
function deleteItem(item, callback) {
	//TODO: Implement
	callback(false, "Unimplemented");
	return null;
}

/**
*Returns true if a list contains the given id, false otherwise
*	list: The list the potentially contains id
*	id: The l
*/	
function contains_id(list, id) {
	console.log(id);
	for (var i = 0; i < list.length; i++) {
		if (list[i] === id) {
			return true;
		} 
	}
	return false;
}
