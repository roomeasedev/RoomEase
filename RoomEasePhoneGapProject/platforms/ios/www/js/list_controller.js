/**
 * re.list_controller is a module that contains the logic behind the List view of the app.
 * Contains functions that are tied to various buttons and interactive elements that drive
 * events such as adding or updating list items to the database. This modules serves as a wrapper and
 * middle man of List's request handler calls, so that error handling and results from the DB
 * can be properly transferred to the front end.
 * @return {Object} the re.controller object, which has a public API containing functions
 *     for various buttons and interactive elements within the application. 
 */

re.list_controller = (function() {  
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
     * Switches the onfocus method from the previous next-item input field to the next one
     */
    function changeFocus() {
        // Bind Focus listener to next-item only if item immediately before has been filled out
        if ($('#first-item').length || $('#prev-item').val() != '') {
            if ($('#first-item').length) {
                $('#first-item').off();
                $('#first-item').attr('id', 'prev-item');                
            } else { // previous item becomes just a list item, next becomes previous, and there's a new next
                $('#prev-item').attr('id', 'list-item');
                $('#next-item').off();
                $('#next-item').attr('id', 'prev-item');
            }
            $('#list-items').append(
                '<input type="text" placeholder="Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
            );
            $('#next-item').on('focus', changeFocus);            
        }
    } 
    
    /** 
     * Takes the items in JSON list object thisList & fills in the populates the popup with them
     * @ param: thisList: the list whose items will be put into the popup
     */
    function loadListItems(thisList) {
        $('#name').val(thisList.name_of_list);
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
        $('#next-item').on('focus', changeFocus);  
    }
    
    /**
     * Clears & resets elements within the document to prepare for user's actions
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
     * Checks to see if there is at least one non-blank item entered into the list. Returns true if there
     * is and false if not.
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
    
/****************************** PUBLIC *********************************/    
    
    /** 
     * Brings up a popup lets user add a new list to the module. Lists with no name and/or no items
     * will not be added; in such a situation, the user will be reminded of this usage.
     */
    function makeNewList() {
        setup('list-items');
        
        //Change title of popup
        $('#popupTitle').html('New List');
        
        // Hide Delete button and resize Cancel and Done buttons
        $('#delete').css('display', 'none');
        $('#cancel').css('width', '49%');
        $('#done').css('width', '49%');
        
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            if (!itemsValid() || !($('#name').val().length)) {
                Materialize.toast('Please input a name and at least one item for the list', 4000);
            } else {
                re.controller.hidePopup();
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
                //       re.new_controller.rhAddCallback. 
                re.requestHandler.addItem(newlist, re.new_controller.rhAddCallback);                
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
                re.controller.hidePopup();
                var updatedItems = [];
                $('#list-items :input').each(function() {
                    if ($(this).val() != '') {
                        updatedItems.push($(this).val());
                    }
                });
                var editedList = thisList;
                editedList.items = updatedItems;
                editedList.name_of_list = $('#name').val();
                re.requestHandler.updateItem(editedList, re.new_controller.rhUpdateCallback);                
            }
        });
        
        $('#delete').click(function() {
            re.controller.hidePopup();
            re.requestHandler.deleteItem(listId, "list", re.new_controller.rhDelCallback);
        });
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'list_items': list_items,
        'makeNewList': makeNewList,
        'editList': editList
	}
})();