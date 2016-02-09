/**
*Creates a RquestHandler object that is able to take and receive 
*requests at the database located at database_location. The database MUST be
*of type CouchDB
*datbase_location: The ip/host and port combination of the location of the database
**/
function RequestHandler(database_location) {

	this.databases = {};
	this.user_id = null;
	this.group_id = null;

	//Public functions
	this.assignGroupId = assignGroupId;
	this.assignUserId = assignUserId;
	this.createNewGroup = createNewGroup;
	this.registerNewUser = registerNewUser;
	this.addUserToGroup = addUserToGroup;
	this.addItem = addItem;

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

	for (var i = 0; i < table_names.length; i++) {
		this.databases[table_names[i]] = new PouchDB(database_location + table_names[i]);
	}
}

/**
*Assigns the following user_id to the request_handler object
*	user_id: The user_id provided by the Facebook Login API on login
**/
function assignUserId(user_id ) {
	this.user_id = user_id;
}

/**
*Assigns the following group_id to the request_handler object
*	group_id: Assigns the following group_id to the request_handler object
**/
function assignGroupId(group_id) {
	this.group_id = group_id;
}

/**
*Creates a new group in the database. Calls callback on error or on success
*	@param {Function} callback(group_id, error)
*			group_id: The id of the group that has been created. -1 if group failed to be made.
*			error: null if group created successfully. String describing an error if an error has occured.
*/
function createNewGroup(callback) {
	var empty_groups_item = 
	{
		"uids" : [],
		"reservations": [],
		"lists": [],
		"fridge_items" : [],
		"chores":[]
	};
	this.databases["groups"].post(empty_groups_item)
	.then(function(response) {
		if (response.ok == true) {
			returnVal = response.id;
			callback(returnVal, null);	
		} else {
			callback("-1", null);
		}
	})
 	.catch(function(err){
 		callback(null, err);
 	});
}

/** 
*Adds a user to the database with the facebook user_id and and name. Calls callback on error or on success.
*	facebook_id: The unique_id generated from the Facebook Login API when a user successfully logs into an application
*	name: The real name of the person registering (Ex: John Doe, Will T. Smith)
*	callback(is_success, error)
*		is_success: True if the user was rgistered into the database, false otherwise
*		error: null if group created successfully. String describing an error if an error has occured.
**/
function registerNewUser(facebook_id, name, callback){
	this.databases["users"].post({
		"uid": facebook_id,
		"name": name,
		"group_num": "-1"
	})
	.then(function(response){
		callback(true, null);
	})
	.catch(function(err){
		callback(false, err);
	});
}

/** 
*Adds a user  to the group with the following usr_id and group_id. 
*If a user is already registered with the group, the function will throw an error.
*Calls callback on error or on success.
*	user_id: The id of the user generated from the Facebook API when logging in.
*	group_id: The id of the group generated on creation.
*	callback(is_success, error)
*		is_success: True if the user was sucessfully assigned to the group, false otherwise
*		error: null if user was added to the group successfully. String describing an error if an error has occured.
**/

function addUserToGroup(user_id, group_id, callback) {
	databases = this.databases;
	databases["groups"].get(group_id)
	.then(function(response) {

		if ( contains_id(response["uids"], user_id)) {
			throw "Error: uiser ID already part of this group";
		}

		response.uids.push(user_id);
		return response;
	
	}).then(function(response){
		//Note: The 'response' from the previous call is the same as THIS response
		databases["groups"].post(response)
		.then(function(response){
			//TODO: Check for OK
			callback(true, null);
		});
	}).catch(function(err){
		callback(false, err);
	});
}

/**
*Adds an item of type item to the database. Calls callback on error or on success.
*	item: The item to be added.
*	item_type: The type of the item to be added.
*	callback(is_success, item_id, error)	
*		is_success: True if the item was properly added to the database, false otherwise.
*		item_id: The unique_id of the item that was added to the database if successfully added.
*		error: null if item was added successfully. String describing error if error occured.
**/
function addItem(item, item_type, callback) {
	if (this.user_id == null || this.group_id == null) {
		callback(null, "Error: no valid user_id and/or group_id assigned to user object");
		return;
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
