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
* Function to be called when the page has loaded.  Initializes the necessary
* modules to start the page on the correct viewport.
*/
$(document).ready(function() {
    //window.localStorage.setItem("user_id", "");
    //window.localStorage.setItem("user_name", "");
    window.localStorage.setItem("group_id", "");
    re.controller.init();
    re.render.init();
});


