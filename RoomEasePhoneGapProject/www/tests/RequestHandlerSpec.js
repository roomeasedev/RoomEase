



describe("Request Handler suite", function() {
	var db_location = "http://40.114.43.49:5984/";
	var facebook_id = (Math.floor((Math.random() * 1000000000) + 1)).toString();
	var group_num = "-1";
	var name = "Matthew Mans";
	re.loginHandler.init(db_location);

	//Note: For this test suite to work, LoginHandlerSpec has to pass all of its tests,
	//For we want to check adding database entries to freshly made groups

	it("Group and user added properly", function( ){
	
		var new_grp_finished = false;
		var new_usr_finished = false;

		var on_new_grp = function(group_id, error){
			group_num = group_id;
			expect(error).toBeNull();
			new_grp_finished = true;
		};

		var on_registered_usr = function(is_success, previously_reg, error) {
			expect(error).toBeNull();
			expect(is_success).toBeTruthy();
			new_usr_finished = true;
		}

		re.loginHandler.createNewGroup(on_new_grp);
		re.loginHandler.registerNewUser(facebook_id, name, on_registered_usr);

		waitsFor(function(){
			return new_grp_finished && new_usr_finished;
		}, "Failed to either register new user or register new group", 10000);
	});

	it("User added to grp", function() {
		var add_usr_finished = false;

		var on_add_usr = function(is_success, already_in_grp, err){
			expect(is_success).toBeTruthy();
			expect(already_in_grp).not.toBeTruthy();
			expect(err).toBeNull();
			add_usr_finished = true;
		}

		re.loginHandler.addUserToGroup(facebook_id, group_num, on_add_usr);

		waitsFor(function(){
			return add_usr_finished;
		}, "Failed to add test user to group", 10000);
	});

	it("Initialize request handler", function(){
		var is_success = re.requestHandler.init(db_location, facebook_id, group_num);
		expect(is_success).toBeTruthy();
	});

	it("Add item", function(){

		var add_finished = false;
		var test_item = {
			"type" : "list",
			"name_of_list" : "Groceries For Tonight", 
			"text": "We need to buy these things", //Have this be a top level text item, 
			"items": ["pears", 					   //Then have these as bullet points
						"grapes", 
						"milk"],
			"visible_users":
				["12345567878", //FB IDs
				"124444433333"], 
			"modifiable_users":
				["12344444", //FB IDs
				"1124444444"]
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).toBeTruthy();
			expect(revised_item._id).not.toBeNull();
			expect(revised_item._rev).not.toBeNull();
			
			//Item should be identical to original, except with _id and _rev added.
			delete revised_item._id;
			delete revised_item._rev;
			expect(JSON.stringify(revised_item)).toEqual(JSON.stringify(test_item));
			add_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return add_finished;
		}, "Failed to properly add item.", 10000);
	});

	it("Add itentical item", function(){
				var add_finished = false;
		var test_item = {
			"type" : "list",
			"name_of_list" : "Groceries For Tonight", 
			"text": "We need to buy these things", //Have this be a top level text item, 
			"items": ["pears", 					   //Then have these as bullet points
						"grapes", 
						"milk"],
			"visible_users":
				["12345567878", //FB IDs
				"124444433333"], 
			"modifiable_users":
				["12344444", //FB IDs
				"1124444444"]
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).toBeTruthy();
			expect(revised_item._id).not.toBeNull();
			expect(revised_item._rev).not.toBeNull();
			
			//Item should be identical to original, except with _id and _rev added.
			delete revised_item._id;
			delete revised_item._rev;
			expect(JSON.stringify(revised_item)).toEqual(JSON.stringify(test_item));
			add_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return add_finished;
		}, "Failed to properly add item.", 10000);
	});


	it("Add different type of item", function(){
		var add_finished = false;
		var test_item = {
			"type" : "fridge_item",
			"item" : "Blueberries",
			"group_id": "12344444", //_id of group
			"expiration_date" : "111222334444", //Unix time
			"owner" : "1112223335555", //FB ID
			"sharable" : "yes" //Could have granularity(IE "yes", "no", "ask")
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).toBeTruthy();
			expect(revised_item._id).not.toBeNull();
			expect(revised_item._rev).not.toBeNull();
			
			//Item should be identical to original, except with _id and _rev added.
			delete revised_item._id;
			delete revised_item._rev;
			expect(JSON.stringify(revised_item)).toEqual(JSON.stringify(test_item));
			add_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return add_finished;
		}, "Failed to properly add item.", 10000);
	});

	it("Add invalid type of item", function(){
		var add_finished = false;
		var test_item = {
			"type" : "non_valid_item_type",
			"item" : "Blueberries",
			"group_id": "12344444", //_id of group
			"expiration_date" : "111222334444", //Unix time
			"owner" : "1112223335555", //FB ID
			"sharable" : "yes" //Could have granularity(IE "yes", "no", "ask")
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).not.toBeTruthy();
			expect(revised_item).toBeNull();
			expect(error).not.toBeNull();
			add_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return add_finished;
		}, "Failed to properly add item.", 10000);
	});

	it("Add null type of item", function(){
		var add_finished = false;
		var test_item = null;

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).not.toBeTruthy();
			expect(revised_item).toBeNull();
			expect(error).not.toBeNull();
			add_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return add_finished;
		}, "Failed to properly add item.", 10000);
	});


	it("Add then delete item", function(){
		var delete_finished = false;
		var test_item = {
			"type" : "fridge_item",
			"item" : "Blueberries",
			"group_id": "12344444", //_id of group
			"expiration_date" : "111222334444", //Unix time
			"owner" : "1112223335555", //FB ID
			"sharable" : "yes" //Could have granularity(IE "yes", "no", "ask")
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).toBeTruthy();
			expect(revised_item._id).not.toBeNull();
			expect(revised_item._rev).not.toBeNull();
			
			re.requestHandler.deleteItem(revised_item, on_delete);	
		}

		var on_delete = function(is_success, error){
			expect(is_success).toBeTruthy();
			expect(error).toBeNull();
			delete_finished = true;
		}

		re.requestHandler.addItem(test_item, on_add);

		waitsFor(function(){
			return delete_finished;
		}, "Failed to properly add item.", 10000);
	});

	it("Add and get multiple items", function(){
		var num_of_items_to_add = 8;
		var num_added = 0;	
		var item_ids = [];
		var got_all_items = false;
		var test_item = {
			"type": "reservation",
			"name_of_item" : "TV",
			"group_num" : "1234454", //_id of group
			"start_time" : "1454552752",
			"end_time" : "1454552752",
			"uid" : "1234444444" //FB id of the person who reserved the item
		}

		var on_add = function(is_success, revised_item, error) {
			expect(is_success).toBeTruthy();
			num_added++;
			item_ids.push(revised_item._id);
			if (num_of_items_to_add > num_added) {
				re.requestHandler.addItem(test_item, on_add);
			} else {
				re.requestHandler.getAllItemsOfType(test_item.type, on_get_items);
			}
		}

		var on_get_items = function(list_of_items, error){
			expect(list_of_items).not.toBeNull();
			expect(error).toBeNull();
			expect(list_of_items.length).toEqual(num_of_items_to_add);

			//Verify that the returned list contains the ids of all the 
			//Added JSON objects
			for (var i = 0; i < list_of_items.length; i++){
				expect(contains_id(item_ids, list_of_items[i]._id)).toBeTruthy();
			}
			got_all_items = true;
		}

		re.requestHandler.addItem(test_item, on_add);
		waitsFor(function(){
			return got_all_items;
		}, "Failed to add and retrieve multiple items.", 30000);

	});

	it("Update item", function(){
		var was_updated = false;

		var test_item = {
			"type": "reservation",
			"name_of_item" : "TV",
			"group_num" : "afadsfasdf", //_id of group
			"start_time" : "1454552752",
			"end_time" : "14545adfasdf52752",
			"uid" : "12344444adsf44a" //FB id of the person who reserved the item
		}

		var first_revision = null;

		var on_add = function(is_success, revised_item, error){
			expect(is_success).toBeTruthy();
			expect(revised_item).not.toBeNull();
			expect(error).toBeNull();
			first_revision = JSON.parse(JSON.stringify(revised_item)); //Make a deep copy
			revised_item.name_of_item = "XBOX";
			re.requestHandler.updateItem(revised_item, on_update);
		}

		var on_update = function(is_success, was_deleted, updated_item, error){
			console.log(error);
			expect(is_success).toBeTruthy();
			expect(updated_item).not.toBeNull();
			expect(error).toBeNull();
			
			expect(updated_item.name_of_item).toEqual("XBOX");
			expect(first_revision.name_of_item).toEqual("TV");
			expect(first_revision._rev).not.toEqual(updated_item._rev);
			expect(first_revision._id).toEqual(updated_item._id);
			was_updated = true;
		}

		re.requestHandler.addItem(test_item, on_add);
		waitsFor(function(){
			return was_updated;
		}, "Failed to update item", 10000);
	});

	it("Update item that has been deleted", function(){
		var was_updated = false;
		var test_item = {
			"type": "reservation",
			"name_of_item" : "TV",
			"group_num" : "afadsfasdf", //_id of group
			"start_time" : "1454552752",
			"end_time" : "14545adfasdf52752",
			"uid" : "12344444adsf44a" //FB id of the person who reserved the item
		}

		var revised_item_ref = null;
		var on_add = function(is_success, revised_item, error){
			expect(is_success).toBeTruthy();
			expect(revised_item).not.toBeNull();
			expect(error).toBeNull();
			revised_item_ref = revised_item;
			re.requestHandler.deleteItem(revised_item, on_delete);
		}

		var on_delete = function(is_success, error) {
			console.log(error);
			expect(is_success).toBeTruthy();
			expect(error).toBeNull();
			re.requestHandler.updateItem(revised_item_ref, on_update);
		}

		var on_update = function(is_success, was_deleted, updated_item, error) {
			expect(is_success).not.toBeTruthy();
			expect(was_deleted).toBeTruthy();
			expect(updated_item).toBeNull();
			expect(error).not.toBeNull();
			was_updated = true;
		}

		re.requestHandler.addItem(test_item, on_add);
		waitsFor(function(){
			return was_updated;
		}, "Failed to update item", 10000);

	});

	function contains_id(list, id) {
		for (var i = 0; i < list.length; i++) {
			if (list[i] === id) {
				return true;
			} 
		}
		return false;
	}
});