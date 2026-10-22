from pathlib import Path
import urllib.request,concurrent.futures,json
from PIL import Image
R=Path(__file__).resolve().parents[1]
items={
'center-fresh':'https://www.perfettivanmelle.in/wp-content/uploads/2016/11/center-fresh-2.png',
'jelly':'https://www.perfettivanmelle.in/wp-content/uploads/2016/12/alp-justJelly.png',
'bikano':'https://bikano.com/img/home2026/aloobhujia.png',
'all-out':'https://allout.in/wp-content/uploads/2026/08/1294463_8685_AO-Ultra-RH-Combi_NPR_ND_NBTL_FOP_S6_V1_26May26_TB-2.png'}
def get(it):
 k,u=it
 try:
  p=R/'dist/assets'/f'{k}.png';urllib.request.urlretrieve(u,p);im=Image.open(p).convert('RGBA');im.thumbnail((700,700));im.save(p.with_suffix('.webp'),quality=90);p.unlink();return k,im.size,'OK'
 except Exception as e:return k,str(e)
print(list(concurrent.futures.ThreadPoolExecutor().map(get,items.items())))
(R/'asset-sources.json').write_text(json.dumps(items,indent=2))
