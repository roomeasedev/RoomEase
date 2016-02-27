/**
* re.fbHandler is a module which interfaces with the facebook SDK and openfb
* library to allow facebook authentication for our application.  This module
* is used to log in to facebook and retrieve basic information about the user,
* especially their facebook ID number, which we use as their unique user ID
* throughout the application.
* @return {Object} An object representing re.fbHandler, which has a 'moveToGroupLogin',
*     'login', and 'getInfo' function. Login attempts the login to FB and uses getInfo
*     as a callback. moveToGroupLogin handles the logic of storing the user ID locally
*     and then routing the user to the group login.
*/
re.fbHandler = (function() {
    
    /**
     * Locally and permanently stores the user's Facebook ID # into window.localStorage
     * as "user_id", then registers the new user/name combination with RoomEase. Finally,
     * routes the user to the group login page.
     * @param userInfo {Object} Facebook user information with an 'id' and a 'name' field,
     *     we store the id as the user's ID for the application, and map the name to the ID
     *     in our database so we can access the name later if necessary.
     */
    function moveToGroupLogin(userInfo, error) {
        if (userInfo) {
            window.localStorage.setItem('user_name', userInfo['name']);
            window.localStorage.setItem('user_id', userInfo['id']);
            //alert(window.localStorage.getItem('user_id'));
            re.loginHandler.registerNewUser(userInfo['id'], userInfo['name'],
                function(success, repeat, error) {
                    if (success) {
                        console.log("successfully registered new RoomEase user");
                    } else if (repeat) {
                        console.log("attempted to re-register an existing RoomEase user");
                    } else {
                        console.log("Error when registering user: " + error);
                    }
                window.location.hash = "#gl";
                re.render.route();
            });
        }
    }
    
    /**
    * Attempts to log the user into their Facebook account
    * @param {function({String, String}, function)} the callback function
    *     with parameters ({user_name, user_id}, errorHandler)
    * @postcondition:  user have been logged into their facebook
    *     account and callbacl function have been invoked with 
    *     the right parameters
    */
    function login(callback) {
        // initialize openFB library with your app's ID
        // TODO: this id is a testAppID, change to appropriate ID
        //       the testAppID is 935583189852299
        openFB.init({appId: '935583189852299'});
        // logs into Facebook with only "email" as a scope
        openFB.login(
            function onSuccess(response) { 
            	/**
	            * response is a JSON object on the form
	            * {
	            *     status:       "connected" or "undefind"
	            *     authResponse: {accessToken: ..... }
	            *     error:        ErrorType
	            * }
	            */
                // get the user's info if connection was successful
                if(response.status == "connected"){
                    getInfo(callback);
                } else { // callback with the error message if connection failed
                    callback(null, response.error);
                }
            }, ["email"]);
    }

    /**
    * gets the user's Facebook ID and invokes the callback appropriately
    * @param {function({String, String}, function)} the callback function
    *     with parameters ({user_name, user_id}, errorHandler)
    * @precondition:   user have been logged into their Facebook
    *     account successfully
    * @postcondition:  callback function have been invoked with 
    *     the right parameters
    */
    function getInfo(callback) {
        // send a GET request to Facebook to retreave the user's ID
        openFB.api({
            // HTTP method defaulted to GET
            path: '/me',
            success: function(data) {
                      /** data is a JSON object on the form
                      *	  {
					  *		name: "John Wick"
					  *		id:   "123456789"
                      *   }
                      */
                      console.log(JSON.stringify(data));

                      // alert user's data for testing purposes
                      //alert(JSON.stringify(data));
                      // if the call was successful call back with data and no error
                      callback(data, null);
                    },
            error: function errorHandler(error) {
                      // if the call was not successful call back with no data and 
                      //     pass the error to callback function
                      callback(null, error);
                    }
                });
    }

    /**
    * attempts to log the user out of their Facebook account
    * @param {function()} the callback function
    * @postcondition:  user have been logged out of their facebook
    *     account, callback function have been invoked, and localStorage 
    *     does not store user_id anymore
    */
    function logout(callback) {
        var user_id = window.localStorage.getItem("user_id");

        // attempt to logout only if user_id exists, meaning that the user
        // have previously logged in.
        if(user_id){
            // remove user_id from localStorage
            window.localStorage.removeItem("user_id");
            window.localStorage.removeItem("group_id");
            window.localStorage.removeItem("group_name");
            window.localStorage.removeItem("group_password");
            // logout, openFB will invoke the callback function
            openFB.logout(callback);
            // redirect the user to the main login page
            window.location.hash = "#fb";
        } else {
            console.log("Could not find userID. User might not have been logged in.");
        }
        
    }
    
    // Return the public API of this module by choosing which
    // funcitons we make visible here.
    return {
        'moveToGroupLogin': moveToGroupLogin,
        'login': login,
        'getInfo': getInfo,
        'logout': logout
    };
})();