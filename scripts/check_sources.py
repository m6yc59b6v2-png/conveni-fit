#!/usr/bin/env python3
"""Check curated official URLs only when robots policy permits. Changes are review-only."""
import json, os, hashlib, urllib.request, urllib.robotparser, urllib.parse, datetime
from pathlib import Path
base=Path(__file__).resolve().parents[1]
cfg=json.loads((base/'data/sources.json').read_text(encoding='utf-8'))
state_path=base/'data/source_state.json'
queue_path=base/'data/review_queue.json'
state=json.loads(state_path.read_text(encoding='utf-8'))
queue=json.loads(queue_path.read_text(encoding='utf-8'))
agent='ConveniFitChangeMonitor/0.1 (+contact: set-your-contact-before-enabling)'
if os.environ.get('ENABLE_SOURCE_CHECK')!='true':
 print('Source checking disabled. Set ENABLE_SOURCE_CHECK=true after confirming permission.')
 raise SystemExit(0)
if 'set-your-contact' in agent:
 print('Set a real contact in User-Agent before enabling automated fetching.')
 raise SystemExit(1)
for s in cfg:
    url=s['url']
    if not url.startswith('https://'):continue
    parsed=urllib.parse.urlparse(url)
    robots=urllib.robotparser.RobotFileParser()
    robots.set_url(f'{parsed.scheme}://{parsed.netloc}/robots.txt')
    try:
        robots.read()
        if not robots.can_fetch(agent,url):
            print('Blocked by robots policy:',url);continue
        req=urllib.request.Request(url,headers={'User-Agent':agent})
        with urllib.request.urlopen(req,timeout=12) as response:
            if int(response.headers.get('Content-Length','0'))>1_000_000:continue
            data=response.read(1_000_001)
            if len(data)>1_000_000:continue
        digest=hashlib.sha256(data).hexdigest()
        if url in state and state[url]!=digest:
            queue.append({'url':url,'detected_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reason':'Official page content changed; manual review required'})
        state[url]=digest
    except Exception as e:print('Skipped:',url,type(e).__name__)
state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
queue_path.write_text(json.dumps(queue[-200:],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
