/**
 * re.list_controller is a module that contains
 */

re.list_controller = (function() {  
    
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
     * Switches the onfocus method from the previous next-item input field to a new one
     */
    function changeFocus() {
        $('#next-item').off('focus');
        $('#next-item').attr('id', 'list-item');
        $('#list-items').append(
            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
    } 
    
    /** 
     * Takes the items in JSON list object thisList & fills in the popup items section with them
     *
     */
    function loadListItems(thisList) {
        $('#name').val(thisList.name_of_list);
        for (var i in thisList.items) {
            $('#next-item').val(thisList.items[i]);    
            changeFocus();
        }        
    }
    
    /**
     * Clears & resets elements within the document to prepare for user's actions
     */
    function setup() {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // Clear old info from popup
        $('#name').val('');
        $('#' + containerId).empty().html(
            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
        // clear old listener on done
        $('#done').off();
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
    }
    
/****************************** PUBLIC *********************************/    
    
    /** 
     * Onclick function for new list button
     *
     */
    function makeNewList() {
        setup();
        // Hide Delete button and resize Cancel and Done buttons
        $('#delete').css('display', 'none');
        $('#cancel').css('width', '49%');
        $('#done').css('width', '49%');
        
        // Adds the new list to the database when the done button is pressed
        $('#done').click(function() {
            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
            re.controller.hidePopup();
            var listName = $('#name').val();
            var listItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                listItems.push($(this).val());
            });
            var newlist = createList(listName, listItems);
            re.requestHandler.addItem(newlist, re.controller.rhAddCallback);
        });
    }
    
    /** 
     * Brings up a popup that lets user edit an existing list with id listId. 
     * User can delete the list, or edit the name & items of the list
     * @param listId: the ID of the list stored in database and localstorage
     */
    function editList(listId) {
        setup();
        // Display delete, cancel, and done buttons
        $('#delete').css('display', 'block');
        $('#cancel').css('width', '30%');
        $('#done').css('width', '30%');
        
        // ** change after refactoring into local storage
        thisList = re.controller.list_items[listId];
        loadListItems(thisList);
        
        $('#done').click(function() {
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
            re.requestHandler.updateItem(editedList, re.controller.rhUpdateCallback);
        });
        
        $('#delete').click(function() {
            re.controller.hidePopup();
            console.log("deleting list");
            re.requestHandler.deleteItem(listId, "list", re.controller.rhDelCallback);
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