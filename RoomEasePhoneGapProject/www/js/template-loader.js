"use strict";
/**
* re.templates is a module which compiles the HTML templates for each of the views
* of the application.  It stores the compiled templates and allows the main page to
* get the compiled templates from re.template's storage.
* @return {Object} An object representing re.templates, which has a "load" and "get"
*     function. Load allows a client to compile a template of the given name(s), while
*     get allows a client to retrieve the compiled template they specify, provided it
*     was already loaded by calling the load function.
*/
re.templates = (function () {
    /**
    * Representation invariant: templates is defined and != null
    *   and for each <name> passed as an argument to load for which
    *   there is a valid <name>.html file, templates[<name>] = the
    *   HTML template compiled from <name>.html
    */
    var templates = {}; 
    
    /**
    * Loads the templates with the given filenames.  Compiles them using
    * HandlebarsJS so they are ready to be displayed when the client calls
    * the get function on a particular template.
    * @param {Array} templateNames an array of names, where each name is a string for
    *     which there is a valid <name>.html file in the templates directory
    */
    var load = function(templateNames) {
        var deferred = [];
    
        $.each(templateNames, function(index, templateName) {
            deferred.push($.get('templates/' + templateName + '.html', function (text) {
                templates[templateName] = Handlebars.compile(text);
                }, 'html'));
            });
        
        return $.when.apply(null, deferred);
    };
    
    /**
    * Get returns the compiled HTML template that was loaded from the specified
    * file name (templates/<name>.html).
    * @param {String} name the name of the compiled template the client is requesting.
    * @return {String} the compiled template for the given template name, or undefined
    *     if the client has not yet called load with the given name as an argument
    */
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