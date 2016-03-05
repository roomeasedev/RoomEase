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
    $(function() {
        FastClick.attach(document.body);
    });
    
    /* PLEASE COMMENT OUT WHEN TESTING IN BROWSER */
    // UNCOMMENT WHEN BUILDING, THIS STYLES THE STATUS AND NAV BAR
    /*
    $("device").ready(function() {
        if (cordova.platformId == 'android') {
            StatusBar.backgroundColorByHexString("#26A69A");
            BarTinter.navigationColor("#26A69A"); 
        }
    });*/

    //User 1
    //window.localStorage.setItem("user_id", "795578070");
    //window.localStorage.setItem("user_name", "Matthew Mans");
    //window.localStorage.setItem("group_id", "");
    //window.localStorage.setItem("group_id", "089d6e77903ccfb44b5bcad1f72f8c88");
    
    re.newController.init();
    
    // load templates and render first viewport
    re.render.init();
});