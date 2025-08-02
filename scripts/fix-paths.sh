#!/bin/bash

# Fix paths script for Neko U project
echo "🔧 Fixing paths in HTML files..."

# Array of HTML files in html/ directory
files=(
    "chat.html"
    "diary.html"  
    "math.html"
    "neko-chat.html"
    "pomodoro.html"
    "reset-password.html"
    "settings.html"
    "todo.html"
    "user-info.html"
)

# Fix CSS paths
for file in "${files[@]}"; do
    if [ -f "html/$file" ]; then
        echo "Fixing CSS paths in $file..."
        sed -i.bak 's|href="css/|href="../css/|g' "html/$file"
        sed -i.bak 's|href="assets/|href="../assets/|g' "html/$file"
    fi
done

# Fix JS paths
for file in "${files[@]}"; do
    if [ -f "html/$file" ]; then
        echo "Fixing JS paths in $file..."
        sed -i.bak 's|src="js/|src="../js/|g' "html/$file"
        sed -i.bak 's|src="assets/|src="../assets/|g' "html/$file"
    fi
done

# Fix navigation links
for file in "${files[@]}"; do
    if [ -f "html/$file" ]; then
        echo "Fixing navigation links in $file..."
        # Dashboard
        sed -i.bak 's|href="dashboard.html"|href="dashboard.html"|g' "html/$file"
        # Diary
        sed -i.bak 's|href="diary.html"|href="diary.html"|g' "html/$file"
        # Chat  
        sed -i.bak 's|href="chat.html"|href="chat.html"|g' "html/$file"
        # Todo
        sed -i.bak 's|href="todo.html"|href="todo.html"|g' "html/$file"
        # Pomodoro
        sed -i.bak 's|href="pomodoro.html"|href="pomodoro.html"|g' "html/$file"
        # Math
        sed -i.bak 's|href="math.html"|href="math.html"|g' "html/$file"
        # Neko Chat
        sed -i.bak 's|href="neko-chat.html"|href="neko-chat.html"|g' "html/$file"
        # Settings
        sed -i.bak 's|href="settings.html"|href="settings.html"|g' "html/$file"
        # User Info
        sed -i.bak 's|href="user-info.html"|href="user-info.html"|g' "html/$file"
        # Login/Register
        sed -i.bak 's|href="index.html"|href="index.html"|g' "html/$file"
        sed -i.bak 's|href="register.html"|href="register.html"|g' "html/$file"
    fi
done

# Clean up backup files
echo "Cleaning up backup files..."
find html/ -name "*.bak" -delete

echo "✅ Path fixing completed!"
echo "📁 All HTML files in html/ directory have been updated with correct relative paths"
