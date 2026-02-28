# Data Model (Current Starter)

## Facility

- id
- name
- timezone
- kennelCount
- dayCutoffHour
- nightCutoffHour
- taxRates `{ boarding, daycare, grooming, retail }`
- pricing `{ boardingNight, daycareDay, groomingBase }`

## Users

- id
- email
- name
- role
- passwordHash
- active

## Employees

- id
- firstName
- lastName
- role
- hourlyRate
- active

## Customers

- id
- firstName
- lastName
- email
- phone
- notes

## Pets

- id
- customerId
- name
- species
- breed
- birthDate
- weightLbs
- behaviorNotes
- groomingNotes

## Reservations

- id
- customerId
- petId
- serviceType (`boarding` | `daycare`)
- billingMode (`night` | `day`)
- checkInAt
- checkOutAt
- kennelsRequired
- units
- status

## GroomingAppointments

- id
- petId
- groomerId
- startAt
- endAt
- packageName
- notes
- status

## InventoryItems

- id
- sku
- name
- category
- price
- taxable
- quantityOnHand
- reorderLevel

## Invoices

- id
- customerId
- petId
- reservationId
- lineItems[]
- subtotal
- tax
- total
- status
