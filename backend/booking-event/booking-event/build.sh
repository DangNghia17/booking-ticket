#!/usr/bin/env bash
# Fail on error
set -o errexit

# Export JAVA_HOME
export JAVA_HOME=/opt/java/openjdk

# Make mvnw executable
chmod +x ./mvnw

# Build with Maven wrapper
./mvnw clean install -DskipTests 