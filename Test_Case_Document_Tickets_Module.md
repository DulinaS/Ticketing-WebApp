# Test Case Document - Tickets Module

## Project: Ticketing WebApp

## Module: Tickets

## Testing Type: Manual Testing

## Prepared By: QA Engineer

## Date: February 7, 2026

---

| Scenario                                     | Test Case ID | Test Case                                                 | Test Steps                                                                                                                                                                                               | Pre-Requisites                                                                                     | Expected Results                                                                                                                       | Actual Results (if results differ from Expected Results)                                  | Status (Pass/Fail) | Priority | Number of times executed | Comments                            | Module  |
| -------------------------------------------- | ------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ | -------- | ------------------------ | ----------------------------------- | ------- |
| **Create Ticket - Valid Data**               | TC_TKT_001   | Create a new ticket with valid title and price            | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Enter valid title "Concert Ticket"<br>4) Enter valid price "25.00"<br>5) Click Submit button               | *User is logged in<br>*User has valid session                                                      | Ticket should be created successfully and user should be redirected to homepage. New ticket should appear in the tickets list.         | Ticket was created successfully. User was redirected to homepage. Ticket visible in list. | Pass               | H        | 3                        |                                     | Tickets |
| **Create Ticket - Empty Title**              | TC_TKT_002   | Attempt to create a ticket with empty title field         | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Leave title field empty<br>4) Enter valid price "50.00"<br>5) Click Submit button                          | *User is logged in<br>*User has valid session                                                      | System should display error message "Title is required". Ticket should NOT be created.                                                 | Error message "Title is required" displayed. Ticket not created.                          | Pass               | H        | 2                        |                                     | Tickets |
| **Create Ticket - Invalid Price (Zero)**     | TC_TKT_003   | Attempt to create a ticket with price set to zero         | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Enter valid title "Movie Ticket"<br>4) Enter price as "0"<br>5) Click Submit button                        | *User is logged in<br>*User has valid session                                                      | System should display error message "Price must be greater than 0". Ticket should NOT be created.                                      | Error message "Price must be greater than 0" displayed.                                   | Pass               | H        | 2                        |                                     | Tickets |
| **Create Ticket - Invalid Price (Negative)** | TC_TKT_004   | Attempt to create a ticket with negative price value      | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Enter valid title "Sports Event"<br>4) Enter price as "-10.00"<br>5) Click Submit button                   | *User is logged in<br>*User has valid session                                                      | System should display error message "Price must be greater than 0". Ticket should NOT be created.                                      | Error message displayed. Ticket not created.                                              | Pass               | H        | 2                        |                                     | Tickets |
| **Create Ticket - Unauthenticated User**     | TC_TKT_005   | Attempt to create a ticket without being logged in        | 1) Ensure user is NOT logged in (no active session)<br>2) Navigate directly to "Sell Tickets" page via URL<br>3) Attempt to submit ticket creation form                                                  | *User is NOT logged in<br>*No valid session exists                                                 | System should deny access and display "Not authorized" error. User should be redirected to sign in page or shown authentication error. | Not authorized error shown. Access denied.                                                | Pass               | H        | 3                        |                                     | Tickets |
| **View All Available Tickets**               | TC_TKT_006   | View list of all available (non-reserved) tickets         | 1) Log in to the system with a valid user account<br>2) Navigate to homepage/tickets list page<br>3) Observe the displayed tickets                                                                       | *User is logged in<br>*At least one ticket exists in the system<br>\*Some tickets are not reserved | System should display all available tickets that are not currently reserved. Reserved tickets should NOT appear in the list.           | All non-reserved tickets displayed correctly. Reserved tickets hidden.                    | Pass               | M        | 4                        |                                     | Tickets |
| **View Single Ticket Details**               | TC_TKT_007   | View details of a specific ticket                         | 1) Log in to the system with a valid user account<br>2) Navigate to homepage/tickets list page<br>3) Click on a specific ticket from the list<br>4) Observe the ticket details page                      | *User is logged in<br>*At least one ticket exists in the system                                    | System should display ticket details page showing title, price, and Purchase button correctly.                                         | Ticket title and price displayed correctly. Purchase button visible.                      | Pass               | M        | 3                        |                                     | Tickets |
| **View Non-Existent Ticket**                 | TC_TKT_008   | Attempt to view a ticket that does not exist              | 1) Log in to the system with a valid user account<br>2) Navigate directly to a ticket URL with invalid/non-existent ticket ID<br>3) Observe the response                                                 | *User is logged in<br>*The ticket ID used does not exist in database                               | System should display "Not Found" error message (404). User should be informed that the ticket does not exist.                         | "Not Found" error displayed correctly.                                                    | Pass               | M        | 2                        |                                     | Tickets |
| **Update Ticket - Valid Data (Owner)**       | TC_TKT_009   | Update an existing ticket with valid data by ticket owner | 1) Log in as the user who created the ticket<br>2) Navigate to the ticket to be updated<br>3) Update title to "Updated Concert Ticket"<br>4) Update price to "35.00"<br>5) Submit the update             | *User is logged in<br>*User owns the ticket being updated<br>\*Ticket is NOT reserved              | System should update the ticket successfully. Updated title and price should be reflected in the ticket details.                       | Ticket updated successfully with new title and price.                                     | Pass               | H        | 3                        |                                     | Tickets |
| **Update Ticket - Not Owner**                | TC_TKT_010   | Attempt to update a ticket that belongs to another user   | 1) Log in as User A<br>2) Note a ticket created by User B<br>3) Attempt to update User B's ticket via API/URL manipulation<br>4) Observe the response                                                    | *User A is logged in<br>*Ticket belongs to User B (different user)<br>\*Ticket exists in system    | System should display "Not Authorized" error. Update should be rejected. Ticket should remain unchanged.                               | "Not Authorized" error displayed. Ticket unchanged.                                       | Pass               | H        | 2                        | Security test - authorization check | Tickets |
| **Update Reserved Ticket**                   | TC_TKT_011   | Attempt to update a ticket that is currently reserved     | 1) Log in as the ticket owner<br>2) Navigate to a ticket that has been reserved (has active order)<br>3) Attempt to update the ticket title or price<br>4) Submit the update                             | *User is logged in and owns the ticket<br>*Ticket has an active order/reservation                  | System should display error "Cannot update a reserved Ticket". Update should be rejected.                                              | Error message "Cannot update a reserved Ticket" displayed.                                | Pass               | H        | 2                        |                                     | Tickets |
| **Price Format - Decimal Rounding**          | TC_TKT_012   | Verify price is formatted to 2 decimal places on blur     | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Enter price as "25.5"<br>4) Click outside the price field (blur event)<br>5) Observe the price field value | *User is logged in<br>*User is on create ticket page                                               | Price field should automatically format to "25.50" (2 decimal places) after blur event.                                                | Price formatted to "25.50" correctly.                                                     | Pass               | L        | 2                        | UI formatting validation            | Tickets |
| **Create Ticket - Empty Price**              | TC_TKT_013   | Attempt to create a ticket with empty price field         | 1) Log in to the system with a valid user account<br>2) Navigate to "Sell Tickets" page<br>3) Enter valid title "Music Festival"<br>4) Leave price field empty<br>5) Click Submit button                 | *User is logged in<br>*User has valid session                                                      | System should display error message indicating price is required or invalid. Ticket should NOT be created.                             | Error message displayed. Ticket not created.                                              | Pass               | H        | 2                        |                                     | Tickets |
| **View Ticket with Invalid ID Format**       | TC_TKT_014   | Attempt to view ticket with malformed/invalid ID          | 1) Log in to the system with a valid user account<br>2) Navigate directly to ticket URL with invalid ID format (e.g., "abc123")<br>3) Observe the response                                               | *User is logged in<br>*Invalid ID format is used (not valid MongoDB ObjectId)                      | System should validate the ID format and display "Not Found" error. System should handle invalid ID gracefully without crashing.       | "Not Found" error displayed. No system crash.                                             | Pass               | M        | 2                        | Input validation test               | Tickets |

---

## Test Case Summary

| Total Test Cases | Passed | Failed | Not Executed | Pass Rate |
| ---------------- | ------ | ------ | ------------ | --------- |
| 14               | 14     | 0      | 0            | 100%      |

---

## Test Coverage Summary

| Functionality                   | Test Cases Covered                 |
| ------------------------------- | ---------------------------------- |
| Create Ticket (Valid)           | TC_TKT_001                         |
| Create Ticket (Invalid - Title) | TC_TKT_002                         |
| Create Ticket (Invalid - Price) | TC_TKT_003, TC_TKT_004, TC_TKT_013 |
| Create Ticket (Authentication)  | TC_TKT_005                         |
| View All Tickets                | TC_TKT_006                         |
| View Single Ticket              | TC_TKT_007, TC_TKT_008, TC_TKT_014 |
| Update Ticket (Valid)           | TC_TKT_009                         |
| Update Ticket (Authorization)   | TC_TKT_010                         |
| Update Ticket (Reserved)        | TC_TKT_011                         |
| UI/UX Validation                | TC_TKT_012                         |

---

## Priority Legend

- **H** - High Priority: Critical functionality that must work correctly
- **M** - Medium Priority: Important functionality but not critical
- **L** - Low Priority: Nice to have, minor functionality

---

## Notes

1. All tests were executed in a controlled testing environment
2. Test data was created specifically for testing purposes
3. Backend API validation was verified along with frontend UI behavior
4. Security tests (TC_TKT_005, TC_TKT_010) verify proper authentication and authorization controls
5. Input validation tests ensure data integrity and system stability
