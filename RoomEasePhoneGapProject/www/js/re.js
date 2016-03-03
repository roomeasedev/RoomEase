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
console.log("testing");
$(document).ready(function() {  
    console.log("device ready");
    $(function() {
        FastClick.attach(document.body);
    });
    
    $("device").ready(function() {
        if (cordova.platformId == 'android') {
            alert("in here!");
            StatusBar.backgroundColorByHexString("#ff26a69a");
        }
    });

    
    //Either set the values to empty string if you want to be directed to a certain page,
    // set them to the default test values if you want to bypass the groups/ids and just
    // go to the default test group, or comment out both and observe the natural flow of
    // the app.
    //SET TO EMPTY TO FORCE NEW LOGIN
    //window.localStorage.setItem("user_id", "");
    //window.localStorage.setItem("group_id", "");
    //SET TO TEST VALUES TO GO TO DEFAULT TEST GROUP
    //User 1
    //window.localStorage.setItem("user_id", "795578070");
    //window.localStorage.setItem("user_name", "Nacho Cano");
    //window.localStorage.setItem("group_id", "089d6e77903ccfb44b5bcad1f72f8c88");
    
    //window.localStorage.setItem("user_id", "802839149821946");
    //window.localStorage.setItem("user_name", "Sidd Gorti");
    //window.localStorage.setItem("group_id", "");
    
    
    //User 2
    //window.localStorage.setItem('user_id', "512963585");
    //User 3
    //window.localStorage.setItem('user_id', "743566854");
    //window.localStorage.setItem("group_id", "089d6e77903ccfb44b5bcad1f7157b47");
    re.newController.init();
    // load templates and render first viewport
    re.render.init();
});


