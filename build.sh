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

INJECT = r'''<div id="gt-wrap" style="position:fixed;top:18px;right:350px;z-index:9999"><select id="gt-lang" onchange="gtActivate(this.value)" style="background:#1e1e2e;color:#9ca3af;border:1px solid #444;border-radius:4px;padding:3px 18px 3px 6px;font-size:11px;font-weight:500;outline:none;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 10 6'%3E%3Cpath fill='%239ca3af' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E&quot;);background-repeat:no-repeat;background-position:right 5px center"><option value="">EN</option><option value="af">Afrikaans</option><option value="sq">Albanian</option><option value="ar">Arabic</option><option value="hy">Armenian</option><option value="bn">Bengali</option><option value="bg">Bulgarian</option><option value="zh-CN">Chinese</option><option value="hr">Croatian</option><option value="cs">Czech</option><option value="da">Danish</option><option value="nl">Dutch</option><option value="et">Estonian</option><option value="fi">Finnish</option><option value="fr">French</option><option value="de">German</option><option value="el">Greek</option><option value="gu">Gujarati</option><option value="hi">Hindi</option><option value="hu">Hungarian</option><option value="id">Indonesian</option><option value="it">Italian</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="lv">Latvian</option><option value="lt">Lithuanian</option><option value="ms">Malay</option><option value="no">Norwegian</option><option value="fa">Persian</option><option value="pl">Polish</option><option value="pt">Portuguese</option><option value="ro">Romanian</option><option value="ru">Russian</option><option value="sr">Serbian</option><option value="sk">Slovak</option><option value="sl">Slovenian</option><option value="es">Spanish</option><option value="sw">Swahili</option><option value="sv">Swedish</option><option value="ta">Tamil</option><option value="th">Thai</option><option value="tr">Turkish</option><option value="uk">Ukrainian</option><option value="ur">Urdu</option><option value="vi">Vietnamese</option></select></div>
<div id="google_translate_element" style="display:none"></div>
<style>
#gt-lang:hover{color:#e5e7eb;border-color:#666}
#gt-lang option{background:#1e1e2e;color:#ccc}
@media(max-width:960px){#gt-wrap{right:60px!important}}
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

SIDEBAR_FALLBACK = r'''<style>
/* Fallback sidebar toggle for browsers that block eval (Brave, etc.) */
#sidebar-fallback-btn{display:none;position:fixed;top:18px;left:14px;z-index:9999;background:transparent;border:none;cursor:pointer;padding:8px;border-radius:50%;color:inherit}
#sidebar-fallback-btn svg{width:24px;height:24px;fill:currentColor}
#sidebar-fallback-btn:hover{background:rgba(128,128,128,0.15)}
@media(min-width:768px){#sidebar-fallback-btn{display:none!important}}
</style>
<script>
(function(){
  // Only activate if Vue failed to mount (v-cloak still present after load)
  var t = setTimeout(function(){
    var btn = document.querySelector(".retype-mobile-menu-button");
    var vueToggle = document.getElementById("retype-sidebar-left-toggle-button");
    // If Vue mounted, the toggle button will have child elements
    if (vueToggle && vueToggle.children.length > 0) return;
    // If the skeleton button is visible and clickable, skip
    if (btn && btn.offsetParent !== null) return;
    // Create fallback hamburger button
    var fb = document.createElement("button");
    fb.id = "sidebar-fallback-btn";
    fb.setAttribute("aria-label", "Toggle navigation");
    fb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2 4h20v2H2zM2 11h20v2H2zM2 18h20v2H2z"/></svg>';
    fb.style.display = "block";
    document.body.appendChild(fb);
    // Find the sidebar
    var sidebar = document.querySelector(".sidebar.border-r");
    if (!sidebar) return;
    var open = false;
    fb.addEventListener("click", function(){
      open = !open;
      sidebar.style.transform = open ? "translateX(0)" : "";
      sidebar.style.zIndex = open ? "9998" : "";
      sidebar.style.display = open ? "flex" : "";
    });
    // Close sidebar when clicking outside
    document.addEventListener("click", function(e){
      if (open && !sidebar.contains(e.target) && e.target !== fb && !fb.contains(e.target)) {
        open = false;
        sidebar.style.transform = "";
        sidebar.style.zIndex = "";
      }
    });
  }, 2000); // Wait 2s for Vue to mount before activating fallback
})();
</script>'''

SUGGEST_WIDGET = r'''<!-- suggest-edit-widget -->
<style>
#se-fab{position:fixed;bottom:24px;right:24px;z-index:99990;width:52px;height:52px;border-radius:50%;background:#3b82f6;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s}
#se-fab:hover{background:#2563eb;transform:scale(1.08)}
#se-fab svg{width:24px;height:24px;fill:#fff}
#se-fab.has-sel{background:#22c55e}
#se-fab.has-sel:hover{background:#16a34a}
#se-fab.has-sel::after{content:"";position:absolute;top:0;right:0;width:14px;height:14px;border-radius:50%;background:#facc15;border:2px solid #1a1a2e}
#se-hint{position:fixed;bottom:84px;right:16px;z-index:99990;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:10px;padding:10px 14px;font-size:13px;line-height:1.4;max-width:220px;box-shadow:0 4px 16px rgba(0,0,0,.5);opacity:0;transform:translateY(8px);transition:opacity .4s,transform .4s;pointer-events:none}
#se-hint.show{opacity:1;transform:translateY(0);pointer-events:auto}
#se-hint::after{content:"";position:absolute;bottom:-7px;right:28px;width:14px;height:14px;background:#1e293b;border-right:1px solid #334155;border-bottom:1px solid #334155;transform:rotate(45deg)}
#se-hint-x{position:absolute;top:4px;right:8px;background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:2px}
#se-overlay{display:none;position:fixed;inset:0;z-index:99991;background:rgba(0,0,0,.6)}
#se-modal{position:fixed;top:0;right:-440px;z-index:99992;width:420px;max-width:100vw;height:100vh;background:#1a1a2e;border-left:1px solid #333;display:flex;flex-direction:column;overflow:hidden;transition:right .3s ease}
#se-modal.open{right:0}
#se-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #333}
#se-hdr h3{margin:0;font-size:16px;color:#f3f4f6;font-weight:600}
#se-tip{font-size:11px;color:#64748b;padding:0 20px;padding-top:10px;line-height:1.4}
#se-x{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:22px;padding:4px 8px;border-radius:4px}
#se-x:hover{color:#fff;background:rgba(255,255,255,.1)}
#se-body{flex:1;overflow-y:auto;padding:12px 20px 20px;display:flex;flex-direction:column;gap:14px}
#se-ctx{background:#111827;border:1px solid #374151;border-radius:8px;padding:10px 14px;font-size:13px;color:#9ca3af}
#se-ctx b{color:#e5e7eb}
#se-sel-preview{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;font-size:12px;color:#94a3b8;font-style:italic;max-height:80px;overflow-y:auto;white-space:pre-wrap;word-break:break-word}
#se-sel-preview::before{content:"Selected text:";display:block;font-style:normal;font-weight:600;color:#e5e7eb;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.se-f label{display:block;font-weight:600;margin-bottom:5px;font-size:13px;color:#e5e7eb}
.se-f label .r{color:#f87171}
.se-f label .o{color:#6b7280;font-weight:400}
.se-f select,.se-f input,.se-f textarea{width:100%;padding:8px 10px;border-radius:8px;border:1px solid #374151;background:#111827;color:#f3f4f6;font-size:13px;box-sizing:border-box;font-family:inherit}
.se-f select:focus,.se-f input:focus,.se-f textarea:focus{outline:none;border-color:#3b82f6}
.se-f textarea{resize:vertical;min-height:100px}
.se-f .h{font-size:11px;color:#6b7280;margin-top:3px}
#se-btn{padding:10px 20px;border-radius:8px;border:none;background:#3b82f6;color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-self:flex-start;margin-top:4px}
#se-btn:hover{background:#2563eb}
#se-btn:disabled{opacity:.6;cursor:not-allowed}
#se-st{display:none;padding:10px 12px;border-radius:8px;font-size:13px}
@media(max-width:480px){#se-modal{width:100vw}}
</style>
<button id="se-fab" aria-label="Suggest an edit" title="Suggest an edit"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fff"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
<div id="se-hint"><button id="se-hint-x">&times;</button>See something wrong? Select text and tap here to suggest an edit.</div>
<div id="se-overlay"></div>
<div id="se-modal">
<div id="se-hdr"><h3>Suggest an Edit</h3><button id="se-x">&times;</button></div>
<div id="se-tip">* Select text on the page before opening this panel to auto-fill your edit</div>
<div id="se-body">
<div id="se-ctx"></div>
<div id="se-sel-preview" style="display:none"></div>
<div class="se-f"><label>Section <span class="r">*</span></label><select id="se-sec"><option value="" disabled>-- choose --</option><option>Getting Started</option><option>Command Reference</option><option>Concepts</option><option>How-To Guides</option><option>Tutorials</option><option>Developers</option><option>For Agents</option><option>Research</option><option>Troubleshooting</option><option>FAQ</option><option>Other / New Section</option></select></div>
<div class="se-f" id="se-hw" style="display:none"><label>Specific heading <span class="o">(optional)</span></label><select id="se-head"><option value="">-- entire page --</option></select></div>
<div class="se-f"><label>What needs changing? <span class="r">*</span></label><input id="se-title" type="text" maxlength="200" placeholder="e.g. Parameters table is missing the amount field"/></div>
<div class="se-f"><label>Your suggestion <span class="r">*</span></label><textarea id="se-content" maxlength="10000" rows="5" placeholder="Describe what should be added, corrected, or improved..."></textarea><div class="h"><span id="se-ch">0</span> / 10,000</div></div>
<div class="se-f"><label>Name or handle <span class="o">(optional)</span></label><input id="se-sub" type="text" maxlength="100" placeholder="e.g. Discord: alice#1234"/></div>
<div id="se-st"></div>
<button id="se-btn">Submit Suggestion</button>
</div>
</div>
<script>
(function(){
if(location.pathname.indexOf("/contribute/suggest-edit")!==-1){var f=document.getElementById("se-fab");if(f)f.style.display="none";return}
var PM={"getting-started":"Getting Started","command-reference":"Command Reference",concepts:"Concepts","how-to":"How-To Guides",tutorials:"Tutorials",developers:"Developers","for-agents":"For Agents",research:"Research",troubleshooting:"Troubleshooting",faq:"FAQ"};
var fab=document.getElementById("se-fab"),ov=document.getElementById("se-overlay"),modal=document.getElementById("se-modal"),sec=document.getElementById("se-sec"),hw=document.getElementById("se-hw"),head=document.getElementById("se-head"),ctx=document.getElementById("se-ctx"),selPrev=document.getElementById("se-sel-preview"),tipDiv=document.getElementById("se-tip"),ti=document.getElementById("se-title"),co=document.getElementById("se-content"),ch=document.getElementById("se-ch"),btn=document.getElementById("se-btn"),st=document.getElementById("se-st");

// First-visit hint bubble — show once, remember in localStorage
var hint=document.getElementById("se-hint");
try{
if(!localStorage.getItem("se-hint-seen")){
setTimeout(function(){hint.classList.add("show")},3000);
setTimeout(function(){hint.classList.remove("show");localStorage.setItem("se-hint-seen","1")},12000);
document.getElementById("se-hint-x").addEventListener("click",function(){hint.classList.remove("show");localStorage.setItem("se-hint-seen","1")});
}
}catch(e){}

// Track text selection — turn FAB green with badge when text is selected
var pendingText="";
document.addEventListener("selectionchange",function(){
if(modal.classList.contains("open"))return;
var s=window.getSelection(),t=s?s.toString().trim():"";
pendingText=t;
fab.classList.toggle("has-sel",t.length>0);
fab.title=t.length>0?"Suggest edit for selected text":"Suggest an edit";
});
// Capture selection on mousedown/touchstart BEFORE the click clears it
fab.addEventListener("mousedown",function(){var s=window.getSelection();if(s)pendingText=s.toString().trim()});
fab.addEventListener("touchstart",function(){var s=window.getSelection();if(s)pendingText=s.toString().trim()},{passive:true});

function findCurrentHeading(hs){
var best="",vp=window.innerHeight||document.documentElement.clientHeight;
for(var k=0;k<hs.length;k++){
var top=hs[k].getBoundingClientRect().top;
if(top<vp*0.3)best=hs[k].textContent.trim();
}
return best;
}

function openM(){
hint.classList.remove("show");try{localStorage.setItem("se-hint-seen","1")}catch(e){}

// Use text captured on mousedown/touchstart (before click cleared it)
var selectedText=pendingText;pendingText="";
fab.classList.remove("has-sel");

var p=location.pathname.replace(/^\/|\/$/g,"").split("/"),slug=p[0]||"",s=PM[slug]||"";
var h1=document.querySelector("h1"),pt=h1?h1.textContent.trim():document.title.replace(/ - .*/,"").trim();
ctx.textContent="";if(s){var b=document.createElement("b");b.textContent=s;ctx.appendChild(b);if(pt)ctx.appendChild(document.createTextNode(" \u2192 "+pt))}else if(pt){var b2=document.createElement("b");b2.textContent=pt;ctx.appendChild(b2)}else ctx.style.display="none";
if(s){for(var i=0;i<sec.options.length;i++){if(sec.options[i].text===s){sec.selectedIndex=i;break}}}else sec.selectedIndex=0;

var hs=document.querySelectorAll("article h2,article h3,.content h2,.content h3,main h2,main h3");
head.innerHTML='<option value="">-- entire page --</option>';
if(hs.length>0){for(var j=0;j<hs.length;j++){var o=document.createElement("option");o.textContent=(hs[j].tagName==="H3"?"  - ":"")+hs[j].textContent.trim();o.value=hs[j].textContent.trim();head.appendChild(o)}hw.style.display=""}else hw.style.display="none";

var curHead=findCurrentHeading(hs);
if(curHead){for(var m=0;m<head.options.length;m++){if(head.options[m].value===curHead){head.selectedIndex=m;break}}}

if(selectedText){
selPrev.textContent=selectedText.length>300?selectedText.substring(0,300)+"...":selectedText;
selPrev.style.display="block";
co.value="Selected text:\n> "+selectedText.replace(/\n/g,"\n> ")+"\n\nSuggested change:\n";
ch.textContent=co.value.length;
ti.value="Edit: "+(curHead||pt);
tipDiv.style.display="none";
setTimeout(function(){co.focus();co.setSelectionRange(co.value.length,co.value.length)},100);
}else{
selPrev.style.display="none";
co.value="";ch.textContent="0";
ti.value=pt?"Edit: "+pt:"";
tipDiv.style.display="";
}

ov.style.display="block";modal.classList.add("open");document.body.style.overflow="hidden";
var gtw=document.getElementById("gt-wrap");if(gtw)gtw.style.display="none";
btn.disabled=false;btn.textContent="Submit Suggestion";st.style.display="none";
}
function closeM(){ov.style.display="none";modal.classList.remove("open");document.body.style.overflow="";
var gtw=document.getElementById("gt-wrap");if(gtw)gtw.style.display=""}
fab.addEventListener("click",openM);ov.addEventListener("click",closeM);
document.getElementById("se-x").addEventListener("click",closeM);
co.addEventListener("input",function(){ch.textContent=co.value.length});
btn.addEventListener("click",function(){
var sv=sec.value,hv=head.value,tv=ti.value.trim(),cv=co.value.trim(),su=document.getElementById("se-sub").value.trim();
if(!sv||!tv||!cv){st.style.display="block";st.style.background="#1c0a0a";st.style.color="#fca5a5";st.style.border="1px solid #7f1d1d";st.textContent="Please fill in all required fields.";return}
var fc=cv;if(hv)fc="[Section: "+hv+"]\n\n"+cv;fc+="\n\n---\nPage: "+location.href;
btn.disabled=true;btn.textContent="Submitting...";st.style.display="none";
fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({section:sv,title:tv,content:fc,submitter:su})})
.then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d}})})
.then(function(r){if(r.ok){st.style.background="#052e16";st.style.color="#86efac";st.style.border="1px solid #166534";st.textContent="Thank you! Your suggestion has been received.";co.value="";ch.textContent="0";btn.textContent="Submitted";selPrev.style.display="none"}else throw new Error(r.data.error||"Failed")})
.catch(function(e){st.style.background="#1c0a0a";st.style.color="#fca5a5";st.style.border="1px solid #7f1d1d";st.textContent="Error: "+e.message;btn.disabled=false;btn.textContent="Submit Suggestion"})
.finally(function(){st.style.display="block"})
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&modal.classList.contains("open"))closeM()});
})();
</script>
<!-- /suggest-edit-widget -->'''

count = 0
for f in glob.glob(".retype/**/*.html", recursive=True):
    with open(f, "r") as fh:
        html = fh.read()
    if "gt-wrap" in html:
        continue
    html = html.replace("</body>", SIDEBAR_FALLBACK + "\n" + INJECT + "\n" + SUGGEST_WIDGET + "\n</body>")
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
