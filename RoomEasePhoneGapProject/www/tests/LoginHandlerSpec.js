

describe("Login Handler suite", function() {
	var db_location = "http://40.114.43.49:5984/";
	var facebook_id = (Math.floor((Math.random() * 1000000000) + 1)).toString();
	var group_num = "-1";
	var name = "Matthew Mans";
	re.loginHandler.init(db_location);
	
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
		}, "Create new group never returned", 5000);
		
		runs(function(){
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
		}, "Add new user never returned", 5000);

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
		}, "Add new user never returned", 5000);

		re.loginHandler.registerNewUser(facebook_id, name, callback);
		
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
		var finished = false;

		var callback = function(is_success, already_in_grp, err){
			success = is_success;
			in_grp = already_in_grp;
			error = err;
			finished = true;
		}
		
		waitsFor(function(){
			return finished;
		}, "Add new user never returned", 5000);

		re.loginHandler.addUserToGroup(facebook_id, group_num, callback);
		
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
		var finished = false;

		var callback = function(is_success, already_in_grp, err){
			success = is_success;
			in_grp = already_in_grp;
			error = err;
			finished = true;
		}
		
		waitsFor(function(){
			return finished;
		}, "Add new user never returned", 5000);

		re.loginHandler.addUserToGroup(facebook_id, group_num, callback);
		
		runs(function(){
			expect(success).not.toBeTruthy();
			expect(in_grp).toBeTruthy();
			expect(error).not.toBeNull();
		});
	});
});

