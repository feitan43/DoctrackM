package com.doctrackm

import android.os.Bundle
import android.graphics.Color
import android.view.WindowInsets
import androidx.core.view.WindowCompat
import com.zoontek.rnbootsplash.RNBootSplash
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Enable edge-to-edge layout
    WindowCompat.setDecorFitsSystemWindows(window, false)
    
    // Make system bars transparent (optional, for full immersive experience)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT

    // Initialize splash screen
    RNBootSplash.init(this, R.style.BootTheme)

    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "DoctrackM"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
