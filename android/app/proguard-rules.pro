# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep all React Native classes and packages
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.packagerconnection.** { *; }
-keep class com.facebook.react.jscexecutor.** { *; }

# Keep all Notifee classes and interfaces (your existing rule)
-keep class com.reactnative.notifee.** { *; }
-keep interface com.reactnative.notifee.** { *; }

# Keep Firebase classes if you're using Firebase (optional)
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }

# Keep all classes for libraries that use reflection
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keepclassmembers class * {
    @com.fasterxml.jackson.annotation.JsonProperty <fields>;
}

# Add any other specific rules for your libraries below as needed
