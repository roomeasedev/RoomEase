/**
 * re.reserve_controller is a module that contains 
 */

re.reserve_controller = (function() {
    
/****************************** "PRIVATE" ****************************************/
    
    /**
     * Creates a reservation JSON object that will be added to the database.
     * name_of_res: The name of the reservation item
     * start_time: the statinf time of the reservation
     * start_date: the date that the reservation starts
     * hours: The number of hours in the reservation
     * minutes: The number of minutes in the reservation
     */
    function createReservation(name_of_res, start_time, start_date, hours, minutes){
        console.log(window.localStorage.getItem('user_id'));
        return test_reservations_item = {
            "type": "reservation",
            "name_of_item" : name_of_res,
            "start_time" : start_time,
            "start_date" : start_date,
            "hours" : hours,
            "minutes" : minutes,
            'uid': userId
        }
    }    
    
/****************************** PUBLIC *********************************/    
    
    /**
    *Function called make all of the resources visible to add a new reservation in the Reservation tremplate
    **/
    function makeNewReservation(){
        $('#name').val('');
        $('.fixed-action-btn').css("display", "none");
        $('.popupBackground').css('display', 'block');
        $('#create-done').off();
        
        // Adds the new reservation to the database when the done button is pressed
        $('#create-done').click(function() {
            re.controller.hidePopup();
            var reserveName = $('#name').val();
            var start_time = $('#start-time').val();
            var minutes = $("#reservation-minutes").val();
            var hours = $("#reservation-hours").val();
            var start_date = $("#start-date").val();            
            var newresv = createReservation(reserveName, start_time, start_date, hours, minutes);  
  
            re.requestHandler.addItem(newresv, re.controller.rhAddCallback);
            });
            
        });
    }
    
    //Function called when a reservation item should be edited or deleted in the Reservation template
    function editReservationItem(reservationId){
        $('.fixed-action-btn').css("display", "none");
        $('#delete-reservation-popup').css('display', 'block');
                
        $('#delete-delete').click(function() {
            $('#delete-reservation-popup').css('display', 'none');
            $('.fixed-action-btn').css("display", "block");

            re.requestHandler.deleteItem(reservationId, "reservation", function(is_success, was_deleted, err){
                updateReservationItems(function(isSuccess, error){
                    re.render.renderSchedulerView(re.controller.reservation_items);   
                });
            });
        });

        $('#delete-cancel').click(function() {
            $('.fixed-action-btn').css("display", "block");
            $('#delete-reservation-popup').css("display", "none");

        });            
    }
    
    /**
    *Attemptes to update the reservation_items list with what is most recent in the database
    *callback(isSuccess, error)
    *   isSuccess: True if the list was successfully updated
    *   error: null if no erro occured. Contains string describing an error that occured
    **/
    
    function updateReservationItems(callback){
        var reservations;
        console.log("Rendering schedule view");
        re.requestHandler.getAllItemsOfType('reservation', function(allReservations, error) {
            if(allReservations == null) {
                console.log("Error");
                callback(false, error);
            } else {
                console.log(allReservations);
                console.log("Success!");

                re.controller.reservation_items = allReservations;
                console.log("Reservations::::");
                console.log(allReservations);
                callback(true, null);
            }
        });
    }
    
    
    /**
    *Attemptes to update the reservation_items list with what is most recent in the database
    *ALSO rerenders the page once the list has been updated
    *callback(isSuccess, error)
    *   isSuccess: True if the list was successfully updated
    *   error: null if no erro occured. Contains string describing an error that occured
    **/
    
    function updateAndRefreshReservationItems(callback){
        updateReservationItems(function(isSuccess, error){
            re.render.route();
            callback(isSuccess, error);
        });
    }
    
    /**
    *Creates the diolague to filter reservations based on their type
    **/
    function filterReservations(){
        $('.fixed-action-btn').css("display", "none");
        $('#filter-reservation-popup').css('display', 'block');
        
        $('select').material_select();

    
        var $selectDropdown = $("#dropdownid");
        
        //Clear Contents
        $selectDropdown.empty();
        
         $selectDropdown.append(
                  $("<option></option>")
                    .attr("reservationName", "None")
                    .text("None")
                );

        var seenReservations = [];
        var reservations = re.controller.reservation_items;
        for(var i = 0; i < reservations.length; i++){
            if(seenReservations.indexOf(reservations[i].name_of_item) == -1) {
                $selectDropdown.append(
                  $("<option></option>")
                    .attr("reservationName", reservations[i].name_of_item)
                    .text(reservations[i].name_of_item)
                );
                seenReservations.push(reservations[i].name_of_item);
            }
        }
        
        
        $('select').material_select();


        $('select').on('contentChanged', function() {
            // re-initialize (update)
            $(this).material_select();
        });
        
        $('#filter-select-btn').click(function() {
            $('.fixed-action-btn').css('display', 'block');
            $('#filter-reservation-popup').css('display', 'none');
            
            var displayedReservations = [];
            var selectedValue = $selectDropdown.find(":selected").text();
            console.log("Selected value:" + selectedValue);
            if(selectedValue == "None"){
                displayedReservations = re.controller.reservation_items;
            } else {
                for(var i = 0; i < reservations.length; i++){
                    if(reservations[i].name_of_item == selectedValue){
                        displayedReservations.push(reservations[i]);
                    }
                }
            }
            
            console.log("Displayed reservations:");
            console.log(displayedReservations);
            console.log("Reservations");
            console.log(reservations);
            re.render.renderSchedulerView(displayedReservations);

        });
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'reservation_items': reservation_items,
        'makeNewReservation': makeNewReservation,
        'editReservationItem':  editReservationItem,
        'filterReservations': filterReservations
	}
})();