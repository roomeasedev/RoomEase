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
    var accountTemplate;
    var groupMakeJoinTemplate;
    var groupMakeTemplate;
    var groupJoinTemplate;
    var quickAdd = false;
    
    /**
    * Sets the HTML value of the injectable page area to the rendered list view.
    * @param {boolean} fullRefresh Whether or not the rendering of the page should
    *     contact the DB to get an updated set of items to display (if not, uses
    *     the locally stored lists of the items)
    */
    function renderListView(fullRefresh) {
        $('.page-title').html('List');
        /* Gets all lists from database and renders the list view with these
        *  lists embedded.
        */
        re.requestHandler.getAllItemsOfType('list', function(allLists, error) {
            $("#loading-bar").css("display", "none");
            if(allLists == null) {
                console.log(error);
            } else {
                $('.page').html(listTemplate(allLists));
               
                //Add listener for longclick
                for (var i in allLists) {
                    var list = allLists[i];
                    re.listController.list_items[list._id] = list; 
                    (function (current) {
                        $('#' + current._id).longpress(function() {
                            re.listController.editList(current._id);
                        })
                    })(list);
                }
            }
             $('#list-tiles').xpull({
                'paused': false,  // Is the pulling paused ?
                'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                'callback':function(){
                    re.render.route();
                }
            });
            
            // Show add item popup if being rendered from quickAdd shortcut
            if(quickAdd) {
                re.listController.makeNewList();
                quickAdd = false;
            }
            
            $("#loading-bar").css("display", "none");
        });
    }

    /**
    * Sets the HTML value of the injectable page area to the rendered scheduler view.
    * @param {boolean} fullRefresh Whether or not the rendering of the page should
    *     contact the DB to get an updated set of items to display (if not, uses
    *     the locally stored lists of the items)
    */
    function renderSchedulerView(fullRefresh) {
        $(".page").on("end.pulltorefresh", function (evt, y){
            if(window.location.hash == "#reservations"){
                console.log("refresh!");
                route();
            } else {
                console.log(window.location.hash);
            }
        });


        $('.page-title').html('Reservations');
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
        
        
        re.requestHandler.getAllItemsOfType('reservation', function(reservations, error){
            $("#loading-bar").css("display", "none");
            if(error){
                alert("Failed to fetch data.")
            } else {
            
                re.reserveController.updateCurrentReservationItems(reservations);

                //Convert the date-time reservations int0 a more readable format

                reservations = re.reserveController.getFilteredReservations(reservations);
                var date_time_reservations = [];
                for(var i = 0; i < reservations.length; i++){
                    var reservationObj = {};
                    var dateTuple = re.reserveController.reservationToDateObjects(reservations[i]);
                    var startDateObj = dateTuple.start;
                    var endDateObj = dateTuple.end;


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
                    reservationObj['user'] = re.requestHandler.getLocalUserIdsToNames()[reservations[i].uid];                
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

                //TODO: Make it so we use reservation_dictionary to aggregate all of the 
                 //Reservations based off of what they are
                $('.page').html(scheduleTemplate(date_time_reservations));
               re.reserveController.refreshFilterReservations();

                //Add listener for longclick
                for (var i in reservations) {
                    (function(reservation){
                        $('#' + reservation._id).longpress(function () {
                           if(reservation.uid == window.localStorage.getItem("user_name")) {
                               re.reserveController.editReservationItem(reservation._id);
                           } else {
                               Materialize.toast("You can't delete someone else's reservation");
                           }
                        });
                    })(reservations[i]);
                }
            }
             $('#reservation-tiles').xpull({
                'paused': false,  // Is the pulling paused ?
                'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                'callback':function(){
                    re.render.route();
                }
            });
            
            // Show add item popup if being rendered from quickAdd shortcut
            if(quickAdd) {
                re.reserveController.makeNewReservation();
                quickAdd = false;
            }
            
            $("#loading-bar").css("display", "none");
            });
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered feed view.
    * @param {boolean} fullRefresh Whether or not the rendering of the page should
    *     contact the DB to get an updated set of items to display (if not, uses
    *     the locally stored lists of the items)
    */
    function renderFeedView(fullRefresh) {
        $('.page-title').html('Feed');
        
        // Store fridge and reservation items separately to add longpress listeners later
        var feedItems = [];
        var fridgeItems = re.requestHandler.getAllItemsOfType("fridge_item", function(allItems, error) {
            $("#loading-bar").css("display", "none");
            for (var i = 0; i < allItems.length; i++) {
                var item = allItems[i];

                var expDate = new Date(item.expiration_date);
                var currDate = new Date();

                var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                var diffDays = Math.ceil((expDate.getTime() - currDate.getTime())/oneDay);

                /* Because of the ceiling the diffdays will almost never be 0 to
                 * account for this we set the expiration to 0 if diffdays is -1.
                 * This is in order to show the user that an item is expiring today.
                 * All other items that have expired are set to -1 simply to show the
                 * user that their food has expired.
                 */
                if(diffDays == -1) {
                    feedItems.push(re.feedController.createFeedItem(item));
                }
            }
            var reservationItems = re.requestHandler.getAllItemsOfType("reservation", function(allItems, error) {
                for (var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    
                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    var currDate = new Date();
                    var reserveTime = new Date(item.start_date);
                    reserveTime.setHours(item.start_time.substr(0, 2));
                    reserveTime.setMinutes(item.start_time.substr(3));
                    
                    if(reserveTime.getTime() - currDate.getTime() < oneDay) {
                        feedItems.push(re.feedController.createFeedItem(item));
                    }
                }
                
                $('.page').html(feedTemplate(feedItems));
                $('#feed-container').xpull({
                    'paused': false,  // Is the pulling paused ?
                    'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                    'callback':function(){
                        re.render.route();
                    }
                });
                
                // Add longpress listeners to fridge items to allow them to be removed
                for(var i in fridgeItems) {
                    (function(fridgeItem) {
                        $('#' + fridgeItem._id).longpress(function() {
                            re.feedController.removeExpiredFood(item._id, item.item);
                        });
                    })(fridgeItems[i]);
                }
                
                // Add onclick shortcut from reservation items to their corresponding area of reservation view
                for(var i in allItems) {
                    var reservation = allItems[i];
                    alert(reservation._id);
                    $('#' + reservation._id).on('click', function() {
                        window.location.hash = "#reservations";
                    });
                }
            });
      
            $("#loading-bar").css("display", "none");
        });
        
    }
    
    /**
    * Sets the HTML value of the injectable page area to the rendered fridge view.
    * @param {boolean} fullRefresh Whether or not the rendering of the page should
    *     contact the DB to get an updated set of items to display (if not, uses
    *     the locally stored lists of the items)
    * @param {boolean} shared Whether the "shared" view or the "mine" view will be rendered
    */
    function renderFridgeView(fullRefresh, shared) {
        $('.page-title').html('Fridge');
        
        var user_ids_to_names = {};

        re.requestHandler.getUidToNameMap(window.localStorage.getItem("group_id"), function(isSuccess, map, error) {
            console.log(isSuccess);
            if(isSuccess) {
				user_ids_to_names = map;
            } else {
                console.log(error);
            }
        });


        re.requestHandler.getAllItemsOfType('fridge_item', function(allItems, error) {
            $("#loading-bar").css("display", "none");
            if(allItems == null) {
                console.log(error);
            } else {                
                var currItems = [];
                // Determine which items will be displayed based on hash
                for(var i = 0; i < allItems.length; i++) {
                    var item = allItems[i];
                    item.owner = user_ids_to_names[item.owner];
                    var expDate = new Date(item.expiration_date);
                    var currDate = new Date();
                    
                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    var diffDays = Math.ceil((expDate.getTime() - currDate.getTime())/oneDay);
                    
                    /* Because of the ceiling the diffdays will almost never be 0 to
                     * account for this we set the expiration to 0 if diffdays is -1.
                     * This is in order to show the user that an item is expiring today.
                     * All other items that have expired are set to -1 simply to show the
                     * user that their food has expired.
                     */
                    if(diffDays == -1) {
                        item.expiration_date = 0;
                    } else if (diffDays < -1) {
                        item.expiration_date = -1;
                    } else {
                        item.expiration_date = diffDays;
                    }
                    
                    if(shared) {                        
                        if(item.sharable == "yes") {
                            currItems.push(item);
                        }
                    } else {
                        if(item.owner == window.localStorage.getItem("user_name")) {
                            currItems.push(item);
                        }
                    }
                }
                
                
                // Compile page and inject into .page in main html view
                $('.page').html(fridgeTemplate(currItems));
                
                // Add longpress listener to fridge items to ask if the user wants to delete them
                // or potentially inform them they don't own the item
                for(var i = 0; i < currItems.length; i++) {
                    var item = currItems[i];
                    $('#' + item._id).longpress(function () {
                        if(item.owner == window.localStorage.getItem("user_name")) {
                            re.fridgeController.removeItem(item._id, item.item);
                        } else {
                            Materialize.toast("You can't delete an item you don't own", 2000);
                        }
                    });
                }
                
                // Add options to datalist field of popup
                for(var name in re.fridgeController.fridge_names) {
                    $('#names-datalist').append('<option value=' + name.substr(0, 1).toUpperCase() + name.substr(1) + '>');
                }
                
                // Check to see if the user entered a item that was used previously
                $('#names').on('focusout', function () {
                    
                    for(var name in re.fridgeController.fridge_names) {
                        
                        if($('#names').val().toLowerCase() == name.toLowerCase()) {
                            
                            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                            var expDate = new Date();
                            expDate.setTime(expDate.getTime() + (oneDay * re.fridgeController.fridge_names[name]));
                            
                            $('#expiration').val(expDate.toISOString().substr(0, 10));
                        }
                    }
                });
                 $('#fridge-tiles').xpull({
                    'paused': false,  // Is the pulling paused ?
                    'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                    'callback':function(){
                        re.render.route();
                    }
                });
            }
            
            // Show add item popup if being rendered from quickAdd shortcut
            if(quickAdd) {
                re.fridgeController.makeNewFridgeItem();
                quickAdd = false;
            }
            
            $("#loading-bar").css("display", "none");
        });
        
        // Initialize tabs
        $(document).ready(function(){
            $('ul.tabs').tabs();
        });
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
    * Presents the HTML injection that allows a user to either make or join
    * a group after sucessfully logining in with facebook
    */
    function renderGroupMakeOrJoinView() {
       $('.page').html(groupMakeJoinTemplate());
        console.log("made gl");
    }
    
    /**
     * Allows the user to request the creation of a new group.
     * The user is given a group id and password that they will then
     * distribute among the other roommates
     */ 
    function renderGroupMakeView() {
       $('.page').html(groupMakeTemplate());
    }
    
    /**
     * Sets the HTML value of the injectable page area to the rendered group joining view.
     * This view should will be shown for users who do not have a group_id but intended on
     * joining an already created group.
    */
    function renderGroupJoinView() {
        $('.page').html(groupJoinTemplate());
    }
    
    /**
     * Set's the quickAdd boolean flag
     * @param {Boolean} flag    Value to set quickAdd to
     */
    function setQuickAdd(flag) {
        quickAdd = flag;
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
        var u_id = window.localStorage.getItem('user_id');
        var g_id = window.localStorage.getItem('group_id');
        console.log("routing: " + hash);
        
        //These are the views where we want the loading bar on
        if(hash == "#feed" || hash == "#list" || hash == "#fridge-mine" || hash == "#fridge-shared" || hash == "#reservations"){
            $("#loading-bar").css("display", "block");
        }

        if (!u_id) {
            renderFacebookLoginView();
        } else if ((!g_id) && hash == "#gl") {
            console.log("routed to gl");
            renderGroupMakeOrJoinView();
        } else if((!g_id) && hash == "#gm") {
            renderGroupMakeView();
        } else if ((!g_id) && hash == "#gj") {
            renderGroupJoinView();
        } else if (!hash || hash == "#feed") {
            renderFeedView(true);
        } else if (hash == "#list") { 
            renderListView(true);
        } else if (hash == "#fridge-mine") {
            renderFridgeView(true, false);
        } else if (hash == "#fridge-shared") {
            renderFridgeView(true);
        } else if (hash == "#reservations") {
            renderSchedulerView();
        } else if(hash == "#account"){
            renderAccountView();
        } else {
            if (g_id && (hash == "#gm" || hash == "#gj" || hash == "#gl")) {
                renderFeedView(true);
            } else if (u_id) {
                renderGroupMakeOrJoinView();
            } else {
                alert("error: routing to unkown location");
            }
        }
    }
    
    /** Call the load function of re.templates, compiling the HTML templates
     * for all existing views.  When load finishes, set the values of the
     * template variables to store the appropriate compiled templates. Finally,
     * route the viewport to the correct view based on the current hash.
     */
    function init() {
        re.templates.load(["Feed", "List", "Fridge", "Reservations", "FacebookLogin",
				"GroupJoin", "Account", "GroupMakeJoin", "GroupMake"]).done(function () {
            feedTemplate = re.templates.get("Feed");
            listTemplate = re.templates.get("List");
            fridgeTemplate = re.templates.get("Fridge");
            scheduleTemplate = re.templates.get("Reservations");
            facebookLoginTemplate = re.templates.get("FacebookLogin");
            groupJoinTemplate = re.templates.get("GroupJoin");
            groupMakeJoinTemplate = re.templates.get("GroupMakeJoin");
            groupMakeTemplate = re.templates.get("GroupMake");
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
        'renderAccountView': renderAccountView,
        'quickAdd': quickAdd,
        'setQuickAdd': setQuickAdd
    };
})();
