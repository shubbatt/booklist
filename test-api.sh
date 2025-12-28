#!/bin/bash

# Test API Endpoints
# Run this to verify the backend is working

SERVER="http://139.59.30.128"

echo "🧪 Testing Book Voucher System API Endpoints"
echo "=============================================="
echo ""

# Test 1: Add a school
echo "1️⃣ Testing POST /api/schools..."
RESPONSE=$(curl -s -X POST "$SERVER/api/schools" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test School API"}')
echo "Response: $RESPONSE"
echo ""

# Test 2: Get schools
echo "2️⃣ Testing GET /api/schools..."
curl -s "$SERVER/api/schools" | python3 -m json.tool
echo ""

# Test 3: Check database directly
echo "3️⃣ Checking database on server..."
ssh root@139.59.30.128 'cd /opt/booklist/server && sqlite3 booklist.db "SELECT * FROM schools ORDER BY name LIMIT 5;"'
echo ""

echo "✅ Test complete!"
echo ""
echo "If you see 'Test School API' in both the API response and database,"
echo "then the backend is working correctly and the issue is in the frontend."
