#!/bin/bash
# NutriAI Setup Script
# Run this ONCE after cloning / unzipping the source files
# Usage: bash setup.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         NutriAI Setup Script             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. Scaffold a fresh RN project
echo "► Step 1/4: Scaffolding React Native project..."
npx @react-native-community/cli@latest init NutriAIApp --version 0.76.9 --skip-install
echo "✓ Scaffold done"

# 2. Copy our source files in
echo "► Step 2/4: Copying NutriAI source files..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cp "$SCRIPT_DIR/App.js"           NutriAIApp/App.js
cp "$SCRIPT_DIR/babel.config.js"  NutriAIApp/babel.config.js
cp "$SCRIPT_DIR/metro.config.js"  NutriAIApp/metro.config.js
cp -r "$SCRIPT_DIR/src"           NutriAIApp/src
echo "✓ Source files copied"

# 3. Install deps
echo "► Step 3/4: Installing dependencies..."
cd NutriAIApp
npm install
npm install \
  @react-navigation/native@^6.1.18 \
  @react-navigation/native-stack@^6.11.0 \
  @react-navigation/bottom-tabs@^6.6.1 \
  react-native-screens@^3.35.0 \
  react-native-safe-area-context@^4.14.0
echo "✓ Dependencies installed"

# 4. iOS pods
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "► Step 4/4: Installing iOS pods..."
  cd ios && pod install && cd ..
  echo "✓ Pods installed"
else
  echo "► Step 4/4: Skipped pod install (not macOS)"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║              Setup Complete!             ║"
echo "╠══════════════════════════════════════════╣"
echo "║  cd NutriAIApp                           ║"
echo "║  npx react-native start                  ║"
echo "║  Then press Play in Xcode                ║"
echo "╚══════════════════════════════════════════╝"
echo ""
