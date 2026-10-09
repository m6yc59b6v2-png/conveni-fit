#!/usr/bin/env python3
"""Validate approved product records before publishing."""
import json, sys, re, datetime
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'data/products.json'
data=json.loads(p.read_text(encoding='utf-8'))
assert data['schema_version']==1
ids=set()
for x in data['products']:
    assert isinstance(x['id'],str) and re.fullmatch(r'[a-z0-9-]+',x['id'])
    assert x['id'] not in ids, f"duplicate id {x['id']}"
    ids.add(x['id'])
    assert x['chain'] in ('seven','family','lawson')
    assert x['category'] in ('staple','protein','vegetable','fruit','dairy','other')
    assert x['status'] in ('verified','review','discontinued')
    assert isinstance(x['name'],str) and x['name'].strip()
    assert x['source_url'].startswith('https://')
    assert isinstance(x['allergens'],list)
    for k in ('price','kcal','protein','fat','carbs'):
        assert x[k] is None or (isinstance(x[k],(int,float)) and not isinstance(x[k],bool) and 0<=x[k]<=10000), (x['id'],k)
    if x['status']=='verified':
        assert x['verified_at'] and re.fullmatch(r'\d{4}-\d{2}-\d{2}',x['verified_at'])
        date=datetime.date.fromisoformat(x['verified_at'])
        assert date<=datetime.date.today()
        assert all(x[k] is not None for k in ('price','kcal','protein')), x['id']
        assert x.get('source_evidence'), f"{x['id']}: source_evidence required"
        assert x.get('reviewed_by'), f"{x['id']}: reviewed_by required"
        assert x['source_evidence'].startswith('https://')
print(f"VALID: {len(ids)} records, {sum(x['status']=='verified' for x in data['products'])} approved")
