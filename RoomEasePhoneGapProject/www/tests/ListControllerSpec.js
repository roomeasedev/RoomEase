describe("List Controller suite", function() {
    
    window.location.hash = "";
    
    describe("Add a list tests", function() {        
        it("displays & closes a popup after adding a valid list", function() {
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div class='page' id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
            
                $("#new-list-btn").trigger("click");
                expect($('#new-list-btn').css('display')).toEqual("none");
                expect($('.popupBackground').css('display')).toEqual("block");
                expect($('#name').val()).toEqual("");
                expect($('#popupTitle').html()).toEqual("New List");
                
                $("#name").val("name");
                $("#first-item").val("first item");
                $("#next-item").val("next item");
                $("#done").trigger("click");
                expect($('#new-list-btn').css('display')).toEqual("block");
                expect($('.popupBackground').css('display')).toEqual("none");
                
                $('#test').empty();                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "displays popup test failed", 100000);
        });

        it("clears new list popup when cancelled", function( ){
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div class='page' id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
            
                $("#new-list-btn").trigger("click"); 
                $('#name').html("SoMething");
                $('#first-item').val("here is a first item");
                
                $('#cancel').trigger('click');
                var buttonDisplay = $('#new-list-btn').css('display');
                var popupDisplay = $('.popupBackground').css('display');
                expect(buttonDisplay).toEqual("block");
                expect(popupDisplay).toEqual("none");
                
                $("#new-list-btn").trigger("click");
                expect($('#popupTitle').html()).toEqual("New List");
                expect($('#name').html()).toEqual("");
                expect($('#first-item').val()).toEqual("");
                
                $('#test').empty();                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "clears popup after cancel failed", 100000);
        });

        it("stops user from adding invalid lists", function() {
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div class='page' id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));
            
                $("#new-list-btn").trigger("click");                
                $("#name").val("name");
                $("#done").trigger("click");
                expect($('#new-list-btn').css('display')).toEqual("none");
                expect($('.popupBackground').css('display')).toEqual("block");
                
                $("#name").val("");
                $("#first-item").val("blah");
                $("#done").trigger("click");
                expect($('#new-list-btn').css('display')).toEqual("none");
                expect($('.popupBackground').css('display')).toEqual("block");
                
                $("#name").val("");
                $("#first-item").val("");
                $("#done").trigger("click");
                expect($('#new-list-btn').css('display')).toEqual("none");
                expect($('.popupBackground').css('display')).toEqual("block");
                
                $('#test').empty();                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "allows user to add a list with invalid fields", 100000);
        });
        
     });
    
    describe("Edit list tests", function() {
        it("displays & closes a popup after adding a valid list", function() {
            var listTemplate;
            var templateSet = false;
            re.templates.load(["List"]).done(function () {
                listTemplate = re.templates.get("List");
                $("body").append("<div class='page' id='test'></div>");
                $('#test').html($.parseHTML(listTemplate()));   
                
                var items = $('#list-item');
                
                $('#test').empty();                
                templateSet = true;
            });
            
            waitsFor(function(){
                return templateSet;
            }, "displays popup test failed", 100000);

        });        
    });
});