/**
 * re.listController is a module that contains the logic behind the List view of the app.
 * Contains functions that are tied to various buttons and interactive elements that drive
 * events such as adding or updating list items to the database. This modules serves as a wrapper and
 * middle man of List's request handler calls, so that error handling and results from the DB
 * can be properly transferred to the front end.
 * @return {Object} the re.listController object, which has a public API containing functions
 *     for most of the operations performed at the list view, including rendering the view
 *     on the page, adding, deleting, and modifying items
 */

re.listController = (function() {  
    var list_items = {};
    
/****************************** "PRIVATE" ****************************************/
        
    /** 
     * Creates a JSON list object with listName, & items. Used only when we want to add a new
     * list to the database
     */
    function createList(listName, items) {
        return list = {
            "type": "list",
            "name_of_list": listName,
            "text": "",
            "items": items,
            "visible_users":
                ["12345567878", //Hardcoding in IDs for now
                    "124444433333"], 
            "modifiable_users":
                ["12344444", //Hardcoded
                "1124444444"]
        }
    }
    
    /** 
     * Switches the onfocus method from the previous next-item input field to the next one.
     * This function allows us to only ever have the onFocus listener attached to one
     * input field at a time, so we don't end up with extra input fields on the list popup.
     */
    function changeFocus() {
        // Bind Focus listener to next-item only if item immediately before has been filled out
        if ($('#first-item').length || $('#prev-item').val() != '') {
            if ($('#first-item').length) {
                $('#first-item').off();
                $('#first-item').attr('id', 'prev-item');                
            } else {
                // Change ids so that the prev item becomes just a regular list item,
                // next becomes a "previous item", and then we can create a new "next item"
                $('#prev-item').attr('id', 'list-item');
                $('#next-item').off();
                $('#next-item').attr('id', 'prev-item');
            }
            // Create a new list item with id "next-item" to receive the new onfocus listener
            $('#list-items').append(
                '<input type="text" placeholder="Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
            );
            $('#next-item').on('focus', changeFocus);            
        }
    } 
    
    /** 
     * Takes the items in JSON list object thisList & populates the popup with them
     * @param {Object} thisList  The list whose items will be put into the popup, must have fields
     *     name_of_list and items (which is an array of the items in the list as strings)
     */
    function loadListItems(thisList) {
        // Set the name input field of the edit list popup
        $('#name').val(thisList.name_of_list);
        // Append each item of the list as an input text field in the edit list popup,
        // so that the menu has the entire content of the list when it is shown to the user
        for (var i = 0; i < thisList.items.length; i++) {
            if (i == 0) {
                $('#first-item').val(thisList.items[i]); 
                $('#first-item').attr('id', 'prev-item');
            } else {
                $('#prev-item').attr('id', 'list-item');
                $('#next-item').val(thisList.items[i]);
                $('#next-item').attr('id', 'prev-item');
            }
            $('#list-items').append(
                '<input type="text" placeholder="Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
            );
        }
        // ensure that the last item has an onFocus listener so that the user can add arbitrarily many
        // elements to the list
        $('#next-item').on('focus', changeFocus);  
    }
    
    /**
     * Clears & resets elements within the popup, should be called just before the popup
     * is displayed to the user. Also hides the "add new list" button and displays the popupBackground
     */
    function setup() {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // Clear old info from popup
        $('#name').val('');
        $('#list-items').empty().html(
            '<input type="text" placeholder="Item" id="first-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
        
        // clear old listener on done
        $('#done').off();
        
        // Bind Focus listener to next-item
        $('#first-item').on('focus', changeFocus);
    }
    
    /**
     * Checks to see if there is at least one non-blank item entered into the list. 
     * @return {boolean}    true if there is at least one non-blank list item, otherwise false
     */
    function itemsValid() {
        var validItem = false;
        $('#list-items :input').each(function() {
            if ($(this).val() != '') {
                validItem = true;
            }
        });
        return validItem;
    }
    
    /**
    * Renders the given list items onto the page, and attaches the necessary listeners to the list
    * items. Also contains all rendering logic that needs to happen AFTER the list items are
    * known, since this function is sometimes a callback for a database request.
    * @param {Array<Object>} allLists   The set of list items that will be rendered to the page.
    *     These may be given by a DB lookup or from the locally stored copies of the list items.
    * @param {string} error A string describing the error that occurred when looking up the list
    *     items in the DB, or null if there was no error.
    *
    */
    function renderListItems(allLists, error) {
        if(allLists == null) {
            $("#loading-icon").css("display", "none");
            console.log(error);
        } else {
            $('.page').html(listTemplate(allLists));
            $("#loading-icon").css("display", "none");

            // Add listener for longclick to each list item
            for (var i in allLists) {
                var list = allLists[i];
                re.listController.list_items[list._id] = list; 
                // wrap the assigned onlongpress function in a closure,
                // so that we have a unique environment for each fn. This
                // allows correct lookup of the "current" element for each
                // of the assigned longpress functions
                (function (current) {
                    $('#' + current._id).longpress(function() {
                        re.listController.editList(current._id);
                    })
                })(list);
            }
        }

        re.newController.assignXPull('list-tiles');

        // Show add item popup if being rendered from quickAdd shortcut
        if(re.feedController.quickAdd) {
            re.listController.makeNewList();
            re.feedController.quickAdd = false;
        }
    }
    
    /** 
     * Brings up a popup lets user add a new list to the module. Lists with no name and/or no 
     * items will be added; in such a situation, the user will be reminded of this usage.
     */
    function makeNewList() {
        setup();
        
        // Change title of popup (since popup is shared with edit list popup)
        $('#popupTitle').html('New List');
        
        // Hide Delete button and resize Cancel and Done buttons
        $('#delete').css('display', 'none');
        $('#cancel').css('width', '49%');
        $('#done').css('width', '49%');
        
        // Adds the new list to the database when the done button is pressed, or alerts
        // user that their attempted input is invalid, allowing them to try again
        $('#done').click(function() {
            if (!itemsValid() || !($('#name').val().length)) {
                Materialize.toast('Please input a name and at least one item for the list', 4000);
            } else {
                // successful case, we will add the list to the database
                re.newController.hidePopup();
                var listName = $('#name').val();
                var listItems = [];
                var inputs = $('#list-items :input');
                inputs.each(function() {
                    if ($(this).val() != '') {
                        listItems.push($(this).val());                    
                    }
                });
                var newlist = createList(listName, listItems);
                // note: right now, the following call & calls like this will work during testing only if the callback is
                //       re.newController.rhAddCallback. 
                re.requestHandler.addItem(newlist, re.newController.rhAddCallback);                
            }
        });
    }
    
    /** 
     * Brings up a popup that lets user edit an existing list with id listId. 
     * User can delete the list, or edit the name & items of the list
     * @param listId: the ID of the list stored in database and localstorage
     */
    function editList(listId) {
        setup();
        
        //Change title of popup
        $('#popupTitle').html('Edit List');
        
        // Display delete, cancel, and done buttons
        $('#delete').css('display', 'block');
        $('#cancel').css('width', '30%');
        $('#done').css('width', '30%');
        
        // ** change after refactoring into local storage
        thisList = list_items[listId];
        loadListItems(thisList);
        
        $('#done').click(function() {
            if (!itemsValid() || !($('#name').val().length)) {
                Materialize.toast('Please input a name and at least one item for the list', 4000);                
            } else {
                re.newController.hidePopup();
                var updatedItems = [];
                $('#list-items :input').each(function() {
                    if ($(this).val() != '') {
                        updatedItems.push($(this).val());
                    }
                });
                var editedList = thisList;
                editedList.items = updatedItems;
                editedList.name_of_list = $('#name').val();
                re.requestHandler.updateItem(editedList, re.newController.rhUpdateCallback);                
            }
        });
        
        $('#delete').click(function() {
            re.newController.hidePopup();
            re.requestHandler.deleteItem(listId, "list", re.newController.rhDelCallback);
    }
    
/****************************** PUBLIC *********************************/    
    
    /**
     * Sets the HTML value of the injectable page area to the rendered list view.
     * @param {boolean} fullRefresh Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     */
    function renderListView(fullRefresh) {
        $("#loading-icon").css("display", "block");
        $('.page-title').html('List');
        /* Gets all lists from database and renders the list view with these
        *  lists embedded.
        */
        
        re.requestHandler.getAllItemsOfType('list', renderListItems);
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'renderListView': renderListView,
        'list_items': list_items,
        'makeNewList': makeNewList,
        'editList': editList
	}
})();