/**
 * re.reserveController is a module that contains 
 */

re.reserveController = (function() {
    
    var filterValue = "All";
    var currentReservationitems = [];
    var currentReservationTypes = ["All"];
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
        return test_reservations_item = {
            "type": "reservation",
            "name_of_item" : name_of_res,
            "start_time" : start_time,
            "start_date" : start_date,
            "hours" : hours,
            "minutes" : minutes,
            'uid': window.localStorage.getItem('user_id')
        };
    }
    
    function updateCurrentReservationItems(newestReservations){
        currentReservationitems = newestReservations;
    }
    
    /**
     * Function to add a new reservation item to the database, using the input
     * fields of the current popup.
     * @return {boolean} true if the item was added, false if there was some
     *     input preventing the reservation item from being added (empty or
     *     invalid field, or time conflict)
     */
    function addReservation() {
        modifyCurrentFilterValue($("#new-reservation-dropdown").find(":selected").text());
        var reserveName = filterValue;
        //Want to filter by the new type of reservation
        var start_time = $('#start-time').val().trim();
        var minutes = $("#reservation-minutes").val().trim();
        var hours = $("#reservation-hours").val().trim();
        var start_date = $("#start-date").val().trim();
        // Check to see if input was valid, give the corresponding
        // toast error message if necessary, then return false to
        // indicate no reservation was added. The popup will not 
        // be hidden when the method returns false, the user can
        // immediately try again.
        
         if(start_date == "") {
            Materialize.toast("Please enter a valid start date", 2000);
            return false;
         }
        var digits = start_date.split("-");
        var startDateObj  = new Date(digits[0], parseInt(digits[1]) - 1, digits[2]);
        var currentNumOfDays = Math.floor((new Date().getTime())/(60 * 60 * 24 * 1000));
        var inputNumOfDays = Math.floor((startDateObj.getTime())/(60 * 60 * 24 * 1000));
        
        if(start_date == "" || inputNumOfDays < currentNumOfDays ) {
           // Allow the user to make a reservation at any time in the current date
           // (by correcting backward 24 hours). TODO: fix this logic to be more
           // accurate to the current time.
            Materialize.toast("Please enter a valid start date", 2000);
            return false;
        } else if (start_time == "") {
            Materialize.toast("Please enter a valid start time", 2000);
            return false;   
        } else if (!hours || parseInt(hours) < 0) {
            Materialize.toast("Please enter a valid duation (hours)", 2000);
            return false;
        } else if (!minutes || parseInt(minutes) < 0) {
             Materialize.toast("Please enter a valid duration (minutes)", 2000);
             return false;
        } else if (parseInt(minutes) == 0 && parseInt(hours) == 0) {
            Materialize.toast("Invalid duration of reservation", 2000);
            return false;
        }
        
        var newresv = createReservation(reserveName, start_time, start_date, hours, minutes);
        var newResTuple = reservationToDateObjects(newresv);
        var newStartTime = newResTuple.start;
        var newEndTime = newResTuple.end;
        
        // If we have passed initial checks on the input, we can verify that there are no
        // conflicts with the current reservation being added. Then we will return true or false
        // from the function to determine if the reservation was actually added.
        return re.requestHandler.getAllItemsOfType('reservation', function(reservations, error){

            var noConflicts = true;
            for(var i = 0; i < reservations.length; i++){
                var reservation = reservations[i];
                if(reservation.name_of_item == reserveName) {
                    var dateTuple = reservationToDateObjects(reservation);
                    var curResStartTime = dateTuple.start;
                    var curResEndTime = dateTuple.end;


                    // Check for time conflicts between the pending reservation and existing
                    // reservations.
                    if((newStartTime <= curResStartTime && newEndTime > curResStartTime) ||
                        (newStartTime > curResStartTime && newStartTime < curResEndTime)) {

                        //Format the conflict string so the user knows the conflicting reservation
                        var formatAMPM = function(date) {
                            var hours = date.getHours();
                            var minutes = date.getMinutes();
                            var ampm = hours >= 12 ? 'pm' : 'am';
                            hours = hours % 12;
                            hours = hours ? hours : 12; // the hour '0' should be '12'
                            minutes = minutes < 10 ? '0'+minutes : minutes;
                            var strTime = hours + ':' + minutes + ' ' + ampm;
                            return strTime;
                        }

                        var appendZero = function(number){
                            if(number < 10) {
                                return "0" + number;
                            } else {
                                return "" + number;
                            }
                        } 

                        var startDateStr = "";
                        var endDateStr = "";
                        //We only add the date to the timeline if we know that it gots over two seperate days
                        //Example: If a reservation starts at 11PM and end at 1AM
                        if(curResStartTime.getDate() != curResEndTime.getDate() ||
                            curResStartTime.getMonth() != curResEndTime.getMonth() ||
                            curResStartTime.getYear() != curResEndTime.getYear()) {

                            startDateStr += " (" + (curResStartTime.getMonth() + 1) + "/" + curResStartTime.getDate() + ")";
                            endDateStr += " (" + (curResEndTime.getMonth() + 1) + "/" + curResEndTime.getDate() + ") ";

                        }

                        var timeString = " from " 
                            + formatAMPM(curResStartTime)
                            + startDateStr 
                            + " to " 
                            + formatAMPM(curResEndTime)
                            + endDateStr; 


                        Materialize.toast("This reservation conflicts: " + timeString, 2000);
                        noConflicts = false;
                    }      
                }
            }
            
            if(noConflicts){
                $('#loading-icon').css('display', 'block');
                re.requestHandler.addItem(newresv, re.newController.rhAddCallback);
                return true;
            }
        });
    }
    
/****************************** PUBLIC *********************************/    

    /**
     * Sets the HTML value of the injectable page area to the rendered scheduler view.
     * @param {boolean} fullRefresh Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     */
    function renderReservationView(fullRefresh) {
        $("#loading-icon").css("display", "block");
        $(".page").on("end.pulltorefresh", function (evt, y){
            if(window.location.hash == "#reservations"){
                console.log("refresh!");
                route();
            } else {
                console.log(window.location.hash);
            }
        });

        $('.page-title').html('Reservations');
        //TODO: Factor out the date calculations and database calls
        (function() {
            var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];

            var months = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sep.','Oct.','Nov.','Dec.'];

            Date.prototype.getMonthName = function() {
                return months[ this.getMonth() ];
            };
            Date.prototype.getDayName = function() {
                return days[ this.getDay() ];
            };
        })();
        
        var formatAMPM = function(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
        
        re.requestHandler.getUidToNameMap(window.localStorage.getItem("group_id"), function(isSuccess, uidMap, error) {
            if(!isSuccess){
                $("#loading-icon").css("display", "none");
                console.log(error);
                //Materialize.toast("An error has occurred1, please try again.", 2000);
            } 
            re.requestHandler.getAllItemsOfType('reservation', function(reservations, error){
                if(error){
                    $("#loading-icon").css("display", "none");
                    Materialize.toast("An error has occurred2, please try again.", 2000);
                } else {

                    re.reserveController.updateCurrentReservationItems(reservations);

                    //Convert the date-time reservations int0 a more readable format

                    reservations = re.reserveController.getFilteredReservations(reservations);
                    var date_time_reservations = [];
                    for(var i = 0; i < reservations.length; i++){
                        var reservationObj = {};
                        var dateTuple = re.reserveController.reservationToDateObjects(reservations[i]);
                        var startDateObj = dateTuple.start;
                        var endDateObj = dateTuple.end;


                      var appendZero = function(number){
                            if(number < 10) {
                                return "0" + number;
                            } else {
                                return "" + number;
                            }
                        } 

                        //We only add the date to the timeline if we know that it gots over two seperate days
                        //Example: If a reservation starts at 11PM and end at 1AM
                        var startDateStr = "";
                        var endDateStr = "";

                        if(startDateObj.getDate() != endDateObj.getDate() ||
                            startDateObj.getMonth() != endDateObj.getMonth() ||
                            startDateObj.getYear() != endDateObj.getYear()) {

                            startDateStr += " (" + (startDateObj.getMonth() + 1) + "/" + startDateObj.getDate() + ")";
                            endDateStr += " (" + (endDateObj.getMonth() + 1) + "/" + endDateObj.getDate() + ") ";

                        }

                        var timeString = "" 
                                        + formatAMPM(startDateObj)
                                        + startDateStr 
                                        + " -- " 
                                        + formatAMPM(endDateObj)
                                        + endDateStr; 

                        var currentDate = new Date();


                        if(currentDate.getTime() > startDateObj.getTime() && currentDate.getTime() < endDateObj){
                            //Event currently happening
                            reservationObj["color_class"] = "reservation_happening_color"; 
                        } else if(currentDate.getTime() > endDateObj.getTime()) {
                            reservationObj["color_class"] = "reservation_happened_color"; 
                        } else {
                            reservationObj["color_class"] = "reservation_not_happened_color"; 
                        }

                        reservationObj["time"] = timeString;
                        reservationObj["title"] = reservations[i].name_of_item;
                        reservationObj["_id"] = reservations[i]._id;
                        reservationObj['start_obj'] = startDateObj;
                        reservationObj['end_obj'] = endDateObj;
                        reservationObj['user'] = uidMap[reservations[i].uid];                
                        reservationObj["unix_start"] = startDateObj.getTime();
                        reservationObj["unix_end"] = endDateObj.getTime();
                        reservationObj["type"] = "reservation";

                        //Make sure that the reservation hasn't already passed
                        //TODO: Update this so that the reservation is automatically deleted
                        if((new Date()).getTime() < endDateObj){
                            date_time_reservations.push(reservationObj);              
                        } else {
                            //TODO: Delete that reservation from the DB
                            date_time_reservations.push(reservationObj);              
                        }
                    }

                    date_time_reservations.sort(function(a, b){
                       return a.unix_start - b.unix_start; 
                    });

                    //Inject the headers that go above each reservation
                    var existing_header_labels = [];
                    for(var i = 0; i < date_time_reservations.length; i++) {
                        var time_header_obj = {};
                        time_header_obj['type'] = 'time';

                        var now_obj = new Date();
                        if(date_time_reservations[i]["start_obj"].getTime() < now_obj.getTime()
                                 && date_time_reservations[i]["end_obj"].getTime() > now_obj.getTime()){
                            time_header_obj['label'] = "Currently Active";
                        } else if(date_time_reservations[i]["end_obj"].getTime() < now_obj.getTime()) {
                            time_header_obj['label'] = "Already Complete";
                        } else if (date_time_reservations[i]['start_obj'].getTime() > now_obj.getTime()) {
                            time_header_obj['label'] = date_time_reservations[i]['start_obj'].getMonthName() + " \ " 
                                                        + date_time_reservations[i]['start_obj'].getDate();

                            //Append year if not this year
                            if(date_time_reservations[i]['end_obj'].getYear() > now_obj.getYear()) {
                                 time_header_obj['label'] += ", " + date_time_reservations[i]['end_obj'].getFullYear();
                            }
                        }

                        if (existing_header_labels.indexOf(time_header_obj.label) == -1){
                            date_time_reservations.splice(i, 0, time_header_obj);
                            existing_header_labels.push(time_header_obj.label);
                            i++;
                        }
                    }

                    //TODO: Make it so we use reservation_dictionary to aggregate all of the 
                     //Reservations based off of what they are
                    $('.page').html(scheduleTemplate(date_time_reservations));
                    $("#loading-icon").css("display", "none");
                    re.reserveController.refreshFilterReservations();

                    //Add listener for longclick
                    for (var i in reservations) {
                        (function(reservation){
                            $('#' + reservation._id).longpress(function () {
                               if(reservation.uid == window.localStorage.getItem("user_id")) {
                                   re.reserveController.editReservationItem(reservation._id);
                               } else {
                                   Materialize.toast("You can't delete someone else's reservation", 2000);
                               }
                            });
                        })(reservations[i]);
                    }
                }
                 $('#reservation-tiles').xpull({
                    'paused': false,  // Is the pulling paused ?
                    'pullThreshold':200, // Pull threshold - amount in  pixels required to pull to enable release callback
                    'callback':function(){
                        re.render.route();
                    }
                });

                // Show add item popup if being rendered from quickAdd shortcut
                if(quickAdd) {
                    re.reserveController.makeNewReservation();
                    quickAdd = false;
                }
            });
        });
    }
    
    /**
    *Function called make all of the resources visible to add a new reservation in the Reservation tremplate
    **/
    function makeNewReservation(){
        if(currentReservationTypes.length == 1) {
            addNewReservationType();
        } else {
            $('#name').val('');
            $('#new-reservation-btn').css('display', 'none');
            $('#add-new-btn').css('display', 'none');
            $('#background1').css('display', 'block');
            $('#create-done').off();
            var dropdown = $("#new-reservation-dropdown");
            dropdown.empty();

            if(filterValue != "All"){
                dropdown.append(
                      $("<option></option>")
                        .attr("reservationName", filterValue)
                        .text(filterValue));
            }

            var reservationTypes = getAllReservationTypes();
            for(var i = 0; i < reservationTypes.length; i++){
                if(!(reservationTypes[i] == filterValue || reservationTypes[i] == "All")){
                  dropdown.append(
                  $("<option></option>")
                    .attr("reservationName", reservationTypes[i])
                    .text(reservationTypes[i]));    
                }
            }

            $('select').material_select();
            $('select').on('contentChanged', function() {
                // re-initialize (update)
                $(this).material_select();
            });

            // Adds the new reservation to the database when the done button is pressed
            $('#create-done').click(function() {
                if (addReservation()) {
                    hidePopup('#background1');
                }    
            });

            // clears the fields in popup & closes it
            $('#create-cancel').click(function() {
                hidePopup('#background1');
            });
        }
    }
    
    /* Brings user back to whatever main module screen they're on (usually the onclick for a cancel button)
     *
     */
    function hidePopup(containerId) {
        $('#new-reservation-btn').css('display', 'block');
        $('#add-new-btn').css('display', 'block');
        $(containerId).css('display', 'none');
        $("#reservation-create-error-text").css("display", "none");
    }
    
    //Function called when a reservation item should be edited or deleted in the Reservation template
    function editReservationItem(reservationId){
        $('#background2').css('display', 'block');
        $('#add-new-btn').css('display', 'none');
        $('.fixed-action-btn').css("display", "none");
        $('#delete-reservation-popup').css('display', 'block');
                
        $('#delete-delete').click(function() {
            re.requestHandler.deleteItem(reservationId, "reservation",
                re.newController.rhDelCallback);
            hidePopup('#background2');
        });

        $('#delete-cancel').click(function() {
            hidePopup('#background2');
        });       
    }
    
    
    /**
    *Creates the diolague to filter reservations based on their type
    **/
    function refreshFilterReservations(){
        var dropdown = $("#filter-dropdown");
        dropdown.empty();
        var reservationTypes = getAllReservationTypes();

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
            modifyCurrentFilterValue(reserveName);
            re.render.route();
        });
    }
    
    function addNewReservationTypeToList(type){
        var reservationTypeExists = false;
        for(var i = 0; i < currentReservationTypes.length; i++){
            if(currentReservationTypes[i].toLocaleLowerCase() === type.toLocaleLowerCase()){
                reservationTypeExists = true;
            }
        }
        if(!reservationTypeExists) {
            currentReservationTypes.push(type);
            modifyCurrentFilterValue(type);
        }
        return !reservationTypeExists;
    }
    
    function addNewReservationType(){
        $('#background3').css('display', 'block');
        
        $("#add-new-reservation-type-btn").click(function(){
            var newType = $("#add-new-resevation-type-text").val().trim();
            if(newType != ''){
                var newTypeAdded = addNewReservationTypeToList(newType);
                    if(newTypeAdded){
                        hidePopup('#background3');
                        makeNewReservation();
                    } else {
                        Materialize.toast("Similar reservation type already exists.", 2000); 
                    }
            } else {
                $("#add-new-reservation-error-text").css("display", "block");
                $("#add-new-reservation-error-text").html("Error: You did not enter a type.");
            }
        });
        
        $('#add-new-reservation-type-btn-cancel').click(function() {
            hidePopup('#background3');
        }); 
        
    }
    
    function getAllReservationTypes(){
        
        for(var i = 0; i < currentReservationitems.length; i++){
           var resName = currentReservationitems[i].name_of_item; 
           if(currentReservationTypes.indexOf(resName) == -1){
                currentReservationTypes.push(resName);
            }
        }
        
        //Put the filter value at the top of the array
        var indexOfFilterVal = currentReservationTypes.indexOf(filterValue);
        if(indexOfFilterVal != -1){
            currentReservationTypes.splice(indexOfFilterVal, 1);
            currentReservationTypes.unshift(filterValue);
        }
                
        return currentReservationTypes;
    }
    
    function reservationToDateObjects(reservation){
        var dateTuple = {};
        var start_date_nums = reservation.start_date.split("-");
        var hours = parseInt(reservation.hours);
        var minutes = parseInt(reservation.minutes);
        var start_time_nums = reservation.start_time.split(":");


        var startDateObj = new Date(
                                    parseInt(start_date_nums[0]), 
                                    parseInt(start_date_nums[1]) - 1,
                                    parseInt(start_date_nums[2]),
                                    parseInt(start_time_nums[0]),
                                    parseInt(start_time_nums[1]));

        var endDateObj = new Date(
                                    parseInt(start_date_nums[0]),
                                    parseInt(start_date_nums[1]) - 1,
                                    parseInt(start_date_nums[2]),
                                    parseInt(start_time_nums[0]) + hours,
                                    parseInt(start_time_nums[1]) + minutes);
        dateTuple['start'] = startDateObj;
        dateTuple['end'] = endDateObj;
        return dateTuple;
    }
    
    function modifyCurrentFilterValue(newFilter){
        filterValue = newFilter;
    }
    function getFilteredReservations(reservations){
        var displayedReservations = [];
        if(filterValue == "All"){
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
        addNewReservationType,
        'reservationToDateObjects': reservationToDateObjects,
        'modifyCurrentFilterValue': modifyCurrentFilterValue
	}
})();