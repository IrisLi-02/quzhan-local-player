package com.irisli.quzhan

import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateManagerTest {
    @Test
    fun comparesReleaseAndAndroidVersions() {
        assertTrue(UpdateManager.compareVersions("0.7.0", "0.6.0") > 0)
        assertTrue(UpdateManager.compareVersions("0.6.0-android.2", "0.6.0-android.1") > 0)
        assertTrue(UpdateManager.compareVersions("0.6.0", "0.6.0-android.1") > 0)
        assertTrue(UpdateManager.compareVersions("0.6.0", "0.6.0") == 0)
    }
}
