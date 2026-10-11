# Product batch QA — 2026-10-11

Catalog: 155 products; 52 verified and 103 pending review. Published main was 150 products and 44 verified at batch start.

Verified coverage by chain/category: {"seven":{"staple":5,"protein":3,"vegetable":3,"other":0},"family":{"staple":7,"protein":1,"vegetable":11,"other":0},"lawson":{"staple":4,"protein":9,"vegetable":8,"other":1}}.

Duplicate chain+normalized name check: PASS.

Known gaps:
- Some verified products have incomplete fat/carbohydrate fields; those are not inferred.
- Some verified products have no complete allergen list. Empty lists mean unknown, not allergen-free. The UI conservatively excludes such items when ingredient exclusions are active.
- The Seven-Eleven chicken-breast and bang-bang-chicken salads are Kinki/Shikoku-only and must not be represented as available in Saitama. The current app has no prefecture-level availability filter; a future feature should handle this before local recommendations.
- Price is rounded up to whole yen for budgeting; checkout total may differ.
- Product information is time-sensitive and store labels prevail.

Quality changes: merged duplicate FamilyMart chicken salad and promoted catalog entries with directly reviewed official nutrition information. No browser or automated tests executed in this session.
