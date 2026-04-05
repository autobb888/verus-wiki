#!/usr/bin/env python3
"""
1. Move the EN dropdown from right side of header to left side (next to hamburger)
2. Inject a bulletproof sidebar fallback for browsers where Vue fails
"""
import glob, re

FALLBACK = '''<!-- sidebar-fb -->
<style>
#sb-fb-btn{display:none;position:fixed;top:20px;left:12px;z-index:10000;background:none;border:none;cursor:pointer;padding:8px;border-radius:50%;color:#d1d5db;-webkit-tap-highlight-color:transparent}
#sb-fb-btn:active{background:rgba(128,128,128,0.2)}
#sb-fb-btn svg{width:22px;height:22px;fill:currentColor;pointer-events:none}
#sb-fb-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9997}
@media(min-width:960px){#sb-fb-btn{display:none!important}#sb-fb-overlay{display:none!important}}
</style>
<script>
(function(){
  function init(){
    var vt = document.getElementById("retype-sidebar-left-toggle-button");
    if (vt && vt.children.length > 0) return;
    var btn = document.createElement("button");
    btn.id = "sb-fb-btn";
    btn.setAttribute("aria-label","Menu");
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>';
    btn.style.display = "block";
    var ov = document.createElement("div");
    ov.id = "sb-fb-overlay";
    document.body.appendChild(btn);
    document.body.appendChild(ov);
    var sb = document.querySelector("div.sidebar.border-r")
          || document.querySelector(".sidebar:not(.sidebar-right)");
    if (!sb) return;
    sb.style.transform = "translateX(-100%)";
    sb.style.transition = "transform 0.3s ease";
    sb.style.zIndex = "9998";
    var open = false;
    function toggle(){
      open = !open;
      sb.style.transform = open ? "translateX(0)" : "translateX(-100%)";
      ov.style.display = open ? "block" : "none";
    }
    btn.addEventListener("click", toggle);
    ov.addEventListener("click", toggle);
  }
  if (document.readyState === "complete") {
    setTimeout(init, 2500);
  } else {
    window.addEventListener("load", function(){ setTimeout(init, 2500); });
  }
})();
</script>'''

count = 0
for f in glob.glob(".retype/**/*.html", recursive=True):
    with open(f, "r") as fh:
        html = fh.read()

    # --- 1. Move EN dropdown from right to left ---
    # Fix desktop position
    html = html.replace(
        'position:fixed;top:23px;right:315px;',
        'position:fixed;top:23px;left:60px;'
    )
    # Fix mobile position
    html = html.replace(
        '@media(max-width:1024px){#gt-wrap{top:14px;right:55px}',
        '@media(max-width:960px){#gt-wrap{top:18px;left:55px}'
    )

    # --- 2. Remove ALL previous sidebar fallback versions ---
    html = re.sub(r'<!-- sidebar-fb -->.*?</script>\s*', '', html, flags=re.DOTALL)
    html = re.sub(r'<!-- sidebar-fallback-vue -->.*?</script>\s*', '', html, flags=re.DOTALL)
    html = re.sub(r'<style>[^<]*#sidebar-fallback-btn[^<]*</style>\s*', '', html)
    html = re.sub(r'<script>[^<]*sidebar-fallback-btn[^<]*</script>\s*', '', html)

    # --- 3. Inject clean sidebar fallback ---
    html = html.replace("</body>", FALLBACK + "\n</body>")

    with open(f, "w") as fh:
        fh.write(html)
    count += 1

print(f"Updated {count} files")
