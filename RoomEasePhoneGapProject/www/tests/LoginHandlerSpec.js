

describe("Login Handler suite", function() {
    var db_location;
    var facebook_id;
    var group_num;
    var name;
    var group_login_name;
    var group_login_password;
    
    beforeEach(function() {
        db_location = "http://40.114.43.49:5984/";
        facebook_id = (Math.floor((Math.random() * 1000000000) + 1)).toString();
        group_num = "-1";
        name = "Matthew Mans";
        group_login_name = null;
        group_login_password = null;
        re.loginHandler.init(db_location)
    });
	
	it("Create New Group", function( ){
		
		var grp_id_val = null;
		var error_val = null;
		var finished = false;

		var callback = function(group_id, error){
			grp_id_val = group_id;
			group_num = group_id;
			error_val = error;
			finished = true;
		}

		re.loginHandler.createNewGroup(callback);

		waitsFor(function(){
			return finished;
		}, "Create new group never returned", 10000);
        
		runs(function(){
            console.log("Create new group group ID: " + grp_id_val);
			expect(grp_id_val).not.toBeNull();
			expect(error_val).toBeNull();
		});
	});

	
	it("Register new user", function() {

		var success = false;
		var error = null;
		var finished = false;
		var prev_reg = false;

		var callback = function(is_success, prevously_reg, err){
			success = is_success;
			error = err;
			prev_reg = prevously_reg;
			finished = true;
		}
		
		waitsFor(function(){
			return finished;
		}, "Add new user never returned", 10000);

		re.loginHandler.registerNewUser(facebook_id, name, callback);
		
		runs(function(){
			expect(prev_reg).not.toBeTruthy();
			expect(success).toBeTruthy();
			expect(error).toBeNull();
		});
	});


	it("Duplicate register user", function() {

		var success = false;
		var error = null;
        var firstFinished = false;
		var secondFinished = false;
		var prev_reg = false;
        
        var callback = function(is_success, prevously_reg, err) {
            firstFinished = true;
        }
        
        var callback2 = function(is_success, prevously_reg, err){
			success = is_success;
			error = err;
			prev_reg = prevously_reg;
			secondFinished = true;
		}
        runs(function(){
          re.loginHandler.registerNewUser(facebook_id, name, callback);  
        });
        
        waitsFor(function(){
			return firstFinished;
		}, "Add new user never returned", 10000);
		
        runs(function(){
            re.loginHandler.registerNewUser(facebook_id, name, callback2);
        });
            
		waitsFor(function(){
			return secondFinished;
		}, "Add new user never returned", 10000);
		
		runs(function(){
			expect(prev_reg).toBeTruthy();
			expect(success).not.toBeTruthy();
			expect(error).not.toBeNull();
		});
	});

	it("Add user to group", function() {

		var success = false;
		var in_grp = false;
		var error = null;
        var createGroupFinished = false;
		var addUserFinished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
            createGroupFinished = true;
		}   
        
        var callback = function(is_success, already_in_grp, err){
			success = is_success;
			in_grp = already_in_grp;
			error = err;
			addUserFinished = true;
		}
        
        runs(function(){
            re.loginHandler.createNewGroup(createGroupCallback);
        });
		
		waitsFor(function(){
			return createGroupFinished;
		}, "create group never returned", 10000);

        runs(function(){
		  re.loginHandler.addUserToGroup(facebook_id, group_num, callback);
        });
             
        waitsFor(function(){
			return addUserFinished;
		}, "add user never returned", 10000);
             
		runs(function(){
			expect(success).toBeTruthy();
			expect(in_grp).not.toBeTruthy();
			expect(error).toBeNull();
		});
	});

	it("Add duplicate user to group", function() {

		var success = false;
		var in_grp = false;
		var error = null;
        var createGroupFinished = false;
		var addUser1Finished = false;
        var addUser2Finished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
            createGroupFinished = true;
		}    
        
        var callback = function(is_success, already_in_grp, err) {
            if (is_success) {
                addUser1Finished = true;
            }
        }
        
		var callback2 = function(is_success, already_in_grp, err){
			success = is_success;
			in_grp = already_in_grp;
			error = err;
			addUser2Finished = true;
		}
        
        runs(function(){
            re.loginHandler.createNewGroup(createGroupCallback);
        });
		
		waitsFor(function(){
			return createGroupFinished;
		}, "Create group never returned", 10000);
        
        runs(function(){
            re.loginHandler.addUserToGroup(facebook_id, group_num, callback);
        });

        waitsFor(function(){
			return addUser1Finished;
		}, "Create group never returned", 10000);
        
        runs(function(){
            re.loginHandler.addUserToGroup(facebook_id, group_num, callback2);
        });
        
        waitsFor(function(){
			return addUser2Finished;
		}, "Create group never returned", 10000);
		
		runs(function(){
			expect(success).not.toBeTruthy();
			expect(in_grp).toBeTruthy();
			expect(error).not.toBeNull();
		});
	});

	it("Create group login info", function() {
        var createGroupFinished = false;
        var createInfoFinished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
			createGroupFinished = true;
		}
        
        var createInfoCallback = function(is_success, group_name, group_password, error){
			group_login_name = group_name;
			group_login_password = group_password;
			expect(group_login_name).not.toBeNull();
			expect(group_login_password).not.toBeNull();
			expect(error).toBeNull();
			createInfoFinished = true;
		}
        
        runs(function(){
		  re.loginHandler.createNewGroup(createGroupCallback);
        });

		waitsFor(function(){
			return createGroupFinished;
		}, "Create new group never returned", 10000);
        
        runs(function(){
            re.loginHandler.generateGroupLoginInfo(group_num, "MatthewMans", createInfoCallback);
        });
		
		waitsFor(function(){
			return createInfoFinished;
		}, "Add new user never returned", 10000);

	});

	it("Create group login info with same login token", function() {
        var createGroupFinished = false;
        var createInfo1Finished = false;
        var createInfo2Finished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
			createGroupFinished = true;
		}
        
        var createInfoCallback1 = function(is_success, group_name, group_password, error){
            if (is_success) {
                group_login_name = group_name;
                group_login_password = group_password;
                createInfo1Finished = true;
            }
		}
        
		var createInfoCallback2  = function(is_success, group_name, group_password, error){
			expect(group_login_name).not.toBeNull();
			expect(group_login_password).not.toBeNull();
			expect(error).toBeNull();

			var prev_suffix = parseInt((group_login_name.split("#"))[1]);
			var cur_suffix = parseInt((group_name.split("#"))[1]);
			expect(cur_suffix - 1).toEqual(prev_suffix);
			createInfo2Finished = true;
		}
        
        runs(function(){
		  re.loginHandler.createNewGroup(createGroupCallback);
        });

		waitsFor(function(){
			return createGroupFinished;
		}, "Create new group never returned", 10000);
        
        runs(function(){
		  re.loginHandler.generateGroupLoginInfo(group_num, "MatthewMans", createInfoCallback1);
        });
		
		waitsFor(function(){
			return createInfo1Finished;
		}, "Create first group info never returned", 10000);
        
        runs(function(){
		  re.loginHandler.generateGroupLoginInfo(group_num, "MatthewMans", createInfoCallback2);
        });
        
        waitsFor(function(){
			return createInfo2Finished;
		}, "Create first group info never returned", 10000);

	});

	it("Get group login info", function() {
        var createGroupFinished = false;
        var createInfoFinished = false;
        var getInfoFinished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
			createGroupFinished = true;
		}
        
        var createInfoCallback = function(is_success, group_name, group_password, error){
            if (is_success) {
                group_login_name = group_name;
                group_login_password = group_password;
                createInfoFinished = true;
            }
		}
               
		var getInfoCallback = function(is_success, incorrect_pwd, group_number, error){
			expect(error).toBeNull();
			expect(is_success).toBeTruthy();
			expect(incorrect_pwd).not.toBeTruthy();
			expect(group_number).toEqual(group_num);
			getInfoFinished = true;
		}
        
        runs(function(){
		  re.loginHandler.createNewGroup(createGroupCallback);
        });

		waitsFor(function(){
			return createGroupFinished;
		}, "Create new group never returned", 10000);
        
        runs(function(){
		  re.loginHandler.generateGroupLoginInfo(group_num, "MatthewMans", createInfoCallback);
        });
		
		waitsFor(function(){
			return createInfoFinished;
		}, "Create group info never returned", 10000);
        
        runs(function(){
            re.loginHandler.getGroupNumber(group_login_name, group_login_password, getInfoCallback);
        })
		
		waitsFor(function(){
			return getInfoFinished;
		}, "Get group info never returned", 10000);

	});

	it("Get group login info fail on bad passwd", function() {
        var createGroupFinished = false;
        var createInfoFinished = false;
        var getInfoFinished = false;
        
        var createGroupCallback = function(group_id, error){
			group_num = group_id;
			createGroupFinished = true;
		}
        
        var createInfoCallback = function(is_success, group_name, group_password, error){
            if (is_success) {
                group_login_name = group_name;
                group_login_password = group_password;
                createInfoFinished = true;
            }
		}
               
		var getInfoCallback = function(is_success, incorrect_pwd, group_number, error){
			expect(error).not.toBeNull();
			expect(is_success).not.toBeTruthy();
			expect(incorrect_pwd).toBeTruthy();
			expect(group_number).toBeNull();
			getInfoFinished = true;
		}
        
        runs(function(){
		  re.loginHandler.createNewGroup(createGroupCallback);
        });

		waitsFor(function(){
			return createGroupFinished;
		}, "Create new group never returned", 10000);
        
        runs(function(){
		  re.loginHandler.generateGroupLoginInfo(group_num, "MatthewMans", createInfoCallback);
        });
		
		waitsFor(function(){
			return createInfoFinished;
		}, "Create group info never returned", 10000);
        
        runs(function(){
            re.loginHandler.getGroupNumber(group_login_name,  "123434352435325232", getInfoCallback);
        })
		
		waitsFor(function(){
			return getInfoFinished;
		}, "Get group info never returned", 10000);
	});
});

