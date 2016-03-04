describe("List Controller suite", function() {
    
    describe("Renders current list items & brings up appropriate buttons when called to", function() {
        
    });
    
    describe("Make new list", function() {

        it("title test", function( ){
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
              
                re.listController.makeNewList();
            
                var title = $('#popupTitle').html();
                console.log("title: " + title);
                expect(title).toEqual("New List");
                $('#test').html('');
                
                templateSet = true;
            });    
            
            waitsFor(function(){
                return templateSet;
            }, "Make new list title test failed", 10000);

        });

        it("name test", function( ){
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
                
                re.listController.makeNewList();

                var name = $('#name').html();
                console.log("name: " + name);
                expect(name).toEqual("");
                $('#test').html('');
                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "Make new list name test failed", 10000);
        });

        it("popup test", function( ){
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
            
                re.listController.makeNewList();

                var buttonDisplay = $('#new-list-btn').css('display');
                var popupDisplay = $('.popupBackground').css('display');
                console.log("buttonDisplay: " + buttonDisplay);
                console.log("popupDisplay: " + popupDisplay);
                expect(buttonDisplay).toEqual("none");
                expect(popupDisplay).toEqual("block");
                $('#test').html('');
                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "Make new list name test failed", 10000);
        });

        it("cancels popup test", function( ){
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
            
                re.listController.makeNewList();
                $("#name").val("to do");
                $("#next-item").val("write more code");
                $("#next-item").val("write more code");
                
                $('#done').trigger('click');

                var buttonDisplay = $('#new-list-btn').css('display');
                var popupDisplay = $('.popupBackground').css('display');
                console.log("buttonDisplay: " + buttonDisplay);
                console.log("popupDisplay: " + popupDisplay);
                expect(buttonDisplay).toEqual("block");
                expect(popupDisplay).toEqual("none");
                $('#test').html('');
                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "Make new list name test failed", 10000);
        });
        
     });
    
//    describe("Edit list", function() {
//        var list;
//        var id = "123";
//        
//        beforeEach(function() {
//            list = {
//                "type": "list",
//                "name_of_list": "food",
//                "text": "hello",
//                "items": ["milk", "cheese"],
//                "visible_users":
//                    ["12345567878", //Hardcoding in IDs for now
//                        "124444433333"], 
//                "modifiable_users":
//                    ["12344444", //Hardcoded
//                    "1124444444"]
//            }
//        });
//        
//        it("title test", function( ){
//            var listTemplate;
//            var templateSet = false;
//            re.templates.load(["List"]).done(function () {
//                listTemplate = re.templates.get("List");
//                $("body").append("<div id='test'></div>");
//                $('#test').html($.parseHTML(listTemplate()));
//                
//                re.listController.list_items.id = id;
//                
//                re.listController.editList(id);
//            
//                var title = $('#popupTitle').html();
//                console.log("title: " + title);
//                expect(title).toEqual("Edit List");
//                $('#test').html('');
//                
//                templateSet = true;
//            });    
//            
//            waitsFor(function(){
//                return templateSet;
//            }, "Make new list title test failed", 10000);
//
//        });
//    });
    
});