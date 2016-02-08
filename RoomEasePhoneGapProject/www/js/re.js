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
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate, listTemplate;
    
    /**
    * Sets the HTML value of the injectable page area to the rendered list view.
    */
    function renderListView() {
        $('.page').html(listTemplate());
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered feed view.
    */
    function renderFeedView() {
        $('.page').html(feedTemplate());
    }
    
    /**
    * Renders the correct view for the injectable area of the viewport.
    * Uses the current hash of the URL to determine which view should be
    * rendered, then calls the appropriate rendering function.
    */
    function route() {
        var hash = window.location.hash;
        console.log(hash);
        if (!hash || hash == "#feed") {
            renderFeedView();
        } else if (hash == "#list") {
            renderListView();
        }
    }
    
    // Attach an event listener to route to the proper view
    // when the hash of the URL is changed.
    $(window).on('hashchange', route);
    
    // Call the load function of re.templates, compiling the HTML templates
    // for all existing views.  When load finishes, set the values of the
    // template variables to store the appropriate compiled templates. Finally,
    // route the viewport to the correct view based on the current hash.
    re.templates.load(["Feed", "List"]).done(function () {
        feedTemplate = re.templates.get("Feed");
        listTemplate = re.templates.get("List");
        route();
    })
});