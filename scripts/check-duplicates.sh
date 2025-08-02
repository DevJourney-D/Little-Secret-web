#!/bin/bash

# Pre-commit hook to check for duplicate files
# Little Secret Project - File Duplication Checker

echo "🔍 ตรวจสอบไฟล์ซ้ำก่อน commit..."

# Check for duplicate JS files (excluding node_modules)
echo "📝 ตรวจสอบไฟล์ JS..."
DUPLICATE_JS=$(find frontend backend -name "*.js" | xargs basename -s .js | sort | uniq -d)
if [ ! -z "$DUPLICATE_JS" ]; then
    echo "⚠️  พบไฟล์ JS ซ้ำ:"
    for file in $DUPLICATE_JS; do
        echo "   - $file.js"
        find frontend backend -name "$file.js"
    done
    echo ""
fi

# Check for duplicate HTML files
echo "📄 ตรวจสอบไฟล์ HTML..."
DUPLICATE_HTML=$(find frontend -name "*.html" | xargs basename -s .html | sort | uniq -d)
if [ ! -z "$DUPLICATE_HTML" ]; then
    echo "⚠️  พบไฟล์ HTML ซ้ำ:"
    for file in $DUPLICATE_HTML; do
        echo "   - $file.html"
        find frontend -name "$file.html"
    done
    echo ""
fi

# Check for old/backup files
echo "🗑️  ตรวจสอบไฟล์เก่า/สำรอง..."
OLD_FILES=$(find . -name "*-old.*" -o -name "*-backup.*" -o -name "*.bak" -o -name "*~" | grep -v node_modules)
if [ ! -z "$OLD_FILES" ]; then
    echo "⚠️  พบไฟล์เก่า/สำรอง:"
    echo "$OLD_FILES"
    echo ""
fi

# Check for unused auth files
echo "🔐 ตรวจสอบไฟล์ auth ที่ไม่ใช้..."
UNUSED_AUTH=$(find frontend/js -name "*auth*" | grep -E "(old|backup|secure|temp)")
if [ ! -z "$UNUSED_AUTH" ]; then
    echo "⚠️  พบไฟล์ auth ที่ไม่ใช้:"
    echo "$UNUSED_AUTH"
    echo ""
fi

# Check for large files that might be duplicates
echo "📦 ตรวจสอบไฟล์ขนาดใหญ่..."
LARGE_FILES=$(find frontend backend -type f -size +100k | grep -v node_modules)
if [ ! -z "$LARGE_FILES" ]; then
    echo "📊 ไฟล์ขนาดใหญ่:"
    ls -lh $LARGE_FILES
    echo ""
fi

# Check for files with same content (using checksum)
echo "🔢 ตรวจสอบไฟล์เนื้อหาเหมือนกัน..."
TEMP_FILE=$(mktemp)
find frontend backend -name "*.js" -o -name "*.html" -o -name "*.css" | xargs md5 > $TEMP_FILE 2>/dev/null
DUPLICATE_CONTENT=$(awk '{print $4}' $TEMP_FILE | sort | uniq -d)
if [ ! -z "$DUPLICATE_CONTENT" ]; then
    echo "⚠️  พบไฟล์เนื้อหาเหมือนกัน:"
    for hash in $DUPLICATE_CONTENT; do
        echo "   Hash: $hash"
        grep "$hash" $TEMP_FILE
    done
    echo ""
fi
rm $TEMP_FILE

# Summary
echo "✅ การตรวจสอบเสร็จสิ้น"

# Exit with status 0 (allow commit) but show warnings
if [ ! -z "$DUPLICATE_JS" ] || [ ! -z "$DUPLICATE_HTML" ] || [ ! -z "$OLD_FILES" ] || [ ! -z "$UNUSED_AUTH" ]; then
    echo "⚠️  พบไฟล์ที่ควรตรวจสอบ แต่ commit ยังดำเนินการต่อได้"
    echo "💡 แนะนำให้ลบไฟล์ที่ไม่จำเป็นออก"
fi

exit 0
