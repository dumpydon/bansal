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

def hawa_flower(x,y,r=1.2):
 # Four fine painted petals, kept small enough to read as ornament at page scale.
 petals='M0 -.45C-1.1 -1.3 -.8 -2.2 0 -3C.8 -2.2 1.1 -1.3 0 -.45Z M.45 0C1.3 -1.1 2.2 -.8 3 0C2.2 .8 1.3 1.1 .45 0Z M0 .45C1.1 1.3 .8 2.2 0 3C-.8 2.2 -1.1 1.3 0 .45Z M-.45 0C-1.3 1.1 -2.2 .8 -3 0C-2.2 -.8 -1.3 -1.1 -.45 0Z'
 return group(path(petals,cream,'none')+circ(0,0,.35,cream,'none'),x,y,r/3)

def hawa_balcony(x,y,w):
 # White-painted floral panels and the small rounded pendants beneath each sill.
 s=rect(x-3,y,w+6,1.8,cream,line,.55)
 s+=path(f'M{x-2} {y+1.8}H{x+w+2}L{x+w-.3} {y+6.8}H{x+.3}Z','#bd846e',cream,.55)
 s+=path(f'M{x-.7} {y+2.6}H{x+w+.7}L{x+w-1} {y+6}H{x+1}Z','none',cream,.35)
 s+=hawa_flower(x+3.8,y+4.35,1.05)+hawa_flower(x+w-3.8,y+4.35,1.05)+hawa_flower(x+w/2,y+4.35,1.25)
 # Little curled leaves flank the central flower, following the reference panel.
 for side in [-1,1]:
  scroll=path('M1.6 0Q3.4 -2 4.5 -.5Q4.6 .5 3.4 .2M1.6 0Q3.4 2 4.5 .5Q4.6 -.5 3.4 -.2',stroke=cream,sw=.35)
  s+=f'<g transform="translate({x+w/2} {y+4.35}) scale({side} 1)">{scroll}</g>'
 scallops=''
 for i in range(7):
  left=x-1+i*(w+2)/7;right=x-1+(i+1)*(w+2)/7;middle=(left+right)/2
  scallops+=f'M{left} {y+6.85}Q{left+.2} {y+8.7} {middle} {y+8.7}Q{right-.2} {y+8.7} {right} {y+6.85}Z'
 s+=path(scallops,cream,line,.35)
 return f'<g class="hawa-balcony">{s}</g>'

def window(x,y,w=22,h=38,ornate=False,accent=None):
 s=arch(x,y,w,h,cream)+arch(x+4,y+5,w-8,h-5,'#b77e69')
 columns=list(range(7,int(w)-5,5));rows=list(range(13,int(h)-2,5))
 pane_row=min(rows,key=lambda yy:abs(yy-h*.7)) if rows else None
 for yy in range(13,int(h)-2,5):
  for xx in columns:
   if accent and yy==pane_row and xx in (columns[0],columns[-1]):
    colour='#557969' if accent=='green' else '#aa6258'
    s+=f'<g class="hawa-glass">{rect(x+xx-1.15,y+yy-1.4,2.3,2.8,colour,cream,.3,.3)}</g>'
   else:s+=circ(x+xx,y+yy,.7,cream,'none')
 if ornate:s+=hawa_balcony(x,y+h,w)
 else:s+=rect(x-3,y+h,w+6,3)+path(f'M{x-3} {y+h+3}L{x+2} {y+h+8}H{x+w-2}L{x+w+3} {y+h+3}',cream)
 return s

def hawa():
 s=rect(0,286,492,14,pink)
 for j in range(11):
  levels=5 if 2<=j<=8 else 4; xx=j*44;top=300-levels*55
  s+=rect(xx,top,44,300-top,pink)+path(f'M{xx+4} {top}V300M{xx+40} {top}V300',sw=.7)
  for k in range(levels):
   yy=top+k*55
   accent='green' if (j+2*k)%4==0 else ('red' if (j+2*k)%7==0 else None)
   s+=window(xx+10,yy+8,24,32,ornate=True,accent=accent)+rect(xx-3,yy+49,50,4,cream)
   for fx in [5,39]:
    s+=path(f'M{xx+fx} {yy+14}v25',sw=.65)
    s+=circ(xx+fx,yy+7,2,cream,'none')
   for fx in [7,37]:
    s+=path(f'M{xx+fx} {yy+43}q-4 -6 0 -8q4 2 0 8m-3 -3h6',stroke=cream,sw=.7)
   s+=path(f'M{xx+1} {yy+4}L{xx+4} {yy+1}H{xx+40}L{xx+43} {yy+4}',stroke=cream,sw=.8)
  s+=dome(xx+2,top-27,40,25)
  s+=circ(xx+22,top-30,2,line)
 # middle crown tier
 for j in range(5):s+=group(window(0,0,30,30,ornate=True,accent='green' if j==1 else ('red' if j==3 else None))+dome(-3,-26,36,22),145+j*39,-9)
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
 vertical_scale=.85
 height=36*vertical_scale
 def ridge_top(dy=0):
  return f'M-650 {385+dy}C-520 {377+dy} -420 {365+dy} -335 {355+dy}S-125 {328+dy} 0 {307+dy}C20 {304+dy} 35 {296+dy} 48 {285+dy}S75 {269+dy} 91 {266+dy}S119 {257+dy} 136 {243+dy}S164 {222+dy} 180 {213+dy}'
 top=ridge_top()
 base=f'L180 {213+height}C164 {222+height} 151 {230+height} 136 {243+height}S107 {263+height} 91 {266+height}S62 {274+height} 48 {285+height}S20 {304+height} 0 {307+height}C-125 {328+height} -250 {345+height} -335 {355+height}C-420 {365+height} -520 {377+height} -650 {385+height}Z'
 face=top+base
 s=f'<g id="parcota-wall"><defs><clipPath id="parcota-wall-clip"><path d="{face}"/></clipPath></defs>'
 s+=path(face,'#e2c2a7','#b58d6d',.9)
 points=[(-650,385),(-500,375),(-335,355),(-160,331),(0,307),(27,298),(48,285),(69,273),(91,266),(113,258),(136,243),(159,226),(180,213)]
 def level(x):
  for (x0,y0),(x1,y1) in zip(points,points[1:]):
   if x0<=x<=x1:return y0+(y1-y0)*(x-x0)/(x1-x0)
  return points[-1][1]
 # Fine cream-painted panels echo the reference without turning the ridge into a focal point.
 panels=''
 for x in range(-646,177,19):
  slope=math.degrees(math.atan((level(min(180,x+17))-level(x))/17))
  panel=rect(0,0,16,27,'none',cream,.65)+rect(2,2,12,5,'none',cream,.6)+arch(2,11,12,14,'none',cream)
  panels+=f'<g transform="translate({x+1} {level(x+1)+7*vertical_scale}) skewY({slope}) scale(1 {vertical_scale})">{panel}</g>'
 s+=f'<g clip-path="url(#parcota-wall-clip)" opacity=".88">{panels}</g>'
 for x in range(-645,173,17):s+=f'<g transform="translate({x} {level(x+6.5)}) scale(1 {vertical_scale})">{parcota_crown(0,0,13,11)}</g>'
 s+=path(top,stroke=cream,sw=1.1)
 band=32*vertical_scale
 s+=path(ridge_top(band),stroke='#c29f80',sw=1)
 return s+'</g>'

def fort_finial(x,y,height=10,central=False):
 s=path(f'M{x} {y}V{y-height}',stroke='#bb9775',sw=.75)
 for fraction,radius in [(.19,1.0),(.44,.8),(.68,.6)]:
  s+=circ(x,y-height*fraction,radius,'#aba786','#bb9775',.35)
 s+=path(f'M{x} {y-height-1.4}l1 2.4l-1 2.2l-1 -2.2Z','#aba786','#bb9775',.35)
 kind='central-finial' if central else 'side-finial'
 return f'<g class="fort-finial {kind}">{s}</g>'

def nahargarh_roof(x,y):
 # The supplied palace reference: one curved central crown, five pinnacles,
 # and two close-set little domed caps, each with its own pinnacle.
 # Solid carved frieze behind the crown: these wedges must not show the sky.
 s=rect(-24,-19,48,24,'#d9c3a2','#bb9775',.5)
 for side in [-31,31]:
  cap=rect(-9,-10,18,10,'#ead6bd','#bb9775',.6)
  cap+=path('M-10 -10Q-12 -22 0 -24Q12 -22 10 -10Z','#c2bd9b','#bb9775',.7)
  cap+=path('M-9 -9H9M-9 -5H9',stroke='#aba786',sw=.8)
  for xx in [-6,-2,2,6]:cap+=path(f'M{xx} -8v5',stroke='#bb9775',sw=.4)
  cap+=fort_finial(0,-24,9)
  s+=group(cap,side,0)
 s+=path('M-23 -9V-23C-23 -39 23 -39 23 -23V-9H-23Z','#c2bd9b','#bb9775',.85)
 s+=path('M-22 -23C-14 -35 14 -35 22 -23M-23 -13C-13 -26 13 -26 23 -13',stroke='#aba786',sw=1)
 for xx in range(-18,19,4):
  lower=-10-9*(1-(xx/23)**2)
  s+=path(f'M{xx} {lower}v-4',stroke='#bb9775',sw=.55)
 # A solid curved stone band with a fine row of lozenges follows the pediment.
 band='M-23 -10C-13 -24 13 -24 23 -10V-3C13 -17 -13 -17 -23 -3Z'
 frieze=path(band,'#d9c3a2','#bb9775',.45)
 for xx in [-19,-13,-7,0,7,13,19]:
  yy=-6.5-10.5*(1-(xx/23)**2)
  frieze+=path(f'M{xx} {yy-.85}l.8 .85l-.8 .85l-.8 -.85Z','none',cream,.3)
 frieze+=path('M-22 -7C-12 -20 12 -20 22 -7',stroke=cream,sw=.3)
 s+=f'<g class="fort-roof-frieze">{frieze}</g>'
 for xx in [-16,-8,0,8,16]:
  s+=fort_finial(xx,-35+(abs(xx)/23)**2*12,11 if xx==0 else 10,central=True)
 # Raised curved pediment and its pale moulding, distinct from a straight parapet.
 s+=path('M-24 1C-15 -22 15 -22 24 1V18H-24Z','#ead6bd','#bb9775',.65)
 s+=path('M-44 1H-24C-15 -22 15 -22 24 1H44L41 5H23C14 -14 -14 -14 -23 5H-41Z',cream,'#bb9775',.55)
 s+=path('M-21 3C-12 -13 12 -13 21 3',stroke='#bb9775',sw=.55)
 return group(s,x,y,extra='class="nahargarh-roof-group"')

def fort_niche(x,y,w,h):
 return path(f'M{x} {y+h}V{y+w/2}a{w/2} {w/2} 0 0 1 {w} 0V{y+h}Z','#d1b495','#bb9775',.6)

def fort_blind_panel(x,y,w,h):
 # Shallow carved niches and bevelled rectangular surrounds echo the stonework.
 s=rect(x,y,w,h,'#dfc6a4','#bb9775',.45)
 s+=path(f'M{x+.8} {y+h-.8}V{y+.8}H{x+w-.8}',stroke=cream,sw=.4)
 motif=arch(x+w*.18,y+h*.15,w*.64,h*.73,'#ead6bd','#bb9775')
 s+=motif.replace('stroke-width="1"','stroke-width=".5"')
 s+=path(f'M{x+1.4} {y+h-1.5}H{x+w-1.4}',stroke='#bb9775',sw=.45)
 return f'<g class="fort-carved-panel">{s}</g>'

def fort_screen_window(x,y,w,h):
 s=arch(x-1.2,y-1.2,w+2.4,h+1.2,'#dfc6a4','#bb9775').replace('stroke-width="1"','stroke-width=".55"')
 s+=fort_niche(x,y,w,h)
 # A fine lattice is confined to the small upper windows.
 lattice=''
 for yy in [y+5,y+8,y+11]:
  for xx in [x+w*.3,x+w*.7]:lattice+=f'M{xx} {yy-1.3}l1 1.3l-1 1.3l-1 -1.3Z'
 s+=path(lattice,stroke=cream,sw=.3)
 s+=rect(x-1, y+h, w+2, 1.2, cream, '#bb9775', .35)
 return s

def nahargarh_palace():
 s=path('M490 152L498 157V225L490 229Z','#c2a784','#bb9775',.7)
 s+=rect(175,152,315,73,'#ead6bd','#bb9775',.85).replace('/>',' class="fort-facade"/>')
 s+=rect(171,151,323,4,cream,'#bb9775',.65)
 for x in range(181,490,9):s+=path(f'M{x} 155v2h3v-2',stroke='#bb9775',sw=.45)
 # Low-contrast stone courses give the long facade weight without a busy texture.
 courses=''
 for row,yy in enumerate([162,173,184,198,209]):
  courses+=f'M176 {yy}H490'
  for xx in range(181+row%2*14,490,28):courses+=f'M{xx} {yy}v8'
 s+=path(courses,stroke='#bb9775',sw=.3,extra='opacity=".28"')
 for centre in [230,333,436]:
  s+=nahargarh_roof(centre,151)
  s+=path(f'M{centre-35} 158V186M{centre+35} 158V186',stroke='#bb9775',sw=.5)
  for xx in [centre-26,centre-4,centre+18]:
   s+=fort_screen_window(xx,165,8,16)
  for xx in [centre-15,centre+7]:s+=fort_blind_panel(xx,164,8,18)
  s+=circ(centre,159,1.3,'#d1b495','#bb9775',.4)
  # A small recessed fan-shaped panel fills each curved pediment.
  s+=path(f'M{centre-8} 155V150a8 8 0 0 1 16 0v5Z','#dfc6a4','#bb9775',.5)
  for dx,dy in [(-5,-4),(-3,-6),(0,-7),(3,-6),(5,-4)]:
   s+=path(f'M{centre} 154L{centre+dx} {151+dy}',stroke=cream,sw=.35)
 # Raised end piers and carved inter-bay panels occupy the former empty strips.
 for xx,ww in [(178,15),(269,25),(372,25),(475,13)]:
  s+=rect(xx,157,ww,29,'#d9c3a2','#bb9775',.6)
  s+=fort_blind_panel(xx+2,160,ww-4,23)
  s+=path(f'M{xx+1} 158V185M{xx+ww-1} 158V185',stroke=cream,sw=.45)
 s+=rect(171,186,323,3,cream,'#bb9775',.6)
 for i in range(8):
  xx=186+i*38
  s+=fort_niche(xx,193,22,29)
  s+=path(f'M{xx+2} 220V205q9 -15 18 0v15',stroke=cream,sw=.5)
  if i<7:s+=fort_blind_panel(xx+25,194,10,19)
 s+=rect(172,222,323,5,'#ead6bd','#bb9775',.7)
 # A modest defensive wall, with rounded pointed merlons and narrow loopholes.
 s+=path('M164 217H502L505 233H164Z','#d9c3a2','#bb9775',.75)
 for i in range(28):
  xx=165+i*12
  s+=path(f'M{xx} 219V213Q{xx} 209 {xx+5} 207Q{xx+10} 209 {xx+10} 213V219Z','#d9c3a2','#bb9775',.55)
  s+=rect(xx+4.3,214,1.4,3,'#c2a784','none',0,.3)
 s+=path('M165 220H502M165 228H504',stroke=cream,sw=.65)
 for xx in range(174,500,18):
  s+=path(f'M{xx} 221v6m-8 -3h16',stroke='#bb9775',sw=.35,extra='opacity=".45"')
 s+=fort_niche(325,219,14,14)
 s+=path('M164 229H504L508 236H160Z','#c2a784','#bb9775',.65)
 s+=path('M163 232H505',stroke=cream,sw=.65)
 return f'<g id="nahargarh-palace">{s}</g>'

def hillfort():
 # A flatter ridge supports the palace; the slope stays irregular and lightly drawn.
 s=path('M-650 399C-520 391 -420 379 -335 369S-125 342 0 320Q65 274 145 261Q160 242 179 231H494Q552 205 610 240Q670 267 700 294L770 350Z','#efe1cd','#d4b99a')
 for k in range(5):
  dy=k*9
  s+=path(f'M-650 {416+dy}C-410 {412+dy} -230 {385+dy} 0 {342+dy}',stroke='#dcc6ad',sw=.65)
 for k in range(10):
  yy=246+k*8
  s+=path(f'M{105-k*6} {yy+68}Q{228+k*6} {yy-28} {375+k*9} {yy-5}T{570+k*8} {yy+24}',stroke='#dcc6ad',sw=.65)
 s+=path('M160 235Q320 242 499 235M155 241Q280 250 366 246M505 237l15 3 12 -1',stroke='#d4b99a',sw=.7)
 s+=nahargarh_palace()+descending_parcota()
 return s

def warehouse_branding(w):
 # Match the delivery vehicle's ivory lettering and dark terracotta nameplate.
 s=rect(7,66,w-14,34,'#7f3e35','#e8bea1',.9,1.5)+rect(9,68,w-18,30,'none','#e8bea1',.45,1)
 mark=path('M6 65V28Q6 18 17 18Q17 6 30 3Q43 6 43 18Q54 18 54 28V65ZM15 65V32Q15 25 22 25Q23 15 30 13Q37 15 38 25Q45 25 45 32V65M2 65h56M12 67h36',stroke='#fff5e5',sw=2.2)
 mark+=path('M23 54V33h8q11 0 7 8q8 11-7 13ZM23 42h10M29 33v21',stroke='#fff5e5',sw=2.2)
 s+=group(mark,18,67,.42)+path('M54 72V94',stroke='#e8bea1',sw=.7)
 s+=txt(w/2+18,83,'BANSAL SALES',19,'#fff5e5','text-anchor="middle" font-weight="700" letter-spacing="1.3"')
 s+=txt(w/2+18,95,'CORPORATION',10,'#f7dcc4','text-anchor="middle" letter-spacing="2"')
 for xx in [13,w-13]:s+=circ(xx,83,.9,'#e8bea1','none')
 return f'<g class="warehouse-wordmark">{s}</g>'

def shop(x,y,w,label,warehouse=False):
 s=rect(0,0,w,200,pink)+rect(4,4,w-8,193,'none',cream)+rect(-5,-8,w+10,8,dark)+rect(-8,-13,w+16,5,cream)
 for j in range(int(w/35)):
  s+=window(9+j*35,13,21,30)
 s+=rect(-5,59,w+10,6,cream)
 if warehouse:s+=warehouse_branding(w)
 elif label=='SUPER DEPARTMENT STORE':
  s+=rect(8,70,w-16,29,cream)
  # Keep the original 13px main type. A light stroke adds visual weight without
  # shrinking or depending on a static font's jump from regular to bold.
  s+=txt(w/2,83.5,'SUPER DEPARTMENT',13,dark,f'text-anchor="middle" letter-spacing="1.3" stroke="{dark}" stroke-width=".2" paint-order="stroke fill"')
  s+=txt(w/2,95.5,'STORE',8.5,dark,'text-anchor="middle" letter-spacing="2"')
 else:s+=rect(8,70,w-16,29,cream)+txt(w/2,89,label,13,dark,'text-anchor="middle" letter-spacing="1.3"')
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
 if warehouse:s+=path(f'M2 119H{w+2}L{w-4} 131H8Z','#4f342b','none',extra='opacity=".14"')
 for j in range(int(w/15)):
  s+=path(f'M{j*15} 100h15l5 20h-15Z',cream if j%2 else dark,dark,.5)
 s+=path(f'M-2 121H{w+6}',stroke=dark,sw=2)+rect(-9,199,w+18,7,cream)
 return group(s,x,y)

def supermarket_interior(x,y):
 # Stocked side aisles recede towards an end display, seen through clear glass.
 s=rect(0,0,54,82,'#e8d9bb','none')
 s+=path('M0 0H54V20L37 28H17L0 20Z','#f2e7d1','none')
 s+=path('M0 20L17 28V59L0 82Z M54 20L37 28V59L54 82Z','#c5b091','none')
 s+=path('M17 59H37L54 82H0Z','#d3c0a2','none')
 for yy in [65,72,80]:
  width=20+(yy-59)*34/23
  s+=path(f'M{27-width/2} {yy}H{27+width/2}',stroke='#b7a58b',sw=.3)
 for xx in [5,16,38,49]:s+=path(f'M27 51L{xx} 82',stroke='#b7a58b',sw=.3)
 s+=rect(17,27,20,32,'#95856e','none')
 colours=['#c79655','#9a665e','#798269','#b4a37d','#b48367']
 for row,baseline in enumerate([37,47,57]):
  s+=rect(17,baseline,20,1,'#b18a67','none')
  for i in range(5):
   s+=rect(18+i*3.6,baseline-6,2.4,5.4,colours[(i+row)%5],cream,.16,.2)
   s+=rect(18.3+i*3.6,baseline-3.7,1.8,.55,cream,'none')
 # Four merchandise rows on each shelving run, foreshortened into the store.
 shelves=path('M1 22L17 31V60L1 77Z','#8d7962','none')
 for row,(front,back) in enumerate([(37,38),(49,45),(61,52),(73,59)]):
  shelves+=path(f'M1 {front}L17 {back}v1.3L1 {front+1.3}Z','#b18a67',cream,.2)
  for i,xx in enumerate([2.2,6,9.7,13.2]):
   depth=(xx-1)/16;bottom=front+(back-front)*depth;height=7-3*depth;width=2.4-.5*depth
   shelves+=rect(xx,bottom-height,width,height-.5,colours[(i+row)%5],cream,.16,.2)
   shelves+=rect(xx+.2,bottom-height*.55,width-.4,.5,cream,'none')
 s+=shelves+f'<g transform="translate(54 0) scale(-1 1)">{shelves}</g>'
 # Interior strip lights, then a very light transparent glazing layer.
 s+=rect(12,17,30,1.3,'#fff4cf','none',0,.6)+rect(21,25,12,.7,'#fff4cf','none',0,.3)
 s+=path('M0 0H54V82H0Z','#d9e8e2','none',extra='opacity=".045"')
 s+=path('M4 29L20 10M5 39L26 14M35 23L46 10',stroke='#fffaf0',sw=.9,extra='opacity=".4"')
 return group(s,x,y,extra='class="supermarket-interior"')

def super_department_store(x,y,w=228):
 # A taller Jaipur shopfront, grounded on the same pavement as its neighbours.
 h=224
 s=rect(0,0,w,h,pink,line,.9)+rect(5,4,w-10,h-7,'none',cream,.8)
 s+=rect(-5,-9,w+10,9,dark,line,.7)+rect(-8,-14,w+16,5,cream,line,.7)
 s+=path(f'M{w/2-27} -14Q{w/2} -32 {w/2+27} -14Z',pink,cream,.9)
 s+=path(f'M{w/2-21} -14Q{w/2} -27 {w/2+21} -14',stroke=line,sw=.6)
 s+=circ(w/2,-18,1.3,cream,'none')
 # Three carved jharokhas and a quiet painted frieze above the fascia.
 for xx in [25,w/2-16,w-57]:s+=window(xx,12,32,36,ornate=True)
 s+=rect(-5,63,w+10,4,cream,line,.7)+rect(8,70,w-16,4,dark,cream,.45)
 for xx in range(17,int(w)-10,18):s+=hawa_flower(xx,72,1.1)
 # Keep the approved 13px main lettering and its slight stroke-weight increase.
 s+=rect(12,78,w-24,34,cream,line,.7)+rect(15,81,w-30,28,'none',dark,.4)
 s+=txt(w/2,92,'SUPER DEPARTMENT',13,dark,f'text-anchor="middle" letter-spacing="1.3" stroke="{dark}" stroke-width=".44" paint-order="stroke fill"')
 s+=txt(w/2,105.5,'STORE',8.5,dark,'text-anchor="middle" letter-spacing="2"')
 for xx in [23,w-23]:s+=path(f'M{xx} 94l1.8 2l-1.8 2l-1.8 -2Z','#b79a70','none')
 # Recessed display arches flank a framed double-door entrance.
 for xx in [17,w-73]:
  s+=arch(xx,139,56,80,'#624d42',cream)
  for shelf in [180,203]:s+=rect(xx+5,shelf,46,2,'#b18a67','none')
  for row,yy in enumerate([168,191]):
   for i,colour in enumerate(['#c79655','#9a665e','#798269','#b4a37d','#9a665e']):
    s+=rect(xx+7+i*9,yy,6.5,11-row,colour,cream,.35,.7)
  s+=rect(xx+5,209,46,9,'#9b7760',cream,.4)
 door_x=w/2-27
 s+=arch(door_x-3,134,60,86,cream,line)
 s+=f'<defs><clipPath id="supermarket-glass-clip">{arch(door_x,138,54,82)}</clipPath></defs>'
 s+=f'<g clip-path="url(#supermarket-glass-clip)">{supermarket_interior(door_x,138)}</g>'
 s+=arch(door_x,138,54,82,'none',line)
 s+=path(f'M{w/2} 159V220M{door_x+2} 206H{door_x+52}',stroke='#b79a70',sw=.55,extra='opacity=".65"')
 for xx in [w/2-4,w/2+4]:s+=path(f'M{xx} 185v8',stroke='#b79a70',sw=1)
 for xx in [7,w-13]:
  s+=rect(xx,136,6,85,cream,line,.6)+rect(xx-1,136,8,3,cream,line,.5)+rect(xx-1,216,8,5,cream,line,.5)
 # Projecting striped canopy with a small scalloped fabric edge.
 cell=w/12
 for j in range(12):
  left=j*cell;colour=cream if j%2 else dark
  s+=path(f'M{left} 114h{cell}l4 19h{-cell}Z',colour,dark,.45)
  s+=path(f'M{left+4} 133h{cell}q{-cell/2} 6 {-cell} 0Z',colour,dark,.4)
 s+=path(f'M-1 114H{w+1}M2 133H{w+5}',stroke=dark,sw=1.1)
 # A pair of shallow stone steps and tiny sheltered lights finish the entrance.
 s+=rect(-5,220,w+10,4,cream,line,.6)
 s+=path(f'M-5 224H{w+5}L{w+10} 230H-10Z','#e1c6a6',line,.7)
 lights=''
 for xx in [28,w/2,w-28]:
  # Visible little brass shades remain part of the architecture during the day.
  s+=path(f'M{xx-5} 76l1.6 -2.5h6.8L{xx+5} 76Z','#b79a70',line,.4)
  s+=rect(xx-4,76,8,1,cream,line,.3,.4)
  lights+=path(f'M{xx-4} 77L{xx-25} 110H{xx+25}L{xx+4} 77Z','url(#shop-spill)','none')
  lights+=f'<ellipse cx="{xx}" cy="94" rx="35" ry="26" fill="url(#lamp-halo)" opacity=".65"/>'
  lights+=rect(xx-3.5,76,7,1.6,'#ffe4a1','none',0,.5)
 lights+=f'<ellipse cx="{w/2}" cy="150" rx="44" ry="28" fill="url(#lamp-halo)" opacity=".22"/>'
 s+=f'<g class="city-light">{lights}</g>'
 return group(s,x,y,extra='class="premium-storefront"')

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

def rickshaw_branding():
 # A larger painted nameplate stays readable against the cargo-bed rails.
 s=rect(0,88,166,25,'#7f3e35','#e8bea1',.8,1.5)
 for x in [5,161]:s+=circ(x,100.5,.9,'#e8bea1','none')
 s+=txt(83,106,'BANSAL SALES',15,'#fff5e5','text-anchor="middle" font-weight="700" letter-spacing="1.65"')
 return f'<g class="rickshaw-wordmark">{s}</g>'

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
 s+=rickshaw_branding()+txt(192,137,'ELECTRIC',6,cream)
 return s

def walking_stride(t):
 # Match the live departure and arrival gait, settling gently into the handover.
 arrival=11<=t<14
 if not (0<=t<4 or arrival):return 0
 walk_time=t-11 if arrival else t
 settle=min(1,(14-t)/.3) if arrival else 1
 return math.sin(walk_time*6)*settle

def leaf_sprig(x,y,scale=1,angle=0,colour='#cdd2b5'):
 # Small almond leaves replace the old repeated diagonal hatch marks.
 s=path('M-1 4Q1 0 5 -3',stroke='#9ba68b',sw=.55)
 s+=path('M0 1Q-5 0 -5 -5Q0 -5 0 1Z M2 -1Q1 -6 7 -6Q8 -1 2 -1Z',colour,'none')
 return f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">{s}</g>'

def shrub(x,y,scale=1):
 s=path('M-18 0Q-24 -8 -15 -13Q-17 -23 -6 -21Q1 -30 10 -21Q19 -24 20 -13Q28 -7 20 1Z','#a5b395','#9ba68b',.7)
 s+=path('M-17 0Q-21 -8 -10 -10Q-7 -20 2 -14Q12 -19 16 -9Q25 -6 18 1Z','#b8c2a5','none')
 for xx,yy,aa in [(-11,-6,-20),(-3,-13,15),(7,-7,-8),(15,-10,20)]:s+=leaf_sprig(xx,yy,.55,aa)
 return group(s,x,y,scale)

def potted_greenery(x,y,scale=1):
 # Fuller leafy planting in a rounded earthen pot, with restrained arched paintwork.
 s=shrub(0,-17,.55)
 s+=path('M-6 -17Q-7 -24 -8 -28M0 -17Q2 -26 0 -32M7 -17Q9 -24 11 -29',stroke='#9ba68b',sw=.7)
 for xx,yy,aa in [(-7,-24,-20),(-1,-28,6),(8,-23,18)]:s+=leaf_sprig(xx,yy,.66,aa)
 s+=path('M-9 -15H9L8 -12Q13 -6 7 -1Q5 1 0 1Q-5 1 -7 -1Q-13 -6 -8 -12Z','#c89e87',line,.65)
 s+='<ellipse cx="0" cy="-15.5" rx="10.5" ry="2" fill="#b68c77" stroke="#ab7962" stroke-width=".5"/>'
 s+='<ellipse cx="0" cy="-16" rx="8.4" ry=".75" fill="#8b795e"/>'
 s+=path('M-9 -13H9M-8 -10Q0 -8.8 8 -10',stroke=cream,sw=.5)
 for xx in [-6,-1.6,2.8]:
  s+=path(f'M{xx} -3.5V-6Q{xx} -7.1 {xx+1.6} -8.2Q{xx+3.2} -7.1 {xx+3.2} -6V-3.5',stroke=cream,sw=.4)
 s+=path('M-7 -2.2Q0 -.4 7 -2.2',stroke=cream,sw=.45)
 s+=rect(-5.5,.3,11,1.2,'#b68c77',line,.45,.6)
 return group(s,x,y,scale,extra='class="jaipur-planter"')

def street_tree(tree_id='tree'):
 # An asymmetrical crown, tapered branching trunk and a low planted stone bed.
 s='<ellipse cx="1253" cy="628" rx="61" ry="6" fill="#715746" opacity=".12"/>'
 s+=path('M1201 617Q1214 608 1253 609Q1291 608 1308 617L1304 626Q1254 632 1205 626Z','#e1c6a6',line,.7)
 s+='<ellipse cx="1254" cy="616" rx="50" ry="7" fill="#8b795e"/>'
 s+=path('M1190 512C1179 499 1186 477 1201 475C1197 457 1216 447 1230 454C1240 440 1262 443 1270 455C1289 447 1306 459 1307 474C1327 475 1335 495 1324 506C1325 526 1308 536 1293 532C1281 548 1261 548 1249 540C1231 549 1213 537 1211 530C1196 533 1185 523 1190 512Z','#a5b395','#9ba68b',.65)
 s+=path('M1250 623Q1248 590 1251 552L1227 525L1232 521L1254 542L1256 496L1261 496L1260 541L1285 515L1289 519L1261 552Q1259 584 1259 623Z','#8c8164','#8c8164',.7)
 s+=path('M1254 617Q1251 582 1256 552M1256 549L1244 533M1257 539L1271 524',stroke='#b0a17f',sw=1.1)
 s+=path('M1255 523Q1245 496 1221 483M1258 523Q1273 493 1302 486',stroke='#8c8164',sw=3.2)
 s+=path('M1205 469C1203 453 1220 445 1233 454C1245 442 1264 447 1268 458C1284 451 1296 465 1286 480Q1265 495 1246 485Q1220 492 1205 469Z','#cdd2b5','#9ba68b',.7)
 s+=path('M1188 489C1182 476 1196 465 1209 473C1221 465 1234 477 1229 489C1237 502 1220 515 1209 508Q1188 514 1188 489Z','#b8c2a5','#9ba68b',.7)
 s+=path('M1275 477C1292 464 1315 475 1317 490C1330 503 1315 522 1302 519C1285 531 1267 515 1269 499Z','#b8c2a5','#9ba68b',.7)
 s+=path('M1214 514C1217 498 1237 490 1252 500C1270 491 1289 505 1286 522C1291 538 1275 549 1260 542C1244 553 1227 543 1223 534C1217 535 1208 525 1214 514Z','#b8c2a5','#9ba68b',.75)
 for i,(xx,yy,aa) in enumerate([(1201,486,-18),(1221,471,8),(1245,459,-8),(1267,472,18),(1292,488,-12),(1307,503,14),(1281,515,8),(1260,530,-10),(1235,522,16),(1211,503,-12),(1246,499,-20),(1269,494,12),(1213,478,16),(1234,463,-15),(1258,469,10),(1278,482,-12),(1295,507,12),(1228,512,-8),(1247,531,18),(1271,520,14)]):
  s+=leaf_sprig(xx,yy,.58,aa,'#a5b395' if i%3==0 else '#cdd2b5')
 s+=shrub(1220,620,.82)+shrub(1287,621,.88)
 for xx,yy in [(1204,622),(1243,624),(1264,623),(1301,623)]:
  s+=path(f'M{xx} {yy}q-1 -7 -5 -9m5 9q1 -10 5 -12m-5 12v-10',stroke='#98a88d',sw=1)
 s+=path('M1205 625Q1254 631 1304 625',stroke=cream,sw=.75)
 return f'<g id="{tree_id}">{s}</g>'

def worker(stride=0):
 # life-sized proportions, clothing folds, supported carton and articulated knees
 s='<ellipse cx="13" cy="6" rx="35" ry="5" fill="#684f41" opacity=".14"/>'
 s+=f'<g id="leg-back" transform="rotate({stride*7} 0 -65)">'+path('M9 -68L22 -33L7 -5',stroke='#585854',sw=14)+path('M4 -7L1 1Q2 5 24 3L19 -2L13 -7Z','#574438',ink,1)+'</g>'
 s+=f'<g id="leg-front" transform="rotate({-stride*7} 0 -65)">'+path('M-5 -67L-12 -35L-17 -5',stroke='#68716a',sw=15)+path('M-21 -7L-25 1Q-22 5 -1 3L-4 -3L-10 -7Z','#574438',ink,1)+'</g>'
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
 stride=walking_stride(t);bob=stride*1.5
 body=f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="850" viewBox="0 0 1600 850" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Jaipur, carried by its people</title><desc id="scene-desc">Original architectural motion study with a hilltop fort, Hawa Mahal inspired facade, Albert Hall inspired pavilions, bazaar shops, a detailed cargo e-rickshaw and an adult carrying a carton. Composite illustration, not a geographical view.</desc><defs><pattern id="paper" width="17" height="19" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r=".5" fill="#a48063" opacity=".16"/><circle cx="13" cy="15" r=".4" fill="#a48063" opacity=".13"/></pattern></defs>'
 # Outboard artwork is revealed on wide views; the original 1600-unit frame stays fixed.
 body+=rect(-1400,0,4400,850,cream,'none')+circ(1240,187,69,'#efdcc0','none')
 body+=group(hillfort(),-60,80,.98,extra='id="hills" opacity=".6"')
 body+=group(albert(),1065,294,1.24,extra='id="albert" opacity=".67"')
 body+=group(hawa(),559,244,1.13,extra='id="hawa"')
 # quiet middle ground houses
 for j in range(9):
  xx=365+j*37;yy=516-(j%3)*13;body+=rect(xx,yy,34,103,'#e4c4ae',line,.6)+arch(xx+10,yy+10,13,25,cream)
 body+=path('M-1400 616H3000V850H-1400Z','#f0e2cd','none')+path('M-1400 632H3000M-1400 751H3000',stroke='#bfa48c',sw=1)
 # street paving perspective
 for yy in [650,674,709,760,825]:body+=path(f'M-1400 {yy}H3000',stroke='#d8c5ab',sw=.7)
 for xx in range(-3150,4800,150):body+=path(f'M{800+(xx-800)*.6} 632L{xx} 850',stroke='#d8c5ab',sw=.7)
 # Enlarge the complete Bansal base around its street-level footing, keeping the skyline and people at their existing scale.
 warehouse=shop(22,410,300,'BANSAL SALES CORPORATION',True)
 for i in range(2):
  for j in range(2-i):warehouse+=carton(306+i*42,590-j*30,38,30)
 warehouse+=path('M7 615H330L343 626H0Z','#d1b59a',line)
 body+=f'<g id="bansal-storefront" transform="translate(0 626) scale(1.1) translate(0 -626)">{warehouse}</g>'
 body+=shop(1320,413,160,'GENERAL STORE')+shop(1487,420,139,'KIRANA')
 body+=f'<g id="panorama-shop">{super_department_store(1633,396,228)}</g>'
 body+=street_tree()
 # Companion planting occupies the open panorama space LEFT of the Bansal base.
 body+=f'<g transform="translate(-41.272 622) scale(.69) translate(-1254 -622)">{street_tree("warehouse-tree")}</g>'
 body+=f'<g id="roadside-greenery">{potted_greenery(-113.168,624,.805)}{potted_greenery(-92.280,624,.69)}{potted_greenery(430,622)}{potted_greenery(457,622,.8)}{potted_greenery(1340,620,.85)}{potted_greenery(1520,623,.85)}{potted_greenery(1655,625,.8)}{potted_greenery(1839,625,.8)}{potted_greenery(-153,624,.6)}{potted_greenery(-134,624,.58)}{potted_greenery(710,622,.65)}{potted_greenery(1149,619,.75)}{potted_greenery(1470,620,.65)}</g>'
 # birds at a quiet scale
 for xx,yy in [(480,208),(1065,176),(1412,302),(979,119)]:body+=path(f'M{xx} {yy}q6 -7 12 0q6 -7 12 0',stroke=line,sw=1.5,extra='class="bird"')
 body+=f'<g id="vehicle" transform="translate({vx} 573)">{rickshaw()}</g>'
 body+=f'<g id="carrier" opacity="{visible}" transform="translate({wx} {728+bob})"><g class="carrier-person" transform="scale(.9)">{worker(stride)}</g></g>'
 # shaded retailer at final threshold, differently dressed
 body+='<g id="retailer" transform="translate(1460 728) scale(-.9 .9)">'+worker().replace('#637d72','#b08a64').replace('#a6b5a2','#d4b895')+'</g>'
 body+=rect(-1400,0,4400,850,'url(#paper)','none')
 body+=txt(45,64,'BANSAL / JAIPUR',13,dark,'letter-spacing="3"')+txt(45,110,'A city of stories. A daily journey.',34,ink)
 body+=txt(45,806,'ARCHITECTURAL MOTION STUDY  /  02',10,dark,'letter-spacing="2"')+txt(1555,806,'Original composite • not a geographical route',11,dark,'text-anchor="end"')
 # Raster export mirrors the live wheel rotations.
 angle=ease*1408
 body=body.replace('class="spokes" style="transform-origin:40px 143px"',f'class="spokes" transform="rotate({angle} 40 143)" style="transform-origin:40px 143px"')
 body=body.replace('class="spokes" style="transform-origin:246px 143px"',f'class="spokes" transform="rotate({angle} 246 143)" style="transform-origin:246px 143px"')
 body+='</svg>'
 return body
