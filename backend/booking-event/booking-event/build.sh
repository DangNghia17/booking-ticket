#!/usr/bin/env bash
# Fail on error
set -o errexit

# Install Java if not present
if ! command -v java &> /dev/null; then
    echo "Installing Java..."
    apt-get update && apt-get install -y openjdk-11-jdk
fi

# Make mvnw executable
chmod +x ./mvnw

# Build with Maven wrapper
./mvnw clean install -DskipTests 