// Defines a template loader which can load (compile) all templates for each
// of the main views.  re.templates is defined as an object with 2 properties,

//
re.templates = (function () {
    
    "use strict";
    
    var templates = {};  // Object to hold the compiled templates for each view
    
    /**
    * Loads the templates with the given filenames.  Compiles them using
    * HandlebarsJS so they are ready to be displayed when the client calls
    * the get function on a particular template.
    * @param arguments (JS function has an inherent arguments)
    */
    var load = function (templateNames) {
        var deferred = [];
    
        $.each(templateNames, function(index, templateName) {
            deferred.push($.get('templates/' + templateName + '.html', function (text) {
                templates[templateName] = Handlebars.compile(text);
                }, 'html'));
            });
        
        return $.when.apply(null, deferred);
    };
    
    // Gets the compiled template for the given name. 
    var get = function(name) {
        return templates[name];
    };
    
    // Returns the public API for re.templates, which is
    // a load and get function.
    return {
        load: load,
        get: get
    };

}());