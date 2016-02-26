
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

    it("deletes the user and group info after logging out", function( ){

        window.localStorage.setItem('user_id', id);
        window.localStorage.setItem('group_id', id);
        window.localStorage.setItem('group_name', name);
        window.localStorage.setItem('group_password', name);

        re.fbHandler.logout(function(){});

        expect(window.localStorage.getItem('user_id')).toBeNull();
        expect(window.localStorage.getItem('group_id')).toBeNull();
        expect(window.localStorage.getItem('group_name')).toBeNull();
        expect(window.localStorage.getItem('group_password')).toBeNull();
    });

    it("invokes the callback function correctly", function( ){
        window.localStorage.setItem('user_id', id);
        window.localStorage.removeItem('test');

        re.fbHandler.logout(function( ){ window.localStorage.setItem('test', name); });
        expect(window.localStorage.getItem('test')).toEqual(name);
    });

    it("does not invoke callback function if user was not logged in", function( ){
        window.localStorage.removeItem('user_id');
        window.localStorage.removeItem('test');

        re.fbHandler.logout(function( ){ window.localStorage.setItem('test', name); });
        expect(window.localStorage.getItem('test')).toBeNull(name);
    });

    it("redirects correctly", function( ){
        window.localStorage.setItem('user_id', id);

        re.fbHandler.logout(function(){});

        expect(window.location.hash).toEqual("#fb"); 
    });

});
