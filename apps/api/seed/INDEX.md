# Seed Cases Index

All cases validate against `packages/types/case.schema.json`.

| # | File | Title | Category | Difficulty | Failure Mode |
|---|------|-------|----------|------------|--------------|
| 001 | `001_marketing_variance.json` | Northgate Advisory — Q1 Marketing Budget Variance | Variance Analysis | Easy | `one_off_as_recurring` |
| 002 | `002_saas_revenue_recognition.json` | Arcturus Cloud — 3-Year Enterprise License Recognition | Revenue Recognition | Hard | `revenue_recognition_timing` |
| 003 | `003_hardware_sales_drop.json` | Q3 Revenue Reconciliation — Hardware Sales Anomaly | Reconciliation | Medium | `ignoring_source_evidence` |
| 004 | `004_payroll_accrual.json` | Meridian Logistics Group — Q4 Bonus Accrual Omission | Payroll & Accruals | Medium | `accrual_vs_cash` |
| 005 | `005_inventory_writedown.json` | Crestline Electronics Corp. — Electronics Inventory Impairment Assessment | Inventory | Hard | `overconfident_incomplete_data` |
| 006 | `006_lease_classification.json` | FreshMart Grocery Co. — Equipment Lease Classification | Lease Accounting | Hard | `wrong_cost_category` |
| 007 | `007_ar_aging.json` | Meridian Parts & Supply Co. — Q3 Collections Forecast Approval | Collections & AR | Medium | `cashflow_vs_pnl` |
| 008 | `008_capex_vs_opex.json` | Greystone Commercial Properties — HVAC Repair Capitalization | CapEx vs OpEx | Easy | `wrong_cost_category` |
| 009 | `009_fx_revaluation.json` | Transatlantic Freight Partners — EUR Receivables Revaluation | FX Revaluation | Medium | `overconfident_incomplete_data` |
| 010 | `010_stock_based_comp.json` | Stellarpath Technologies — Performance Share Vesting Cliff Under-Accrual | Stock-Based Compensation | Easy | `materiality_ignored` |

## Difficulty mix
- Easy (3): 001, 008, 010
- Medium (4): 003, 004, 007, 009
- Hard (3): 002, 005, 006

## Failure mode coverage
| Mode | Cases |
|------|-------|
| `one_off_as_recurring` | 001 |
| `revenue_recognition_timing` | 002 |
| `ignoring_source_evidence` | 003 |
| `accrual_vs_cash` | 004 |
| `overconfident_incomplete_data` | 005, 009 |
| `wrong_cost_category` | 006, 008 |
| `cashflow_vs_pnl` | 007 |
| `materiality_ignored` | 010 |

## To reload into DB
```bash
python apps/api/app/db/seed.py
```
