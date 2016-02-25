/**
 * re.controller is a module that contains much of the UI-driven logic of the application.
 * Contains functions that are tied to various buttons and interactive elements that drive
 * events such as adding or updating database items. This modules serves as a wrapper and
 * middle man of the request handler calls, so that error handling and results from the DB
 * can be properly transferred to the front end.
 * @return {Object} the re.controller object, which has a public API containing functions
 *     for various buttons and interactive elements within the application. 
 */
// TODO: refactor controller.js into a separate, smaller controller for each module
re.controller = (function() {

    // TODO: Refactor these into a different module (localstorage)
	var list_items = {};
    var userId = window.localStorage.getItem('user_id');
    var groupId = window.localStorage.getItem("group_id");
    
    
/****************************** "PRIVATE" ****************************************/
    
    /* Callback function for database.addItem
    *is_success: True if the callback was successful, false otherwise
    *revised_item: The revised item returned by the database. Null if failed.
    *error: Describes error if error occured
     */
    function rhAddCallback(is_success, revised_item, error) {
        errorHandler(is_success, error);
        console.log(error);
    }
    
    /* Callback function for database.updateItem
     *
     */
    function rhUpdateCallback(is_success, was_deleted, updated_item, error) {
        if (is_success) {
            console.log("success");
            list_items[updated_item._id] = updated_item;
            re.render.route();
            // TODO: scroll to where the new list is
        } else {
            console.log(error);
            // let user know an error occurred and prompt them to try again
            $('.error-popup').css('display', 'block');
            $('#exit-error').click(function() {
                $('.error-popup').css('display', 'none');
            });
        }  
    }
    
    /* Callback function for database.deleteItem. Also functions as the base
     * code for callbacks that return something not used
     *
     */
    function errorHandler(is_success, error) {
        if (is_success) {
            console.log("success");
            re.render.route();
            // TODO: scroll to where the new list is
        } else {
            console.log(error);
            // let user know an error occurred and prompt them to try again
            $('.error-popup').css('display', 'block');
            $('#exit-error').click(function() {
                $('.error-popup').css('display', 'none');
            });
        }        
    }
        
    /* Creates a JSON list object with listName, & items. Used only when we want to add a new
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
    
    /* Clears the list elements from a popup
     * @param containerId The id of the text container in the popup to be emptied
     */
    function clearItems(containerId) {
        $('#name').val('');
        $('#' + containerId).empty().html(
            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
        );
    }
    
    /* Switches the onfocus method from the previous next-item input field to a new one
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
    
    /* Takes the items in JSON list object thisList & fills in the popup items section with them
     *
     */
    function loadListItems(thisList) {
        $('#name').val(thisList.name_of_list);
        for (var i in thisList.items) {
            $('#next-item').val(thisList.items[i]);    
            changeFocus();
        }        
    }
    
    function setup() {
        $('#new-list-btn').css('display', 'none');
        $('.popupBackground').css('display', 'block');
        
        // Clear old list items from popup
        clearItems('list-items');
        
        // Bind Focus listener to next-item
        $('#next-item').on('focus', changeFocus);
        
        // clear old listener on done
        
    }
    
    
/****************************** PUBLIC *********************************/    
    
    /* Onclick function for new list button
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
            hidePopup();
            var listName = $('#name').val();
            var listItems = [];
            var inputs = $('#list-items :input');
            inputs.each(function() {
                listItems.push($(this).val());
            });
            var newlist = createList(listName, listItems);
            re.requestHandler.addItem(newlist, rhAddCallback);
        });
    }
    
    /* Brings up a popup that lets user edit an existing list with id listId. 
     * User can delete the list, or edit the name & items of the list
     */
    function editList(listId) {
        setup();
        // Display delete, cancel, and done buttons
        $('#delete').css('display', 'block');
        $('#cancel').css('width', '30%');
        $('#done').css('width', '30%');
        
        thisList = list_items[listId];
        loadListItems(thisList);
        
        $('#done').click(function() {
            hidePopup();
            var updatedItems = [];
            $('#list-items :input').each(function() {
                if ($(this).val() != '') {
                    updatedItems.push($(this).val());
                }
            });
            var editedList = thisList;
            editedList.items = updatedItems;
            editedList.name_of_list = $('#name').val();
            console.log("edited list: " + JSON.stringify(editedList));
            re.requestHandler.updateItem(editedList, rhUpdateCallback);
        });
        
        $('#delete').click(function() {
            hidePopup();
            console.log("deleting list");
            re.requestHandler.deleteItem(listId, "list", errorHandler);
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