


///The users_item and the groups_item will mostly be used by ////////////////
//the back end and will not be a concern of the front end/controller/////////
var test_users_item = {
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this
	"type" : "user",	
	"uid": "1222333334444", //Generated from Facebook
	"name" : "Chevvy Mans",
	"group_num" : "12233344444" //This field will be -1 if the users item does not have an associated grouyp with them yet
}

var test_groups_item = 
{
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this
	"type": "group",
	//All of the entries in the lists should correspond to the _id field of the entries 
	//They represent
	//(For example, reservations[1] should be the id of a DB ST reservations[1] == _id)
	"uid" : 
		["1111", //These shouyld be FB IDs instead of _id ids, but this is the only exception
		"2222",  //to the rule
		"3333"],
	"reservation":
		["1234",
		"5678",
		"7676"],
	"list": 
		["0000",
		"4545",
		"1557"],
	"fridge_item":
		["112344",
		"12341241234213",
		"124544444"],
	"chore":
		["12342222",
		"8999999",
		"44444323423"]
}

var test_groups_login_info_item = {
	"_id" :"123456789",
	"_rev": "123445554353",
	"group_id": "123456789", //This will be the number of the group when it is first generated
	"group_name": "MatthewMans#1", //Unique ID for the group. Contains the Creator's name along with a random 5 digit code. Garunteed unique 
	"group_password": "12345678" //Random 8 digit password
}
//=========================================================================
//============= The items below this is what the front end will============
//===========================mainly use====================================
var test_reservations_item = {
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this
	"type": "reservation",
	"name_of_item" : "TV",
	"group_num" : "1234454", //_id of group
	"start_time" : "1454552752",
	"end_time" : "1454552752",
	"uid" : "1234444444" //FB id of the person who reserved the item
}

var test_lists_item = {
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this
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

var test_fridge_items_item = {
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this	
	"type" : "fridge_item",
	"item" : "Blueberries",
	"group_id": "12344444", //_id of group
	"expiration_date" : "111222334444", //Unix time
	"owner" : "1112223335555", //FB ID
	"sharable" : "yes" //Could have granularity(IE "yes", "no", "ask")
}

var test_chores_item = 
{
	"_id" : "123456789", //Generated by DB. All JSON objects WILL have this
	"_rev" : "123456789",  //Generated by DB. All JSON objects WILL have this
	"type" : "chore",
	"chore" : "Take out dishes",
	"chore_owner" : "1234", //FB ID
	"deadline" : "1454552752", //This is in UNIX time
	"on_repeat" : "true",
	"interval" : "604800" //Interval to repeat in seconds
};

