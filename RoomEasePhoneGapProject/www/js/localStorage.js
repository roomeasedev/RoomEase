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

    /*
        precondition:   all fields are appropriatly filled
        postcondition:  the data within the fields have been stored
                        saved into local storage as an Item object
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

    /*
        precondition:   none
        postcondition:  prints all the stored items into the textarea
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

    /*
        precondition:  none
        postcondition: all data have been cleared from local storage
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

    return {
        'store': store,
        'show': show,
        'clear': clear
    }
})();