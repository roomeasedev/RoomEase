/**
 * re.reserve_controller is a module that contains 
 */

re.reserve_controller = (function() {
    
    var filterValue = "None";
    var currentReservationitems = [];
    var currentReservationTypes = [];
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
            'uid': window.localStorage.getItem('user_id')
        }
    }
    
    function updateCurrentReservationItems(newestReservations){
        currentReservationitems = newestReservations;
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
        var dropdown = $("#new-reservation-dropdown");
        dropdown.empty();
        var reservationTypes = getAllReservationTypes();
        for(var i = 0; i < reservationTypes.length; i++){
             dropdown.append(
              $("<option></option>")
                .attr("reservationName", reservationTypes[i])
                .text(reservationTypes[i]));
        }
        
        $('select').material_select();
        $('select').on('contentChanged', function() {
            // re-initialize (update)
            $(this).material_select();
        });
        
        // Adds the new reservation to the database when the done button is pressed
        $('#create-done').click(function() {
            re.controller.hidePopup();
            var reserveName = dropdown.find(":selected").text();
            
            //Want to filter by the new type of reservation
            filterValue = reserveName;
            var start_time = $('#start-time').val();
            var minutes = $("#reservation-minutes").val();
            var hours = $("#reservation-hours").val();
            var start_date = $("#start-date").val();            
            var newresv = createReservation(reserveName, start_time, start_date, hours, minutes);  
  
            re.requestHandler.addItem(newresv, re.new_controller.rhAddCallback);
            
        });
        
        // clears the fields in popup & closes it
        $('#create-cancel').click(function() {
            console.log("Pressed cancel!");
            $('#new-reservation-btn').css('display', 'block');
            $('.popupBackground').css('display', 'none');
            re.controller.resetButtons();
            $('#name').val('');
        });
    }
    
    //Function called when a reservation item should be edited or deleted in the Reservation template
    function editReservationItem(reservationId){
        $('.fixed-action-btn').css("display", "none");
        $('#delete-reservation-popup').css('display', 'block');
                
        $('#delete-delete').click(function() {
            $('#delete-reservation-popup').css('display', 'none');
            $('.fixed-action-btn').css("display", "block");

            re.requestHandler.deleteItem(reservationId, "reservation",
                re.controller.rhDelCallback);
            });

        $('#delete-cancel').click(function() {
            $('.fixed-action-btn').css("display", "block");
            $('#delete-reservation-popup').css("display", "none");

        });            
    }
    
    
    /**
    *Creates the diolague to filter reservations based on their type
    **/
    function refreshFilterReservations(){
        var dropdown = $("#filter-dropdown");
        dropdown.empty();
        var reservationTypes = getAllReservationTypes();
        dropdown.append(
            $("<option></option>")
            .attr("reservationName", "None")
            .text("  None").css('display', 'block')
             );
        for(var i = 0; i < reservationTypes.length; i++){
             dropdown.append(
              $("<option></option>")
                .attr("reservationName", reservationTypes[i])
                .text(reservationTypes[i]).css('display', 'block')
             );
        }
        
        $('select').material_select();
        dropdown.change(function() {
            var reserveName = dropdown.find(":selected").text();
            
            //Want to filter by the new type of reservation
            filterValue = reserveName;
            re.render.route();
        });
    }
    
    function addNewReservationTypeToList(type){
        if(currentReservationTypes.indexOf(type) == -1){
            currentReservationTypes.push(type);
        }
    }
    
    function addNewReservationType(){
        console.log("Here!");
        $("#add-new-resevation-type").css('display', 'block');
        
        $("#add-new-reservation-type-btn").click(function(){
            console.log("Change!!");
            $("#add-new-resevation-type").css('display', 'none');
            var newType = $("#add-new-resevation-type-text").val();
            if(newType != ''){
                addNewReservationTypeToList(newType);
                makeNewReservation();
                console.log("Cool!");
            } else {
                console.log("Error! Invalid new item!");
            }
        });
    }
    
    function getAllReservationTypes(){
        for(var i = 0; i < currentReservationitems.length; i++){
           var resName = currentReservationitems[i].name_of_item; if(currentReservationTypes.indexOf(resName) == -1){
                currentReservationTypes.push(resName);
            }
        }
        return currentReservationTypes;
    }
    
    function getFilteredReservations(reservations){
        var displayedReservations = [];
        if(filterValue == "None"){
                displayedReservations = reservations;
            } else {
                for(var i = 0; i < reservations.length; i++){
                    if(reservations[i].name_of_item == filterValue){
                        displayedReservations.push(reservations[i]);
                    }
                }
            }
            return displayedReservations;
        }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'makeNewReservation': makeNewReservation,
        'editReservationItem':  editReservationItem,
        'refreshFilterReservations': refreshFilterReservations,
        'getFilteredReservations': getFilteredReservations,
        'updateCurrentReservationItems':updateCurrentReservationItems,
        'currentReservationitems': currentReservationitems,
        'addNewReservationType':
        addNewReservationType
	}
})();