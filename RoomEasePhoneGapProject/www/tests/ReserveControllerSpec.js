describe("Reservation Controller Suite", function(){
    
//    beforeEach(function(){
//        re.templates.load(['Reservations']).done(function(){
//            template = re.templates.get('Reservations');
//        
//            $("body").append("<div id='test'></div>");
//            $('#test').append(template());
//
//
//        });
//    });

    it("Make new reservation type", function(){
        var finished = false;
        re.templates.load(['Reservations']).done(function(){
            template = re.templates.get('Reservations');
            $("body").append("<div id='test'></div>");
            $('#test').html($.parseHTML(template()));
            console.log($("add-new-reservation-type-btn").children());
            finished = true;
        });
        
        
        waitsFor(function(){
			return finished;
		}, "Failed to add test user to group", 10000);

//        var button = $("#add-new-reservation-type-btn").html(template);
//        button.trigger("click");
//        var addType = $("#add-new-resevation-type").html(template);
//        console.log(addType.css("display"));
    });
    
    it("Edit reservation", function(){
    });
});