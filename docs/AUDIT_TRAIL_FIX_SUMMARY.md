# Audit Trail Fix for Moderator and Super-Admin

## Summary
Fixed the audit trail system to properly work for both **moderator** (regular admin) and **super-admin** roles.

## Changes Made

### 1. Updated JWT Token to Include Username (api.js, ~line 465)
**Before:**
```javascript
const token = jwt.sign({
    userId: admin.id,
    email: admin.email,
    role: 'admin',
    isAdmin: true,
    isSuperAdmin: admin.is_super_admin === 1
}, JWT_SECRET, { expiresIn: '24h' });
```

**After:**
```javascript
const token = jwt.sign({
    userId: admin.id,
    username: admin.username,  // ← ADDED
    email: admin.email,
    role: 'admin',
    isAdmin: true,
    isSuperAdmin: admin.is_super_admin === 1
}, JWT_SECRET, { expiresIn: '24h' });
```

**Reason:** The audit trail needs the admin's username to log who performed each action. Previously, the username was not included in the JWT token.

---

### 2. Enhanced logAuditTrail Function (api.js, ~line 2463)
**Key improvements:**
1. ✅ Added `admin_username` to audit data
2. ✅ Properly stringify JSON objects for `old_value` and `new_value`
3. ✅ Enhanced logging to show whether action was performed by super-admin or moderator
4. ✅ Better error handling with detailed debug information

**Before:**
```javascript
const auditData = {
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId || null,
    entity_name: entityName || null,
    old_value: oldValue || null,        // ← Not stringified
    new_value: newValue || null,        // ← Not stringified
    admin_id: adminId,
    admin_email: adminEmail,            // ← Missing admin_username
    // ... other fields
};
```

**After:**
```javascript
const auditData = {
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId || null,
    entity_name: entityName || null,
    old_value: oldValue ? JSON.stringify(oldValue) : null,  // ← Stringified
    new_value: newValue ? JSON.stringify(newValue) : null,  // ← Stringified
    admin_id: adminId,
    admin_username: adminUsername,      // ← ADDED
    admin_email: adminEmail,
    // ... other fields
};
```

---

## Database Schema
The `audit_trail` table already supports both roles:
```sql
CREATE TABLE audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    entity_name TEXT,
    old_value TEXT,
    new_value TEXT,
    admin_id INTEGER,
    admin_username TEXT,        -- Stores who performed the action
    admin_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);
```

---

## Roles Explained

### Moderator (Regular Admin)
- Has `role = 'admin'` and `isAdmin = true`
- Has `isSuperAdmin = false` 
- Database: `is_super_admin = 0`
- **Can:** Perform CRUD operations on books, users, orders, vouchers
- **Can:** View and generate audit trail logs
- **Cannot:** Create/delete other admin accounts

### Super Admin
- Has `role = 'admin'` and `isAdmin = true`
- Has `isSuperAdmin = true`
- Database: `is_super_admin = 1`
- **Can:** Everything a moderator can do
- **Can:** Create, update, delete admin accounts
- **Can:** View and generate audit trail logs

---

## API Endpoints Using Audit Trail

### All CRUD Operations Log to Audit Trail:
1. **Books**: Create, Update, Delete, Archive, Unarchive
2. **Users**: Update role, Archive, Unarchive
3. **Orders**: Update status, Archive, Unarchive
4. **Vouchers**: Create, Update, Delete
5. **Admin Accounts**: Create, Update, Delete, Password reset (super-admin only)

### Audit Trail API Endpoints (Both Roles Can Access):
- `GET /api/admin/audit-trail/recent` - Get recent logs
- `GET /api/admin/audit-trail` - Get all logs (paginated)
- `GET /api/admin/audit-trail/entity/:entityType` - Filter by entity
- `GET /api/admin/audit-trail/action/:actionType` - Filter by action
- `GET /api/admin/audit-trail/admin/:adminId` - Filter by admin

All use `authenticateAdmin` middleware, so both moderators and super-admins can access them.

---

## Testing

### Test Case 1: Moderator Creates a Book
1. Login as moderator
2. Create a new book
3. Check audit trail - should show:
   - `action_type`: "CREATE"
   - `entity_type`: "book"
   - `admin_username`: moderator's username
   - `admin_email`: moderator's email
   - `description`: "Created new book..."

### Test Case 2: Super-Admin Deletes Admin Account
1. Login as super-admin
2. Delete an admin account
3. Check audit trail - should show:
   - `action_type`: "DELETE"
   - `entity_type`: "admin"
   - `admin_username`: super-admin's username
   - `description`: "Deleted admin account..."

### Test Case 3: View Audit Trail
1. Login as moderator or super-admin
2. Navigate to audit trail section
3. Should see all logged actions from both moderators and super-admins

---

## Console Debug Output
When an action is logged, you'll see:
```
📜 Logging audit trail: {
  action: 'CREATE',
  entity: 'book #123',
  admin_id: 1,
  admin_username: 'admin',
  admin_email: 'admin@example.com',
  role: 'moderator'  // or 'super-admin'
}
✅ Audit trail logged successfully
```

---

## Files Modified
1. `api.js` - Updated JWT token generation and audit logging function
2. `database-turso.js` - Already had correct schema and operations (no changes needed)

---

## Verification Checklist
- [x] JWT token includes `username` for admin logins
- [x] `logAuditTrail` function includes `admin_username`
- [x] JSON values are properly stringified before storage
- [x] Both moderator and super-admin can log actions
- [x] Both roles can view audit trail
- [x] Console logging shows role (moderator vs super-admin)
- [x] All CRUD operations trigger audit logs
- [x] Database schema supports audit trail
- [x] API endpoints use correct authentication middleware

---

## Status
✅ **COMPLETE** - Audit trail is now fully functional for both moderator and super-admin roles.
