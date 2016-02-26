describe("Controller suite", function() {
    
    // Removed this test because we don't have the chorse feature anymore   
    /* it("createChoreTest", function() {
        var choreName = "chore";
        var recurring = "everyday";
        var date = "date";
        var assigned = "assigned";
        
        var chore_item = re.controller.createChore(choreName, recurring, date, assigned);
        
        expect(chore_item[type]).toEqual("chore");
        expect(chore_item[chore_item]).toEqual(choreName);
        expect(chore_item[recurring]).toEqual(recurring);
        expect(chore_item[date]).toEqual(date);
        expect(chore_item[assigned]).toEqual(assigned);
        
        pending();
    });*/
    
    it("createFridgeItemTest", function() {
        var name = "name";
        var expiration = "date";
        var shared = true;
        
        var fridge_item = re.controller.createFridgeItem(name, expiration, shared);
        
        expect(fridge_item[type]).toEqual("food");
        expect(fridge_item[name]).toEqual(name);
        expect(fridge_item[expiration]).toEqual(expiration);
        expect(fridge_item[shared]).toEqual(shared);
        
        pending();
    });
});
    