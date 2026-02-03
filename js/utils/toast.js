window.showToast = function(msg, type = 'success', duration = 3000) {
  let t = document.createElement('div');
  t.className = 'toast ' + type;
  t.setAttribute('role', 'alert');
  t.setAttribute('aria-live', 'assertive');
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('visible'), 50);
  setTimeout(() => t.classList.remove('visible'), duration - 400);
  setTimeout(() => t.remove(), duration);
};

window.showConfirm = function({message, onConfirm, onCancel}) {
  let overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  let modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn" id="confirmBtn">Confirm</button>
        <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function cleanup() { overlay.remove(); }

  document.getElementById('confirmBtn').onclick = () => { cleanup(); onConfirm && onConfirm(); };
  document.getElementById('cancelBtn').onclick = () => { cleanup(); onCancel && onCancel(); };

  overlay.focus();
};