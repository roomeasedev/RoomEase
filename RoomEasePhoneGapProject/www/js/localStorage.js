/*
    Omar AlSughayer 
    20/04/16
    This is a simple mckup to store items locally 
*/

"use strict";

//anonymouse function 
(function (){

    //array of all previously stored fridge items, stored locally
    var fridgeItems = window.localStorage.getItem("fridge");
    
    if(fridgeItems != null){ //parse the items list if it exists
        fridgeItems = JSON.parse(fridgeItems);
    } else { // create and store the fridge items list if it does not exist
        fridgeItems = [];
        //fridgeItems = new Array();
        window.localStorage.setItem("fridge", JSON.stringify(fridgeItems))
    }
    
    /*
        precondition:   none
        postcondition:  the STORE and SHOW buttons have been linked to their
                        respective functions
    */
    window.onload = function(){
        document.getElementById("store").onclick = store;
        document.getElementById("show").onclick = show;
        document.getElementById("clear").onclick = clear;
    }

    /*
        precondition:   all fields are appropriatly filled
        postcondition:  the data within the fields have been stored
                        saved into local storage as an Item object
    */
    function store(){

        //pull the contents of the fields
        var text = document.getElementById("text").value;
        var owner = document.getElementById("owner").value;
        var date = document.getElementById("date").value;

        //transform into a JSON object
        var item = {
                    "text":text,
                    "owner":owner,
                    "date":date,
                    "id":"0",
                    "revision":"0"
                   };

        //add the newly created Item object to the items list
        fridgeItems.push(item);
        //store the new items list over the same key, overriding the old one
        window.localStorage.setItem("fridge", JSON.stringify(fridgeItems));

        //reset the fields
        document.getElementById("text").value = null;
        document.getElementById("owner").value = null;
        document.getElementById("date").value = null;

        //update the textarea
        show();
    }

    /*
        precondition:   none
        postcondition:  prints all the stored items into the textarea
    */
    function show(){
        var allItems = "";

        for (var i = 0; i < fridgeItems.length; i++) {
            allItems += fridgeItems[i].text + " " + 
                        fridgeItems[i].owner + " " +
                        fridgeItems[i].date + "\n";
        };

        document.getElementById("area").value = allItems;
    }

    /*
        precondition:  none
        postcondition: all data have been cleared from local storage
    */
    function clear(){
        //clear all date from the local storage
        window.localStorage.clear();

        //nullify the fridge items then add them to the storage again
        fridgeItems = [];
        window.localStorage.setItem("fridge", JSON.stringify(fridgeItems))

        //erase everything from textarea
        document.getElementById("area").value = null;
    }

})();