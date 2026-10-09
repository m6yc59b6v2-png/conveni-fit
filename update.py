#!/usr/bin/env python3
"""Record approved changes; never auto-approve unverified external information."""
import json, datetime, subprocess
from pathlib import Path
base=Path(__file__).resolve().parents[1]
product=base/'data/products.json'
history=base/'data/history.json'
current=json.loads(product.read_text(encoding='utf-8'))
try:
    previous=json.loads(subprocess.check_output(['git','show','HEAD~1:data/products.json'],cwd=base,stderr=subprocess.DEVNULL,text=True))
except Exception:
    previous={'products':[]}
old={p['id']:p for p in previous['products']}
now={p['id']:p for p in current['products']}
changes=[]
for pid,item in now.items():
    if pid not in old:changes.append(f"商品登録：{item['name']}（{item['status']}）")
    elif item!=old[pid]:changes.append(f"商品更新：{item['name']}（{item['status']}）")
for pid,item in old.items():
    if pid not in now:changes.append(f"商品削除：{item['name']}")
if changes:
    entries=json.loads(history.read_text(encoding='utf-8'))
    date=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    entries.extend({'at':date,'message':message} for message in changes)
    history.write_text(json.dumps(entries[-200:],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    current['updated_at']=date
    product.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('\n'.join(changes))
else: print('No product changes')
