#!/bin/bash

# Clean up script for Little Secret project
echo "🧹 ทำความสะอาดไฟล์ที่ไม่จำเป็น..."

# ลบไฟล์สำรอง
echo "🗑️  ลบไฟล์สำรอง..."
find . -name "*-old.*" -o -name "*-backup.*" -o -name "*.bak" -o -name "*~" | grep -v node_modules | while read file; do
    echo "   ลบ: $file"
    rm -f "$file"
done

# ลบไฟล์ temporary
echo "🗑️  ลบไฟล์ temporary..."
find . -name "*.tmp" -o -name "*.temp" | grep -v node_modules | while read file; do
    echo "   ลบ: $file"
    rm -f "$file"
done

# ลบไฟล์ log ขนาดใหญ่
echo "🗑️  ลบไฟล์ log ขนาดใหญ่..."
find . -name "*.log" -size +10M | grep -v node_modules | while read file; do
    echo "   ลบ: $file"
    rm -f "$file"
done

# ลบ .DS_Store ใน macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 ลบไฟล์ .DS_Store..."
    find . -name ".DS_Store" -delete 2>/dev/null
fi

# แสดงไฟล์ที่เหลือ
echo "📊 สถิติไฟล์โปรเจ็กต์:"
echo "   JavaScript: $(find frontend backend -name "*.js" | wc -l) ไฟล์"
echo "   HTML: $(find frontend -name "*.html" | wc -l) ไฟล์"
echo "   CSS: $(find frontend -name "*.css" | wc -l) ไฟล์"

echo "✅ ทำความสะอาดเสร็จสิ้น"
