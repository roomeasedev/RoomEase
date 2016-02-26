
describe("Facebook Handler suite", function() {
    var id = "0123456789";
    var name = "Nachos";
    var info = {
                    'name': name,
                    'id': id
               };

    it("Store the user name and id locally", function( ){

        re.fbHandler.moveToGroupLogin(info, null);

        waitsFor(function(){
            return true;
        }, "group login never finished", 5000);

        expect(window.localStorage.getItem('user_id')).toEqual(id);
        expect(window.localStorage.getItem('user_name')).toEqual(name);
    });
});


/*
describe("Facebook Handler suite", function() {
    
    var id = "0123456789";
    var name = "Omar AlSughayer";
    var info = {
                    'name': name,
                    'id': id
               };

    it("", function( ){
        var id = "0123456789";
        var name = "Omar AlSughayer";
        var info = {
                        'name': name;
                        'id': id;
                   };
        re.fb_handler.moveToGroupLogin(info, error);

        waitsFor(function(){
            return finished;
        }, "group login never finished", 5000);

        expect(window.localStorage.getItem('user_id')).toEqual(id);
        expect(window.localStorage.getItem('user_name')).toEqual(name);
    });
});
*/