from pathlib import Path
import sys,re,shutil,urllib.request,json
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parents[1];A=R/'dist/assets'
sys.path.insert(0,str(R/'scripts'))
from illustration_library import hawa,albert,worker,rickshaw,shop,carton,path,rect,group,circ,arch,dome,make_svg,cream,line
svg=make_svg().replace('id="leg-front"','class="leg-front"').replace('id="leg-back"','class="leg-back"')
svg=re.sub(r'<text x="(?:45|1555)"[^>]*>.*?</text>','',svg)
svg=svg.replace('viewBox="0 0 1600 850"','viewBox="0 155 1600 620"').replace('height="850"','height="620"',1)
(A/'hero.svg').write_text(svg)
# All other illustrations reuse the approved architectural language.
def wrap(body,vb):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>'
# People vignette: preparation and dispatch, detailed warehouse and people.
s=rect(0,0,700,560,'#eddbca','none')+circ(490,190,135,'#f8eddf','none')+group(shop(0,0,300,'BANSAL SALES',True),38,215,.95)+group(worker(),345,510,.9)+group(rickshaw(),400,365,1)
s+=path('M0 493H700',stroke='#ba9476')
(A/'people.svg').write_text(wrap(s,'0 0 700 560'))
# Gateway composition for the contact section.
s=rect(0,0,600,380,'#f0d8c7','none')+rect(56,92,480,270,'#cc8e76')
s+=arch(202,125,188,237,cream)+arch(82,233,74,129,cream)+arch(444,233,65,129,cream)
for x in [68,448]:
 s+=rect(x,65,77,26,'#d4a087')+dome(x+4,10,69,52)
for x in range(72,525,28):s+=arch(x,111,13,27,cream)
s+=rect(45,147,500,8,cream)+rect(41,79,505,12,cream)+rect(49,342,151,6,cream)+rect(391,342,144,6,cream)
for x in [166,406]:s+=path(f'M{x} 158V331',stroke=cream,sw=3)
s+=rect(25,362,542,10,cream)
for x in [80,450]:
 s+=rect(x,166,55,45,'none',cream,.8)
 for cx in [x+14,x+40]:
  s+=circ(cx,188,7,'none',cream,.8)+path(f'M{cx} 178v20M{cx-10} 188h20',stroke=cream,sw=.8)
for x in [181,411]:
 for yy in range(168,330,13):s+=path(f'M{x} {yy}l3 4-3 4-3-4Z',cream,cream,.5)
(A/'gateway.svg').write_text(wrap(s,'0 -20 600 400'))
# Small stock and ledger still life.
s=group(carton(0,0,110,86),70,120)+group(carton(0,0,84,66),155,147)+group(carton(0,0,83,65),100,50)
s+=path('M34 195Q115 213 265 200',stroke='#ba9476')
(A/'cartons.svg').write_text(wrap(s,'0 0 300 240'))
# Self-host compact fonts.
for family,weight,target in [('cormorantgaramond',600,'display'),('manrope',400,'body'),('manrope',600,'body-semibold')]:
 f=TTFont(R/'design/fonts'/f'{family}-{weight}.ttf');f.flavor='woff2';f.save(A/f'{target}.woff2')
f=TTFont(R.parent/'research/assets/fonts/notosansdevanagari.ttf');f.flavor='woff2';f.save(A/'hindi.woff2')
for p in (R/'design/fonts').glob('*OFL.txt'):shutil.copy(p,A/p.name)
print('Original scene + 3 companion illustrations and fonts prepared')
