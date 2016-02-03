// Define a global object, re, on which other namespaces
// will be created.
var re = {};

$(document).ready(function () {
    
    "use strict";
    console.log("test");
    var feedTemplate, listTemplate;
    
    function renderListView() {
        $('.page').html(listTemplate());
    }
    
    function renderFeedView() {
        $('.page').html(feedTemplate());
    }
    
    // Renders the correct view by the value of the
    // hash of the URL.
    function route() {
        var hash = window.location.hash;
        var match;
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
    
    $('button').on('click', function(e) {
        //console.log(window.location.hash);

    });
    
    re.templates.load(["Feed", "List"]).done(function () {
        feedTemplate = re.templates.get("Feed");
        listTemplate = re.templates.get("List");
        route();
    })
});