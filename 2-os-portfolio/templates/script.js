// Real-time Clock Framework
function updateSystemClock() {
  const d = new Date();
  document.getElementById('clock').textContent = d.toLocaleDateString('en-US', {
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  }) + '   ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit', 
    minute: '2-digit'
  });
}
updateSystemClock(); 
setInterval(updateSystemClock, 30000);

let zTopIndex = 100;
let trashedApps = [];

// Window Operations Engine
function closeWin(id) { 
  document.getElementById(id).classList.add('hidden'); 
}

function openWin(id) {
  const win = document.getElementById(id);
  if (!win || win.classList.contains('trashed')) return;
  win.classList.remove('hidden');
  focusWindow(win);
}

function focusWindow(win) { 
  zTopIndex++; 
  win.style.zIndex = zTopIndex; 
}

// Global Shortcuts Linkage
document.querySelectorAll('[data-win]').forEach(el => {
  el.addEventListener('click', () => openWin(el.getAttribute('data-win')));
});

// Trash System Sub-Routines
function sendToTrash(winId) {
  const win = document.getElementById(winId);
  if (!win || winId === 'win-trash' || trashedApps.includes(winId)) return;
  
  win.classList.add('trashed');
  trashedApps.push(winId);
  updateTrashUI();
}

function restoreFromTrash(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  win.classList.remove('trashed');
  win.classList.remove('hidden');
  trashedApps = trashedApps.filter(id => id !== winId);
  updateTrashUI();
  focusWindow(win);
}

function updateTrashUI() {
  const list = document.getElementById('trash-list');
  const msg = document.getElementById('trash-empty-msg');
  const desktopTrashIcon = document.getElementById('trash-icon-emoji');
  const dockTrashIcon = document.getElementById('dock-trash');
  
  list.innerHTML = '';
  if (trashedApps.length === 0) {
    msg.style.display = 'block';
    desktopTrashIcon.textContent = '🗑️';
    dockTrashIcon.textContent = '🗑️';
  } else {
    msg.style.display = 'none';
    desktopTrashIcon.textContent = '🗑️';
    trashedApps.forEach(id => {
      const titleText = document.getElementById(id).querySelector('.title').textContent || id;
      const row = document.createElement('div');
      row.className = 'trash-item-row';
      row.innerHTML = `<span>${titleText}</span><button class="restore-btn" onclick="restoreFromTrash('${id}')">Restore</button>`;
      list.appendChild(row);
    });
  }
}

// Window Controller & Drag Drop Engineering Matrix
document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.titlebar');
  win.addEventListener('mousedown', () => focusWindow(win));
  
  // Double click window header to quick-trash
  bar.addEventListener('dblclick', () => {
    if (win.id !== 'win-trash') sendToTrash(win.id);
  });

  let offsetX = 0, offsetY = 0, isDragging = false;
  
  bar.addEventListener('mousedown', e => {
    isDragging = true;
    focusWindow(win);
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
  
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = Math.max(36, e.clientY - offsetY); // Stay underneath system status bar
    win.style.left = x + 'px';
    win.style.top = y + 'px';

    const targets = [document.getElementById('desktop-trash'), document.getElementById('dock-trash')];
    targets.forEach(t => {
      const rect = t.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        t.classList.add('drag-hover');
      } else {
        t.classList.remove('drag-hover');
      }
    });
  });
  
  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    
    const targets = [document.getElementById('desktop-trash'), document.getElementById('dock-trash')];
    let droppedInTrash = false;

    targets.forEach(t => {
      const rect = t.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        droppedInTrash = true;
      }
      t.classList.remove('drag-hover');
    });

    if (droppedInTrash && win.id !== 'win-trash') {
      sendToTrash(win.id);
    }
  });
});