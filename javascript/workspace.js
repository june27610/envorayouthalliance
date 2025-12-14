// Sidebar toggle
document.addEventListener('DOMContentLoaded', function(){
  const btn = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  if(btn && sidebar){
    // Toggle the mobile sidebar; on large screens sidebar is always visible.
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const opened = sidebar.classList.toggle('open');
      btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
      btn.innerHTML = opened ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });

    // Click outside closes the sidebar when open (mobile)
    document.addEventListener('click', (e)=>{
      if(!sidebar.classList.contains('open')) return;
      if(sidebar.contains(e.target) || btn.contains(e.target)) return;
      sidebar.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      btn.innerHTML = '<i class="bi bi-list"></i>';
    });

    // Escape key closes mobile sidebar
    document.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape' && sidebar.classList.contains('open')){ sidebar.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<i class="bi bi-list"></i>'; } });

    // Backdrop element click - closes sidebar
    const backdropEl = document.getElementById('sidebarBackdrop');
    if(backdropEl){ backdropEl.addEventListener('click', ()=>{ sidebar.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<i class="bi bi-list"></i>'; }); }

    // Close button inside sidebar
    const closeBtn = document.getElementById('closeSidebar');
    if(closeBtn){ closeBtn.addEventListener('click', ()=>{ sidebar.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<i class="bi bi-list"></i>'; }); }

    // Ensure consistent state on resize
    window.addEventListener('resize', ()=>{ if(window.innerWidth > 991 && sidebar.classList.contains('open')){ sidebar.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<i class="bi bi-list"></i>'; } });
  }

  // Set year in footer
  const y = new Date().getFullYear();
  const el = document.getElementById('dashYear'); if(el) el.textContent = y;

  // Chart management: dynamic datasets and timeframe filters
  function generateData(metric, length){
    // Simple deterministic-ish generator for demo purposes
    const seed = metric === 'waste' ? 2 : (metric === 'volunteers' ? 1.2 : 1);
    return Array.from({length}, (_,i)=>{
      const base = Math.sin(i/6)*10 + (i*0.6);
      const jitter = Math.round(Math.abs((Math.cos(i/3)*8 + Math.random()*8)));
      let value = Math.max(0, Math.round((base + jitter) * seed));
      if(metric === 'waste') value = +(value/10).toFixed(1); // tonnes-ish
      return value;
    });
  }

  let lineChart = null;
  function initLineChart(labels, data, metric){
    const ctx = document.getElementById('lineChart');
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent-green') || '#38ae60';
    const config = {
      type: 'line',
      data: {labels, datasets:[{label: metric, data, borderColor: color, backgroundColor: 'rgba(56,174,96,0.12)', tension:0.3, fill:true}]},
      options: {responsive:true, plugins:{legend:{display:false}}, scales:{x:{display:false}}}
    };
    if(lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, config);
  }

  function updateChartFromControls(){
    const tf = parseInt(document.getElementById('timeframeSelect').value,10);
    const metric = document.getElementById('metricSelect').value;
    const labels = Array.from({length:tf}, (_,i)=>`Day ${i+1}`);
    const data = generateData(metric, tf);
    const titleMap = {participants: 'Participants', volunteers: 'Volunteers', waste: 'Waste Diverted'};
    const titleEl = document.getElementById('chartTitle');
    if(titleEl) titleEl.textContent = `${titleMap[metric]} (${tf} days)`;
    initLineChart(labels, data, titleMap[metric]);
  }

  // Initialize with defaults
  try{
    if(document.getElementById('lineChart')){
      updateChartFromControls();
    }
  }catch(e){console.warn('Chart init failed',e)}

  // Wire controls
  const tfSelect = document.getElementById('timeframeSelect');
  const metricSelect = document.getElementById('metricSelect');
  if(tfSelect) tfSelect.addEventListener('change', updateChartFromControls);
  if(metricSelect) metricSelect.addEventListener('change', updateChartFromControls);

  // No secondary bar chart in light theme; keep main chart only.

  // Workspace canvas: add blocks, drag, and save/load to localStorage
  const canvas = document.getElementById('workspaceCanvas');
  const addTextBtn = document.getElementById('addTextBlock');
  const addStickyBtn = document.getElementById('addStickyBlock');
  const addImageBtn = document.getElementById('addImageBlock');
  const clearCanvasBtn = document.getElementById('clearCanvas');

  function loadCanvas() {
    try{
      const raw = localStorage.getItem('workspaceCanvas');
      if(!raw) return [];
      return JSON.parse(raw);
    }catch(e){return []}
  }
  function saveCanvas(items){ localStorage.setItem('workspaceCanvas', JSON.stringify(items)); }

  function renderCanvas(){
    if(!canvas) return;
    canvas.innerHTML = '';
    const items = loadCanvas();
    if(items.length === 0){
      const ph = document.createElement('div');
      ph.className = 'canvas-empty';
      ph.style.padding = '16px';
      ph.style.color = 'rgba(0,0,0,0.45)';
      ph.textContent = 'Your workspace is empty — add text, sticky notes, or images using the toolbar above.';
      canvas.appendChild(ph);
      return;
    }
    items.forEach((it, idx)=>{
      const el = document.createElement('div');
      el.className = 'canvas-block ' + (it.type==='sticky' ? 'canvas-sticky' : it.type==='image' ? 'canvas-image' : '');
      el.dataset.idx = idx;
      el.style.left = (it.x || 20) + 'px';
      el.style.top = (it.y || 20) + 'px';
      el.style.zIndex = 10 + (it.z || 0);
      el.innerHTML = `<div class=\"block-handle\"><span>${it.type.toUpperCase()}</span><button class=\"btn btn-sm btn-outline remove-block\">✕</button></div><div class=\"block-content\" contenteditable=\"true\">${it.content || ''}</div>`;
      if(it.type === 'image' && it.src){ const img = document.createElement('img'); img.src = it.src; el.querySelector('.block-content').innerHTML = ''; el.querySelector('.block-content').appendChild(img); }

      // remove handler
      el.querySelector('.remove-block').addEventListener('click', ()=>{
        const arr = loadCanvas(); arr.splice(idx,1); saveCanvas(arr); renderCanvas();
      });

      // content changes must be saved
      const contentEl = el.querySelector('.block-content');
      contentEl.addEventListener('input', ()=>{
        const arr = loadCanvas(); arr[idx].content = contentEl.innerHTML; saveCanvas(arr);
      });

      // drag using pointer events
      let startX=0, startY=0, origX=0, origY=0, dragging=false;
      const handle = el.querySelector('.block-handle');
      handle.style.cursor = 'grab';
      handle.addEventListener('pointerdown', (ev)=>{
        ev.preventDefault(); handle.setPointerCapture(ev.pointerId);
        dragging = true; el.classList.add('dragging'); startX = ev.clientX; startY = ev.clientY; origX = parseInt(el.style.left||0); origY = parseInt(el.style.top||0);
      });
      document.addEventListener('pointermove', (ev)=>{
        if(!dragging) return; const dx = ev.clientX-startX; const dy = ev.clientY-startY; el.style.left = (origX+dx) + 'px'; el.style.top = (origY+dy) + 'px';
      });
      document.addEventListener('pointerup', (ev)=>{
        if(!dragging) return; dragging=false; el.classList.remove('dragging');
        const arr = loadCanvas(); arr[idx].x = parseInt(el.style.left||0); arr[idx].y = parseInt(el.style.top||0); saveCanvas(arr);
      });

      canvas.appendChild(el);
    });
  }

  function addBlock(type, opts={}){
    const items = loadCanvas();
    const newItem = {type, content: opts.content|| (type==='sticky' ? 'Sticky note' : 'New text'), x: opts.x||30, y: opts.y||30, z: items.length};
    if(type==='image') newItem.src = opts.src|| 'https://via.placeholder.com/220x140';
    items.push(newItem); saveCanvas(items); renderCanvas();
  }

  if(addTextBtn) addTextBtn.addEventListener('click', ()=> addBlock('text'));
  if(addStickyBtn) addStickyBtn.addEventListener('click', ()=> addBlock('sticky'));
  if(addImageBtn) addImageBtn.addEventListener('click', ()=>{
    const url = prompt('Image URL (or leave blank for placeholder)'); addBlock('image', {src: url});
  });
  if(clearCanvasBtn) clearCanvasBtn.addEventListener('click', ()=>{ if(confirm('Clear all blocks?')){ saveCanvas([]); renderCanvas(); } });
  // render existing canvas
  renderCanvas();

  // --- To-Do List logic ---
  (function(){
    const KEY = 'envoraTodos';
    const input = document.getElementById('todoInput');
    const addBtn = document.getElementById('addTodoBtn');
    const listEl = document.getElementById('todoList');
    const countEl = document.getElementById('todoCount');
    const clearBtn = document.getElementById('clearCompleted');

    function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){return[]} }
    function save(items){ localStorage.setItem(KEY, JSON.stringify(items)); }

    function render(){
      const items = load();
      listEl.innerHTML = '';
      items.forEach((t, i)=>{
        const li = document.createElement('li'); li.className = 'todo-item' + (t.done ? ' completed' : ''); li.dataset.id = t.id; li.setAttribute('role','listitem');
        li.innerHTML = `<input type="checkbox" class="todo-check" ${t.done? 'checked' : ''} aria-label="Mark task complete"><div class="todo-text" contenteditable="true">${t.text}</div><div class="todo-actions"><button class="btn btn-sm btn-outline-secondary todo-delete" title="Delete">🗑</button></div>`;
        // checkbox
        li.querySelector('.todo-check').addEventListener('change', (e)=>{
          const items = load(); items[i].done = e.target.checked; save(items); render();
        });
        // delete
        li.querySelector('.todo-delete').addEventListener('click', ()=>{ const items = load(); items.splice(i,1); save(items); render(); });
        // edit content save on blur
        const textEl = li.querySelector('.todo-text');
        textEl.addEventListener('blur', ()=>{ const items = load(); items[i].text = textEl.textContent.trim(); save(items); render(); });
        // Enter in edit to blur (save)
        textEl.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter'){ ev.preventDefault(); textEl.blur(); } });
        listEl.appendChild(li);
      });
      countEl.textContent = items.length + (items.length===1 ? ' item' : ' items');
    }

    function add(text){
      if(!text || !text.trim()) return;
      const items = load();
      items.push({id: Date.now(), text: text.trim(), done: false}); save(items); render();
    }

    addBtn && addBtn.addEventListener('click', ()=>{ add(input.value); input.value=''; input.focus(); });
    input && input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ add(input.value); input.value=''; } });
    clearBtn && clearBtn.addEventListener('click', ()=>{ const items = load().filter(t=>!t.done); save(items); render(); });

    // initial render
    if(listEl) render();
  })();

  // Challenges: toggle active/completed state and persist
  const challengeCards = document.querySelectorAll('.challenge-card');
  function loadChallenges(){ try{ return JSON.parse(localStorage.getItem('challengesState')||'{}'); }catch(e){return{}} }
  function saveChallenges(state){ localStorage.setItem('challengesState', JSON.stringify(state)); }
  const state = loadChallenges();
  challengeCards.forEach(card=>{
    const id = card.dataset.id;
    if(state[id] && state[id].active) card.classList.add('active');
    if(state[id] && state[id].completed) card.querySelector('.check-circle').textContent = '✓';
    card.addEventListener('click', ()=>{
      card.classList.toggle('active');
      const nowActive = card.classList.contains('active');
      // toggle completed when active clicked
      const completed = nowActive ? true : false;
      const cc = card.querySelector('.check-circle');
      cc.textContent = completed ? '✓' : '';
      state[id] = {active: nowActive, completed};
      saveChallenges(state);
      updateGamificationDisplay(); // Update display when challenge completed
    });
  });

  // Load and display gamification data
  function updateGamificationDisplay() {
    try {
      const data = JSON.parse(localStorage.getItem('envoraGamification') || '{"coins":0,"badges":[],"completedQuizzes":[],"completedChallenges":[]}');
      
      // Update coins
      const coinsEl = document.getElementById('totalCoins');
      if(coinsEl) coinsEl.textContent = (data.coins || 0).toLocaleString();
      
      // Update badges count
      const badgesEl = document.getElementById('totalBadges');
      if(badgesEl) badgesEl.textContent = (data.badges || []).length;
      
      // Calculate progress (quizzes + challenges completed)
      const totalQuizzes = 9; // b1-b3, i1-i3, a1-a3
      const totalChallenges = 6; // 3day, 7day, 10day, trash, recycling, creativity
      const completedQuizzes = (data.completedQuizzes || []).length;
      const completedChallenges = (data.completedChallenges || []).length;
      const totalCompleted = completedQuizzes + completedChallenges;
      const totalPossible = totalQuizzes + totalChallenges;
      const progress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      
      const progressEl = document.getElementById('progressPercent');
      if(progressEl) progressEl.textContent = progress + '%';
      
      // Update challenge cards to show completed state
      challengeCards.forEach(card => {
        const id = card.dataset.id;
        const challengeMap = {
          'tb-1': '3days',
          'tb-2': 'weekly',
          'tb-3': '10days',
          'q-1': 'trash',
          'q-2': 'recycling',
          'q-3': 'creativity'
        };
        const challengeId = challengeMap[id];
        if(challengeId && (data.completedChallenges || []).includes(challengeId)) {
          card.classList.add('active');
          const cc = card.querySelector('.check-circle');
          if(cc) cc.textContent = '✓';
        }
      });
    } catch(e) {
      console.warn('Error loading gamification data:', e);
    }
  }
  
  // Initial load
  updateGamificationDisplay();

});
