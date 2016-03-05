describe("Reservation Controller Suite", function(){
        window.location.hash = "reservations";
        window.localStorage.setItem('group_id', "089d6e77903ccfb44b5bcad1f732caf6");
        window.localStorage.setItem('user_id', "35668452");


    it("Make new reservation popup", function(){
        $(".page").remove();
        window.location.hash = "reservations";
        window.localStorage.setItem('group_id', "089d6e77903ccfb44b5bcad1f732caf6");
        window.localStorage.setItem('user_id', "35668452");
        var finished = false;
        re.templates.load(['Reservations']).done(function(){
            template = re.templates.get('Reservations');
            $("body").append("<div class='page'></div>");
            $('.page').html($.parseHTML(template()));
            var addButton = $("#new-reservation-btn");
            addButton.trigger("click");
            var popupDisplay = $('.popupBackground').css('display');
            expect(popupDisplay).toEqual("block");
            $(".page").html('');
            finished = true;

        });
        
        
        waitsFor(function(){
			return finished;
		}, "Failed to add test user to group", 10000);
    });
    
    
    it("Add new reservation", function(){
        var finished = false;
        re.templates.load(['Reservations']).done(function(){            
            var addButton = $("#new-reservation-btn");
            addButton.trigger("click");
            popupDisplay = $('#background1').css('display');
            expect(popupDisplay).toEqual("block");
            
            
            var now = new Date();

            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);
            var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
            $('#start-date').val(today);
            $("#start-time").val("21:22");
            $("#reservation-minutes").val("1");
            $("#reservation-hours").val("1");
            $("#create-done").trigger("click");
            finished = true;
        });
        
        waitsFor(function(){
            
            //Note: Since the new type is added async, we have to wait for the callback to finally occur for it to be added to the dropdown
            var allResItems = $(".all-reservation-items");
			return finished && allResItems.size() == 1;
		}, "Failed to add test user to group", 10000);
    });
    
        
    it("Add second reservation", function(){
        var finished = false;
        re.templates.load(['Reservations']).done(function(){            
            var addButton = $("#new-reservation-btn");
            addButton.trigger("click");
            popupDisplay = $('#background1').css('display');
            expect(popupDisplay).toEqual("block");
            
            
            var now = new Date();

            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);
            var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
            $('#start-date').val(today);
            $("#start-time").val("23:22");
            $("#reservation-minutes").val("1");
            $("#reservation-hours").val("1");
            $("#create-done").trigger("click");
            finished = true;
    });
        
        waitsFor(function(){
            
            //Note: Since the new type is added async, we have to wait for the callback to finally occur for it to be added to the dropdown
            var allResItems = $(".all-reservation-items");
			return finished && allResItems.size() == 2;
		}, 10000);
    });
    
    it("Delete reservation", function(){
        var finished = true;
        $(".all-reservation-items").each(function(index){
            //Only select the first item for deletion
            if(index == 0){ 
                re.reserveController.editReservationItem(this.id);
                $('#delete-delete').trigger('click');
                finished = true;
           } 
        });
        
        waitsFor(function(){
            
            //Note: Since the new type is added async, we have to wait for the callback to finally occur for it to be added to the dropdown
            var allResItems = $(".all-reservation-items");
            if(finished && allResItems.size() == 1){
                $(".page").html('');
                return true;
            } else {
                return false;
            }
			
		}, "Failed to add test user to group", 10000);
    });        
});