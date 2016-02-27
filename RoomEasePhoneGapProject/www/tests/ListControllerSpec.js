describe("List Controller suite", function() {
    
//    function makeNewList() {
//        setup('list-items');
//        
//        //Change title of popup
//        $('#popupTitle').html('New List');
//        
//        // Hide Delete button and resize Cancel and Done buttons
//        $('#delete').css('display', 'none');
//        $('#cancel').css('width', '49%');
//        $('#done').css('width', '49%');
//        
//        // Adds the new list to the database when the done button is pressed
//        $('#done').click(function() {
//            // need to pass in name-of-list, text, items, dummy varibles for visible/modifiable users for now
//            re.controller.hidePopup();
//            var listName = $('#name').val();
//            var listItems = [];
//            var inputs = $('#list-items :input');
//            inputs.each(function() {
//                listItems.push($(this).val());
//            });
//            var newlist = createList(listName, listItems);
//            // note: right now, the following call & calls like this will work during testing only if the callback is
//            //       re.new_controller.rhAddCallback. 
//            re.requestHandler.addItem(newlist, re.controller.rhAddCallback);
//        });
//    }
//    
//    function setup(containerId) {
//        $('#new-list-btn').css('display', 'none');
//        $('.popupBackground').css('display', 'block');
//
//        // Clear old info from popup
//        $('#name').val('');
//        $('#' + containerId).empty().html(
//            '<input type="text" placeholder="Next Item" id="next-item" style="margin: 0 0 0 .75em; width: 95%"><br>'
//        );
//        // clear old listener on done
//        $('#done').off();
//
//        // Bind Focus listener to next-item
//        $('#next-item').on('focus', changeFocus);
//    }
    
    describe("Make new list", function() {
        var listTemplate;
        beforeEach(function() {
//            loadFixtures('List.html, index.html');
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
            });
            $('.page-title').html('List');
            $('.page').html(listTemplate());
            console.log($(''))
        });
        
        it("Make new list title test", function( ){
            re.list_controller.makeNewList();
            
            var title = $('#popupTitle').val();
            console.log("title: " + title);
            expect(title).toEqual("New List");
        });

        it("Make new list name test", function( ){
            re.list_controller.makeNewList();

            var name = $('#name').val();
            console.log("name: " + title);
            expect(name).toEqual('');
        });

        it("Make new list popup test", function( ){
            re.list_controller.makeNewList();

            var buttonDisplay = $('#new-list-btn').attr('display');
            var popupDisplay = $('.popupBackground').attr('display');
            console.log("buttonDisplay: " + buttonDisplay);
            console.log("popupDisplay: " + popupDisplay);
            expect(buttonDisplay).toEqual("none");
            expect(popupDisplay).toEqual("block");
        });
     });
});