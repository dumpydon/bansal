from pathlib import Path
import math,random
R=Path(__file__).parent
random.seed(7)
cream='#fbf3e5';pink='#d49a85';dark='#965c50';line='#ab7962';ink='#493b38'
def path(d,fill='none',stroke=line,sw=1,extra=''):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def rect(x,y,w,h,f=cream,s=line,sw=1,rx=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" stroke="{s}" stroke-width="{sw}"/>'
def circ(x,y,r,f=cream,s=line,sw=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{s}" stroke-width="{sw}"/>'
def txt(x,y,t,size=12,f=ink,extra=''):return f'<text x="{x}" y="{y}" fill="{f}" font-family="Georgia,serif" font-size="{size}" {extra}>{t}</text>'
def group(s,x=0,y=0,scale=1,extra=''):return f'<g transform="translate({x} {y}) scale({scale})" {extra}>{s}</g>'
def arch(x,y,w,h,f=cream,s=line):return path(f'M{x} {y+h}V{y+h*.38} Q{x} {y+h*.2} {x+w*.2} {y+h*.2} Q{x+w*.22} {y+h*.06} {x+w*.38} {y+h*.1}L{x+w*.5} {y}L{x+w*.62} {y+h*.1}Q{x+w*.78} {y+h*.06} {x+w*.8} {y+h*.2}Q{x+w} {y+h*.2} {x+w} {y+h*.38}V{y+h}Z',f,s)
def dome(x,y,w,h):
 s=path(f'M{x} {y+h}Q{x-3} {y+h*.45} {x+w*.5} {y} Q{x+w+3} {y+h*.45} {x+w} {y+h}Z',cream)
 for a in [.2,.4,.6,.8]:s+=path(f'M{x+w*.5} {y+2}Q{x+w*a} {y+h*.4} {x+w*a} {y+h}',sw=.6)
 s+=rect(x-4,y+h,w+8,4)+path(f'M{x+w*.5} {y-17}V{y}',sw=1.4)+circ(x+w*.5,y-8,2,line)
 return s

def window(x,y,w=22,h=38):
 s=arch(x,y,w,h,cream)+arch(x+4,y+5,w-8,h-5,'#b77e69')
 for yy in range(13,int(h)-2,5):
  for xx in range(7,int(w)-5,5):s+=circ(x+xx,y+yy,.7,cream,'none')
 s+=rect(x-3,y+h,w+6,3)+path(f'M{x-3} {y+h+3}L{x+2} {y+h+8}H{x+w-2}L{x+w+3} {y+h+3}',cream)
 return s

def hawa():
 s=rect(0,286,492,14,pink)
 for j in range(11):
  levels=5 if 2<=j<=8 else 4; xx=j*44;top=300-levels*55
  s+=rect(xx,top,44,300-top,pink)+path(f'M{xx+4} {top}V300M{xx+40} {top}V300',sw=.7)
  for k in range(levels):
   yy=top+k*55;s+=window(xx+10,yy+8,24,32)+rect(xx-3,yy+49,50,4,cream)
   for fx in [5,39]:
    s+=path(f'M{xx+fx} {yy+14}v25',sw=.65)
    s+=circ(xx+fx,yy+7,2,cream,'none')
   for fx in [7,37]:
    s+=path(f'M{xx+fx} {yy+43}q-4 -6 0 -8q4 2 0 8m-3 -3h6',stroke=cream,sw=.7)
   s+=path(f'M{xx+1} {yy+4}L{xx+4} {yy+1}H{xx+40}L{xx+43} {yy+4}',stroke=cream,sw=.8)
  s+=dome(xx+2,top-27,40,25)
  s+=circ(xx+22,top-30,2,line)
 # middle crown tier
 for j in range(5):s+=group(window(0,0,30,30)+dome(-3,-26,36,22),145+j*39,-9)
 s+=rect(139,27,205,5,cream)
 return s

def albert():
 s=rect(0,190,360,13)+rect(12,115,336,75)
 for j in range(13):s+=arch(18+j*25,136,21,52)+rect(16+j*25,131,25,4)
 for j in range(9):s+=arch(51+j*28,87,22,40)+rect(49+j*28,82,27,5)
 s+=rect(43,125,275,7)+rect(112,51,139,37)
 for j in range(5):s+=arch(118+j*26,57,20,30)
 s+=dome(135,-3,91,52)+rect(128,46,106,8)
 for xx in [4,64,275,330]:
  s+=rect(xx,91,28,35)+arch(xx+5,92,18,31)+dome(xx-4,61,36,28)
 s+=rect(7,189,346,5)
 for k in range(4):s+=rect(95-k*12,203+k*5,170+k*24,5)
 return s

def parcota_crown(x,y,w=13,h=11):
 # Curved shoulders and a pointed crown, inspired by Jaipur's painted parapets.
 d=f'M{x} {y+2}V{y-h*.37}Q{x} {y-h*.65} {x+w*.5} {y-h}Q{x+w} {y-h*.65} {x+w} {y-h*.37}V{y+2}Z'
 s=path(d,'#dfbba0','#b58d6d',.7)
 s+=path(f'M{x+1.6} {y+.6}V{y-h*.36}Q{x+1.6} {y-h*.59} {x+w*.5} {y-h+1.6}Q{x+w-1.6} {y-h*.59} {x+w-1.6} {y-h*.36}V{y+.6}',stroke=cream,sw=.65)
 s+=rect(x+w*.5-1,y-h*.43,2,2.3,'#ae8e70',cream,.45)
 return s

def descending_parcota():
 # A curved retaining wall follows the ridge; upright crowns keep their masonry rhythm.
 top='M0 307C20 304 35 296 48 285S75 269 91 266S119 257 136 243S164 222 180 213'
 base='L180 249C164 258 151 266 136 279S107 299 91 302S62 310 48 321S20 340 0 343Z'
 face=top+base
 s=f'<g id="parcota-wall"><defs><clipPath id="parcota-wall-clip"><path d="{face}"/></clipPath></defs>'
 s+=path(face,'#e2c2a7','#b58d6d',.9)
 points=[(0,307),(27,298),(48,285),(69,273),(91,266),(113,258),(136,243),(159,226),(180,213)]
 def level(x):
  for (x0,y0),(x1,y1) in zip(points,points[1:]):
   if x0<=x<=x1:return y0+(y1-y0)*(x-x0)/(x1-x0)
  return points[-1][1]
 # Fine cream-painted panels echo the reference without turning the ridge into a focal point.
 panels=''
 for x in range(0,177,19):
  slope=math.degrees(math.atan((level(min(180,x+17))-level(x))/17))
  panel=rect(0,0,16,27,'none',cream,.65)+rect(2,2,12,5,'none',cream,.6)+arch(2,11,12,14,'none',cream)
  panels+=f'<g transform="translate({x+1} {level(x+1)+7}) skewY({slope})">{panel}</g>'
 s+=f'<g clip-path="url(#parcota-wall-clip)" opacity=".88">{panels}</g>'
 for x in range(1,173,17):s+=parcota_crown(x,level(x+6.5),13,11)
 s+=path(top,stroke=cream,sw=1.1)
 s+=path('M0 339C20 336 35 328 48 317S75 301 91 298S119 289 136 275S164 254 180 245',stroke='#c29f80',sw=1)
 return s+'</g>'

def hillfort():
 s=path('M0 320Q80 235 145 257Q240 160 330 191Q415 140 490 185Q610 179 700 274L770 350Z','#efe1cd','#d4b99a')
 for k in range(16):
  yy=224+k*7;s+=path(f'M{130-k*5} {yy+70}Q{280+k*8} {yy-70} {470+k*10} {yy+3}',stroke='#dcc6ad',sw=.7)
 s+=rect(175,166,315,51,'#ead6bd','#bb9775')
 for j in range(22):s+=parcota_crown(176+j*14,166,11,9)
 s+=path('M175 170H490',stroke=cream,sw=1)
 for xx in [176,262,389,470]:
  s+=rect(xx,139,24,79,'#ead6bd','#bb9775')+dome(xx-2,123,28,17)
  for yy in [155,178,199]:s+=arch(xx+7,yy,9,13,'#d1b495','#bb9775')
 for j in range(15):s+=arch(210+j*17,183,8,14,'#d1b495','#bb9775')
 s+=descending_parcota()
 return s

def shop(x,y,w,label,warehouse=False):
 s=rect(0,0,w,200,pink)+rect(4,4,w-8,193,'none',cream)+rect(-5,-8,w+10,8,dark)+rect(-8,-13,w+16,5,cream)
 for j in range(int(w/35)):
  s+=window(9+j*35,13,21,30)
 s+=rect(-5,59,w+10,6,cream)+rect(8,70,w-16,29,cream)
 s+=txt(w/2,89,label,13,dark,'text-anchor="middle" letter-spacing="1.3"')
 s+=arch(16,105,w-32,95,'#624d42')
 if warehouse:
  for yy in [111,132,153,174]:s+=rect(23,yy,w-46,3,'#987a55',ink,.5)
  for i in range(4):
   for j in range(3):s+=carton(26+i*29,151-j*21,27,20)
 else:
  s+=rect(22,157,w-44,7,'#b18a67')
  for i in range(7):s+=rect(25+i*(w-54)/7,140,9,16,['#c79655','#9a665e','#798269'][i%3],cream,.5,1)
  s+=rect(24,171,w-48,25,'#9b7760')
 # striped awning
 for j in range(int(w/15)):
  s+=path(f'M{j*15} 100h15l5 20h-15Z',cream if j%2 else dark,dark,.5)
 s+=path(f'M-2 121H{w+6}',stroke=dark,sw=2)+rect(-9,199,w+18,7,cream)
 return group(s,x,y)

def carton(x,y,w=35,h=28):
 s=rect(x,y,w,h,'#c5a16f','#876c4c',.8)+path(f'M{x} {y}l7 -5h{w}l-7 5M{x+w} {y}l7 -5v{h}l-7 5','#d8ba87','#876c4c',.8)
 s+=rect(x+w*.44,y,5,h,'#ead5ae','none')+path(f'M{x+5} {y+h-7}v-7m-2 2l2 -2 2 2m5 5v-5m-2 2l2 -2 2 2',stroke='#876c4c',sw=.7)
 return s

def wheel(cx,cy):
 s=circ(cx,cy,24,'#3e3d39','#292d2b',2)+circ(cx,cy,17,'#aaa28c',ink,2)+circ(cx,cy,12,'#665e51',cream,.7)
 spokes=''
 for i in range(8):
  a=i*math.pi/4;spokes+=path(f'M{cx+5*math.cos(a)} {cy+5*math.sin(a)}L{cx+15*math.cos(a)} {cy+15*math.sin(a)}',stroke='#d9d3b9',sw=1.5)
 s+=f'<g class="spokes" style="transform-origin:{cx}px {cy}px">{spokes}</g>'+circ(cx,cy,4,cream,ink)
 return s

def rickshaw():
 s='<ellipse cx="135" cy="157" rx="157" ry="10" fill="#715746" opacity=".12"/>'
 s+=path('M-5 128H287L279 144H-5Z','#673d35',ink,2)
 s+=wheel(40,143)+wheel(246,143)
 # bed and open metal rails
 s+=path('M-14 85H180V129H-14Z','#a64e43','#593a34',2)
 for xx in range(-5,180,22):s+=path(f'M{xx} 91v31',stroke='#cf8571',sw=1.5)
 s+=path('M-17 82H183M-17 110H180',stroke='#e0ad8c',sw=3)
 for xx in [-12,52,116,179]:s+=path(f'M{xx} 62v58',stroke='#5e4b40',sw=3)
 s+=path('M-12 64H179',stroke='#5e4b40',sw=3)
 for xx,yy,ww,hh in [(0,47,45,34),(46,48,50,33),(99,45,40,35),(142,53,32,27),(23,15,43,31),(69,11,46,35),(119,18,39,28)]:s+=carton(xx,yy,ww,hh)
 s+=path('M12 19L15 127M154 20L160 128',stroke='#eee1b9',sw=2)
 s+=path('M186 128L190 43L213 23H260L283 80V130Z','#ad5849','#573d37',2)
 s+=path('M199 46L216 32H252L268 73H198Z','#b5c9c2','#573d37',2)
 s+=path('M203 48L219 35M205 57L227 35',stroke=cream,sw=2)
 # driver seen through open cabin
 s+=path('M204 115L207 87Q215 76 230 86L240 108L232 116Z','#e8c797',ink,1)
 s+=path('M215 85L217 74Q208 69 211 57Q217 50 224 56L229 67L224 75L224 86','#af805c',ink,1)
 s+=path('M210 60Q207 50 219 51Q231 53 227 63L220 58Z','#493d32',ink,1)
 s+=path('M220 91L240 99L256 95',stroke='#af805c',sw=7)+path('M245 83L257 99L255 115',stroke=ink,sw=3)
 s+=path('M207 113H236V126H202Z','#4a4942',ink,1)
 s+=path('M187 31L195 17H263L273 31Z','#883f36','#573d37',2)+path('M193 20H261',stroke='#d39578',sw=2)
 s+=path('M273 52L292 47V64',stroke=ink,sw=2)+rect(287,47,9,15,'#77918d',ink,1,3)
 s+=rect(268,99,11,10,'#eedb9b',ink,1,3)+rect(274,121,8,5,'#dbaa6b',ink)
 s+=path('M17 124Q40 104 63 124M222 126Q245 105 268 126',stroke='#643f35',sw=6)
 s+=txt(58,103,'BANSAL SALES',10,'#f7dcc4','letter-spacing="1.1"')+txt(192,137,'ELECTRIC',6,cream)
 return s

def worker():
 # life-sized proportions, clothing folds, supported carton and articulated knees
 s='<ellipse cx="13" cy="6" rx="35" ry="5" fill="#684f41" opacity=".14"/>'
 s+='<g id="leg-back">'+path('M9 -68L22 -33L7 -5',stroke='#585854',sw=14)+path('M4 -7L1 1Q2 5 24 3L19 -2L13 -7Z','#574438',ink,1)+'</g>'
 s+='<g id="leg-front">'+path('M-5 -67L-12 -35L-17 -5',stroke='#68716a',sw=15)+path('M-21 -7L-25 1Q-22 5 -1 3L-4 -3L-10 -7Z','#574438',ink,1)+'</g>'
 s+=path('M-11 -119Q0 -128 16 -119L25 -81L14 -63L-14 -64L-18 -91Z','#637d72','#344e46',1.5)
 s+=path('M-8 -111L5 -78M-13 -72L12 -71M7 -119L13 -94M16 -81L7 -76',stroke='#a6b5a2',sw=1)
 s+=path('M-1 -126L0 -139L13 -141L14 -121L7 -115Z','#b98666','#6e513e',1)
 s+=path('M-6 -151Q-6 -168 7 -171Q21 -171 23 -157L28 -148L23 -145Q22 -130 10 -131L-1 -137Z','#b98666','#6e513e',1)
 s+=path('M-6 -148Q-12 -168 2 -173Q22 -181 26 -160L15 -163L7 -156L1 -158L0 -146Z','#514236','#514236',1)
 s+=circ(3,-148,3,'#c99a77','#71513e',.7)+path('M17 -152h3M19 -140l-7 1',stroke='#654735',sw=.8)
 s+=path('M15 -112L30 -89L48 -91',stroke='#b98666',sw=10)+path('M-9 -108L1 -85L35 -80',stroke='#b98666',sw=10)
 s+=path('M13 -114L20 -104M-10 -112L-5 -103',stroke='#637d72',sw=15)
 s+=carton(31,-115,43,33)+path('M33 -82L42 -80M48 -91L53 -89',stroke='#b98666',sw=7)
 return s

def make_svg(t=0):
 random.seed(7)
 # One controlled cycle: carry / load / travel / handover. No empty return through the street.
 travel=max(0,min(1,(t-5)/6));ease=travel*travel*(3-2*travel);vx=505+ease*590
 wx=390+min(t/4,1)*90 if t<5 else (vx+130+80*min(1,(t-11)/3) if t>=11 else 480)
 visible=1 if t<4.6 or t>=11 else 0
 bob=math.sin(t*6)*1.5 if t<4 else 0
 body=f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="850" viewBox="0 0 1600 850" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Jaipur, carried by its people</title><desc id="scene-desc">Original architectural motion study with a hilltop fort, Hawa Mahal inspired facade, Albert Hall inspired pavilions, bazaar shops, a detailed cargo e-rickshaw and an adult carrying a carton. Composite illustration, not a geographical view.</desc><defs><pattern id="paper" width="17" height="19" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r=".5" fill="#a48063" opacity=".16"/><circle cx="13" cy="15" r=".4" fill="#a48063" opacity=".13"/></pattern></defs>'
 body+=rect(0,0,1600,850,cream,'none')+circ(1240,187,69,'#efdcc0','none')
 body+=group(hillfort(),-60,80,.98,extra='id="hills" opacity=".6"')
 body+=group(albert(),1065,294,1.24,extra='id="albert" opacity=".67"')
 body+=group(hawa(),559,244,1.13,extra='id="hawa"')
 # quiet middle ground houses
 for j in range(9):
  xx=365+j*37;yy=516-(j%3)*13;body+=rect(xx,yy,34,103,'#e4c4ae',line,.6)+arch(xx+10,yy+10,13,25,cream)
 body+=path('M0 616H1600V850H0Z','#f0e2cd','none')+path('M0 632H1600M0 751H1600',stroke='#bfa48c',sw=1)
 # street paving perspective
 for yy in [650,674,709,760,825]:body+=path(f'M0 {yy}H1600',stroke='#d8c5ab',sw=.7)
 for xx in range(-600,2300,150):body+=path(f'M{800+(xx-800)*.6} 632L{xx} 850',stroke='#d8c5ab',sw=.7)
 body+=shop(22,410,300,'BANSAL SALES CORPORATION',True)+shop(1320,413,160,'GENERAL STORE')+shop(1487,420,139,'KIRANA')
 # warehouse parapet and crates at dispatch threshold
 for i in range(2):
  for j in range(2-i):body+=carton(306+i*42,590-j*30,38,30)
 body+=path('M7 615H330L343 626H0Z','#d1b59a',line)
 # a tree with branching, differentiated foliage clusters
 branches=path('M1254 622Q1248 550 1256 489M1253 564L1221 530M1252 547L1286 517',stroke='#8c8164',sw=6)
 for xx,yy,rr in [(1220,513,25),(1251,483,34),(1288,502,32),(1250,524,30),(1210,493,22)]:
  branches+=circ(xx,yy,rr,'#bbc0a3','#8c977a',.9)
  for z in range(7):branches+=path(f'M{xx+random.uniform(-rr*.65,rr*.65):.1f} {yy+random.uniform(-rr*.6,rr*.6):.1f}l5 -3',stroke='#8c977a',sw=.7)
 body+=f'<g id="tree">{branches}</g>'
 # birds at a quiet scale
 for xx,yy in [(480,208),(1065,176),(1412,302),(979,119)]:body+=path(f'M{xx} {yy}q6 -7 12 0q6 -7 12 0',stroke=line,sw=1.5,extra='class="bird"')
 body+=f'<g id="vehicle" transform="translate({vx} 573)">{rickshaw()}</g>'
 body+=f'<g id="carrier" opacity="{visible}" transform="translate({wx} {728+bob})">{worker()}</g>'
 # shaded retailer at final threshold, differently dressed
 body+='<g id="retailer" transform="translate(1460 728) scale(-.9 .9)">'+worker().replace('#637d72','#b08a64').replace('#a6b5a2','#d4b895')+'</g>'
 body+=rect(0,0,1600,850,'url(#paper)','none')
 body+=txt(45,64,'BANSAL / JAIPUR',13,dark,'letter-spacing="3"')+txt(45,110,'A city of stories. A daily journey.',34,ink)
 body+=txt(45,806,'ARCHITECTURAL MOTION STUDY  /  02',10,dark,'letter-spacing="2"')+txt(1555,806,'Original composite • not a geographical route',11,dark,'text-anchor="end"')
 # Raster export mirrors the live wheel rotations.
 angle=ease*1408
 body=body.replace('class="spokes" style="transform-origin:40px 143px"',f'class="spokes" transform="rotate({angle} 40 143)" style="transform-origin:40px 143px"')
 body=body.replace('class="spokes" style="transform-origin:246px 143px"',f'class="spokes" transform="rotate({angle} 246 143)" style="transform-origin:246px 143px"')
 body+='</svg>'
 return body
