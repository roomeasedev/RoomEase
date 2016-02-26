"use strict";
/**
 * re.render is a module which contains the rendering and page-routing logic for the
 * RoomEase application.  This rendering module contains functions to render each of
 * the views, to compile/load the rendered templates from the template loader, and to
 * route the page to the correct view when the hash of the URL is changed.
 * @return {Object} an Object representing re.render. The 'init' function should be called
 *     on document ready, before other functions of re.render are called.
 */
//TODO: refactor this file to remove the request handler calls from this module
re.render = (function() {
    // Define various templates, which hold the compiled templates for each of the views.
    var feedTemplate;
    var listTemplate; 
    var fridgeTemplate;
    var scheduleTemplate;
    var facebookLoginTemplate;
    var groupLoginTemplate;
    var choreTemplate;
    var accountTemplate;
    
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
               
                //Add listener for longclick
                for (var i in allLists) {
                    var list = allLists[i];
                    re.list_controller.list_items[list._id] = list; 
                    (function (current) {
                        $('#' + current._id).longpress(function() {
                            $('#popupTitle').html('Edit List');
                            re.list_controller.editList(current._id);
                        })
                    })(list);
                }
            }
        });
    }

    /**
    * Sets the HTML value of the injectable page area to the rendered scheduler view.
    * reservations: A list of reservation JSON objects that will be rendered to the page
    */
    function renderSchedulerView(reservations) {
        console.log("Rendering Schedule View");
        //TODO: Factor out the date calculations and database calls
        (function() {
            var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];

            var months = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sep.','Oct.','Nov.','Dec.'];

            Date.prototype.getMonthName = function() {
                return months[ this.getMonth() ];
            };
            Date.prototype.getDayName = function() {
                return days[ this.getDay() ];
            };
        })();
        
        var formatAMPM = function(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
            
        
            //Convert the date-time reservations int0 a more readable format
            var date_time_reservations = [];
            for(var i = 0; i < reservations.length; i++){
                var reservationObj = {};
                var start_date_nums = reservations[i].start_date.split("-");
                var hours = parseInt(reservations[i].hours);
                var minutes = parseInt(reservations[i].minutes);
                var start_time_nums = reservations[i].start_time.split(":");
    
                
                var startDateObj = new Date(
                                            parseInt(start_date_nums[0]), 
                                            parseInt(start_date_nums[1]) - 1,
                                            parseInt(start_date_nums[2]),
                                            parseInt(start_time_nums[0]),
                                            parseInt(start_time_nums[1]));
                
                var endDateObj = new Date(
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
                
                //We only add the date to the timeline if we know that it gots over two seperate days
                //Example: If a reservation starts at 11PM and end at 1AM
                var startDateStr = "";
                var endDateStr = "";
                
                if(startDateObj.getDate() != endDateObj.getDate() ||
                    startDateObj.getMonth() != endDateObj.getMonth() ||
                    startDateObj.getYear() != endDateObj.getYear()) {
                        
                    startDateStr += " (" + (startDateObj.getMonth() + 1) + "/" + startDateObj.getDate() + ")";
                    endDateStr += " (" + (endDateObj.getMonth() + 1) + "/" + endDateObj.getDate() + ") ";

                }
                
                var timeString = "" 
                                + formatAMPM(startDateObj)
                                + startDateStr 
                                + " -- " 
                                + formatAMPM(endDateObj)
                                + endDateStr; 
                
                var currentDate = new Date();
                
                
                if(currentDate.getTime() > startDateObj.getTime() && currentDate.getTime() < endDateObj){
                    //Event currently happening
                    reservationObj["color_class"] = "reservation_happening_color"; 
                } else if(currentDate.getTime() > endDateObj.getTime()) {
                    reservationObj["color_class"] = "reservation_happened_color"; 
                } else {
                    reservationObj["color_class"] = "reservation_not_happened_color"; 
                }
                
                reservationObj["time"] = timeString;
                reservationObj["title"] = reservations[i].name_of_item;
                reservationObj["_id"] = reservations[i]._id;
                reservationObj['start_obj'] = startDateObj;
                reservationObj['end_obj'] = endDateObj;
                reservationObj['user'] = re.controller.getUIDsMap()[reservations[i].uid];
                console.log("User");
                console.log(reservationObj['user']);
                console.log(re.controller.getUIDsMap());
                
                console.log("User id");
                console.log(reservations[i]);
                
                
                reservationObj["unix_start"] = startDateObj.getTime();
                reservationObj["unix_end"] = endDateObj.getTime();
                reservationObj["type"] = "reservation";
                
                //Make sure that the reservation hasn't already passed
                //TODO: Update this so that the reservation is automatically deleted
                if((new Date()).getTime() < endDateObj){
                    date_time_reservations.push(reservationObj);              
                } else {
                    //TODO: Delete that reservation from the DB
                    date_time_reservations.push(reservationObj);              
                }
            }
             
            date_time_reservations.sort(function(a, b){
               return a.unix_start - b.unix_start; 
            });
            
            //Inject the headers that go above each reservation
            var existing_header_labels = [];
            for(var i = 0; i < date_time_reservations.length; i++) {
                var time_header_obj = {};
                time_header_obj['type'] = 'time';

                var now_obj = new Date();
                if(date_time_reservations[i]["start_obj"].getTime() < now_obj.getTime()
                         && date_time_reservations[i]["end_obj"].getTime() > now_obj.getTime()){
                    time_header_obj['label'] = "Currently Active";
                } else if(date_time_reservations[i]["end_obj"].getTime() < now_obj.getTime()) {
                    time_header_obj['label'] = "Already Complete";
                } else if (date_time_reservations[i]['start_obj'].getTime() > now_obj.getTime()) {
                    time_header_obj['label'] = date_time_reservations[i]['start_obj'].getMonthName() + " \ " 
                                                + date_time_reservations[i]['start_obj'].getDate();
                    
                    //Append year if not this year
                    if(date_time_reservations[i]['end_obj'].getYear() > now_obj.getYear()) {
                         time_header_obj['label'] += ", " + date_time_reservations[i]['end_obj'].getFullYear();
                    }
                }
                
                if (existing_header_labels.indexOf(time_header_obj.label) == -1){
                    date_time_reservations.splice(i, 0, time_header_obj);
                    existing_header_labels.push(time_header_obj.label);
                    i++;
                }
            }
         
            $('.page-title').html('Reservations');
            
             //TODO: Make it so we use reservation_dictionary to aggregate all of the 
             //Reservations based off of what they are
            $('.page').html(scheduleTemplate(date_time_reservations));
            
            //Add listener for longclick
            console.log(reservations);
            for (var i in reservations) {
                console.log("reservation");
                console.log("#" + reservations[i]._id);
                (function(current) {
                    $("#" + current._id).longpress(function() {
                        re.controller.editReservationItem(current._id);
                        console.log("Long press on reservation!");
                    });
                })(reservations[i]);
            }
    }
                
    
    /**
    * Sets the HTML value of the injectable page area to the rendered feed view.
    */
    function renderFeedView() {
        $('.page-title').html('Feed');
        $('.page').html(feedTemplate());
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered fridge view.
    */
    function renderFridgeView(shared) {
        re.requestHandler.getAllItemsOfType('fridge_item', function(allItems, error) {
            if(allItems == null) {
                console.log(error);
            } else {
                $('.page-title').html('Fridge');
                
                var currItems = [];
                
                // Determine which items will be displayed based on hash
                for(var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    if(shared) {                        
                        if(item.owner == window.localStorage.getItem("user_id") || item.sharable == "yes") {
                            currItems.push(item);
                        }
                    } else {
                        if(item.owner == window.localStorage.getItem("user_id")) {
                            currItems.push(item);
                        }
                    }
                }
                
                // Compile page and inject into .page in main html view
                $('.page').html(fridgeTemplate(currItems));
                
                // Add longpress listener to fridge items to ask if the user wants to delete them
                // or potentially inform them they don't own the item
                for(var item in currItems) {
                    $('#' + item._id).longpress(function () {
                        //TODO: write re.controller.deleteFridgeItem()
                        //re.controller.deleteFridgeItem();
                        
                        re.controller.editFridgeItem(item);
                    });
                }
            }
        });
        
        // Initialize tabs
        $(document).ready(function(){
            $('ul.tabs').tabs();
        });
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered chores view.
    */
    function renderChoreView() {
        $('.page-title').html('Chores');
        $('.page').html(choreTemplate());
    }
    
        /**
    * Sets the HTML value of the injectable page area to the rendered chores view.
    */
    function renderAccountView() {
        $('.page-title').html('Account Details');
        $('.page').html(accountTemplate());
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered facebook login view.
    * This view should only be shown to users for whom we do not yet have a user (FB) id number.
    */
    function renderFacebookLoginView() {
        $('.page').html(facebookLoginTemplate());
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered group joining/creation view.
    * This view should only be shown to users for whom we do not yet have a group id number.
    */
    function renderGroupLoginView() {
        $('.page').html(groupLoginTemplate());
    }
    
    /**
    * Renders the correct view for the injectable area of the viewport.
    * Uses the current hash of the URL to determine which view should be
    * rendered, then calls the appropriate rendering function. The default
    * view to be rendered is dependent on whether or not we have a user
    * and group ID for the current user (will either default to FB login page,
    * group login page, or feed view depending on which IDs we need for the user).
    */
    function route() {
        var hash = window.location.hash;
        console.log(hash);
        var u_id = window.localStorage.getItem('user_id');
        var g_id = window.localStorage.getItem('group_id');
        console.log("routing, hash= " + hash + ", user id: " + u_id +
                    ", group id: " + g_id);
        console.log(!null);
        console.log(!u_id);
        console.log(typeof u_id);
        if (!u_id || hash == "#fb") {
            renderFacebookLoginView();
        } else if ((!g_id) || hash == "#gl") {
            renderGroupLoginView();
        } else if (hash == "#feed") {
            renderFeedView();
        } else if (!hash || hash == "#list") { 
            console.log("Here!");
            renderListView();
        } else if (hash == "#fridge-mine") {
            renderFridgeView(false);
        } else if (hash == "#fridge-shared") {
            renderFridgeView(true);
        } else if (hash == "#reservations") {
            renderSchedulerView(re.controller.reservation_items);
        } else if(hash == "#account"){
            renderAccountView();
        } else {
            alert("routing to unknown location");
        }
    }
    
    /** Call the load function of re.templates, compiling the HTML templates
     * for all existing views.  When load finishes, set the values of the
     * template variables to store the appropriate compiled templates. Finally,
     * route the viewport to the correct view based on the current hash.
     */
    function init() {
        console.log("called render.init");
        re.templates.load(["Feed", "List", "Fridge", "Reservations", "Chores",
                           "FacebookLogin", "GroupLogin", "Account"]).done(function () {
            feedTemplate = re.templates.get("Feed");
            listTemplate = re.templates.get("List");
            fridgeTemplate = re.templates.get("Fridge");
            scheduleTemplate = re.templates.get("Reservations");
            choreTemplate = re.templates.get("Chores");
            facebookLoginTemplate = re.templates.get("FacebookLogin");
            groupLoginTemplate = re.templates.get("GroupLogin");
            accountTemplate = re.templates.get("Account");
            // Attach an event listener to route to the proper view
            // when the hash of the URL is changed.
            window.onhashchange = route;
            route();
        });   
    }
    
    // Return the public API of re.render, only making the
    // following functions from this file visible to the other
    // modules.
    return {
        'init': init,
        'route': route,
        'renderLoginView': renderFacebookLoginView,
        'renderFeedView': renderFeedView,
        'renderListView': renderListView,
        'renderFridgeView': renderFridgeView,
        'renderSchedulerView': renderSchedulerView,
        'renderAccountView': renderAccountView
    };
})();