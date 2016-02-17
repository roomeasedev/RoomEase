"use strict";
/**
* This file is the base javascript file which initializes
* the other javascript modules. The application uses a single-page
* architecture, so this file also contains the logic to render the
* correct view to the user based on the current routing of the page
* (the hash of the URL).
*/
// Define a global object, re, to use as a namespace. re is the namespace
// on which other namespaces will be created.
var re = {};

/**
* Function to be called when the page has loaded.  Defines the various
* rendering functions, implements the logic to listen for changes to the
* URL hash and render the correct view accordingly. Loads (compiles) all
* of the templates for the various views so they are ready to be displayed.
*/
$(document).ready(function () {
    //Initialize login handler and request_handler
    re.loginHandler.init("http://40.114.43.49:5984/");

    // Example group and user ID are chosen from DB. These values are hard coded so request
    // handler cooperates.
    re.requestHandler.init("http://40.114.43.49:5984/",
                        "893308038", "089d6e77903ccfb44b5bcad1f7157b47");
    
    re.controller.init();
    
    re.render.init();
});
