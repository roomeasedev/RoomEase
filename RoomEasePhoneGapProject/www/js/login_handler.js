re.loginHandler = (function() {

	var tables = ["groups", "users", "group_login"];
	var databases = {};

	/**
    * attempts to log the user into their Facebook account
    * @param {function(String, function)} the callback function
    *     with parameters (user_id, errorHandler)
    * @postcondition:  user have been logged into their facebook
    *     account and callbacl function have been invoked with 
    *     the right parameters
    */
    function login(callback) {
        // initialize openFB library with your app's ID
        // TODO: this id is a testAppID, change to appropriate ID
        openFB.init({appId: '935583189852299'});
        // logs into Facebook with only "email" as a scope
        openFB.login(
            function onSuccess(response) { 
                // get the user's info if connection was successful
                if(response.status == "connected"){
                    getInfo(callback);
                } else { // callback with the error message if connection failed
                    callback(null, response.error);
                }
            }, ["email"]);
            /**
            * response is a JSON object on the form
            * {
            *     status:       "connected" or "undefind"
            *     authResponse: {accessToken: ..... }
            *     error:        ErrorType
            * }
            */
    }

    /**
    * gets the user's Facebook ID and invokes the callback appropriately
    * @param {function(String, function)} the callback function
    *     with parameters (user_id, errorHandler)
    * @precondition:   user have been logged into their Facebook
    *     account successfully
    * @postcondition:  callback function have been invoked with 
    *     the right parameters
    */
    function getInfo(callback) {
        //send a GET request to Facebook to retreave the user's ID
        openFB.api({
            // HTTP method defaulted to GET
            path: '/me',
            success: function(data) {
                      console.log(JSON.stringify(data));
                      var fbid = data.id;
                      // alert user's id for testing purposes
                      //alert(fbid);
                      // if the call was successful call back with the id and no error
                      callback(fbid, null);
                    },
            error: function errorHandler(error) {
                      // if the call was not successful call back with no id and 
                      //     pass the error to callback function
                      callback(null, error);
                    }
                });
    }

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
	*	callback(is_success, prev_registered, error)
	*		is_success: True if the user was NEWLY rgistered into the database, false otherwise
	*		prev_registered: True if the user was previously registered to DB, false otherwise
	*		error: null if group created successfully. String describing an error if an error has occured.
	**/
	function registerNewUser(facebook_id, name, callback){

		var already_registered = false;
		var name_of_map_reduce_function = 'get_by_uids/uids'; //Note: This is a function that
															//is stored server side

		databases["users"].query(name_of_map_reduce_function, {
		  key          : facebook_id,
		  include_docs : true
		}).then(function (result) {

			//Ensure that no duplicate FB IDs end upin DB
			if (result.rows.length != 0 ){
				already_registered = true;
				callback(false, true, "User already registered");
			} else {
				//Put FB ID into DB
				return databases["users"]
				.post({
				 	"uid": facebook_id,
				 	"name": name,
				 	"group_num": "-1"
				 });
			}
		})
		.then(function(response){
			if ( !already_registered ) {
				callback(true,false, null);
			}
		})
		.catch(function (err) {
		  callback(false, false, err);
		});
	}

	/** 
	*Adds a user  to the group with the following usr_id and group_id. 
	*If a user is already registered with the group, the function will throw an error.
	*Calls callback on error or on success.
	*	user_id: The id of the user generated from the Facebook API when logging in.
	*	group_id: The id of the group generated on creation.
	*	callback(is_success, already_in_grp, error)
	*		is_success: True if the user was sucessfully assigned to the group, false otherwise
	*		already_in_grp: True if the user was already in the group
	*		error: null if user was added to the group successfully. String describing an error if an error has occured.
	**/

	function addUserToGroup(facebook_id, group_id, callback) {

		var already_in_grp = false;
		var name_of_map_reduce_function = 'get_by_uids/uids';

		databases["groups"].get(group_id)
		.then(function(response) {

			if ( contains_id(response["uid"], facebook_id)) {
				already_in_grp = true;
				callback(false, true, "Error: uiser ID already part of this group");
			} else {

				//Update the "users" entry with the proper group number
				databases["users"].query(name_of_map_reduce_function, {
		 		 key          : facebook_id,
		 		 include_docs : true
				})
				.then(function (result) {
					if(result.rows.length != 1){
						throw "Error: Multiple entries for the same user ID"
					} else {
					 	result.rows[0].doc.group_num = group_id;
						return databases["users"].post(result.rows[0].doc);
					}
				});

				response.uid.push(facebook_id);
				return response;

			}
		}).then(function(response){
			//Note: The 'response' from the previous call is the same as THIS response
			if(!already_in_grp){
				databases["groups"].post(response)
				.then(function(response){
					//TODO: Check for OK
					callback(true, false, null);
				});
			}
		}).catch(function(err){
			callback(false, false, err);
		});
	}

	/**
	*Creates a username and password that a user can identify and log into a group by
	*group_id: The id that is generated to identify the group. Normally reutned by the 
	*function createNewGroup(). If a group has already been registered, then the information in the 
	*callback will be the information that was generated when the group was registered for the first time.
	*group_name_prefix: The prefix of the name of the group. No whitespace allowed. Recommended to be 
	*the name of the person who creates the group without whitespace. (Example: JohnDoe)
	*callback(is_success, group_name, group_password, error)
	*	is_success: true if the group was properly given a name and password, false otherwise
	*	group_name: the name of the group that the user will identify loggining into their group with
	*	group_password: an 8 digit string the user will use to log into their group
	*	error: null if registration successful. e 
	**/
	function generateGroupLoginInfo(group_id, group_name_prefix, callback) {
		
		var random_8_digit_pwd = (Math.floor(Math.random()*900000) + 100000).toString();
		var suffix = null;
		databases["group_login"].query('group_login/prefix_count', {
			key: group_name_prefix,
 		 	include_docs : true
		})
		.then(function(result){
				suffix = (result.rows.length).toString();
				return databases["group_login"].post({
						"group_id": group_id,
						"group_prefix": group_name_prefix, 
						"group_suffix": suffix,
						"group_name": group_name_prefix +'#' + suffix,
						"group_password": random_8_digit_pwd 
				});
		}).then(function(result){
			if(result.ok){
				callback(true, group_name_prefix + "#" + suffix, random_8_digit_pwd, null);
			} else {
				throw "Error: Something went wrong while generating group login info";
			}
		})
		.catch(function(err){
			callback(false, null, null, err);
		});
	}

	/** 
	*Given a group name and correct password, determines the group number associated with
	*the group name and password. Callback called on success or on error.
	*group_name: The name of the group (Usually follows the format string#int (Example: JohnDoe#1234))
	*group_password: The password associated with the group_name
	*callback(is_success, incorrect_pwd, group_number, error)
	*	is_success: True if the function completed without any errors, false otherwise
	*	incorrect_pwd: True if the password that was provided was incorrect, false otherwise
	*	group_number: null if gorpu_name and group_password are correct, otherwise is the group_number associated with
	*					the group_name
	*	error: String describing if an error occured, null if no error occured.
	**/
	function getGroupNumber(group_name, group_password, callback) {
		//NOTE: THIS IS INSECURE! MUST FIND A BETTER WAY
		databases["group_login"].query('group_login/get_group_obj_by_name', {
			key: group_name,
			include_docs: true,
 			attachments: true

		})
		.then(function(result){
			if (result.rows[0].doc.group_password === group_password) {
				callback(true, false, result.rows[0].doc.group_id, null);
			} else {
				callback(false, true, null, "Error: Incorrect password");
			}
		}).catch(function(err){
			callback(false, false, null, err);

		});
	}
	/**
	*Returns true if a list contains the given id, false otherwise
	*	list: The list the potentially contains id
	*	id: The l
	*/	
	function contains_id(list, id) {
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
		'addUserToGroup': addUserToGroup,
		'generateGroupLoginInfo': generateGroupLoginInfo,
		'getGroupNumber': getGroupNumber
	}
})();



