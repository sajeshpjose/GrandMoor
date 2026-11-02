import json, re, sys, html
sys.path.insert(0, 'tools')
from faqs import FAQS

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
START, END = '<!-- FAQ:START -->', '<!-- FAQ:END -->'
LD_START, LD_END = '<!-- FAQ-SCHEMA:START -->', '<!-- FAQ-SCHEMA:END -->'

def plain(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))

for rel, items in FAQS.items():
    path = f'{ROOT}/{rel}'
    s = open(path, encoding='utf-8').read()
    # strip previous injections so the script can be re-run
    s = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', '', s, flags=re.S)
    s = re.sub(r'\s*' + re.escape(LD_START) + r'.*?' + re.escape(LD_END), '', s, flags=re.S)

    qa = '\n'.join(
        f'''        <details class="faq-item">
          <summary><h3>{html.escape(q)}</h3></summary>
          <p>{a}</p>
        </details>''' for q, a in items)
    section = f'''{START}
  <section class="faq-section" aria-labelledby="faq-title">
    <div class="container">
      <h2 id="faq-title" class="faq-title">Frequently Asked Questions</h2>
      <div class="faq-list">
{qa}
      </div>
    </div>
  </section>
{END}
'''
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage',
          'mainEntity': [{'@type': 'Question', 'name': q,
                          'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q, a in items]}
    ld_block = f'\n  {LD_START}\n  <script type="application/ld+json">\n{json.dumps(ld, indent=2, ensure_ascii=False)}\n  </script>\n  {LD_END}'

    # Place the FAQ right before the related-services grid, else before the footer
    anchor = s.find('<section class="offerings-section">')
    if anchor == -1:
        anchor = s.find('<div id="footer-container">')
    line_start = s.rfind('\n', 0, anchor) + 1
    s = s[:line_start] + '  ' + section + s[line_start:]
    s = s.replace('</head>', ld_block + '\n</head>', 1)
    open(path, 'w', encoding='utf-8').write(s)
    print(f'{rel}: {len(items)} questions')
