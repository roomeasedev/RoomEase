"use strict";
re.render = (function() {
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate;
    var listTemplate; 
    var fridgeTemplate;
    var scheduleTemplate;
    var facebookLoginTemplate;
    var groupLoginTemplate;
    var choreTemplate;
    
    /**
    * Sets the HTML value of the injectable page area to the rendered list view.
    */
    function renderListView() {
        /* Gets all lists from database and renders the list view with these
        *  lists embedded.
        */
        re.requestHandler.getAllItemsOfType('list', function(allLists, error) {
            if(allLists == null) {
                console.log(error);
            } else {
                $('.page-title').html('List');
                $('.page').html(listTemplate(allLists));
                for (var i in allLists) {
                    var list = allLists[i];
                    re.controller.list_items[list._id] = list; 
                    $('#' + list._id).longpress(function() {
                        re.controller.editList(list._id);
                    });
                }
            }
        });
    }

    function renderSchedulerView() {
        
        //TODO: Factor this out
        (function() {
            var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

            Date.prototype.getMonthName = function() {
                return months[ this.getMonth() ];
            };
            Date.prototype.getDayName = function() {
                return days[ this.getDay() ];
            };
        })();
        
        var reservations;
        console.log("Rendering schedule view");
        re.requestHandler.getAllItemsOfType('reservation', function(allReservations, error) {
            if(allReservations == null) {
                console.log(error);
            } else {
                reservations = allReservations;
            }
            
        
            //Convert the date-time reservations int0 a more readable format
            var date_time_reservations = [];
            for(var i = 0; i < reservations.length; i++){
                var start_end_date_obj = {};
                var start_date_nums = reservations[i].start_date.split("-");
                var hours = parseInt(reservations[i].hours);
                var minutes = parseInt(reservations[i].minutes);
                var start_time_nums = reservations[i].start_time.split(":");
                
                var start_date_obj = new Date(
                                            parseInt(start_date_nums[0]), 
                                            parseInt(start_date_nums[1]) - 1,
                                            parseInt(start_date_nums[2]),
                                            parseInt(start_time_nums[0]),
                                            parseInt(start_time_nums[1]));
                
                var end_date_obj = new Date(
                                            parseInt(start_date_nums[0]),
                                            parseInt(start_date_nums[1]) - 1,
                                            parseInt(start_date_nums[2]),
                                            parseInt(start_time_nums[0]) + hours,
                                            parseInt(start_time_nums[1]) + minutes);
                                
                var appendZero = function(number){
                    if(number < 10) {
                        return "0" + number;
                    } else {
                        return "" + number;
                    }
                }
                
                var start_date_str = "Start: " + start_date_obj.getDayName() 
                                    + ", " + start_date_obj.getMonthName()
                                    + " " + start_date_obj.getDate()
                                    + ", " + start_date_obj.getFullYear()
                                    + " at " + start_date_obj.getHours()
                                    + ":" + appendZero(start_date_obj.getMinutes());
                
                var end_date_str = "End: " + end_date_obj.getDayName() 
                                    + ", " + end_date_obj.getMonthName()
                                    + " " + end_date_obj.getDate()
                                    + ", " + end_date_obj.getFullYear()
                                    + " at " + end_date_obj.getHours()
                                    + ":" + appendZero(end_date_obj.getMinutes());
                
                start_end_date_obj["start"] = start_date_str;
                start_end_date_obj["end"] = end_date_str;
                start_end_date_obj["title"] = reservations[i].name_of_item;
                start_end_date_obj["_id"] = reservations[i]._id;
                
                start_end_date_obj["unix_start"] = start_date_obj.getTime();
                start_end_date_obj["unix_end"] = end_date_obj.getTime();
                
                //Make sure that the reservation hasn't already passed
                //TODO: Update this so that the reservation is automatically deleted
                if((new Date()).getTime() < end_date_obj){
                    date_time_reservations.push(start_end_date_obj);              
                } else {
                    //Delete that reservation from the DB
                }
                
            }
             
            date_time_reservations.sort(function(a, b){
               return a.unix_start - b.unix_start; 
            });
             
             
                    
            $('.page-title').html('Reservations');
            
             //TODO: Make it so we use reservation_dictionary to aggregate all of the 
             //Reservations based off of what they are
            $('.page').html(scheduleTemplate(date_time_reservations));
            
            console.log(reservations);
            for (var i = 0; i < reservations.length; i++) {
                    console.log("reservation");
                    console.log(reservations[i]);
                  $('#' + reservations[i]._id).longpress(function() {
                      re.controller.editReservationItem(reservations[i]._id);
                      console.log("Long press on reservation!");
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
    
    function renderChoreView() {
        $('.page').html(choreTemplate());
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
        if ( hash == "#fb") {
            renderFacebookLoginView();
        } else if (hash == "#list") {      
            renderListView();
        } else if (hash == "#fridge") {
            renderFridgeView();
        } else if (hash == "#feed") {
            renderFeedView();
        } else if (hash == "#gl") {
            renderGroupLoginView();
        } else if (true || hash == "#scheduler") {
            renderSchedulerView();
        } else if (hash == "#chore") {
            renderChoreView();
        }
    }
    
    // Call the load function of re.templates, compiling the HTML templates
    // for all existing views.  When load finishes, set the values of the
    // template variables to store the appropriate compiled templates. Finally,
    // route the viewport to the correct view based on the current hash.
    function init() {
        console.log("init");
        re.templates.load(["Feed", "List", "Fridge", "Reservations", "Chores",
                           "FacebookLogin", "GroupLogin"]).done(function () {
            feedTemplate = re.templates.get("Feed");
            listTemplate = re.templates.get("List");
            fridgeTemplate = re.templates.get("Fridge");
            scheduleTemplate = re.templates.get("Reservations");
            choreTemplate = re.templates.get("Chores");
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
        'route': route,
        'renderLoginView': renderFacebookLoginView,
        'renderFeedView': renderFeedView,
        'renderListView': renderListView,
        'renderFridgeView': renderFridgeView,
        'renderSchedulerView': renderSchedulerView
    };
})();