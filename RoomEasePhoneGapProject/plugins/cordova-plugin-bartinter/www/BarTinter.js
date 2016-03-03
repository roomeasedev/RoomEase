/*
* Copyright Developing Wild 2016
*/

/* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var exec = require('cordova/exec');

var BarTinter = {

    statusColor: function (hexString) {
        if (hexString.charAt(0) !== "#") {
            hexString = "#" + hexString;
        }

        if (hexString.length === 4) {
            var split = hexString.split("");
            hexString = "#" + split[1] + split[1] + split[2] + split[2] + split[3] + split[3];
        }

        exec(null, null, "BarTinter", "statusBar", [hexString]);
    },
	
	navigationColor: function (hexString) {
        if (hexString.charAt(0) !== "#") {
            hexString = "#" + hexString;
        }

        if (hexString.length === 4) {
            var split = hexString.split("");
            hexString = "#" + split[1] + split[1] + split[2] + split[2] + split[3] + split[3];
        }

        exec(null, null, "BarTinter", "navigationBar", [hexString]);
    }
};

exec(function (res) {
    if (typeof res == 'object') {
        if (res.type == 'tap') {
            cordova.fireWindowEvent('statusTap');
        }
    }
}, null, "BarTinter", "_ready", []);

module.exports = BarTinter;
