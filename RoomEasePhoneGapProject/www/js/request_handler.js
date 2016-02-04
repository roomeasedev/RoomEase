//NOTE: These should be identical to an entry that we would put into the DB
//If not, we should change these to reflect any changes in the schema

var test_chores_item = 
{
	"name_of_chore" : "Take out dishes",
	"person_performing_chore" : "1234",
	"completion_end_date" : "1454552752", //This is in UNIX time
	"on_repeat" : "true",
	"interval" : "604800" //Note that this is a week
};

var test_groups_item = 
{
	"uids" : 
		["1111",
		"2222",
		"3333"],
	"reservations":
		["1234",
		"5678",
		"7676"],
	"lists": 
		["0000",
		"4545",
		"1557"],
	"fridge_items":
		["112344",
		"12341241234213",
		"124544444"],
	"chores":
		["12342222",
		"8999999",
		"44444323423"]
}

var empty_groups_item = 
{
	"uids" : [],
	"reservations": [],
	"lists": [],
	"fridge_items" : [],
	"chores":[]
}


var test_reservations_item = {
	"name_of_item" : "TV",
	"group_num" : "1234454",
	"start_time" : "1454552752",
	"end_time" : "1454552752",
	"uid" : "1234444444"
}

var test_lists_item = {
	"name_of_list" : "Groceries",
	"text" : "Buy some cool stuff",
	"visible_users":
		["12345567878",
		"124444433333"],
	"modifiable_users":
		["12344444",
		"1124444444"]

}

var test_fridge_items_item = {
	"name" : "Blueberries",
	"group_id": "12344444",
	"expiration_date" : "111222334444",
	"owner" : "1112223335555",
	"sharable" : "yes"
}

var test_users_item = {
	"uid": "1222333334444",
	"name" : "Chevvy Mans",
	"group_num" : "12233344444"
}

function RequestHandler( ) {

	this.databases = {};
	this.init = init;
	this.init();

	//Public functions
	this.getGroupData = _getGroupData;
	this.createNewGroup = _createNewGroup;
	this.registerNewUser = _registerNewUser;
	this.addUserToGroup = _addUserToGroup;

	//Private functions
	this.__assemble_group_JSON_object = __assemble_group_JSON_object;

}

function _getGroupData(group_id) {
	console.log(group_id);
}

function init() {
	var table_names = ['chores',
					'fridge_items',
					'groups',
					'lists',
					'reservations',
					'users']
	var table_names_test = ['test_chores',
					'test_fridge_items',
					'test_groups',
					'test_lists',
					'test_reservations',
					'test_users',
					'test'] //NOTE: We want to use this table for junk entries that we do not care about
	var use_test_tables = true;
	var base_ip = 'http://40.114.43.49:5984/'

	var active_tables = table_names;

	if (use_test_tables) {
		active_tables = table_names_test;
	}

	for (var i = 0; i < active_tables.length; i++) {
		this.databases[active_tables[i]] = new PouchDB(base_ip + active_tables[i]);
	}
}


var req_handler = new RequestHandler();
req_handler.getGroupData(1234);
//req_handler.__assemble_group_JSON_object(1234);

req_handler.createNewGroup();
req_handler.registerNewUser("1234", "Matthew Mans"));
req_handler.addUserToGroup("1234", "089d6e77903ccfb44b5bcad1f700ab2f");

//This function will 
function __assemble_group_JSON_object(group_id){
	this.databases['test_groups'].get(toString(group_id))
	.then(function(response) {
		console.log(response);
	})
	.catch(function(err){
		console.log("Error: Unable to get 'groups' to error.");
		return {type:null};
	});
}


//Returns a unique ID of a new group. Returns -1 if unable ot make a group
function _createNewGroup() {
	this.databases["test_groups"].post(empty_groups_item)
	.then(function(response) {
		if (response.ok == true) {
			console.log("New group created. ID: " + response.id);
			returnVal = response.id;	
		}
	})
 	.catch(function(err){
 		console.log(err);
 	});
}

function _registerNewUser(facebook_id, name){
	this.databases["test_users"].post({
		"uid": facebook_id,
		"name": name,
		"group_num": "-1"
	})
	.then(function(response){
		console.log(response);
		return 1;
	})
	.catch(function(err){
		console.log(err);
		return - 1;
	});
}

function _addUserToGroup(user_id, group_id) {
	databases = this.databases; //This gets past some weird "this" notation issues
	databases["test_groups"].get(group_id)
	.then(function(response) {
		response.uids.push(user_id);
		console.log(response);
		return response;
	}).then(function(response){
		//Note: The 'response' from the previous call is the same as THIS response
		databases["test_groups"].post(response)
		.then(function(response){
			console.log("Updated!");
		});
	});
}



