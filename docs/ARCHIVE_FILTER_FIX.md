# Archive Tabs Filter Dropdown Fix

## Summary
Fixed the filter dropdowns for archived books and orders to work properly with backend filtering.

---

## Issues Fixed

### 1. ✅ Archived Books Category Filter
**Problem:** The category filter dropdown was visible but didn't actually filter the archived books by category.

**Root Cause:**
- API endpoint didn't accept `category` parameter
- Database operation didn't support category filtering
- No state management for the selected category

**Solution:**
1. Updated API endpoint to accept and pass `category` parameter
2. Enhanced database query to filter by category when provided
3. Added state management to maintain selected filter value
4. Updated pagination to respect category filter

---

### 2. ✅ Archived Orders Status Filter
**Status:** Already working correctly! ✓

The archived orders filter was already properly implemented with:
- API endpoint accepts `status` parameter
- Database operation filters by status
- Pagination respects status filter

---

## Changes Made

### File 1: `api.js` (Backend API)

**Location:** Line ~1207

**Before:**
```javascript
app.get('/api/admin/books/archived', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // ❌ No category parameter

    archiveOperations.getArchivedBooks(page, limit, (err, result) => {
        // ...
    });
});
```

**After:**
```javascript
app.get('/api/admin/books/archived', authenticateAdmin, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null; // ✅ Added category parameter

    console.log('Admin fetching archived books, page:', page, 'limit:', limit, 'category:', category);

    archiveOperations.getArchivedBooks(page, limit, category, (err, result) => {
        // ...
    });
});
```

---

### File 2: `database-turso.js` (Database Operation)

**Location:** Line ~1989

**Before:**
```javascript
getArchivedBooks: async (page = 1, limit = 10, callback) => {
    // ❌ Always fetches all archived books
    const countQuery = 'SELECT COUNT(*) as total FROM books WHERE archived = 1';
    const dataQuery = 'SELECT * FROM books WHERE archived = 1 ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    
    const [countResult, booksResult] = await Promise.all([
        query(countQuery),
        query(dataQuery, [limit, offset])
    ]);
}
```

**After:**
```javascript
getArchivedBooks: async (page = 1, limit = 10, category = null, callback) => {
    // ✅ Dynamic query based on category filter
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE archived = 1';
    let dataQuery = 'SELECT * FROM books WHERE archived = 1';
    const params = [];
    
    if (category) {
        countQuery += ' AND category = ?';
        dataQuery += ' AND category = ?';
        params.push(category);
    }
    
    dataQuery += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    
    const [countResult, booksResult] = await Promise.all([
        query(countQuery, category ? [category] : []),
        query(dataQuery, [...params, limit, offset])
    ]);
}
```

---

### File 3: `admin.html` (Frontend)

**Location:** Line ~1593

**Enhancement:** Added filter state management

**Before:**
```javascript
async function loadArchivedBooksFromAPI(page = currentArchivedBooksPage, category = 'all') {
    // ... load data ...
    
    displayArchivedBooks(category);
    // ❌ Filter dropdown may not reflect actual selection
}
```

**After:**
```javascript
async function loadArchivedBooksFromAPI(page = currentArchivedBooksPage, category = 'all') {
    // ... load data ...
    
    // ✅ Update the filter dropdown to show current selection
    const categoryFilter = document.getElementById('archivedBookCategoryFilter');
    if (categoryFilter && categoryFilter.value !== category) {
        categoryFilter.value = category;
    }
    
    displayArchivedBooks(category);
}
```

---

## How It Works

### Archived Books Filter Flow

1. **User selects category** from dropdown (Fiction, Non - Fiction, or All Categories)
2. **onchange event** triggers: `loadArchivedBooksFromAPI(1, this.value)`
3. **API client** sends request: `/admin/books/archived?page=1&limit=10&category=Fiction`
4. **Backend API** receives and validates category parameter
5. **Database query** filters: `WHERE archived = 1 AND category = 'Fiction'`
6. **Results returned** with pagination data
7. **Frontend displays** filtered books with updated pagination

### Archived Orders Filter Flow

1. **User selects status** from dropdown (pending, processing, shipped, completed, cancelled, or All Statuses)
2. **onchange event** triggers: `loadArchivedOrdersFromAPI(1, this.value)`
3. **API client** sends request: `/admin/orders/archived?page=1&limit=10&status=completed`
4. **Backend filters** orders by status
5. **Results displayed** with correct count and pagination

---

## Filter Options

### Archived Books Category Filter
```html
<select id="archivedBookCategoryFilter" onchange="loadArchivedBooksFromAPI(1, this.value)">
    <option value="all">All Categories</option>
    <option value="Fiction">Fiction</option>
    <option value="Non - Fiction">Non - Fiction</option>
</select>
```

**Values:**
- `all` → Shows all archived books (no filter)
- `Fiction` → Shows only Fiction archived books
- `Non - Fiction` → Shows only Non-Fiction archived books (note: space in value matches database)

### Archived Orders Status Filter
```html
<select id="archivedStatusFilter" onchange="loadArchivedOrdersFromAPI(1, this.value)">
    <option value="all">All Statuses</option>
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
</select>
```

---

## Testing Checklist

### Test 1: Archived Books Filter
- [x] Navigate to Archived Books section
- [x] Select "Fiction" - should show only Fiction books
- [x] Select "Non - Fiction" - should show only Non-Fiction books
- [x] Select "All Categories" - should show all archived books
- [x] Pagination works with filter active
- [x] Filter selection persists during pagination
- [x] Book count updates based on filter

### Test 2: Archived Orders Filter
- [x] Navigate to Archived Orders section
- [x] Select "Completed" - should show only completed orders
- [x] Select "Pending" - should show only pending orders
- [x] Select "All Statuses" - should show all archived orders
- [x] Pagination works with filter active
- [x] Order count updates based on filter

### Test 3: Filter State Persistence
- [x] Apply filter on archived books
- [x] Navigate to different page
- [x] Filter selection remains active
- [x] Data remains filtered

---

## Console Debug Output

When filtering archived books, you should see:
```
📚 Loading archived books - Page: 1, Category: Fiction
Admin fetching archived books, page: 1, limit: 10, category: Fiction
✅ Archived books loaded: 5, Total: 5
```

When filtering archived orders, you should see:
```
📋 Loading archived orders - Page: 1, Status: completed
Admin fetching archived orders, page: 1, limit: 10, filters: { status: 'completed' }
✅ Archived orders loaded
```

---

## API Endpoints

### Get Archived Books (with filter)
```
GET /api/admin/books/archived?page=1&limit=10&category=Fiction
Authorization: Bearer <admin_token>

Response:
{
  "books": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

### Get Archived Orders (with filter)
```
GET /api/admin/orders/archived?page=1&limit=10&status=completed
Authorization: Bearer <admin_token>

Response:
{
  "orders": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 8,
    "itemsPerPage": 10
  }
}
```

---

## Database Queries

### Archived Books - All Categories
```sql
SELECT COUNT(*) as total FROM books WHERE archived = 1;
SELECT * FROM books WHERE archived = 1 ORDER BY updated_at DESC LIMIT 10 OFFSET 0;
```

### Archived Books - Fiction Only
```sql
SELECT COUNT(*) as total FROM books WHERE archived = 1 AND category = 'Fiction';
SELECT * FROM books WHERE archived = 1 AND category = 'Fiction' ORDER BY updated_at DESC LIMIT 10 OFFSET 0;
```

### Archived Orders - Completed Only
```sql
SELECT COUNT(*) as total FROM orders WHERE archived = 1 AND status = 'completed';
SELECT * FROM orders WHERE archived = 1 AND status = 'completed' ORDER BY created_at DESC LIMIT 10 OFFSET 0;
```

---

## Important Notes

1. **Category Value Consistency**
   - Database stores: `"Non - Fiction"` (with spaces)
   - Filter dropdown uses: `value="Non - Fiction"` (matches database)
   - Display shows: `"Non-Fiction"` (no spaces, but value is correct)

2. **Filter Reset**
   - Changing filter automatically resets to page 1
   - Ensures user sees filtered results from the beginning

3. **Pagination Integration**
   - `paginateArchivedBooks()` uses current filter value
   - Filter persists across page changes

4. **No Filter = All Items**
   - `category="all"` → converted to `null` → no WHERE clause for category
   - `status="all"` → not included in filters object → no WHERE clause for status

---

## Files Modified

1. ✅ `api.js` - Added category parameter to archived books endpoint
2. ✅ `database-turso.js` - Enhanced getArchivedBooks with category filtering
3. ✅ `admin.html` - Added filter state management
4. ℹ️ `js/api-client.js` - Already correct (no changes needed)

---

## Status
✅ **COMPLETE** - Archive filter dropdowns are now fully functional for both moderator and super-admin roles.

Both archived books category filter and archived orders status filter work correctly with:
- Backend filtering
- Pagination
- State persistence
- Accurate counts
