# End-to-End Operational Lifecycle Verification Script

**Role:** Lead QA Engineer
**System:** Lean Logistics Management (Tripartite Loop)
**Version:** v1.0

## Prerequisites
- Server running at `http://localhost:3000`
- Supabase project connected and running
- **Test Accounts**:
    - **Client User**: `client@example.com` (or similar)
    - **Admin User**: `admin@example.com`
    - **Driver User**: `driver@example.com`

---

## 1. Client Initiation (Trip Request)
**Goal:** Create a 'pending' trip request using the Client Portal.

**Step-by-Step:**
1. Log in as **Client User** and navigate to `http://localhost:3000/client`.
2. Click the **"New Shipment Request"** button (Top Right).
3. Fill in the form:
   - **Pickup Location**: `Warehouse A, Mumbai`
   - **Drop-off Location**: `Distribution Center, Pune`
   - **Billed Amount**: `5000`
4. Click **"Submit Request"**.
5. **Verification**:
   - The modal should close.
   - **UI Expectation**: You should see the new shipment appear in the "Awaiting Assignment" section (Yellow status) immediately.

---

## 2. Admin Assignment
**Goal:** Assign a driver and vehicle to the pending request.

**Step-by-Step:**
1. Log in as **Admin** and navigate to `http://localhost:3000/admin`.
2. Locate the **Booking Request Queue** (Right-hand panel).
3. **UI Check**: Verify the trip from Step 1 appears here with "Warehouse A" → "Distribution Center".
4. Click the **"Assign Driver & Vehicle"** button on the trip card.
5. In the **Assignment Modal**:
   - **Select Driver**: Choose a driver (e.g., "Ramesh Driver").
   - **Select Vehicle**: Choose an available vehicle (e.g., "MH-12-AB-1234").
   - Click **"Confirm Assignment"**.

**Database Verification (Trigger Check):**
- Run: `SELECT status, driver_id, vehicle_id FROM public.trips WHERE id = '[TRIP_ID]';` -> Expect `status` = 'assigned'.
- Run: `SELECT is_available FROM public.vehicles WHERE id = '[VEHICLE_ID]';` -> Expect `is_available` = `false` (Trigger `handle_vehicle_availability` worked).

---

## 3. Driver Execution
**Goal:** Accept, run, and complete the trip.

**Step-by-Step:**
1. Log in as the **assigned Driver** and navigate to `http://localhost:3000/driver`.
2. **UI Check**: Verify seeing the "Active Assignment" card. Status badge should say **ASSIGNED** (gray/secondary).
3. **Start Trip**:
   - Click **"Arrived at Pickup"**.
   - **UI Validation**:
     - Status badge changes to **ACTIVE** (Green).
     - "Quick Action" buttons (Break, Fuel, Toll) appear.
4. **Log Fuel Milestone**:
   - Click **"Fuel"** button.
   - Enter **Cost**: `3500`, **Liters**: `35`.
   - Click **"Log Milestone"**.
   - **UI Validation**: New entry appears in "Trip Timeline" with Fuel icon and cost details.
   - **DB Validation**: `SELECT * FROM public.milestones WHERE trip_id = '...';` should show a `fuel` record with JSON metadata.
5. **Complete Trip**:
   - Click **"Complete Delivery"**.
   - **UI Check**: Card disappears or shows "No Active Trips" state (depending on refresh/redirect logic).

**Final Database Verification:**
- Run: `SELECT status FROM public.trips WHERE id = '[TRIP_ID]';` -> Expect `status` = 'completed'.
- Run: `SELECT is_available FROM public.vehicles WHERE id = '[VEHICLE_ID]';` -> Expect `is_available` = `true` (Vehicle automatically returned to pool).

---

## Checklist Summary
| Step | Action | Expected Outcome | Pass/Fail |
| :--- | :--- | :--- | :--- |
| 1 | Client creates request | (Workaround used) Row in DB, visible in Client UI | |
| 2 | Admin sees request | Visible in BookingQueue | |
| 3 | Admin assigns resource | Modal works, DB updates to 'assigned' | |
| 4 | Vehicle locked | `vehicles.is_available` becomes FALSE | |
| 5 | Driver starts trip | Status 'assigned' -> 'active' | |
| 6 | Driver logs fuel | Milestone added with metadata | |
| 7 | Driver completes trip | Status 'active' -> 'completed' | |
| 8 | Vehicle released | `vehicles.is_available` becomes TRUE | |
