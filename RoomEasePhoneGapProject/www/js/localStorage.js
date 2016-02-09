"use strict";
/**
* re.storage is a module which stores information into the window's local storage.
* In a phonegap application, storing to window.localStorage will allow information
* to persist locally despite closing the application. This allows us to store information
* client-side on user's phones, giving us offline capabilities.
* @return {Object} An object representing re.storage, which has a "show", "store",
*     and "clear" function. Information in this object is currently tightly coupled
*     with specific DOM elements, but will be refactored to work more closely with
*     request handler.
*/
re.storage = (function () {
    //array of all previously stored fridge items, stored locally
    var fridgeItems = window.localStorage.getItem("fridge");
    var listItems = window.localStorage.getItem("list");

    if(fridgeItems != null) { //parse the items list if it exists
        fridgeItems = JSON.parse(fridgeItems);
    } else { // create and store the fridge items list if it does not exist
        fridgeItems = [];
        window.localStorage.setItem("fridge", JSON.stringify(fridgeItems))
    }
    
    if (listItems != null) {
        listItems = JSON.parse(listItems);
    } else {
        listItems = [];
        window.localStorage.setItem("list", JSON.stringify(listItems));
    }

    /**
     * Stores the information stored in relevant DOM elements on the current
     * page into local storage, in the array corresponding to the given module.
     * The data inserted by this method can be retrieved later by calling show
     * with the same parameter.
     * @param {String} module The name of the module in which we are storing
     *     the current data
     * @precondition:   all fields are appropriatly filled
     * @postcondition:  the data within the fields have been stored
     *                   saved into local storage as an Item object
     */
    function store(module){
        console.log("storing " + module);
        //pull the contents of the fields
        var collection;
        if (module == "fridge") {
            collection = fridgeItems;
        } else if (module == "list") {
            collection = listItems;
        }
        
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
        collection.push(item);
        //store the new items list over the same key, overriding the old one
        window.localStorage.setItem(module, JSON.stringify(collection));

        //reset the fields
        document.getElementById("text").value = null;
        document.getElementById("owner").value = null;
        document.getElementById("date").value = null;

        //update the textarea
        show(module);
    }

    /**
    * Loads the information stored in relevant DOM elements on the current
    * page into local storage, from the array corresponding to the given module.
    * The data loaded by this method is determined by what was given to the "store"
    * function with the same module name.
    * @param {String} module The name of the module from which we are loading
    *     the local data
    * @postcondition prints all the stored items into the textarea
    */
    function show(module){
        var items;
        if (module == "fridge") {
            items = fridgeItems;
        } else if (module == "list") {
            items = listItems;
        }
        
        var allItems = "";

        for (var i = 0; i < fridgeItems.length; i++) {
            allItems += items[i].text + " " + 
                        items[i].owner + " " +
                        items[i].date + "\n";
        };

        document.getElementById("area").value = allItems;
    }

    /**
    * Clear removes all items from the local storage of the application.
    * @postcondition all data have been cleared from local storage
    */
    function clear(){
        //clear all data from the local storage
        window.localStorage.clear();

        //nullify the fridge items then add them to the storage again
        fridgeItems = [];
        listItems = [];
        window.localStorage.setItem("fridge", JSON.stringify(fridgeItems));
        window.localStorage.setItem("list", JSON.stringify(listItems));

        //erase everything from textarea
        document.getElementById("area").value = null;
    }

    // Returns the public API for re.storage, which is
    // a store, show, and clear function.
    return {
        'store': store,
        'show': show,
        'clear': clear
    }
})();