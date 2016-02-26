
describe("Facebook Handler suite", function() {

    // test user id, name, and info
    var id = "0123456789";
    var name = "Nachos";
    var info = {
                    'name': name,
                    'id': id
               };

    // reset user id and name before every test
    beforeEach(function() {
        window.localStorage.removeItem('user_id');
        window.localStorage.removeItem('user_name');
    });

    it("fails silently if user info wasn't initialized", function( ){

        re.fbHandler.moveToGroupLogin(null, null);

        waitsFor(function(){
            return true;
        }, "group login never finished", 5000);

        expect(window.localStorage.getItem('user_id')).toBeNull(id);
        expect(window.localStorage.getItem('user_name')).toBeNull(name);
    });


    it("Store the user name and id locally", function( ){

        re.fbHandler.moveToGroupLogin(info, null);

        waitsFor(function(){
            return true;
        }, "group login never finished", 5000);

        expect(window.localStorage.getItem('user_id')).toEqual(id);
        expect(window.localStorage.getItem('user_name')).toEqual(name);
    });

});
