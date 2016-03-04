/**
 * re.reserveController is a module that contains 
 */

re.reserveController = (function() {
    
    var filterValue = "All";
    var currentReservationitems = [];
    var currentTypes = ["All"];
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
    
    /**
     * Function to add a new reservation item to the database, using the input
     * fields of the current popup.
     * @return {boolean} true if the item was added, false if there was some
     *     input preventing the reservation item from being added (empty or
     *     invalid field, or time conflict)
     */
    function addReservation() {
        setFilterValue($("#new-reservation-dropdown").find(":selected").text());
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
    
    /**
     * Extend JS Date objects to be able to display a string representing their day of the week
     * and month name.
     */
    function setDateMessages() {
        var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];

        var months = 
            ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sep.','Oct.','Nov.','Dec.'];

        Date.prototype.getMonthName = function() {
            return months[ this.getMonth() ];
        };
        Date.prototype.getDayName = function() {
            return days[ this.getDay() ];
        };
    }
    
    /**
     * Formats the given date object into a string of the form "HH:MM am" or "HH:MM pm",
     * with HH <= 12.
     * @param {Date} date   The date object to be formatted into a string
     * @param {string}      The formatted string corresponding to the given Date object
     */
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    
    /**
     * Attempt to render the reservation items on the user's screen, by first grabbing the user ID
     * to user name map for the current group.
     * @param {boolean} isSuccess   Whether the attempt to get the uID to user names map succeeded
     * @param {uidMap} uidMap   The map of user IDs to user names for the user's group, or null
     *     if the request for the uidMap was unsuccessful
     * @param {string} error    An message describing an error when getting the uidMap, or null if 
     *     no error occurred
     */
    function prepareRender(isSuccess, uidMap, error) {
        // Now that we have the uid to user name map, get the reservation items to render
        re.requestHandler.getAllItemsOfType('reservation', renderItems);
    }
    
    /**
     * Renders the given reservation items onto the page for the user, then hides the loading
     * icon and attaches the correct listeners.
     * @param {Array<Object>} reservations  The list of reservation objects to be considered
     *     for rendering
     * @param {string} error    A message describing the error when grabbing the reservation
     *     items, or null if no error occurred
     */
    function renderItems(reservations, error){
        // In case of error, indicate that something went wrong and unlock the loading icon
        // so user can try again.
        if(error){
            $("#loading-icon").css("display", "none");
            Materialize.toast("An error has occurred, please try again.", 2000);
        } else {
            currentReservationitems = reservations;

            // Format the reservations so they can be displayed properly
            reservations = getFilteredReservations(reservations);
            reservations = getFormattedReservations(reservations);
            //TODO: Make it so we use reservation_dictionary to aggregate all of the 
             //Reservations based off of what they are
            $('.page').html(reservationTemplate(formattedReservations));
            $("#loading-icon").css("display", "none");
            re.reserveController.refreshFilterReservations();

            //Add listener for longclick
            for (var i in reservations) {
                (function(reservation){
                    $('#' + reservation._id).longpress(function () {
                       if(reservation.uid == window.localStorage.getItem("user_id")) {
                           re.reserveController.deleteReservation(reservation._id);
                       } else {
                           Materialize.toast("You can't delete someone else's reservation", 2000);
                       }
                    });
                })(reservations[i]);
            }
        }
    }
    
    /**
     * Given an array of reservations, returns an array of those reservations formatted so they
     * are ready to be rendered on the page.
     * @param {Array<Object>} reservations  The input list of reservations to be rendered
     * @return {Array<Object>} The formatted list of reservations which can be rendered
     */
    function getFormattedReservations(reservations) {
        var formattedReservations = [];
        // iterate through input array and format each reservation object
        for(var i = 0; i < reservations.length; i++){
            var reservationObj = {};
            var dateTuple = re.reserveController.reservationToDateObjects(reservations[i]);
            var startDateObj = dateTuple.start;
            var endDateObj = dateTuple.end;


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
                formattedReservations.push(reservationObj);              
            } else {
                //TODO: Delete that reservation from the DB
                formattedReservations.push(reservationObj);              
            }
        }

        formattedReservations.sort(function(a, b){
           return a.unix_start - b.unix_start; 
        });

        //Inject the headers that go above each reservation
        var existing_header_labels = [];
        for(var i = 0; i < formattedReservations.length; i++) {
            var time_header_obj = {};
            time_header_obj['type'] = 'time';

            var now_obj = new Date();
            if(formattedReservations[i]["start_obj"].getTime() < now_obj.getTime()
                     && formattedReservations[i]["end_obj"].getTime() > now_obj.getTime()){
                time_header_obj['label'] = "Currently Active";
            } else if(formattedReservations[i]["end_obj"].getTime() < now_obj.getTime()) {
                time_header_obj['label'] = "Already Complete";
            } else if (formattedReservations[i]['start_obj'].getTime() > now_obj.getTime()) {
                time_header_obj['label'] = formattedReservations[i]['start_obj'].getMonthName() + " \ " 
                                            + formattedReservations[i]['start_obj'].getDate();

                //Append year if not this year
                if(formattedReservations[i]['end_obj'].getYear() > now_obj.getYear()) {
                     time_header_obj['label'] += ", " + formattedReservations[i]['end_obj'].getFullYear();
                }
            }

            if (existing_header_labels.indexOf(time_header_obj.label) == -1){
                formattedReservations.splice(i, 0, time_header_obj);
                existing_header_labels.push(time_header_obj.label);
                i++;
            }
        }
        return formattedReservations;
    }

    /**
     * Appends a zero to the front of a given number if it is less than 10, then returns the 
     * result as a string.
     * @param {number} number   The number to be formatted
     * @return {string} The number as a String, with a leading zero if the number is less than 10
     */
    var appendZero = function(number){
        if(number < 10) {
            return "0" + number;
        } else {
            return "" + number;
        }
    }
    
    /**
     * Gets the reservations of the current filter type
     * @param  {Array<Object>} reservations  List of all reservations to be filtered
     * @return {Array<Object>}              List of reservations of current filter type
     */
    function getFilteredReservations(reservations) {
        var displayedReservations = [];
        if(filterValue == "All") {
            displayedReservations = reservations;
        } else {
            for(var i = 0; i < reservations.length; i++) {
                if(reservations[i].name_of_item == filterValue) {
                    displayedReservations.push(reservations[i]);
                }
            }
        }
        return displayedReservations;
    }
       
    /**
     * Brings user back to whatever main module screen they're on hiding the current popup
     * @param {String} containerId  Id specifying which popup shouold be hidden
     */
    function hidePopup(containerId) {
        $('#new-reservation-btn').css('display', 'block');
        $(containerId).css('display', 'none');
        $("#reservation-create-error-text").css("display", "none");
    }
    
    /**
     * Brings up the popup to allow the user to delete one of their own resevations
     * @param {String} resrevationId    Id of the reservation to be deleted.
     */
    function deleteReservation(reservationId) {
        $('#background2').css('display', 'block');
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
     * Adds a new type of reservation to the dropdown list and sets the current filter to that type.
     * @param  {String} type     Name of new type of reservation to be added
     * @return {boolean}        True if type was successfully added, false otherwise
     */
    function addTypeToList(type) {
        var typeExists = false;
        for(var i = 0; i < currentTypes.length; i++) {
            if(currentTypes[i].toLocaleLowerCase() === type.toLocaleLowerCase()) {
                typeExists = true;
            }
        }
        
        if(!typeExists) {
            currentTypes.push(type);
            setFilterValue(type);
        }
        return !typeExists;
    }
    
    /**
     * Takes a reservation and returns a tuple containging two date objects
     * representing the start and end times of the reservation.
     * @param  {Object} reservation  The reservation to be turned into date objects
     * @return {Object}             Tuple containing the two date objects of
     *                              the start and end times of the reservation
     */
    function reservationToDateObjects(reservation) {
        var dateTuple = {};
        var startDateNums = reservation.start_date.split("-");
        var hours = parseInt(reservation.hours);
        var minutes = parseInt(reservation.minutes);
        var startTimeNums = reservation.start_time.split(":");

        var startDateObj = new Date(
                                    parseInt(startDateNums[0]), 
                                    parseInt(startDateNums[1]) - 1,
                                    parseInt(startDateNums[2]),
                                    parseInt(startTimeNums[0]),
                                    parseInt(startTimeNums[1]));

        var endDateObj = new Date(
                                    parseInt(startDateNums[0]),
                                    parseInt(startDateNums[1]) - 1,
                                    parseInt(startDateNums[2]),
                                    parseInt(startTimeNums[0]) + hours,
                                    parseInt(startTimeNums[1]) + minutes);
        dateTuple['start'] = startDateObj;
        dateTuple['end'] = endDateObj;
        return dateTuple;
    }
    
    /**
     * Parses the reservations of the group to find all the types of reservations
     * @return {Array<String>}  The array of the current types of reservations
     */
    function getAllTypes() {
        for(var i = 0; i < currentReservationitems.length; i++) {
           var resName = currentReservationitems[i].name_of_item; 
           if(currentTypes.indexOf(resName) == -1) {
                currentTypes.push(resName);
            }
        }
        
        //Put the filter value at the top of the array
        var indexOfFilterVal = currentTypes.indexOf(filterValue);
        if(indexOfFilterVal != -1) {
            currentTypes.splice(indexOfFilterVal, 1);
            currentTypes.unshift(filterValue);
        }
                
        return currentTypes;
    }
    
        
    /**
     * Creates the diolague to filter reservations based on their type
     */
    function refreshFilterReservations() {
        var dropdown = $("#filter-dropdown");
        dropdown.empty();
        var reservationTypes = getAllTypes();

        for(var i = 0; i < reservationTypes.length; i++) {
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
            setFilterValue(reserveName);
            re.render.route();
        });
    }
    
/****************************** PUBLIC *********************************/    

    /**
     * Sets the HTML value of the injectable page area to the rendered scheduler view.
     * @param {boolean} fullRefresh Whether or not the rendering of the page should
     *     contact the DB to get an updated set of items to display (if not, uses
     *     the locally stored lists of the items)
     */
    function render(fullRefresh) {
        // Set loading icon to display so user knows we are processing
        $("#loading-icon").css("display", "block");
        $('.page-title').html('Reservations');
        
        setDateMessages();
                
        // Get the name map of the current group so we can display who owns each reservation.
        // Then, the callback for that request will render the reservation items.
        re.requestHandler.getUidToNameMap(window.localStorage.getItem("group_id"), prepareRender);
    }
    
    /**
     * Brings up the popup to add a new reservation of the current filter type.
     */
    function makeNewReservation(){
        if(currentTypes.length == 1) {
            addNewReservationType();
        } else {
            $('#name').val('');
            $('#background1').css('display', 'block');
            $('#create-done').off();
            var dropdown = $("#new-reservation-dropdown");
            dropdown.empty();

            if(filterValue != "All") {
                dropdown.append(
                      $("<option></option>")
                        .attr("reservationName", filterValue)
                        .text(filterValue));
            }

            var reservationTypes = getAllTypes();
            for(var i = 0; i < reservationTypes.length; i++) {
                if(!(reservationTypes[i] == filterValue || reservationTypes[i] == "All")) {
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
    
    /**
     * Reads the user input and adds a new type of reservation or prompts
     * the user for input if the entry field was blank.
     */
    function addNewReservationType() {
        $('#background3').css('display', 'block');
        
        $("#add-new-reservation-type-btn").click(function() {
            var newType = $("#add-new-reservation-type-text").val().trim();
            if(newType != '') {
                if(addTypeToList(newType)) {
                    hidePopup('#background3');
                    makeNewReservation();
                } else {
                    Materialize.toast("Similar reservation type already exists.", 2000); 
                }
            } else {
                Materialize.toast("Please enter a type", 2000);
            }
        });
        
        $('#add-new-reservation-type-btn-cancel').click(function() {
            hidePopup('#background3');
        });
    }
    
    /**
     * Sets filterValue to a new filter
     * @param {String} newFilter    The new filter to which filterValue is being set
     */
    function setFilterValue(newFilter) {
        filterValue = newFilter;
    }
    
    // Return the public API of the controller module,
    // making the following functions public to other modules.
	return {
        'render': render,
        'makeNewReservation': makeNewReservation,
        'addNewReservationType': addNewReservationType,
        'setFilterValue':setFilterValue
	}
})();