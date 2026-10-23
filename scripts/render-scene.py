"""Rebuild the original hero with theme-aware materials and localized architectural light.
Run explicitly when illustration_library.py changes; normal build serves the saved SVG.
"""
from pathlib import Path
import re
from illustration_library import make_svg
ROOT=Path(__file__).resolve().parent.parent

def illuminate(svg):
    # Material variables retain their exact original colours in day mode.
    materials={
        '#fbf3e5':'plaster','#d49a85':'masonry','#965c50':'terracotta','#ab7962':'outline',
        '#b77e69':'recess','#efe1cd':'hill','#d4b99a':'hill-edge','#dcc6ad':'contour',
        '#ead6bd':'fort','#bb9775':'fort-edge','#d1b495':'fort-recess',
        '#dfbba0':'wall','#b58d6d':'wall-edge','#e2c2a7':'wall','#ae8e70':'wall-recess',
        '#c29f80':'wall-edge','#e4c4ae':'houses','#f0e2cd':'street','#bfa48c':'street-edge','#d8c5ab':'paving',
        '#624d42':'shop-dark','#987a55':'shelf','#d1b59a':'threshold','#bbc0a3':'foliage','#9ba68b':'leaf-edge',
        '#8c8164':'trunk','#b18a67':'counter','#9b7760':'counter-dark',
        '#bd846e':'painted-panel','#557969':'glass-green','#aa6258':'glass-red',
        '#b8c2a5':'foliage','#cdd2b5':'foliage-light','#a5b395':'foliage-shadow',
        '#98a88d':'foliage-deep','#b0a17f':'trunk-light','#e1c6a6':'garden-stone','#8b795e':'garden-soil',
        '#c89e87':'planter-clay','#b68c77':'planter-rim',
        '#c2bd9b':'fort-roof','#aba786':'fort-roof-shadow','#d9c3a2':'fort-wall','#c2a784':'fort-wall-shadow',
        '#dfc6a4':'fort-panel',
        '#657569':'premium-glass','#b79a70':'premium-brass',
        '#e8d9bb':'premium-interior',
    }
    svg=re.sub(r'(fill|stroke)="(#[a-fA-F0-9]+)"',lambda m:f'{m[1]}="var(--scene-{materials[m[2]]},{m[2]})"' if m[2] in materials else m[0],svg)
    defs='''<style>.city-light,.city-stars{opacity:0}</style><clipPath id="scene-panorama-clip"><rect x="-1400" y="155" width="4400" height="620"/></clipPath><linearGradient id="city-sky" gradientUnits="userSpaceOnUse" x1="0" y1="155" x2="0" y2="775"><stop stop-color="var(--sky-top,#fbf3e5)"/><stop offset=".65" stop-color="var(--sky-mid,#fbf3e5)"/><stop offset="1" stop-color="var(--sky-bottom,#fbf3e5)"/></linearGradient>
<linearGradient id="lit-masonry" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--stone-top,#d49a85)"/><stop offset=".65" stop-color="var(--stone-mid,#d49a85)"/><stop offset="1" stop-color="var(--stone-bottom,#d49a85)"/></linearGradient>
<linearGradient id="store-masonry" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9a604a"/><stop offset=".65" stop-color="#bc8054"/><stop offset="1" stop-color="#dfa365"/></linearGradient>
<radialGradient id="amber-wash" cx="50%" cy="100%" r="80%"><stop stop-color="#ffd991" stop-opacity=".66"/><stop offset=".42" stop-color="#ffbb60" stop-opacity=".23"/><stop offset="1" stop-color="#f2a353" stop-opacity="0"/></radialGradient>
<radialGradient id="ground-pool"><stop stop-color="#f8c67e" stop-opacity=".3"/><stop offset=".55" stop-color="#eeb36c" stop-opacity=".12"/><stop offset="1" stop-color="#f4b56c" stop-opacity="0"/></radialGradient>
<radialGradient id="lamp-halo"><stop stop-color="#ffedbb" stop-opacity=".75"/><stop offset=".18" stop-color="#ffd18a" stop-opacity=".3"/><stop offset="1" stop-color="#ffc07b" stop-opacity="0"/></radialGradient>
<linearGradient id="shop-spill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffdc9b" stop-opacity=".22"/><stop offset="1" stop-color="#ffbd70" stop-opacity="0"/></linearGradient>
<filter id="soft-light" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>'''
    svg=svg.replace('<defs>','<defs>'+defs,1)
    # Only horizontal overflow is intentional. Keep painting away from text/controls.
    svg=svg.replace('</defs>','</defs><g clip-path="url(#scene-panorama-clip)">',1).replace('</svg>','</g></svg>',1)
    svg=svg.replace('fill="var(--scene-plaster,#fbf3e5)" stroke="none" stroke-width="1"/>','fill="url(#city-sky)" stroke="none" stroke-width="1"/>',1)
    svg=re.sub(r'<circle cx="1240" cy="187".*?/>','',svg,count=1) # sun is now an accessible HTML control
    stars=''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eee2c6" opacity="{o}"/>' for x,y,r,o in [(-350,225,.9,.4),(-170,306,.8,.35),(95,182,1,.4),(525,200,1.1,.45),(1000,210,.9,.6),(1360,178,1,.4),(1492,229,1,.6),(1100,290,.8,.4),(825,170,.7,.4),(371,184,.8,.4),(1438,350,.7,.3),(70,255,.7,.5),(1150,168,1,.4),(1695,220,1,.4),(1820,301,.8,.4),(2070,248,.9,.3)])
    svg=svg.replace('<g transform="translate(-60',f'<g class="city-stars" aria-hidden="true">{stars}</g><g transform="translate(-60',1)
    # Wash each architectural bay from below, leaving its jali recess dark.
    def baylight(m):
        x,y,w,h=map(float,m.group(1,2,3,4))
        # Hawa Mahal's projecting bays are illuminated tier by tier.
        # Retain a broad wash on the larger shop facades.
        step = 55 if w == 44 else h
        washes = ''.join(f'<rect class="city-light facade-wash" x="{x}" y="{y+offset}" width="{w}" height="{min(step,h-offset)}" fill="url(#amber-wash)" pointer-events="none"/>' for offset in range(0,int(h),int(step)))
        return m[0]+washes
    svg=re.sub(r'<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="0" fill="var\(--scene-masonry,#d49a85\)"[^>]+/>',baylight,svg)
    # Three quiet facade washes follow the actual palace rectangle, behind its niches.
    def fortlight(match):
        values=dict(re.findall(r'(x|y|width|height)="([\d.]+)"',match[0]))
        x,y,w,h=(float(values[key]) for key in ('x','y','width','height'))
        lights=''.join(f'<rect class="city-light fort-uplight" x="{x+i*w/3}" y="{y}" width="{w/3}" height="{h}" fill="url(#amber-wash)"/>' for i in range(3))
        return match[0]+lights
    svg=re.sub(r'<rect[^>]+class="fort-facade"[^>]*/>',fortlight,svg)
    # Ground pools sit behind all people and vehicles and stay anchored to their shops.
    pools='''<g class="city-light street-light" aria-hidden="true"><ellipse cx="183" cy="649" rx="240" ry="50" fill="url(#ground-pool)"/><ellipse cx="840" cy="633" rx="360" ry="26" fill="url(#ground-pool)"/><ellipse cx="1430" cy="651" rx="240" ry="47" fill="url(#ground-pool)"/><path d="M25 610H347L434 722H0Z" fill="url(#shop-spill)" opacity=".6" filter="url(#soft-light)"/></g>'''
    svg=svg.replace('<g id="bansal-storefront"',pools+'<g id="bansal-storefront"',1)
    # Luminaires: sheltered warm downlight over the sign and under the awning.
    def lamps(w,warehouse):
        out='<g class="city-light shop-light" aria-hidden="true">'
        xs=[35,w/2,w-35] if warehouse else [28,w-28]
        for x in xs:
            out+=f'<ellipse cx="{x}" cy="80" rx="35" ry="32" fill="url(#lamp-halo)"/><path d="M{x-26} 96L{x-5} 65H{x+5}L{x+26} 96Z" fill="url(#shop-spill)"/><rect x="{x-5}" y="63" width="10" height="2" rx="1" fill="#ffe4a1"/>'
        out+=f'<rect x="18" y="120" width="{w-36}" height="2" fill="#ffdb92" opacity=".85"/><ellipse cx="{w/2}" cy="135" rx="{w/2}" ry="28" fill="url(#lamp-halo)" opacity=".55"/></g>'
        return out
    # Place lamps after each shop's awning and before its group close.
    for w,warehouse in [(300,True),(160,False),(139,False)]:
        marker=f'<rect x="-9" y="199" width="{w+18}" height="7"'
        svg=re.sub('('+re.escape(marker)+r'[^>]+/>)',lambda m:m[0]+lamps(w,warehouse),svg,count=1)
    # Small vehicle headlamp cast travels with the rickshaw without extra animation tracks.
    svg=re.sub(r'(<g id="vehicle"[^>]*>)',r'\1<g class="city-light vehicle-light"><path d="M278 104L385 81Q405 111 385 145L278 109Z" fill="url(#shop-spill)" opacity=".35"/><ellipse cx="275" cy="104" rx="19" ry="17" fill="url(#lamp-halo)"/></g>',svg,count=1)
    return svg

svg=make_svg().replace('id="leg-front"','class="leg-front"').replace('id="leg-back"','class="leg-back"')
svg=re.sub(r'<text x="(?:45|1555)"[^>]*>.*?</text>','',svg)
svg=svg.replace('viewBox="0 0 1600 850"','viewBox="0 155 1600 620"').replace('height="850"','height="620"',1)
svg=illuminate(svg)
(ROOT/'dist/assets/hero.svg').write_text(svg)
inline=svg.replace('scene-title','hero-title').replace('scene-desc','hero-desc')
p=ROOT/'dist/index.html'
html=p.read_text()
html,n=re.subn(r'(<div class="hero-scene">)<svg[\s\S]*?</svg>',lambda m:m[1]+inline,html,count=1)
assert n==1,'Hero scene must exist exactly once'
p.write_text(html)
print('Rendered theme-aware hero and inline scene')
