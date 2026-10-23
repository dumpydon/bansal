"""Download the source-listed product images, preserve package artwork, and generate local WebP sizes.
Requires requests and Pillow. Source provenance is in catalog-sources.json.
"""
from pathlib import Path
import concurrent.futures,hashlib,io,json,requests,subprocess,sys
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1];source=json.loads((ROOT/'catalog-sources.json').read_text());OUT=ROOT/'dist/assets/catalog';OUT.mkdir(exist_ok=True)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

def fetch(item):
 item=dict(item);u=item.pop('sourceImage');item.pop('imageSource');item.pop('sourceKind')
 item['image']=None;item['thumb']=None
 if not u:return item,'No source photograph'
 key=hashlib.sha256(u.encode()).hexdigest()[:16];large=OUT/(key+'.webp');small=OUT/(key+'-thumb.webp')
 try:
  if not large.exists() or not small.exists():
   code="import requests,sys; r=requests.get(sys.argv[1],headers={'User-Agent':sys.argv[2]},timeout=18); r.raise_for_status(); sys.stdout.buffer.write(r.content)"
   r=subprocess.run([sys.executable,'-c',code,u,UA],capture_output=True,timeout=23)
   if r.returncode:raise ValueError(r.stderr.decode(errors='replace').strip().splitlines()[-1])
   im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.stdout))).convert('RGBA')
   if max(im.size)<60:raise ValueError('Source image too small')
   if im.getextrema()[3][0]==255:im=im.convert('RGB')
   im.thumbnail((650,650));im.save(large,'WEBP',quality=86,method=4)
   im.thumbnail((240,240));im.save(small,'WEBP',quality=80,method=4)
  # Trim only fully transparent outside padding; all visible package artwork is preserved.
  artwork=Image.open(large).convert('RGBA');bounds=artwork.getchannel('A').getbbox()
  if bounds and bounds!=(0,0,*artwork.size):
   artwork=artwork.crop(bounds);artwork.save(large,'WEBP',quality=90,method=4)
   artwork.thumbnail((240,240));artwork.save(small,'WEBP',quality=84,method=4)
  item['image']='assets/catalog/'+large.name;item['thumb']='assets/catalog/'+small.name
  return item,None
 except Exception as e:return item,str(e)[:160]
results=[];fail=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for item,err in pool.map(fetch,source['products']):
  results.append(item)
  if err:fail.append({'id':item['id'],'name':item['name'],'error':err})
data={'updated':source['retrieved'],'brands':source['brands'],'products':results}
(ROOT/'dist/catalog-data.js').write_text('window.BANSAL_CATALOG = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'catalog-image-report.json').write_text(json.dumps({'total':len(results),'withImages':sum(bool(i['image']) for i in results),'missing':fail},ensure_ascii=False,indent=2))
print('Catalogue:',len(results),'products;',sum(bool(i['image']) for i in results),'photographs;',len(fail),'unavailable')
print('Failures:',json.dumps(fail,ensure_ascii=False))
