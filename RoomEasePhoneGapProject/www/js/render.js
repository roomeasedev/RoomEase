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
        $('.page-title').html("");
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
            renderFridgeView(true, true);
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
        'route': route
    };
})();
