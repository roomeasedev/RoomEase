describe("Fridge Controller suite", function() {
    it("Shows add new fridge item popup", function() {
        var finished = false;
        var template;

        re.templates.load(['Fridge']).done(function() {
            template = re.templates.get('Fridge');
            $("body").append("<div id='test'></div>");
            $('#test').html($.parseHTML(template()));

            var addButton = $("#new-fridge-item-btn");
            addButton.trigger("click");
            var addButtonDisplay = $('#new-fridge-item-btn').css('display');
            var popupDisplay = $('.popupBackground').css('display');
            expect(addButtonDisplay).toEqual("none");
            expect(popupDisplay).toEqual("block");
            finished = true;
        });

        waitsFor(function() {
            return finished;
        }, "Failed to show popup to add new fridge item", 10000);     
    });

    it ("Prompts user to enter in fridge item name and date of expiry if left blank", function() {
        var finished = false;
        var template;

        re.templates.load(['Fridge']).done(function() {
            template = re.templates.get('Fridge');
            $("body").append("<div id='test'></div>");
            $('#test').html($.parseHTML(template()));

            $("#new-fridge-item-btn").trigger("click");
            $('#done').trigger("click");
            expect($('.popupBackground').css('display')).toEqual("block");
            expect($('.toast').css('display')).toNotEqual("none");
            finished = true;
        });

        waitsFor(function() {
            return finished;
        }, "Allows user to add invalid items to the fridge", 10000);            
    });
});