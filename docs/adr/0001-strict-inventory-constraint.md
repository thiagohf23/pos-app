# Strict Inventory Constraint for POS Sales

We decided to enforce strict inventory integrity during sales, meaning the system will throw an `InsufficientStockException` rather than allowing a product's stock to go negative.

While allowing negative stock is common in some physical point-of-sale systems (to prevent blocking a cashier during checkout due to system/physical mismatches), we opted for strict integrity to guarantee accurate ledger tracking. If physical stock exists but the system shows zero, the operator or manager must resolve the discrepancy via a manual stock adjustment rather than forcing a negative balance.
