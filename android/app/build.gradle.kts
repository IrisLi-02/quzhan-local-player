import org.gradle.api.tasks.Sync
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val repoRoot = rootProject.projectDir.parentFile
val signingPropertiesFile = repoRoot.resolve("release/android-signing.properties")
val signingProperties = Properties().apply {
    if (signingPropertiesFile.isFile) {
        signingPropertiesFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "com.irisli.quzhan"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.irisli.quzhan"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "0.6.1"
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    signingConfigs {
        if (signingPropertiesFile.isFile) {
            create("release") {
                storeFile = file(signingProperties.getProperty("storeFile"))
                storePassword = signingProperties.getProperty("storePassword")
                keyAlias = signingProperties.getProperty("keyAlias")
                keyPassword = signingProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            if (signingPropertiesFile.isFile) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))

    packaging {
        resources.excludes += setOf(
            "META-INF/AL2.0",
            "META-INF/LGPL2.1",
            "META-INF/LICENSE.md",
            "META-INF/NOTICE.md",
        )
    }
}

val syncWebAssets by tasks.registering(Sync::class) {
    description = "Copies the shared Quzhan web UI into the Android APK assets."
    from(repoRoot.resolve("src"))
    into(layout.buildDirectory.dir("generated/webAssets/web"))
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.media:media:1.7.0")
    testImplementation("junit:junit:4.13.2")
}
