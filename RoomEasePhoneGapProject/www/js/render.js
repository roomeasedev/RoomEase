"use strict";

re.render = (function() {
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate, listTemplate, fridgeTemplate, facebookLoginTemplate;
    
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
                        
            $('.page').html(listTemplate(lists));
            
            // TO DO: refactor this into controller?
            $('#new-list-btn').click(function() {                
                $('.new-list-popup').css('display', 'block');
                
                // stores the new list in the database on "Save" button click
                $('#store').click(function() {
                    // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
                    $('.new-list-popup').css('display', 'none');
                    var listName = $('#name').val();
                    var items = $('#items').val();
                    var text = $('#descrip-text').val();
                    re.controller.addList(listName, items, text);
                    // TODO: put in some form of reloading
                    //       location.reload() doesn't work; lists won't ever be displayed even if in database
                });
                
                $('#cancel').click(function() {
                    $('.new-list-popup').css('display', 'none');
                    $('#name').val('');
                    $('#items').val('');
                    $('#descrip-text').val('');
                });
            });
            
            // TODO: Add edit functionality on longpress
            for (let list of lists) {
                $('#' + list._id).longpress(function(e) {
                    alert('Success!');
                });
            }
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
    
    function renderFacebookLoginView() {
        $('.page').html(facebookLoginTemplate());
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
        if (!hash || hash == "#fb") {
            renderFacebookLoginView();
        } else if (hash == "#list") {      
            renderListView();
        } else if (hash == "#fridge") {
            renderFridgeView();
        } else if (hash == "#feed") {
            renderFeedView();
        }
    }
    
    // Call the load function of re.templates, compiling the HTML templates
    // for all existing views.  When load finishes, set the values of the
    // template variables to store the appropriate compiled templates. Finally,
    // route the viewport to the correct view based on the current hash.
    function init() {
        re.templates.load(["Feed", "List", "Fridge", "FacebookLogin"]).done(function () {
            feedTemplate = re.templates.get("Feed");
            listTemplate = re.templates.get("List");
            fridgeTemplate = re.templates.get("Fridge");
            facebookLoginTemplate = re.templates.get("FacebookLogin");
            // Attach an event listener to route to the proper view
            // when the hash of the URL is changed.
            window.onhashchange = route;
            route();
        });   
    }
   
    
    return {
        'init': init,
        'renderLoginView': renderFacebookLoginView,
        'renderFeedView': renderFeedView,
        'renderListView': renderListView,
        'renderFridgeView': renderFridgeView
    };
})();