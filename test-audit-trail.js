// Test Script for Audit Trail - Both Moderator and Super-Admin
// This script helps verify that audit trail works for both roles

console.log('🧪 AUDIT TRAIL TEST GUIDE');
console.log('================================\n');

console.log('📋 SETUP:');
console.log('1. Make sure you have both a moderator and super-admin account');
console.log('2. Start your server: node api.js');
console.log('3. Open admin panel in browser\n');

console.log('🔍 TEST SCENARIOS:\n');

console.log('TEST 1: Moderator Creates a Book');
console.log('----------------------------------');
console.log('1. Login as moderator (is_super_admin = 0)');
console.log('2. Navigate to Books section');
console.log('3. Click "Add New Book"');
console.log('4. Fill in book details and save');
console.log('5. Check console logs for:');
console.log('   📜 Logging audit trail: { role: "moderator" }');
console.log('   ✅ Audit trail logged successfully');
console.log('6. Navigate to Audit Trail section');
console.log('7. Verify entry shows:');
console.log('   - Action Type: CREATE');
console.log('   - Entity Type: book');
console.log('   - Admin Username: [your moderator username]');
console.log('   - Description: Created new book...\n');

console.log('TEST 2: Super-Admin Updates User Role');
console.log('----------------------------------');
console.log('1. Login as super-admin (is_super_admin = 1)');
console.log('2. Navigate to Users section');
console.log('3. Change a user\'s role');
console.log('4. Check console logs for:');
console.log('   📜 Logging audit trail: { role: "super-admin" }');
console.log('   ✅ Audit trail logged successfully');
console.log('5. Navigate to Audit Trail section');
console.log('6. Verify entry shows:');
console.log('   - Action Type: UPDATE');
console.log('   - Entity Type: user');
console.log('   - Admin Username: [your super-admin username]');
console.log('   - Old Value: {"role":"user"}');
console.log('   - New Value: {"role":"admin"}\n');

console.log('TEST 3: Both Roles Can View Audit Trail');
console.log('----------------------------------');
console.log('1. Login as moderator');
console.log('2. Navigate to Audit Trail section');
console.log('3. Verify you can see all audit logs');
console.log('4. Logout and login as super-admin');
console.log('5. Navigate to Audit Trail section');
console.log('6. Verify you can see the same audit logs\n');

console.log('TEST 4: Archive Operations');
console.log('----------------------------------');
console.log('1. Login as moderator');
console.log('2. Archive a book/user/order');
console.log('3. Check audit trail for ARCHIVE action');
console.log('4. Unarchive the same item');
console.log('5. Check audit trail for UNARCHIVE action');
console.log('6. Verify both entries have admin_username populated\n');

console.log('TEST 5: API Endpoints Direct Test');
console.log('----------------------------------');
console.log('Use these cURL commands or Postman:\n');

console.log('// Get recent audit logs');
console.log('GET http://localhost:3000/api/admin/audit-trail/recent?limit=10');
console.log('Headers: { Authorization: "Bearer YOUR_ADMIN_TOKEN" }\n');

console.log('// Get all audit logs with pagination');
console.log('GET http://localhost:3000/api/admin/audit-trail?page=1&limit=50');
console.log('Headers: { Authorization: "Bearer YOUR_ADMIN_TOKEN" }\n');

console.log('// Get audit logs by entity type');
console.log('GET http://localhost:3000/api/admin/audit-trail/entity/book');
console.log('Headers: { Authorization: "Bearer YOUR_ADMIN_TOKEN" }\n');

console.log('// Get audit logs by action type');
console.log('GET http://localhost:3000/api/admin/audit-trail/action/CREATE');
console.log('Headers: { Authorization: "Bearer YOUR_ADMIN_TOKEN" }\n');

console.log('✅ EXPECTED RESULTS:');
console.log('----------------------------------');
console.log('1. ✅ All operations by moderator are logged');
console.log('2. ✅ All operations by super-admin are logged');
console.log('3. ✅ Each log entry has admin_username populated');
console.log('4. ✅ Each log entry has admin_email populated');
console.log('5. ✅ Console shows correct role (moderator/super-admin)');
console.log('6. ✅ Both roles can view audit trail');
console.log('7. ✅ old_value and new_value are properly stringified JSON\n');

console.log('❌ FAILURE INDICATORS:');
console.log('----------------------------------');
console.log('1. ❌ Console shows: "Cannot log audit trail - req or req.user is undefined"');
console.log('2. ❌ Admin username shows as "Unknown" or null');
console.log('3. ❌ Audit trail is empty for certain actions');
console.log('4. ❌ 403 Forbidden when accessing audit trail endpoints\n');

console.log('🔧 DEBUGGING:');
console.log('----------------------------------');
console.log('1. Check server console for audit trail logs');
console.log('2. Check browser DevTools Network tab for API responses');
console.log('3. Verify JWT token contains username field:');
console.log('   - Go to jwt.io');
console.log('   - Paste your auth token');
console.log('   - Check payload has: username, email, role, isAdmin, isSuperAdmin');
console.log('4. Check database directly:');
console.log('   SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT 10;\n');

console.log('📝 NOTES:');
console.log('----------------------------------');
console.log('- Moderators cannot create/delete admin accounts (403 error expected)');
console.log('- Super-admins can do everything moderators can + manage admins');
console.log('- All admin actions should be logged regardless of role');
console.log('- Audit trail is read-only (no delete/edit endpoints)');
console.log('- Database stores old_value and new_value as JSON strings\n');

console.log('================================');
console.log('End of Test Guide');
console.log('================================\n');
