# MILO Product Roadmap

## Core Modules

1. Authentication and role-based access (`admin`, `manager`, `employee`, `groomer`)
2. Facility settings (kennel capacity, tax rates, pricing, billing cutoffs)
3. CRM (customers, pets, contact records, notes)
4. Calendar and reservations (boarding/daycare occupancy and availability)
5. Grooming appointments (stylist assignment, packages, status workflow)
6. Inventory and retail catalog (taxable vs non-taxable)
7. Billing and invoices (service charges, retail sales, sales tax)
8. Reporting (occupancy, revenue, labor, package performance)

## Booking & Calendar Requirements

- Capacity uses `facility.kennelCount`
- Reservation overlap logic blocks overbooking
- Billing can be configured by:
  - `night` for boarding
  - `day` for daycare
- Day billing uses a configurable cutoff hour (`dayCutoffHour`)
- Night billing counts per overnight stay

## Suggested Next Build Steps

1. Replace in-memory store with PostgreSQL
2. Add recurring daycare schedules
3. Add drag-and-drop calendar UI
4. Build check-in/check-out operations board
5. Add payment processor integration
6. Add vaccination and incident tracking
7. Add audit log and immutable billing events
