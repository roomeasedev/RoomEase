re.loginHandler = (function() {

	var tables = ["groups", "users"];
	var databases = {};

	function init(database_location) {
		for (var i = 0; i < tables.length; i++) {
			databases[tables[i]] = 
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
		databases["groups"].post(empty_groups_item)
		.then(function(response) {
			if (response.ok == true) {
				var returnVal = response.id;
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
		databases["users"].post({
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
		databases["groups"].get(group_id)
		.then(function(response) {

			if ( contains_id(response["uid"], facebook_id)) {
				throw "Error: uiser ID already part of this group";
			}

			response.uid.push(facebook_id);
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
	*Creates a username and password that a user can identify and log into a group by
	*group_id: The id that is generated to identify the group. Normally reutned by the 
	*function createNewGroup(). If a group has already been registered, then the information in the 
	*callback will be the information that was generated when the group was registered for the first time.
	*
	*group_name_prefix: The prefix of the name of the group.
	*callback(is_success, group_name, group_password, error)
	*	is_success: true if the group was properly given a name and password, false otherwise
	*	group_name: the name of the group that the user will identify loggining into their group with
	*	group_password: an 8 digit string the user will use to log into their group
	*	error: null if registration successful. e 
	**/
	function generateGroupLoginInfo(group_id, group_name_prefix, callback) {
		///TODO: implement
		callback(false, null, null, null, "Unimplemented");
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
	
	return {
		'init': init,
		'createNewGroup': createNewGroup,
		'registerNewUser': registerNewUser,
		'addUserToGroup': addUserToGroup
	}
})();



