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
    
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate, listTemplate, fridgeTemplate;
    
    // Attach an event listener to route to the proper view
    // when the hash of the URL is changed.
    window.onhashchange = route;
    
    /**
    * Sets the HTML value of the injectable page area to the rendered list view.
    */
    function renderListView() {
        var lists;
        /* Gets all lists from database and renders the list view with these
        *  lists embedded. 
        */
        re.requestHandler.getAllItemsOfType("list", function(allLists, error) {
            if(allLists == null) {
                console.log(error);
            } else {
                lists = allLists;
            }
            console.log(lists);
                        
            $('.page').html(listTemplate(lists));
            
            $('#new-list-btn').click(function() {                
                $('.popup').css('display', 'block');
                
                // stores the new list in the database on "Save" button click
                $('#store').click(function() {
                    // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
                    $('.popup').css('display', 'none')
                    var listName = $('#name').val();
                    var items = $('#items').val();
                    re.controller.addList(listName, items); 
                    console.log("returned from controller call");
                    // TODO: put in some form of reloading
                    //       location.reload() doesn't work; lists won't ever be displayed even if in database
                });
            });
        });
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered feed view.
    */
    function renderFeedView() {
        $('.page').html(feedTemplate());
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered fridge view.
    */
    function renderFridgeView() {
        $('.page').html(fridgeTemplate());
        
        // Initialize tabs
        $(document).ready(function(){
            $('ul.tabs').tabs();
        });
    }
    
    /**
    * Renders the correct view for the injectable area of the viewport.
    * Uses the current hash of the URL to determine which view should be
    * rendered, then calls the appropriate rendering function. If the hash
    * is not set (on first load), the feed view is rendered.
    */
    function route() {
        var hash = window.location.hash;
        console.log(hash);
        if (!hash || hash == "#feed") {
            renderFeedView();
        } else if (hash == "#list") {      
            renderListView();
        } else if (hash == "#fridge") {
            renderFridgeView();
        }
    }
    
    
    // Call the load function of re.templates, compiling the HTML templates
    // for all existing views.  When load finishes, set the values of the
    // template variables to store the appropriate compiled templates. Finally,
    // route the viewport to the correct view based on the current hash.
    re.templates.load(["Feed", "List", "Fridge"]).done(function () {
        feedTemplate = re.templates.get("Feed");
        listTemplate = re.templates.get("List");
        fridgeTemplate = re.templates.get("Fridge");
        route();
    })
});
