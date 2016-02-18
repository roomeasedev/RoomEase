re.fbHandler = (function() {
    
    function moveToGroupLogin(userInfo) {
        window.localStorage['user_id'] = userInfo['id'];
        alert(window.localStorage['user_id']);
        window.location.hash = "#gl";
    }
    	/**
    * attempts to log the user into their Facebook account
    * @param {function({String, String}, function)} the callback function
    *     with parameters ({user_name, user_id}, errorHandler)
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
        alert("getInfo called");
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
    
    return {
        'moveToGroupLogin': moveToGroupLogin,
        'login': login,
        'getInfo': getInfo
    };
})();