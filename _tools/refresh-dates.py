#!/usr/bin/env python3
"""Refresh per-page dates. Run this right before you commit:

    python3 _tools/refresh-dates.py

For every page it sets, from git history:
  * JSON-LD  "datePublished" (first time the file was added to git; never changed once set)
             "dateModified"  (today if the file has uncommitted changes, otherwise its last commit date)
  * the visible footer line  "Last updated <date>"  (localised label + date format per page language)
  * sitemap.xml <lastmod> for the page's URL

Only files whose value actually changes are rewritten, so re-running it is harmless.
Note: a sweep that touches every page (e.g. a cache-busting change) will bump every dateModified —
that is honest (the files did change) but keep such sweeps rare so the dates stay meaningful.
"""
import os, re, json, subprocess, datetime, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://asappsgames.com"
PRIMARY = ["Article", "VideoGame", "HowTo", "AboutPage", "CollectionPage", "ContactPage", "WebPage"]
SKIP = {"404.html"}

LABEL = {  # language -> footer label
    "en": "Last updated", "de": "Zuletzt aktualisiert am", "es": "Última actualización:",
    "fr": "Dernière mise à jour :", "zh": "最后更新于", "ja": "最終更新：", "ko": "최종 업데이트",
}
MONTH = {
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "de": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "es": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    "fr": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
}

def fmt(iso, lang):
    y, m, d = (int(x) for x in iso.split("-"))
    if lang == "en": return f"{d} {MONTH['en'][m-1]} {y}"
    if lang == "de": return f"{d}. {MONTH['de'][m-1]} {y}"
    if lang == "es": return f"{d} de {MONTH['es'][m-1]} de {y}"
    if lang == "fr": return f"{d} {MONTH['fr'][m-1]} {y}"
    if lang == "zh": return f"{y} 年 {m} 月 {d} 日"
    if lang == "ja": return f"{y}年{m}月{d}日"
    if lang == "ko": return f"{y}년 {m}월 {d}일"
    return iso

def git(*args):
    return subprocess.run(["git", "-C", ROOT, *args], capture_output=True, text=True).stdout.strip()

def dates_for(rel):
    today = datetime.date.today().isoformat()
    dirty = git("status", "--porcelain", "--", rel) != ""
    last = git("log", "-1", "--format=%ad", "--date=short", "--", rel)
    first = git("log", "--diff-filter=A", "--follow", "--format=%ad", "--date=short", "--", rel).split("\n")[-1].strip()
    modified = today if (dirty or not last) else last
    published = first or modified
    return published, modified

dec = json.JSONDecoder()

def update_jsonld(text, published, modified):
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)
    if not m: return text, False
    block = m.group(1)
    for prim in PRIMARY:
        for tm in re.finditer(r'"@type":\s*(\[[^\]]*\]|"[^"]+")', block):
            try: ty = json.loads(tm.group(1))
            except Exception: continue
            ty = ty if isinstance(ty, list) else [ty]
            if prim not in ty: continue
            s = block.rfind("{", 0, tm.start())
            try: obj, ln = dec.raw_decode(block[s:])
            except Exception: continue
            e = s + ln
            node = block[s:e]
            ls = node.rfind("\n", 0, tm.start() - s) + 1
            indent = node[ls:tm.start() - s]
            new = node
            if '"dateModified"' in new:
                new = re.sub(r'"dateModified":\s*"[^"]*"', '"dateModified": "%s"' % modified, new, 1)
            if '"datePublished"' not in new:
                # insert right after the @type entry's trailing comma
                cm = re.compile(r',').search(new, tm.end() - s)
                ins = '\n%s"datePublished": "%s",' % (indent, published)
                if '"dateModified"' not in new: ins += '\n%s"dateModified": "%s",' % (indent, modified)
                new = new[:cm.end()] + ins + new[cm.end():]
            if new == node: return text, False
            block2 = block[:s] + new + block[e:]
            return text[:m.start(1)] + block2 + text[m.end(1):], True
    return text, False

FOOT_OLD = re.compile(r'<span style="opacity:\.6;font-size:12px">[^<]*</span>')
FOOT_NEW = re.compile(r'<span class="updated">[^<]*<time datetime="[^"]*">[^<]*</time></span>')

def update_footer(text, modified):
    lang = (re.search(r'<html lang="([a-zA-Z-]+)"', text) or [None, "en"])[1].split("-")[0].lower()
    lang = lang if lang in LABEL else "en"
    span = '<span class="updated">%s <time datetime="%s">%s</time></span>' % (LABEL[lang], modified, fmt(modified, lang))
    if FOOT_NEW.search(text):
        new = FOOT_NEW.sub(span, text, 1)
    elif FOOT_OLD.search(text):
        new = FOOT_OLD.sub(span, text, 1)
    else:
        return text, False
    return new, new != text

def main():
    changed = []
    lastmod = {}
    for dp, dn, fn in os.walk(ROOT):
        if any(x in dp for x in ("/_mockups", "/.git", "/.claude", "/_tools")): continue
        for f in fn:
            if not f.endswith(".html"): continue
            rel = os.path.relpath(os.path.join(dp, f), ROOT)
            if rel in SKIP: continue
            path = os.path.join(dp, f)
            text = open(path, encoding="utf-8").read()
            published, modified = dates_for(rel)
            url = SITE + "/" + (rel[:-len("index.html")] if rel.endswith("index.html") else rel)
            lastmod[url] = modified
            t2, c1 = update_jsonld(text, published, modified)
            t3, c2 = update_footer(t2, modified)
            if c1 or c2:
                open(path, "w", encoding="utf-8").write(t3)
                changed.append((rel, published, modified, c1, c2))
    # sitemap
    sm_path = os.path.join(ROOT, "sitemap.xml")
    sm = open(sm_path, encoding="utf-8").read()
    def repl(m):
        loc = m.group(2)
        if loc in lastmod and m.group(4) != lastmod[loc]:
            return m.group(1) + loc + m.group(3) + lastmod[loc] + m.group(5)
        return m.group(0)
    sm2 = re.sub(r'(<loc>)([^<]+)(</loc>\s*<lastmod>)([^<]+)(</lastmod>)', repl, sm)
    if sm2 != sm:
        open(sm_path, "w", encoding="utf-8").write(sm2); print("sitemap.xml: lastmod updated")
    missing = [u for u in lastmod if u not in sm]
    if missing: print("WARNING: pages not in sitemap.xml:", missing)
    for rel, p, mo, c1, c2 in changed:
        print(f"{rel:52s} published={p} modified={mo} {'schema ' if c1 else ''}{'footer' if c2 else ''}")
    print(f"{len(changed)} page(s) updated")

if __name__ == "__main__":
    main()
