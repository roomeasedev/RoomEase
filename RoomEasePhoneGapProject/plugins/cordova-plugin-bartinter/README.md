<h1>Cordova Bartinter Plugin </h1>
<p>A Cordova plugin to change the colors of the Status and Navigation bar</p>
<p><b>This plugin only supports android 5 and up! </b></p>
<h2> Comparison between android 4.3, 4.4.4 and android 5.0.2: </h2>
<img src="https://i.ytimg.com/vi/YCThIedqbCQ/maxresdefault.jpg">
<p>The plugin does what you can see on most right phone</p>


<br/>
<h2> Easy start guide </h2>
<h6>Step 1: First add this plugin to your cordova project using <code>cordova plugin add cordova-plugin-bartinter</code></h6>
<br/>
<h6>Step 2: Include cordova.js (automatically added to WWW) in the preferred HTML files like this:
  <code> &lt;script src="cordova.js"&gt; (if not exits)'</code></h6>
<br/>
<h2> Usage: </h2>
<h4>BarTinter.statusColor("hex color");</h4>
<h5>For example:</h5>
<code>BarTinter.statusColor("#C31515"); </code>
<br/>
<h4>BarTinter.navigationColor("hex color");</h4>
<h5>For example:</h5>
<code>BarTinter.navigationColor("#E81E1E"); </code>
<br/>
<h3><b>If the color isn't a hex color the function won't work!</b></h3>
