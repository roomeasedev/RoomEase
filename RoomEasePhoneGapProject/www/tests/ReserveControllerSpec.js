describe("Reservation Controller Suite", function(){
    it("Make new reservation", function(){
        
    });
    
    it("Edit reservation", function(){
        beforeEach(function(){
            re.templates.load(['List']).done(function(){
                template = re.templates.get('List');
                console.log("Foo!");
                console.log(template);
            });
            
        });
    });
});