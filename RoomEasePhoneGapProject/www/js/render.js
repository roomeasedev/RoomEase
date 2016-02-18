"use strict";

re.render = (function() {
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate, listTemplate, fridgeTemplate, scheduleTemplate, facebookLoginTemplate, groupLoginTemplate;
    
    /**
    * Sets the HTML value of the injectable page area to the rendered list view.
    */
    function renderListView() {
        var lists;
        /* Gets all lists from database and renders the list view with these
        *  lists embedded. 
        */
        re.requestHandler.getAllItemsOfType('list', function(allLists, error) {
            if(allLists == null) {
                console.log(error);
            } else {
                lists = allLists;
            }
            
            $('.page-title').html('List');
            $('.page').html(listTemplate(lists));
            
            for (let list of lists) {
                $('#' + list._id).longpress(function() {
                    re.controller.editList(list._id);
                });
            }
        });
    }

    function renderSchedulerView(){
        var reservations;
        console.log("Rendering schedule view");
         re.requestHandler.getAllItemsOfType('reservation', function(allReservations, error) {
            if(allReservations == null) {
                console.log(error);
            } else {
                reservations = allReservations;
            }
            
            //Categorize all of the different reservations into groups
            var reservation_dictionary = {};
            for(var i = 0; i < reservations.length; i++){
                name = reservations[i].name_of_item.toLocaleLowerCase();
                
                if(reservation_dictionary[name] === undefined){
                    reservation_dictionary[name] = [];
                }
                //TODO: Make sure these come in order
                reservation_dictionary[name].push(reservations[i]);
            }             
            $('.page-title').html('Reservations');
            
             //TODO: Make it so we use reservation_dictionary to aggregate all of the 
             //Reservations based off of what they are
            $('.page').html(scheduleTemplate(reservations));
            
            for (let reservation of reservations) {
                $('#' + reservation._id).longpress(function() {
                    //TODO: Do something on long press
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
    
    function renderGroupLoginView() {
        $('.page').html(groupLoginTemplate());
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
        if (hash == "#fb") {
            renderFacebookLoginView();
        } else if (hash == "#list") {      
            renderListView();
        } else if (hash == "#fridge") {
            renderFridgeView();
        } else if (!hash || hash == "#feed") {
            renderFeedView();
        } else if (hash == "#gl") {
            renderGroupLoginView();
        } else if (hash == "#scheduler") {
            renderSchedulerView();
        }
    }
    
    // Call the load function of re.templates, compiling the HTML templates
    // for all existing views.  When load finishes, set the values of the
    // template variables to store the appropriate compiled templates. Finally,
    // route the viewport to the correct view based on the current hash.
    function init() {
        re.templates.load(["Feed", "List", "Fridge", "Reservations", "FacebookLogin", "GroupLogin"]).done(function () {
            feedTemplate = re.templates.get("Feed");
            listTemplate = re.templates.get("List");
            fridgeTemplate = re.templates.get("Fridge");
            scheduleTemplate = re.templates.get("Reservations");
            facebookLoginTemplate = re.templates.get("FacebookLogin");
            groupLoginTemplate = re.templates.get("GroupLogin");
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
        'renderFridgeView': renderFridgeView,
        'renderSchedulerView': renderSchedulerView
    };
})();