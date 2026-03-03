---
label: Suggest an Edit
icon: pencil
order: -1
---

# Suggest an Edit or Addition

See something missing or outdated? Submit your suggestion below and it will be reviewed by the wiki maintainers each week.

All fields are anonymous by default — the name/handle field is optional.

---

<div id="wiki-suggest-form">

<form id="suggest-form" data-turbo="false" style="display:flex;flex-direction:column;gap:1.25rem;max-width:680px;">

  <div>
    <label for="section" style="display:block;font-weight:600;margin-bottom:.4rem;">Section <span style="color:#f87171">*</span></label>
    <select id="section" name="section" required
      style="width:100%;padding:.6rem .75rem;border-radius:.5rem;border:1px solid #374151;background:#111827;color:#f3f4f6;font-size:.95rem;box-sizing:border-box;cursor:pointer;">
      <option value="" disabled selected>— choose a section —</option>
      <option>Getting Started</option>
      <option>Command Reference</option>
      <option>Concepts</option>
      <option>How-To Guides</option>
      <option>Tutorials</option>
      <option>Developers</option>
      <option>For Agents</option>
      <option>Research</option>
      <option>Troubleshooting</option>
      <option>FAQ</option>
      <option>Other / New Section</option>
    </select>
  </div>

  <div>
    <label for="title" style="display:block;font-weight:600;margin-bottom:.4rem;">Page title or topic <span style="color:#f87171">*</span></label>
    <input id="title" name="title" type="text" required
      placeholder="e.g. How to use getidentity with multiple outputs"
      maxlength="200"
      style="width:100%;padding:.6rem .75rem;border-radius:.5rem;border:1px solid #374151;background:#111827;color:#f3f4f6;font-size:.95rem;box-sizing:border-box;" />
  </div>

  <div>
    <label for="content" style="display:block;font-weight:600;margin-bottom:.4rem;">Your suggestion or content <span style="color:#f87171">*</span></label>
    <p style="margin:0 0 .5rem;font-size:.85rem;color:#9ca3af;">
      Describe what should be added, corrected, or improved. Paste example commands, code snippets, or notes — the more detail the better.
    </p>
    <textarea id="content" name="content" required rows="10"
      placeholder="e.g. The page on basket currencies doesn't explain how reserve ratios work in practice. Here's a concrete example: ..."
      maxlength="10000"
      style="width:100%;padding:.6rem .75rem;border-radius:.5rem;border:1px solid #374151;background:#111827;color:#f3f4f6;font-size:.95rem;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>
    <div id="char-count" style="text-align:right;font-size:.8rem;color:#6b7280;margin-top:.25rem;">0 / 10,000</div>
  </div>

  <div>
    <label for="submitter" style="display:block;font-weight:600;margin-bottom:.4rem;">Your name or handle <span style="color:#6b7280;font-weight:400;">(optional)</span></label>
    <input id="submitter" name="submitter" type="text"
      placeholder="e.g. alice@verus or Discord: alice#1234"
      maxlength="100"
      style="width:100%;padding:.6rem .75rem;border-radius:.5rem;border:1px solid #374151;background:#111827;color:#f3f4f6;font-size:.95rem;box-sizing:border-box;" />
  </div>

  <div id="form-status" style="display:none;padding:.75rem 1rem;border-radius:.5rem;font-size:.9rem;"></div>

  <button type="submit" id="submit-btn"
    style="align-self:flex-start;padding:.65rem 1.5rem;border-radius:.5rem;border:none;background:#3b82f6;color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;">
    Submit Suggestion
  </button>

</form>

</div>

<script>
(function () {
  var API = '/api/submit';

  // Use document-level delegation in capture phase so Vue hydration
  // and Turbo Drive cannot remove or bypass this listener.

  // Char counter — delegated via input event
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'content') {
      var counter = document.getElementById('char-count');
      if (counter) counter.textContent = e.target.value.length + ' / 10,000';
    }
  }, true);

  // Form submit — capture phase beats Turbo's interception
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'suggest-form') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var status = document.getElementById('form-status');
    var btn    = document.getElementById('submit-btn');

    status.style.display = 'none';
    btn.disabled    = true;
    btn.textContent = 'Submitting…';

    var body = {
      section:   document.getElementById('section').value,
      title:     document.getElementById('title').value,
      content:   document.getElementById('content').value,
      submitter: document.getElementById('submitter').value
    };

    fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
    .then(function (res) {
      if (res.ok) {
        status.style.background = '#052e16';
        status.style.color      = '#86efac';
        status.style.border     = '1px solid #166534';
        status.textContent      = 'Thank you! Your suggestion has been received and will be reviewed this week.';
        form.reset();
        document.getElementById('char-count').textContent = '0 / 10,000';
        btn.textContent = 'Submitted';
      } else {
        throw new Error(res.data.error || 'Submission failed.');
      }
    })
    .catch(function (err) {
      status.style.background = '#1c0a0a';
      status.style.color      = '#fca5a5';
      status.style.border     = '1px solid #7f1d1d';
      status.textContent      = 'Error: ' + err.message;
      btn.disabled    = false;
      btn.textContent = 'Submit Suggestion';
    })
    .finally(function () {
      status.style.display = 'block';
    });
  }, true); // true = capture phase, runs before Turbo
})();
</script>
