function LoginHandler(database_location) {

	this.createNewGroup = createNewGroup;
	this.registerNewUser = registerNewUser;
	this.addUserToGroup = addUserToGroup;
	tables = ["groups", "users"];
	this.databases = {};

	for (var i = 0; i < tables.length; i++) {
		this.databases[tables[i]] = 
		new PouchDB(database_location + tables[i]);
	}
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
		"uid" : [],
		"reservation": [],
		"list": [],
		"fridge_item" : [],
		"chore":[]
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

function addUserToGroup(facebook_id, group_id, callback) {
	databases = this.databases;
	databases["groups"].get(group_id)
	.then(function(response) {

		if ( contains_id(response["uid"], user_id)) {
			throw "Error: uiser ID already part of this group";
		}

		response.uid.push(user_id);
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

