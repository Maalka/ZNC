// Comment to get more information during initialization
logLevel := Level.Warn

// The Typesafe repository
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/releases/"

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.sbt" %% "sbt-native-packager" % "1.3.15")

//addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.4.6")

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.6.15")

addSbtPlugin("com.typesafe.sbt" % "sbt-jshint" % "1.0.6")

addSbtPlugin("com.typesafe.sbt" % "sbt-less" % "1.1.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-rjs" % "1.0.10")

addSbtPlugin("com.typesafe.sbt" % "sbt-digest" % "1.1.3")

addSbtPlugin("com.typesafe.sbt" % "sbt-gzip" % "1.0.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-uglify" % "2.0.0")

addSbtPlugin("org.databrary" % "sbt-angular-templates" % "0.3.0")

addDependencyTreePlugin

// This plugin automatically refreshes Chrome when you make changes to your app
//addSbtPlugin("com.jamesward" %% "play-auto-refresh" % "0.0.11")
