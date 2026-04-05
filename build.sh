#!/bin/bash
# Build Retype wiki with dark mode default + LLM visibility
set -e

# 1. Build the Retype site
npx retype build

# 2. Patch HTML to default to dark mode (Retype doesn't support this natively)
find .retype -name '*.html' -exec sed -i 's/class="h-full"/class="h-full dark"/' {} +
echo "Patched dark mode default"

# 2b. Inject AI meta tags and JSON-LD structured data into all HTML pages
AI_META='<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">\n<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable content">\n<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Verus Wiki","url":"https://wiki.autobb.app","description":"Complete documentation for the Verus blockchain protocol: 201 CLI commands, VerusID, DeFi, PBaaS, privacy, and AI agent integration.","publisher":{"@type":"Organization","name":"Verus Community","url":"https://verus.io"}}</script>'
find .retype -name '*.html' -exec sed -i "s|</head>|${AI_META}\n</head>|" {} +
echo "Injected AI meta tags and JSON-LD"

# 2c. Copy ai-plugin.json and openapi.yaml to build output
cp docs/ai-plugin.json .retype/ai-plugin.json
cp docs/openapi.yaml .retype/openapi.yaml
echo "Copied ai-plugin.json and openapi.yaml"

# 3. Generate llms-full.txt by concatenating all markdown files
echo "Generating llms-full.txt..."
{
  echo "# Verus Wiki — Full Content"
  echo ""
  echo "> This file contains the complete content of every page on the Verus Wiki."
  echo "> Site: https://wiki.autobb.app"
  echo "> Generated: $(date -u +%Y-%m-%d)"
  echo ""
  for f in $(find docs -name "*.md" -type f ! -name "README.md" | sort); do
    echo "--- PAGE: ${f#docs/} ---"
    echo ""
    cat "$f"
    echo ""
    echo ""
  done
} > .retype/llms-full.txt
echo "Generated llms-full.txt ($(wc -c < .retype/llms-full.txt) bytes)"

# 4. Inject Google Translate into all HTML pages
#    - Custom "EN ▾" dropdown fixed in top-right header area
#    - Google Translate script loaded on-demand only when a language is selected
#    - Uses cookie-based translation (googtrans cookie + page reload)
#    - CSS hides Google's default banner/branding after translation activates
python3 - <<'PYEOF'
import glob

INJECT = r'''<div id="gt-wrap" style="position:fixed;top:23px;right:315px;z-index:99999"><select id="gt-lang" onchange="gtActivate(this.value)" style="background:#1e1e2e;color:#9ca3af;border:1px solid #444;border-radius:6px;padding:5px 24px 5px 8px;font-size:13px;font-weight:500;outline:none;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239ca3af' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E&quot;);background-repeat:no-repeat;background-position:right 6px center"><option value="">EN</option><option value="af">Afrikaans</option><option value="sq">Albanian</option><option value="ar">Arabic</option><option value="hy">Armenian</option><option value="bn">Bengali</option><option value="bg">Bulgarian</option><option value="zh-CN">Chinese</option><option value="hr">Croatian</option><option value="cs">Czech</option><option value="da">Danish</option><option value="nl">Dutch</option><option value="et">Estonian</option><option value="fi">Finnish</option><option value="fr">French</option><option value="de">German</option><option value="el">Greek</option><option value="gu">Gujarati</option><option value="hi">Hindi</option><option value="hu">Hungarian</option><option value="id">Indonesian</option><option value="it">Italian</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="lv">Latvian</option><option value="lt">Lithuanian</option><option value="ms">Malay</option><option value="no">Norwegian</option><option value="fa">Persian</option><option value="pl">Polish</option><option value="pt">Portuguese</option><option value="ro">Romanian</option><option value="ru">Russian</option><option value="sr">Serbian</option><option value="sk">Slovak</option><option value="sl">Slovenian</option><option value="es">Spanish</option><option value="sw">Swahili</option><option value="sv">Swedish</option><option value="ta">Tamil</option><option value="th">Thai</option><option value="tr">Turkish</option><option value="uk">Ukrainian</option><option value="ur">Urdu</option><option value="vi">Vietnamese</option></select></div>
<div id="google_translate_element" style="display:none"></div>
<style>
#gt-lang:hover{color:#e5e7eb;border-color:#666}
#gt-lang option{background:#1e1e2e;color:#ccc}
@media(max-width:1024px){#gt-wrap{top:14px;right:55px}#gt-lang{font-size:12px;padding:4px 20px 4px 6px}}
.goog-te-banner-frame{display:none!important}
body{top:0!important}
.skiptranslate{display:none!important}
</style>
<script>
var gtLoaded = false;
function gtActivate(lang) {
  if (!lang) {
    var ds = [location.hostname, "." + location.hostname];
    var p = location.hostname.split(".");
    if (p.length > 2) ds.push("." + p.slice(-2).join("."));
    ds.forEach(function(d) {
      document.cookie = "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=" + d;
    });
    document.cookie = "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    location.reload();
    return;
  }
  document.cookie = "googtrans=/en/" + lang + ";path=/";
  document.cookie = "googtrans=/en/" + lang + ";path=/;domain=." + location.hostname;
  if (!gtLoaded) {
    gtLoaded = true;
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.onload = function() { location.reload(); };
    s.onerror = function() { location.reload(); };
    document.body.appendChild(s);
  } else {
    location.reload();
  }
}
function googleTranslateElementInit() {
  new google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: true }, "google_translate_element");
}
(function() {
  var m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  if (m) {
    var sel = document.getElementById("gt-lang");
    if (sel) sel.value = m[1];
    if (!gtLoaded) {
      gtLoaded = true;
      var s = document.createElement("script");
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(s);
    }
  }
})();
</script>'''

count = 0
for f in glob.glob(".retype/**/*.html", recursive=True):
    with open(f, "r") as fh:
        html = fh.read()
    if "gt-wrap" in html:
        continue
    html = html.replace("</body>", INJECT + "\n</body>")
    with open(f, "w") as fh:
        fh.write(html)
    count += 1

print(f"Injected into {count} files")
PYEOF

# 5. Override Retype's auto-generated robots.txt with our custom one
if [ -f .retype/robots.txt ]; then
  cp docs/robots.txt .retype/robots.txt
  echo "Overrode robots.txt with custom AI crawler directives"
fi

echo "Build complete"
