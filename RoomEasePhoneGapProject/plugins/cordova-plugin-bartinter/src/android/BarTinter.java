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
package com.dw.bartinter;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONException;

public class BarTinter extends CordovaPlugin {
	
    private static final String TAG = "BarTinter";

    @Override
    public void initialize(final CordovaInterface cordova, CordovaWebView webView) {
        Log.v(TAG, "StatusBar: initialization");
        super.initialize(cordova, webView);

        this.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Window window = cordova.getActivity().getWindow();
                window.clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
				statusBar("#000000");
				navigationBar("#000000");
            }
        });
    }

    @Override
    public boolean execute(final String action, final CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        Log.v(TAG, "Executing action: " + action);
        final Activity activity = this.cordova.getActivity();
        final Window window = activity.getWindow();

        if ("_ready".equals(action)) {
            boolean statusBarVisible = (window.getAttributes().flags & WindowManager.LayoutParams.FLAG_FULLSCREEN) == 0;
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, statusBarVisible));
            return true;
        }

        if ("statusBar".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        statusBar(args.getString(0));
                    } catch (JSONException ignore) {
                        Log.e(TAG, "Invalid hexString argument.");
                    }
                }
            });
            return true;
        }
		
		if("navigationBar".equals(action)) {
			this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        navigationBar(args.getString(0));
                    } catch (JSONException ignore) {
                        Log.e(TAG, "Invalid hexString argument.");
                    }
                }
            });
            return true;
		}

        return false;
    }

    private void statusBar(final String colorPref) {
        if (Build.VERSION.SDK_INT >= 21) {
            if (colorPref != null && !colorPref.isEmpty()) {
                final Window window = cordova.getActivity().getWindow();
                window.clearFlags(0x04000000);
                window.addFlags(0x80000000);
                try {
					window.getClass().getDeclaredMethod("setStatusBarColor", int.class).invoke(window, Color.parseColor(colorPref));
                } catch (IllegalArgumentException ignore) {
                    Log.e(TAG, "Invalid hexString argument.");
                } catch (Exception ignore) {
                    Log.w(TAG, "Method window.setStatusBarColor not found for SDK level " + Build.VERSION.SDK_INT);
                }
            }
        }
    }
	
	private void navigationBar(final String colorPref) {
        if (Build.VERSION.SDK_INT >= 21) {
            if (colorPref != null && !colorPref.isEmpty()) {
                final Window window = cordova.getActivity().getWindow();
                window.clearFlags(0x04000000);
                window.addFlags(0x80000000);
                try {
                    window.getClass().getDeclaredMethod("setNavigationBarColor", int.class).invoke(window, Color.parseColor(colorPref));
                } catch (IllegalArgumentException ignore) {
                    Log.e(TAG, "Invalid hexString argument.");
                } catch (Exception ignore) {
                    Log.w(TAG, "Method window.setNavigationBarColor not found for SDK level " + Build.VERSION.SDK_INT);
                }
            }
        }
    }
}
