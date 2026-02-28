# API Overview

Base URL: `/api`

## Auth

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

## Facility

- `GET /facility`
- `PATCH /facility`

## Employees

- `GET /employees`
- `POST /employees`
- `PATCH /employees/:id`

## Customers / Pets

- `GET /customers`
- `POST /customers`
- `PATCH /customers/:id`
- `GET /customers/:id/pets`
- `POST /customers/:id/pets`

## Calendar / Reservations

- `GET /calendar/availability?from=<iso>&to=<iso>`
- `POST /calendar/quote`
- `POST /calendar/reservations`
- `GET /calendar/reservations`

## Grooming

- `GET /grooming/appointments`
- `POST /grooming/appointments`
- `PATCH /grooming/appointments/:id`

## Inventory

- `GET /inventory`
- `POST /inventory`
- `PATCH /inventory/:id`

## Billing

- `GET /billing/invoices`
- `POST /billing/invoices/from-reservation/:reservationId`
- `POST /billing/sales`
