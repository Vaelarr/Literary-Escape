# 📋 Literary Escape - Update Documentation

**Updates and Changes Since October 14, 2025**

This document details all the new features, improvements, and changes made to the Literary Escape platform after the last README update (October 14, 2025).

---

## 📅 Documentation Period

**Last README Update:** October 14, 2025  
**This Update Documentation:** October 22, 2025  
**Change Summary:** 8 days of development

---

## 🎯 Major Feature Additions

### 1. **Turso Cloud Database Integration** 🌐

**NEW DATABASE OPTION ADDED** - The platform now supports **three database backends** instead of two:

#### What Changed:
- Added **Turso Cloud** (Edge SQLite) as the primary recommended database for production
- Turso provides global edge deployment with ultra-low latency
- Built-in multi-region replication for better worldwide performance

#### Database Priority Order:
```javascript
1. TURSO_DATABASE_URL present → Use Turso Cloud (NEW!)
2. POSTGRES_URL present → Use PostgreSQL  
3. Default → Use local SQLite
```

#### New Files Added:
- `database-turso.js` - Complete Turso database implementation (2,201 lines)
- `seed-turso.js` - Data seeding script for Turso
- `migrate-turso.js` - Database migration tool for Turso

#### Updated Files:
- `database-config.js` - Enhanced auto-switcher to include Turso detection
- `package.json` - Added new scripts: `seed-turso`

#### Environment Variables (NEW):
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

#### Benefits:
- ✅ **9 GB free storage** + 1B reads/month (generous free tier)
- ✅ **Edge deployment** - Runs at the edge for global low latency
- ✅ **SQLite compatibility** - Use familiar SQLite syntax
- ✅ **Built-in replication** - Automatic multi-region support
- ✅ **Perfect for Vercel** - Optimized for edge functions

---

### 2. **Voucher/Coupon System** 🎟️

**COMPLETE E-COMMERCE FEATURE** - Full voucher management system for discounts and promotions.

#### Features Added:

##### Admin Features:
- **Create Vouchers**: Generate discount codes with customizable rules
- **Manage Vouchers**: View, edit, activate/deactivate coupon codes
- **Flexible Discount Types**:
  - Percentage discounts (e.g., 20% off)
  - Fixed amount discounts (e.g., $10 off)
- **Advanced Rules**:
  - Minimum purchase requirements
  - Maximum discount caps
  - Usage limits (total and per user)
  - Valid date ranges
  - Status control (active/inactive)

##### Customer Features:
- **Apply Vouchers**: Enter coupon codes at checkout
- **Real-time Validation**: Instant feedback on voucher validity
- **Automatic Discount Calculation**: Applied to order total
- **Usage Tracking**: Prevents exceeding per-user limits

#### Database Schema (NEW):
```sql
CREATE TABLE vouchers (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    max_discount REAL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### New API Endpoints:
```javascript
// Public
POST   /api/vouchers/validate         // Validate voucher code

// Admin Only
GET    /api/admin/vouchers             // Get all vouchers (paginated)
GET    /api/admin/vouchers/:id         // Get single voucher
POST   /api/admin/vouchers             // Create new voucher
PUT    /api/admin/vouchers/:id         // Update voucher
DELETE /api/admin/vouchers/:id         // Delete voucher
```

#### Files Updated:
- `api.js` - Added voucher API endpoints and validation logic
- `database.js` - Added `voucherOperations` object with CRUD methods
- `database-turso.js` - Full Turso-compatible voucher implementation
- Admin panel - Voucher management UI (in `admin.html`)

---

### 3. **Shopping Cart Item Selection** ✅

**ENHANCED CHECKOUT EXPERIENCE** - Users can now select specific items from their cart for checkout.

#### What Changed:
Previously, users had to checkout ALL items in their cart. Now they can:
- ✅ **Select individual items** for checkout
- ✅ **Select all / Deselect all** with one click
- ✅ **Partial cart checkout** - Keep items for later
- ✅ **Dynamic total calculation** - Only selected items count toward total

#### Database Changes:
```sql
-- New column added to cart table
ALTER TABLE cart ADD COLUMN selected_for_checkout INTEGER DEFAULT 1;
```

#### New API Endpoints:
```javascript
PUT  /api/cart/select-all       // Select all cart items for checkout
PUT  /api/cart/deselect-all     // Deselect all cart items
GET  /api/cart/selected         // Get only selected items
GET  /api/cart/selected-total   // Get total of selected items only
```

#### Files Updated:
- `database.js` - Added cart selection methods
- `database-turso.js` - Turso-compatible cart selection
- `api.js` - Cart selection API endpoints
- `js/api-client.js` - Client-side cart selection functions
- Cart page UI - Checkboxes for item selection

---

### 4. **Account Dashboard Enhancement** 👤

**NEW USER PROFILE PAGE** - Comprehensive account management interface.

#### New File:
- `account-dashboard.html` - Full-featured account dashboard (1,858 lines)

#### Features:
- **Profile Management**: View and edit personal information
- **Order History**: Complete purchase history with details
- **Review Management**: View and manage book reviews
- **Address Book**: Save multiple shipping addresses
- **Settings**: Account preferences and privacy controls
- **Modern UI**: Responsive design with sidebar navigation

#### Design Features:
- Tabbed interface for easy navigation
- Real-time form validation
- Responsive mobile-friendly layout
- Bootstrap 5 integration
- Font Awesome icons

---

### 5. **User Address Management** 📍

**MULTIPLE SHIPPING ADDRESSES** - Users can save and manage multiple delivery addresses.

#### Database Schema (NEW):
```sql
CREATE TABLE user_addresses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    label TEXT NOT NULL,              -- e.g., "Home", "Office"
    full_address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

#### Features:
- Save multiple addresses per user
- Set default shipping address
- Label addresses (Home, Office, etc.)
- Delete unwanted addresses
- Select address during checkout

#### API Methods Added:
```javascript
userOperations.getUserAddresses(userId, callback)
userOperations.saveAddress(addressData, callback)
userOperations.setDefaultAddress(userId, addressId, callback)
userOperations.deleteAddress(userId, addressId, callback)
```

---

### 6. **Archive System Enhancements** 📦

**SOFT DELETE FUNCTIONALITY** - Items are now archived instead of permanently deleted.

#### What Changed:
- Books, users, and orders can be **archived** instead of deleted
- Archived items are hidden from main views but retained in database
- Admins can view and restore archived items
- Better data retention and audit trail

#### Database Migrations:
```sql
-- Columns added via migration
ALTER TABLE users ADD COLUMN archived INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN archived INTEGER DEFAULT 0;
-- books table already had archived column
```

#### New Operations:
```javascript
archiveOperations.archiveBook(bookId, callback)
archiveOperations.unarchiveBook(bookId, callback)
archiveOperations.archiveUser(userId, callback)
archiveOperations.unarchiveUser(userId, callback)
archiveOperations.archiveOrder(orderId, callback)
archiveOperations.unarchiveOrder(orderId, callback)

// Pagination support
archiveOperations.getArchivedBooks(page, limit, callback)
archiveOperations.getArchivedUsers(page, limit, callback)
archiveOperations.getArchivedOrders(page, limit, callback)
```

---

## 🔧 Technical Improvements

### Database Layer Enhancements

#### 1. **Automatic Migration System**
- Added `runMigrations()` function in database initialization
- Automatically adds missing columns without manual intervention
- Graceful error handling for existing columns

#### 2. **Database Health Monitoring**
```javascript
// Enhanced health check with version info
GET /api/health
// Returns: status, timestamp, database version
```

#### 3. **Connection Logging**
- Detailed startup logs showing which database is active
- Environment variable detection feedback
- Clear visual indicators for database type

Example console output:
```
=================================================
DATABASE CONFIGURATION
=================================================
Environment Variables Check:
- TURSO_DATABASE_URL: ✅ SET (Cloud Database)
- TURSO_AUTH_TOKEN: ✅ SET
- POSTGRES_URL: ❌ NOT SET
- DATABASE_URL: ❌ NOT SET
- NODE_ENV: production
=================================================
✅ SELECTED: Turso Cloud Database (ONLINE)
   URL: libsql://literary-escape-user.turso.io
=================================================
```

---

## 📊 API Updates

### New Endpoints Summary

#### Vouchers:
```
POST   /api/vouchers/validate
GET    /api/admin/vouchers
GET    /api/admin/vouchers/:id
POST   /api/admin/vouchers
PUT    /api/admin/vouchers/:id
DELETE /api/admin/vouchers/:id
```

#### Cart Selection:
```
PUT    /api/cart/select-all
PUT    /api/cart/deselect-all
GET    /api/cart/selected
GET    /api/cart/selected-total
```

#### User Addresses:
```
GET    /api/users/addresses
POST   /api/users/addresses
PUT    /api/users/addresses/:id/default
DELETE /api/users/addresses/:id
```

---

## 📦 Package Dependencies

### New Dependencies Added:
```json
{
  "@libsql/client": "^0.14.0"  // Turso Cloud database client
}
```

### Updated Scripts in package.json:
```json
{
  "seed-turso": "node seed-turso.js",
  "db-health": "node check-db-health.js"
}
```

---

## 🗂️ New Files Added

1. **`database-turso.js`** (2,201 lines)
   - Complete Turso database implementation
   - All operations with Turso-specific optimizations
   - Edge-ready architecture

2. **`seed-turso.js`**
   - Sample data seeding for Turso
   - Compatible with Turso's async API

3. **`migrate-turso.js`**
   - Database migration utilities
   - Schema updates for Turso

4. **`account-dashboard.html`** (1,858 lines)
   - Complete user dashboard interface
   - Profile, orders, reviews, addresses

5. **`run-migration.html`**
   - Admin tool for running database migrations
   - Utility for schema updates

---

## 🔄 Modified Files

### Core Backend:
- ✏️ `database-config.js` - Added Turso detection
- ✏️ `database.js` - Added vouchers, cart selection, addresses
- ✏️ `api.js` - New endpoints for all features

### Frontend:
- ✏️ `cart.html` - Item selection checkboxes
- ✏️ `checkout.html` - Voucher input field
- ✏️ `admin.html` - Voucher management panel
- ✏️ `js/api-client.js` - New API methods

---

## 🎨 UI/UX Improvements

### Cart Page:
- ✅ Individual item selection checkboxes
- ✅ "Select All" / "Deselect All" buttons
- ✅ Live total updates based on selection
- ✅ Visual feedback for selected items

### Checkout Page:
- ✅ Voucher code input field
- ✅ "Apply Voucher" button
- ✅ Real-time discount calculation
- ✅ Error messages for invalid codes

### Account Dashboard:
- ✅ Modern sidebar navigation
- ✅ Tabbed content sections
- ✅ Responsive mobile design
- ✅ Address management interface
- ✅ Order history with details

---

## 🔒 Security Updates

### Enhanced Admin Authentication:
```javascript
// Improved admin verification
authenticateAdmin middleware now:
- Validates admin role in token
- Verifies admin exists in database
- Checks for active admin status
```

### Voucher Security:
- ✅ Per-user usage limits
- ✅ Total usage caps
- ✅ Expiration date validation
- ✅ Status-based activation

---

## 📈 Performance Optimizations

### Database Indexing:
```sql
-- New indexes added in Turso
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
```

### Query Optimization:
- Turso uses edge-hosted databases for low latency
- Connection pooling for PostgreSQL
- Efficient JOIN queries for cart with book details

---

## 🐛 Bug Fixes

1. **Cart Persistence**: Fixed cart items not persisting after logout
2. **Book Update**: Resolved issue with book stock not updating correctly
3. **Admin Auth**: Fixed admin token verification edge cases
4. **Mobile Layout**: Responsive design fixes for account pages

---

## 📚 Database Schema Changes

### New Tables:
1. **`vouchers`** - Discount code management
2. **`user_addresses`** - Multiple shipping addresses

### Modified Tables:
1. **`cart`** - Added `selected_for_checkout` column
2. **`users`** - Added `archived` column (migration)
3. **`orders`** - Added `archived` column (migration)

---

## 🚀 Deployment Updates

### Vercel Configuration:
- No changes required - automatic database detection works
- Environment variables needed for Turso:
  - `TURSO_DATABASE_URL`
  - `TURSO_AUTH_TOKEN`

### Database Options Comparison:

| Feature | Turso Cloud | PostgreSQL | SQLite |
|---------|-------------|------------|--------|
| **Use Case** | Production (Edge) | Production | Development |
| **Setup** | Manual (Turso CLI) | Auto (Vercel) | Automatic |
| **Free Tier** | 9GB + 1B reads | Limited | Unlimited |
| **Performance** | Edge (Fastest) | Good | Local only |
| **Replication** | Multi-region | Single region | None |
| **Scalability** | Excellent | Good | Limited |

---

## 📖 Documentation Updates Needed

### README.md Sections to Update:

1. **Features Section**:
   - Add Voucher/Coupon system
   - Add Cart item selection
   - Add Multiple addresses
   - Add Account dashboard

2. **Database Configuration**:
   - Update to reflect 3 database options
   - Add Turso as recommended option
   - Include Turso setup instructions

3. **API Endpoints**:
   - Document new voucher endpoints
   - Document cart selection endpoints
   - Document address management endpoints

4. **Project Structure**:
   - List new files (database-turso.js, etc.)
   - Update with account-dashboard.html

---

## 🎯 Migration Guide

### For Existing Users:

#### If Using SQLite (Local):
1. Database will auto-migrate on next startup
2. New columns added automatically
3. No manual action required

#### If Using PostgreSQL (Vercel):
1. Schema updates applied on deployment
2. Verify tables with `/api/health` endpoint
3. Check logs for migration success

#### To Switch to Turso:
1. Install Turso CLI
2. Create Turso database
3. Add environment variables
4. Run `npm run seed-turso`
5. Redeploy

---

## 🔮 Future Roadmap

Based on current features, potential next steps:

- [ ] **Wishlist Sharing** - Share favorites with friends
- [ ] **Book Recommendations** - AI-powered suggestions
- [ ] **Order Tracking** - Real-time shipping updates
- [ ] **Email Notifications** - Order confirmations, promotions
- [ ] **Social Login** - Google/Facebook authentication
- [ ] **Advanced Search** - Filters, sorting, price ranges
- [ ] **Book Previews** - Sample pages/chapters
- [ ] **Mobile App** - React Native/Flutter version

---

## 💡 Breaking Changes

### None! 🎉

All updates are **backward compatible**. Existing functionality remains unchanged.

- Old database configurations still work
- Existing API endpoints unchanged
- No changes required to existing code

---

## 📞 Support & Resources

### New Documentation:
- **TURSO_SETUP.md** - Complete Turso database setup guide (create this)
- **VOUCHER_GUIDE.md** - Voucher system usage guide (create this)

### Updated Resources:
- Package.json scripts updated
- Environment variable examples updated
- API documentation enhanced

---

## ✅ Testing Checklist

### For Developers Updating:

- [ ] Database auto-detection works correctly
- [ ] Cart item selection functions properly
- [ ] Vouchers validate correctly
- [ ] Address management saves addresses
- [ ] Account dashboard loads all sections
- [ ] Archive operations work for books/users/orders
- [ ] Admin panel shows voucher management
- [ ] Turso database connects (if configured)
- [ ] Migrations run successfully
- [ ] All API endpoints respond correctly

---

## 🏆 Credits

**Developer:** Arianne Kaye E. Tupaen  
**GitHub:** [@Vaelarr](https://github.com/Vaelarr)  
**Project:** [Literary-Escape](https://github.com/Vaelarr/Literary-Escape)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 14, 2025 | Initial README |
| 1.1.0 | Oct 22, 2025 | Turso DB, Vouchers, Cart Selection, Address Management, Account Dashboard |

---

**🎉 End of Update Documentation**

*For the complete feature list, see README.md*  
*For deployment instructions, see README.md*  
*For troubleshooting, see README.md*

**Last Updated:** October 22, 2025  
**Documentation Version:** 1.1.0
