# POS Application

Point of sale system and inventory management.

## Language

**Stock Ledger**:
The module responsible for safely adjusting a product's stock quantity and guaranteeing the creation of a corresponding `StockMovement` audit record.
_Avoid_: StockManager, StockService, AdjustStockAction
