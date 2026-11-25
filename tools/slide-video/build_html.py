"""ประกอบไฟล์สไลด์: engine + common.css + ธีม + sections
ใช้: python3 build_html.py <sections.html> <theme.css> <out.html> [--presenter]"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
sec, theme, out = sys.argv[1:4]
eng = open(os.path.join(here, 'examples/insure-tax-gold.html')).read()
t = open(sec).read().replace('ILL/', 'file://' + here + '/icons/illust/')
css = open(os.path.join(here, 'common.css')).read() + open(theme).read()
if '--presenter' in sys.argv: css += open(os.path.join(here, 'presenter.css')).read()
head = '<!doctype html>\n<html lang="th"><head><meta charset="utf-8">\n<link href="file://' + here + '/fonts/prompt.css" rel="stylesheet">\n'
open(out, 'w').write(head + eng[eng.index('<style>'):eng.index('</style>') + 8] + '\n' + t.replace('</head>', '<style>' + css + '</style>\n</head>', 1) + '\n' + eng[eng.index('<script>'):])
