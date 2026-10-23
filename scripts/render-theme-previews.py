"""Export self-contained SVG art proofs (not browser screenshots) for the three themes."""
from pathlib import Path
import re
import base64
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CSS = (ROOT / 'dist/theme.css').read_text()
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)

def variables(declarations):
    return dict(re.findall(r'(--[\w-]+):([^;}]+)', declarations))

def resolve(value, props):
    for _ in range(4):
        value, count = re.subn(r'var\((--[\w-]+),([^()]*)\)', lambda m: props.get(m[1], m[2]), value)
        if not count:
            break
    return value

out = ROOT / 'design/theme-preview'
out.mkdir(exist_ok=True)
for theme in ['day', 'evening', 'night']:
    svg = ET.fromstring((ROOT / 'dist/assets/hero.svg').read_text())
    # The HTML control now rises 120px above its original position. Include that
    # extra sky in this 1600px-wide art proof, without moving the architecture.
    svg.set('viewBox', '0 35 1600 740')
    svg.set('height', '740')
    # Art proofs include the HTML sun/moon area; the served SVG itself stays
    # vertically clipped so the overflow never paints over playback controls.
    for element in svg.iter():
        if element.get('clip-path') == 'url(#scene-panorama-clip)':
            del element.attrib['clip-path']
    props = variables(re.search(r':root\{([^}]+)', CSS)[1])
    theme_match = re.search(r'html\[data-theme=' + theme + r'\]\{([^}]+)', CSS)
    if theme_match:
        props.update(variables(theme_match[1]))
    # Only SVG-related overrides are relevant to these illustration-only proofs.
    rules = re.findall(r'html\[data-theme=' + theme + r'\] (#[-\w]+)\{([^}]+)\}', CSS)
    def walk(element, inherited):
        local = dict(inherited)
        for selector, declarations in rules:
            if element.get('id') == selector[1:]:
                local.update(variables(declarations))
                opacity = re.search(r'(?:^|;)opacity:([^;]+)', declarations)
                if opacity:
                    element.set('opacity', opacity[1])
        classes = element.get('class', '').split()
        if 'city-light' in classes:
            element.set('opacity', {'day':'0', 'evening':'.48', 'night':'1'}[theme])
        if 'city-stars' in classes:
            element.set('opacity', '.8' if theme == 'night' else '0')
        if 'bird' in classes:
            element.set('opacity', {'day':'1', 'evening':'.5', 'night':'.13'}[theme])
        for key, value in list(element.attrib.items()):
            element.set(key, resolve(value, local))
        for child in list(element):
            if child.tag == f'{{{NS}}}style':
                element.remove(child)
            else:
                walk(child, local)
    walk(svg, props)
    # The interactive HTML sun/moon has this equivalent visual in an art proof.
    radius = 69 * {'day':.81, 'evening':.7128, 'night':.5022}[theme]
    if theme in ('day', 'night'):
        asset = 'sun.svg' if theme == 'day' else 'moon.svg'
        artwork = base64.b64encode((ROOT / 'dist/assets' / asset).read_bytes()).decode()
        moon = ET.Element(f'{{{NS}}}image', {
            'href': f'data:image/svg+xml;base64,{artwork}',
            'x':str(1240-radius), 'y':str(109.4-radius),
            'width':str(radius*2), 'height':str(radius*2)
        })
    else:
        moon = ET.Element(f'{{{NS}}}circle', {'cx':'1240','cy':'109.4','r':str(radius), 'fill':{'day':'#efdcc0','evening':'#f6cd98'}[theme]})
    svg.append(moon)
    (out / f'{theme}-illustration.svg').write_text(ET.tostring(svg, encoding='unicode'))
print('Saved three original SVG art proofs to design/theme-preview/')
