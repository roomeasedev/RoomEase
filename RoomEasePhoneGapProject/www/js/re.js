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
    re.controller.init();
    re.render.init();
});
