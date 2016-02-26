/** 
* Example test suite using the Jasmine testing framework
* Include this file as a dependency in spec.html for local testing
* or for any automated testing suites
*/
describe("Facebook Handler suite", function() {
    it("has successfully loaded jQuery", function() {
        expect($).toBeTruthy();
    });
    
    it("has successfully loaded re.js", function() {
        expect(re).toBeTruthy();
    });
    
    it("can find the window", function() {
        expect(window).toBeTruthy();
    });
    
    describe("is testing template", function() {
        beforeEach(function() {
             re.templates.load(["Fridge", "List"]).done(function() {
                 // TODO: figure out how to test asynchronously so these have
                 // time to load
             });
        });
        
        it("for fridge", function() {
            var fridgeTemplate = re.templates.get("Fridge");
            expect(fridgeTemplate).toBeTruthy();
        });
        
        it("for list", function() {
            var listTemplate = re.templates.get("List");
            expect(listTemplate).toBeTruthy();        
        });
    });
});
