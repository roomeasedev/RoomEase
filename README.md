# RoomEase
Welcome, developers! Thanks for checking out our project!

## Obtaining source code:
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

If not, run the following commands

`sudo apt-get update`

`sudo apt-get install nodejs`

`sudo apt-get install npm`


Next, install phonegap (cordova) by running the following command:

`sudo npm install cordova -g`

Note: Depending on the version of node, you may see the following error:

`“The program ‘node’ can be found in the following packages”`

To fix this, run the following command

`sudo ln -s /usr/bin/nodejs /usr/bin/node`

Phonegap allows us to work with and build nearly any platform you want. To add a platform to build to, at the top directory of your project (you should see a config.xml) run the following command:

`cordova platform add android`

Below we will describe the process of building for android, but the process is nearly identical for other platforms. Instructions for other platforms will be included when we introduce our first prototype for those platforms. *Note: In general, you can add the build resources for any platform by running `cordova platform add <platform>`.*

Now to build to android run the following command:

`cordova build android`

You may see some errors regarding not having the correct versions of the android SDK installed. These can be resolved by installing the android SDK and installing the latest SDK tools. You may also need to install the jdk by running:

`sudo apt-get install openjdk-7-jdk`

Also, you may get a the following errors: 

`Failed to find ‘ANDROID_HOME’ environment variable.`

`Failed to find ‘android’ in current path.`

In this case, you need to set up your ANDROID_HOME and path variables.

Note: There may be some dependencies that are not part of phonegap by default that need to be installed manually through npm. You may see an error such as `cannot find module <module>`. This typically can be fixed by running the following command:

`sudo npm install -g <module>`

If everything went well, the console should display where your .apk was built to! Try running it on your Android device. You may or may not be able to receive any server data, since this app requires a database to operate. See “Setting Up Your Database” to see how to set up a local database.

## Running without needing to build:
Phonegap allows you to run an application without needing to build an apk (or any platform’s equivalence). You can load your app onto your platform of choice without needing to build the application. This will require a separate desktop and mobile application. Follow the instructions located at the following address:
**http://docs.phonegap.com/getting-started/1-install-phonegap/desktop/**
You will want to follow the documentation as if you have already created a project, since you'll be using this repository as your project.

*Note: If you are on Windows, you should follow the instructions for the Desktop App. If you are on Linux, you should follow the instructions for the CLI (Command Line Interface). If you are on OSX, either should be fine. The above guide shows documentation for both. *

## Setting Up Your Local Database:
RoomEase uses a NoSQL backend known as CouchDB. CouchDB can run on any server backend or on LocalHost. Typically, couchDB will run on localhost:5984. In general, CouchDB will be running on port 5984. Below are the current steps to install CouchDB on a local machine. Be sure to have CouchDB running when running tests locally. Futon is a GUI interpretation of CouchDB that allows you to see your data entries easily and conveniently.

Follow this guide to getting your database set-up and ensuring that it is working. In particular, be able to add items to the database and be able to access Futon:
*https://www.digitalocean.com/community/tutorials/how-to-install-couchdb-and-futon-on-ubuntu-14-04*

To run any unit tests that use the server, please have couchDB running locally.

## Directory Structure:
config.xml: Main configuration file. Used by phonegap for global settings.
platforms: contains platform-specific files such as AndroidManifest.xml.
plugins: contains code for plugins added to the project.
www: Location of vast majority of the source code. Main directory to work in.
www/css:  CSS files. ALL CSS files should go in here. Current external library files: materialize.css, materialize.min.css
www/font: Contains all font packages. These should not be modified, but others can be added. 
www/img: Contains all images, symbols, ETC used in the application.
www/js: Contains all js files in the application. Any file in the lib subdirectory should only be modified in the case where the file is being updated.
www/res: Contains app symbols along with other resources for platform-specific releases. Used in conjunction with the platforms folder.
www/templates: HTML Templates that are injected into index.html. All templates are loaded on startup then injected into index.html when needed.
www/tests: Location of all unit tests. All unit tests should run using Jasmine (a Javascript unit testing platform) at this time. If you need unit tests that run for a different platform, please contact us so we can integrate it into the automatic testing suite. (TODO: Should we have that final line or not?)
www/index.html: The main document that all other HTML pages will dynamically inject themselves into.
www/spec: TODO: Figure out what it does.

 

Testing:
In order to run tests locally from you will need to host a server on your machine. To do this run
sudo npm install -g http-server
Then run from the www folder of the project run http-server .
Now in your web browser you can navigate to localhost:
Describe automatic testing plan

Note: Make sure that you have followed the instructions on “Setting Up Your Database”

Bug Tracking:
For all active/known bugs, please refer to the following Spreadsheet:
https://docs.google.com/spreadsheets/d/1TUz7qx3GqziUEGzJB6NABSbTz8rprz-C40Qe7xVgVIM/edit#gid=0

