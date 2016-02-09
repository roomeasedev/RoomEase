# RoomEase
Welcome, developers! Thanks for checking out our project! RoomEase is an
application designed to make coordination among roommates streamlined and
simple.

Developer page: http://roomeasedev.github.io/
Product page: http://roomeasedev.github.io/projectpage.html

## Obtaining Source Code:
First, ensure you have git installed. If not, run the following command:

`sudo apt-get install git-all`
 
Then, run the following command:

`git clone https://github.com/roomeasedev/RoomEase.git`

## Building From Source:

Before we do anything, run the following commands:

`sudo apt-get upgrade`

`sudo apt-get update`

`sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6`

Now, ensure you have node.js and npm installed by running the following:

`node -v`

`npm -v`

If not, run the following commands:

`sudo apt-get update`

`sudo apt-get install nodejs`

`sudo apt-get install npm`

Next, install phonegap (cordova) by running the following command:

`sudo npm install cordova -g`

*Note:* Phonegap and Cordova are for most intents and purposes, are the same platform. There was a namechange at some point in development, so sometimes cordova and phonegap  will be used interchangably. In fact, replacing any commandthat contains `cordova` with `phonegap` will yield the same results, more or less.

*Note:* Depending on the version of node, you may see the following error:

`The program ‘node’ cannot be found in the following packages`

To fix this, run the following command

`sudo ln -s /usr/bin/nodejs /usr/bin/node`

Phonegap allows us to work with and build nearly any platform you want. To add a platform to build to, at the top directory of your project (you should see a config.xml) run the following command:

`cordova platform add android`

*Note:* There may be some dependencies that are not part of cordova(phonegap) by default that need to be installed manually through npm. You may see an error such as `cannot find module <module>`. This typically can be fixed by running the following command:
`sudo npm install -g <module>`.

*Note:* Below we are building for Android, but the process is nearly identical for other platforms. We are currently only targeting Android, but in the future we will be building for IOS. That still does not mean you can't try building for IOS right now!

Now to build to android run the following command:

`cordova build android`

You may see some errors regarding not having the correct versions of the android SDK installed. These can be resolved by installing the android SDK and installing the latest SDK tools. You may also need to install the jdk by running:

`sudo apt-get install openjdk-7-jdk`

Also, you may get one of the following errors:

`Failed to find ‘ANDROID_HOME’ environment variable.`

`Failed to find ‘android’ in current path.`

In this case, you need to set up your ANDROID_HOME and path variables.


If everything went well, the console should display where your .apk was built to! Try running it on your Android device. You may or may not be able to receive any server data, for this app requires a database to operate. See **“Setting Up Your Local Database”** to see how to set up a local database.

## Running Without Needing to Build:

Phonegap allows you to run an application without needing to build an apk (or any platform’s equivalence). This will require a separate desktop and mobile application. Follow the instructions located at the following address:
http://docs.phonegap.com/getting-started/1-install-phonegap/desktop/.
You will want to follow the documentation as if you have already created a project.

*Note:* If you are on Windows, you should follow the instructions for the Desktop App. If you are on Linux, you should follow the instructions for the CLI (Command Line Interface). If you are on OSX, either should be fine. The above guide shows documentation for both.   

## Setting Up Your Local Database:
RoomEase uses a NoSQL backend known as CouchDB. CouchDB can run on any server backend or on LocalHost. Typically, couchDB will run on localhost:5984. In general, CouchDB will be running on port 5984. Below are the current steps to install CouchDB on a local machine. Be sure to have CouchDB running when running tests locally. Futon is a GUI interpretation of CouchDB that allows you to see your data entries easily and conveniently.

Follow this guide to getting your database set-up and ensuring that it is working. In particular, be able to add items to the database and be able to access Futon:
https://www.digitalocean.com/community/tutorials/how-to-install-couchdb-and-futon-on-ubuntu-14-04.

If you wish to see how we have our database set up, refer to this link:
http://40.114.43.49:5984/_utils/fauxton/#/_all_dbs

## Directory Structure:

**config.xml:** Main configuration file. Used by phonegap for global settings.

**platforms:** contains platform-specific files such as AndroidManifest.xml.

**plugins:** contains code for plugins added to the project.

**www:** Location of vast majority of the source code. Main directory to work in.

**www/css:**  CSS files. ALL CSS files should go in here. Current external library files: materialize.css, materialize.min.css

**www/font:** Contains all font packages. These should not be modified, but others can be added. 

**www/img:** Contains all images, symbols, ETC used in the application.

**www/js:** Contains all js files in the application. Any file in the lib subdirectory should only be modified in the case where the file is being updated.

**www/res:** Contains app symbols along with other resources for platform-specific releases. Used in conjunction with the platforms folder.

**www/templates:** HTML Templates that are injected into index.html. All templates are loaded on startup then injected into index.html when needed.

**www/tests:** Location of all unit tests. All unit tests should run using Jasmine (a Javascript unit testing platform) at this time.

**www/index.html:** The main document that all other HTML pages will dynamically inject themselves into.

**www/spec.html:** Open this file to run all unit tests.

## Testing:
In order to run tests locally from you will need to host a server on your machine. To do this run
`sudo npm install -g http-server`
Then run from the www folder of the project run
`http-server`.
Now in your web browser you can navigate to `localhost:8080/indexSpec.html`. This should bring you to a page describing the results of the tests run by Jasmine.
In order to add tests, create a js file ending in Spec.js or spec.js and add it to the www/tests folder. These files are required to be written using the Jasmine testing framework. For details check out the Jasmine documentation. *http://jasmine.github.io/2.4/introduction.html*

**If you would like to subscribe or see the results of our nightly build,follow this link:** *https://groups.google.com/forum/#!forum/roomease*

If you're interested in setting up your own automated testing, you'll need to install Grunt, follow the instructions here on how to get started with Grunt:
*http://gruntjs.com/getting-started*

In order to fully get Grunt working to run our Jasmine tests we had to install a couple npm packages:
`sudo npm install -g grunt-cli`
`sudo npm install -g grunt-contrib-jasmine`

Here are the Gruntfile.js and package.json files we used to do our automated testing, these were placed outside of the RoomEase folder.

**Gruntfile.js**
```
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jasmine: {
            src:['./RoomEase/RoomeEasePhoneGapProject/www/js/lib/jquery-2.1.3.min.js',
                 './RoomEase/RoomeEasePhoneGapProject/www/js/lib/materialize.min.js',
                 './RoomEase/RoomeEasePhoneGapProject/wwwjs/lib/handlebars-v4.0.5.js',
                 './RoomEase/RoomeEasePhoneGapProject/www/js/re.js',
                 './RoomEase/RoomeEasePhoneGapProject/www/js/template-loader.js',
                 './RoomEase/RoomeEasePhoneGapProject/www/js/localStorage.js',
                 './RoomEase/RoomeEasePhoneGapProject/www/tests/indexSpec.js'
                 ]
            }
    });
    
    // Load the plugin that provides the "grunt-contrib-jasmine" task.
    grunt.loadNpmTasks('grunt-contrib-jasmine');  
};
```

**package.json**
```
{
  "name": "roomease",
  "version": "0.1.0",
  "description": "",
  "main": "Gruntfile.js",
  "devDependencies": {
    "grunt": "~0.4.5",
    "grunt-contrib-jasmine": "^1.0.0",
    "grunt-contrib-jshint": "~0.10.0",
    "grunt-contrib-nodeunit": "~0.4.1",
    "grunt-contrib-uglify": "~0.5.0"
  }
}
```

Then write a script that will freshly pull or clone the repo and run grunt using `grunt jasmine`. Now if you set up a crontab using the command `crontab -e` to run that script on a regular basis and email yourself the results you should have fully automated testing!

## Bug Tracking:
For all active/known bugs, please refer to the following Spreadsheet:
https://docs.google.com/spreadsheets/d/1cA4G4z5QwtK4EyoeObnpWF133WUGqeTGqy8O8ekPFmY/edit#gid=931147155
This form is automatically populated with all of the bugs that are reported using our form on our developer website (listed above).
