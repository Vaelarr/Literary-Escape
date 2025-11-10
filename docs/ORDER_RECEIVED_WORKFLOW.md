# Order Received Workflow Documentation

## Overview
This document describes the order received workflow where customers must confirm receipt of their order before admins can mark it as completed.

## Database Changes

### Orders Table
Added two new columns to the `orders` table:
- `received_by_user` (BOOLEAN, default: 0) - Tracks whether the user has confirmed receipt
- `received_at` (DATETIME) - Timestamp when the user marked the order as received

## API Changes

### New User Endpoint
**PUT** `/api/orders/:id/receive`
- **Authentication**: Requires user token
- **Purpose**: Allows users to mark their delivered orders as received
- **Validation**:
  - Order must belong to the authenticated user
  - Order status must be "delivered"
  - Order cannot already be marked as received
- **Response**: Returns updated order information

### Modified Admin Endpoint
**PUT** `/api/admin/orders/:id`
- **New Validation**: 
  - Prevents admin from marking order as "completed" unless `received_by_user` is true
  - Returns error: "Order cannot be marked as completed until the customer marks it as received"

## User Interface Changes

### Customer Dashboard (account-dashboard.html)
1. **Order List Display**:
   - Shows "Mark as Received" button for orders with status "delivered" that haven't been received yet
   - Displays green "Received on [date]" badge for received orders
   - Button is only visible for delivered, unreceived orders

2. **New Function**:
   - `markOrderAsReceived(orderId)` - Handles marking order as received with confirmation dialog

### Admin Panel (admin.html)
1. **Order Table Display**:
   - Added "Delivered" status option to the status dropdown
   - Shows status badges next to order status:
     - Green "Received" badge with checkmark for received orders
     - Orange "Pending" badge with clock for delivered but unreceived orders
   - Disables "Completed" option in dropdown if order hasn't been received

2. **Order Details Modal**:
   - Shows "Received by customer on [date]" badge for received orders
   - Shows "Awaiting customer confirmation" badge for delivered unreceived orders

3. **Enhanced Validation**:
   - `updateOrderStatus()` function now checks if user has received order before allowing completion
   - Shows appropriate error message if admin tries to complete unreceived order

4. **Archived Orders**:
   - Also displays received status badges for archived orders

## Workflow

### Normal Order Flow
1. Admin creates/processes order → Status: "pending"
2. Admin marks order as "processing" → Status: "processing"
3. Admin marks order as "shipped" → Status: "shipped"
4. Admin marks order as "delivered" → Status: "delivered"
5. **Customer marks order as received** → `received_by_user` = true, `received_at` = current timestamp
6. Admin can now mark as "completed" → Status: "completed"

### Restrictions
- Customers can only mark orders as received if status is "delivered"
- Customers cannot mark an order as received more than once
- Admins cannot mark an order as "completed" unless customer has marked it as received
- If admin tries to complete unreceived order, error message is shown

## Status Definitions
- **pending**: Order placed, awaiting processing
- **processing**: Order is being prepared
- **shipped**: Order has been shipped to customer
- **delivered**: Order has been delivered to customer (awaiting customer confirmation)
- **completed**: Order delivered AND confirmed received by customer
- **cancelled**: Order was cancelled

## Migration
The database migration runs automatically on server start and adds the new columns to existing orders table. Existing orders will have `received_by_user` = 0 by default.

## Benefits
1. **Order Confirmation**: Ensures customers actually received their orders before marking complete
2. **Dispute Prevention**: Provides clear record of when customer confirmed receipt
3. **Better Tracking**: Admins can see which delivered orders are awaiting customer confirmation
4. **Improved Communication**: Clear visual indicators for both customers and admins about order status
