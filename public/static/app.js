  // ═══════════════════════════════════════════════════════════
  // LIVE DATE — fetched from server on every session start
  // ═══════════════════════════════════════════════════════════
  let TODAY = {
    iso: new Date().toISOString().split('T')[0],
    full: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    day: new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  }

  // ═══════════════════════════════════════════════════════════
  // DAILY AUTO-RESET — wipe goal progress at midnight (IST)
  // Called on: app start (loadState), after fetchTodayDate() confirms server date
  // ═══════════════════════════════════════════════════════════
  function checkAndResetGoalsForNewDay(serverIsoDate) {
    const todayIso = serverIsoDate || TODAY.iso
    if (!todayIso) return
    // If we have no stored date OR stored date is from a previous day — reset
    if (STATE.goalsDate !== todayIso) {
      const wasYesterday = STATE.goalsDate && STATE.goalsDate < todayIso
      STATE.dailyGoals = STATE.dailyGoals.map(g => ({
        ...g, completed: false, count: 0
      }))
      STATE.goalsDate = todayIso
      saveState()
      if (wasYesterday) {
        // Show a cheerful new-day toast (only if it's actually a date rollover, not first launch)
        showToast('🌅 New day, new goals! Daily goals have been reset. Let’s go!', 'success')
        // Refresh view if on daily-goals or dashboard
        if (STATE.activeTool === 'daily-goals') {
          delete STATE.toolCache['daily-goals']
          renderTool('daily-goals', document.getElementById('tool-container'))
        }
        if (STATE.activeTool === 'performance-dashboard') {
          delete STATE.toolCache['performance-dashboard']
          renderTool('performance-dashboard', document.getElementById('tool-container'))
        }
      }
    }
  }

  // Fetch real IST date from server (ensures accuracy regardless of user's local clock/timezone)
  async function fetchTodayDate() {
    try {
      const res = await fetch('/api/today')
      if (res.ok) {
        const d = await res.json()
        TODAY = d
        // Update any live date displays
        document.querySelectorAll('.live-date-display').forEach(el => {
          el.textContent = `${d.day}, ${d.full}`
        })
        // Re-check midnight rollover using the authoritative server date
        checkAndResetGoalsForNewDay(d.iso)
      }
    } catch (e) { /* use fallback */ }
  }

  function todayContext() {
    return ''
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL STATE
  // ═══════════════════════════════════════════════════════════
  const STATE = {
    apiKey: '',
    activeTool: 'performance-dashboard',
    mockTestHistory: [],
    topicPerformanceData: { quant: {}, reasoning: {}, english: {}, ga: {} },
    studyStreak: 0,
    lastStudyDate: null,
    goalsDate: null,         // ISO date string (YYYY-MM-DD) when goals were last active
    dailyGoals: [
      { text: 'Learn 5 new vocabulary words',   tool: 'vocabulary',        completed: false, count: 0, target: 5  },
      { text: 'Solve 10 Quant problems',         tool: 'quant-solver',      completed: false, count: 0, target: 10 },
      { text: 'Practice 10 Reasoning questions', tool: 'reasoning-solver',  completed: false, count: 0, target: 10 },
      { text: 'Read 2 Current Affairs topics',   tool: 'current-affairs',   completed: false, count: 0, target: 2  },
      { text: 'Complete 1 Full Mock Test',       tool: 'ai-mock-test',      completed: false, count: 0, target: 1  },
      { text: 'Review formulas for 15 mins',     tool: 'formula-bank',      completed: false, count: 0, target: 3  },
      { text: 'Analyse 5 PYQ questions',         tool: 'pyq-analyser',      completed: false, count: 0, target: 5  },
      { text: 'Log any mistakes in Error Log',   tool: 'error-log',         completed: false, count: 0, target: 1  },
    ],
    historyLog: [],
    bookmarks: [],
    aiTutorHistory: [],
    studyBuddyHistory: [],
    debateHistory: [],
    interviewHistory: [],
    toolCache: {},
    errorLog: [],
  }

  const TOOLS = {
    'performance-dashboard':   { name: 'Performance Dashboard', icon: 'fa-chart-line', desc: 'Track your progress and scores', cat: 'Dashboard' },
    'daily-goals':             { name: 'Daily Goals', icon: 'fa-bullseye', desc: 'Your daily practice checklist', cat: 'Dashboard' },
    'ai-mock-test':            { name: 'AI Mock Test', icon: 'fa-file-alt', desc: 'Full-length timed mock test', cat: 'Dashboard' },
    'question-generator':      { name: 'Question Generator', icon: 'fa-question-circle', desc: 'Generate targeted MCQs', cat: 'Dashboard' },
    'interactive-smart-revision': { name: 'Smart Revision', icon: 'fa-brain', desc: 'AI-curated revision plan', cat: 'Dashboard' },
    'quant-solver':            { name: 'Quant Solver', icon: 'fa-calculator', desc: 'Solve quantitative problems', cat: 'Practice' },
    'reasoning-solver':        { name: 'Reasoning Solver', icon: 'fa-puzzle-piece', desc: 'Practice reasoning problems', cat: 'Practice' },
    'para-jumble-solver':      { name: 'Para Jumble', icon: 'fa-random', desc: 'Practice para-jumble exercises', cat: 'Practice' },
    'vocabulary':              { name: 'Vocabulary Builder', icon: 'fa-book', desc: 'Expand your word power', cat: 'Practice' },
    'writing-assistant':       { name: 'Writing Assistant', icon: 'fa-pen-fancy', desc: 'Improve English writing', cat: 'Practice' },
    'essay-scorer':            { name: 'Essay Scorer', icon: 'fa-star-half-alt', desc: 'Get your essay evaluated', cat: 'Practice' },
    'rc-practice':             { name: 'RC Practice', icon: 'fa-glasses', desc: 'Reading comprehension practice', cat: 'Practice' },
    'current-affairs':         { name: 'Current Affairs', icon: 'fa-newspaper', desc: 'Latest news & exam relevance', cat: 'Knowledge' },
    'static-gk':               { name: 'Static GK', icon: 'fa-globe', desc: 'General knowledge notes', cat: 'Knowledge' },
    'concept-explainer':       { name: 'Concept Explainer', icon: 'fa-lightbulb', desc: 'Understand any concept', cat: 'Knowledge' },
    'compare-contrast':        { name: 'Compare & Contrast', icon: 'fa-balance-scale', desc: 'Compare two topics', cat: 'Knowledge' },
    'acronym-explainer':       { name: 'Acronyms', icon: 'fa-font', desc: 'Decode important acronyms', cat: 'Knowledge' },
    'ca-linker':               { name: 'CA Linker', icon: 'fa-link', desc: 'Link current affairs to static GK', cat: 'Knowledge' },
    'flashcards':              { name: 'Flashcards', icon: 'fa-layer-group', desc: 'Active recall flashcards', cat: 'Study Aids' },
    'mind-map-generator':      { name: 'Mind Map', icon: 'fa-project-diagram', desc: 'Visual mind maps', cat: 'Study Aids' },
    'mnemonic-generator':      { name: 'Mnemonics', icon: 'fa-magic', desc: 'Create memory aids', cat: 'Study Aids' },
    'document-summarizer':     { name: 'Summarizer', icon: 'fa-compress-alt', desc: 'Summarize notes & articles', cat: 'Study Aids' },
    'revision-sheet':          { name: 'Revision Sheet', icon: 'fa-clipboard-list', desc: 'Quick revision cheatsheet', cat: 'Study Aids' },
    'tts':                     { name: 'Audio Revision', icon: 'fa-headphones', desc: 'Listen to your notes', cat: 'Study Aids' },
    'ai-tutor':                { name: 'AI Tutor', icon: 'fa-chalkboard-teacher', desc: 'Personalised tutoring chat', cat: 'Interactive' },
    'study-buddy':             { name: 'Study Buddy', icon: 'fa-user-friends', desc: 'Motivation & support', cat: 'Interactive' },
    'debate-simulator':        { name: 'Debate Simulator', icon: 'fa-comments', desc: 'Sharpen your reasoning', cat: 'Interactive' },
    'interview-simulator':     { name: 'Interview Sim', icon: 'fa-user-tie', desc: 'Mock government job interview', cat: 'Interactive' },
    'gk-story-weaver':         { name: 'GK Story Weaver', icon: 'fa-book-open', desc: 'Learn GK through stories', cat: 'Interactive' },
    'hobby-connector':         { name: 'Hobby Connector', icon: 'fa-heart', desc: 'Connect hobbies to GK', cat: 'Interactive' },
    'history-logs':            { name: 'History & Logs', icon: 'fa-history', desc: 'Review past sessions', cat: 'Interactive' },
    'bookmarks':               { name: 'Bookmarks', icon: 'fa-bookmark', desc: 'Saved responses for revision', cat: 'Saved' },
    'formula-bank':            { name: 'Formula Bank', icon: 'fa-superscript', desc: 'Quant & Reasoning shortcut formulas', cat: 'Practice' },
    'pyq-analyser':            { name: 'PYQ Analyser', icon: 'fa-archive', desc: 'Previous year questions with analysis', cat: 'Practice' },
    'error-log':               { name: 'Error Log', icon: 'fa-exclamation-circle', desc: 'Track your mistakes & weak spots', cat: 'Dashboard' },
    'pomodoro-timer':          { name: 'Study Timer', icon: 'fa-stopwatch', desc: 'Pomodoro focus timer for study sessions', cat: 'Dashboard' },
  }

  const CATEGORIES = ['Dashboard', 'Practice', 'Knowledge', 'Study Aids', 'Interactive', 'Saved']

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════
  function init() {
    loadState()
    buildNav()
    updateClock()
    setInterval(updateClock, 30000)
    fetchTodayDate() // fetch live IST date from server
    // Poll every minute: re-check date in case user leaves app open past midnight
    setInterval(fetchTodayDate, 60 * 1000)

    if (!STATE.apiKey) {
      document.getElementById('api-modal').style.display = 'flex'
    } else {
      document.getElementById('api-modal').style.display = 'none'
      document.getElementById('streak-display').textContent = STATE.studyStreak
      switchTool('performance-dashboard')
    }
  }

  function loadState() {
    try {
      STATE.apiKey = localStorage.getItem('cgl_api_key') || ''
      const saved = localStorage.getItem('cgl_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.assign(STATE, parsed)
        STATE.apiKey = localStorage.getItem('cgl_api_key') || ''
      }
      STATE.toolCache = {}   // always reset cache on load — session-only
      // Migration: patch goals that lack count/target (old localStorage saves won't have them)
      const defaultTargets = [5, 10, 10, 2, 1, 3, 5, 1]
      STATE.dailyGoals = (STATE.dailyGoals || []).map((g, i) => ({
        ...g,
        count:  (typeof g.count  === 'number') ? g.count  : 0,
        target: (typeof g.target === 'number') ? g.target : (defaultTargets[i] ?? 1),
      }))
      // ── Daily auto-reset: if last goals date ≠ today, wipe counts and start fresh ──
      checkAndResetGoalsForNewDay()
    } catch (e) { console.error('Load state error:', e) }
  }

  function saveState() {
    try {
      const toSave = { ...STATE }
      delete toSave.apiKey
      delete toSave.toolCache   // never persist DOM cache — session-only
      // Cap bookmarks at 50 to avoid localStorage overflow
      if (toSave.bookmarks && toSave.bookmarks.length > 50) {
        toSave.bookmarks = toSave.bookmarks.slice(0, 50)
      }
      localStorage.setItem('cgl_state', JSON.stringify(toSave))
    } catch (e) {
      // If quota exceeded, try saving without outputHTML fields
      try {
        const toSave = { ...STATE }
        delete toSave.apiKey
        delete toSave.toolCache
        toSave.historyLog = (toSave.historyLog || []).map(e => ({ ...e, outputHTML: '' }))
        toSave.bookmarks = (toSave.bookmarks || []).slice(0, 20).map(b => ({ ...b, contentHTML: b.contentHTML?.slice(0, 2000) || '' }))
        localStorage.setItem('cgl_state', JSON.stringify(toSave))
      } catch (e2) { console.error('Save state error:', e2) }
    }
  }

  function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim()
    if (!key || key.length < 10) {
      showToast('Please enter a valid API key', 'error')
      return
    }
    STATE.apiKey = key
    localStorage.setItem('cgl_api_key', key)
    document.getElementById('api-modal').style.display = 'none'
    document.getElementById('streak-display').textContent = STATE.studyStreak
    switchTool('performance-dashboard')
    showToast('API key saved! Welcome to CGL Prep Pro 🎉')
  }

  function showApiModal() {
    document.getElementById('api-modal').style.display = 'flex'
    document.getElementById('api-key-input').value = STATE.apiKey
  }

  function updateClock() {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    document.getElementById('current-time').textContent = now + ' IST'
  }

  // ═══════════════════════════════════════════════════════════
  // NAV BUILDER
  // ═══════════════════════════════════════════════════════════
  function buildNav() {
    const nav = document.getElementById('nav-menu')
    nav.innerHTML = ''
    CATEGORIES.forEach(cat => {
      const tools = Object.entries(TOOLS).filter(([_, t]) => t.cat === cat)
      const section = document.createElement('div')
      section.innerHTML = `
        <div class="nav-section-label">${cat}</div>
        ${tools.map(([id, t]) => `
          <button onclick="switchTool('${id}')" id="nav-${id}" class="nav-tool-btn">
            <span class="nav-icon"><i class="fas ${t.icon}" style="font-size:10.5px"></i></span>
            <span class="truncate" style="flex:1;min-width:0">${t.name}</span>
          </button>
        `).join('')}
      `
      nav.appendChild(section)
    })
  }

  function switchTool(toolId) {
    // Save current tool's DOM state before switching
    const oldToolId = STATE.activeTool
    if (oldToolId && oldToolId !== toolId) {
      const container = document.getElementById('tool-container')
      if (container && container.innerHTML.trim()) {
        STATE.toolCache[oldToolId] = container.innerHTML
      }
    }

    // Deactivate old
    document.querySelectorAll('.nav-tool-btn').forEach(b => b.classList.remove('active'))
    document.getElementById(`nav-${toolId}`)?.classList.add('active')

    STATE.activeTool = toolId
    const tool = TOOLS[toolId]
    document.getElementById('current-tool-name').textContent = tool.name
    document.getElementById('current-tool-desc').textContent = tool.desc
    // Update category badge in topbar
    const badge = document.getElementById('tool-category-badge')
    if (badge) { badge.textContent = tool.cat }

    // Mark daily streak
    updateStreak()

    // Render: restore from cache if available, otherwise fresh render
    const container = document.getElementById('tool-container')
    if (STATE.toolCache[toolId] && STATE.toolCache[toolId].trim()) {
      container.innerHTML = STATE.toolCache[toolId]
    } else {
      container.innerHTML = `<div style="padding:56px 0;display:flex;flex-direction:column;align-items:center;gap:16px">
        <div style="display:flex;flex-direction:column;gap:8px;width:240px">
          <div class="skeleton" style="height:13px;border-radius:6px"></div>
          <div class="skeleton" style="height:13px;border-radius:6px;width:80%"></div>
          <div class="skeleton" style="height:13px;border-radius:6px;width:60%"></div>
        </div>
        <div class="loading-bar" style="width:160px;margin-top:6px"></div>
      </div>`
      setTimeout(() => { renderTool(toolId, container) }, 50)
    }

    // Close sidebar on mobile
    if (window.innerWidth < 768) closeSidebar()
  }

  function openSidebar() {
    document.getElementById('sidebar').classList.add('open')
    document.getElementById('sidebar-overlay').classList.remove('hidden')
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open')
    document.getElementById('sidebar-overlay').classList.add('hidden')
  }

  function updateStreak() {
    const today = new Date().toDateString()
    if (STATE.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      if (STATE.lastStudyDate === yesterday) {
        STATE.studyStreak++
      } else if (STATE.lastStudyDate !== today) {
        STATE.studyStreak = 1
      }
      STATE.lastStudyDate = today
      document.getElementById('streak-display').textContent = STATE.studyStreak
      saveState()
    }
  }

  function clearCurrentTool() {
    // Clear cached state so tool re-renders fresh
    delete STATE.toolCache[STATE.activeTool]
    renderTool(STATE.activeTool, document.getElementById('tool-container'))
  }

  // ═══════════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════════
  function showToast(msg, type = 'success') {
    const el = document.getElementById('toast')
    const txt = document.getElementById('toast-text')
    const icon = document.getElementById('toast-icon')
    txt.textContent = msg
    el.classList.remove('hidden')
    if (type === 'error') { icon.className = 'fas fa-exclamation-circle'; icon.style.color = '#F87171' }
    else if (type === 'info') { icon.className = 'fas fa-info-circle'; icon.style.color = '#38BDF8' }
    else { icon.className = 'fas fa-check-circle'; icon.style.color = '#34D399' }
    clearTimeout(el._toastTimer)
    el._toastTimer = setTimeout(() => el.classList.add('hidden'), 3200)
  }

  // ═══════════════════════════════════════════════════════════
  // API CALLER
  // ═══════════════════════════════════════════════════════════
  function friendlyError(msg) {
    if (!msg) return 'Something went wrong. Please try again.'
    if (msg.includes('Rate limit') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return '⏳ Rate limit reached. The free Gemini tier has request limits. Please wait 30–60 seconds and try again, or upgrade your Google AI Studio plan.'
    }
    if (msg.includes('API key error') || msg.includes('API_KEY_INVALID')) {
      return '🔑 Invalid API key. Please click your name → Change API Key and re-enter your key.'
    }
    if (msg.includes('No API key')) {
      return '🔑 No API key set. Please enter your Google Gemini API key to get started.'
    }
    return msg
  }

  async function callFlow(type, input) {
    const res = await fetch(`/api/flow/${type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': STATE.apiKey },
      body: JSON.stringify({ ...input, _apiKey: STATE.apiKey })
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({ error: 'API error' }))
      throw new Error(friendlyError(e.error || 'API error'))
    }
    return res.json()
  }

  async function callGeneric(prompt, mode = 'html', enableSearch = true) {
    // Inject unique nonce into every generic prompt so Gemini never returns cached/repeated content
    const nonce = `[REQ:${Date.now()}-${Math.random().toString(36).slice(2,8)}] `
    return callFlow('generic', { prompt: nonce + prompt, mode, enableSearch })
  }

  async function callChat(type, history) {
    const res = await fetch(`/api/chat/${type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': STATE.apiKey },
      body: JSON.stringify({ history, _apiKey: STATE.apiKey })
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({ error: 'Chat API error' }))
      throw new Error(friendlyError(e.error || 'Chat API error'))
    }
    return res.text()
  }

  function addHistory(entry) {
    // entry should include { id, tool, input, output, outputHTML, timestamp }
    STATE.historyLog = [entry, ...STATE.historyLog].slice(0, 150)
    saveState()
  }

  // ═══════════════════════════════════════════════════════════
  // HISTORY MODAL
  // ═══════════════════════════════════════════════════════════
  function openHistoryModal(id) {
    const entry = STATE.historyLog.find(e => e.id === id)
    if (!entry) return
    const modal = document.getElementById('history-modal')
    if (!modal) return
    document.getElementById('hm-title').textContent = entry.tool
    document.getElementById('hm-meta').textContent =
      new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) +
      '  ·  Input: ' + (entry.input || '').slice(0, 60)
    const contentEl = document.getElementById('hm-content')
    if (entry.outputHTML) {
      contentEl.innerHTML = entry.outputHTML
    } else {
      contentEl.innerHTML = `<p class="text-slate-400 text-sm">${entry.output || 'No detail available.'}</p>`
    }
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
  }

  function closeHistoryModal() {
    const modal = document.getElementById('history-modal')
    if (modal) modal.style.display = 'none'
    document.body.style.overflow = ''
  }

  // ═══════════════════════════════════════════════════════════
  // BOOKMARKS
  // ═══════════════════════════════════════════════════════════
  function toggleBookmark(id, btn) {
    // Find the content of this card
    const card = btn ? btn.closest('.output-card') : document.querySelector(`[data-entry-id="${id}"]`)
    const contentEl = document.getElementById('content-' + id)
    const contentHTML = contentEl ? contentEl.innerHTML : ''

    const existing = STATE.bookmarks.findIndex(b => b.id === id)
    if (existing > -1) {
      // Remove bookmark
      STATE.bookmarks.splice(existing, 1)
      if (btn) {
        btn.classList.remove('bookmarked')
        btn.querySelector('span').textContent = 'Bookmark'
        showToast('Bookmark removed', 'info')
      }
    } else {
      // Add bookmark — figure out tool name from active tool
      const toolName = TOOLS[STATE.activeTool]?.name || 'Unknown Tool'
      STATE.bookmarks.unshift({
        id,
        tool: toolName,
        toolId: STATE.activeTool,
        contentHTML,
        timestamp: new Date().toISOString(),
        title: document.getElementById('current-tool-name')?.textContent || toolName
      })
      if (btn) {
        btn.classList.add('bookmarked')
        btn.querySelector('span').textContent = 'Saved'
        showToast('📌 Bookmarked! View in Bookmarks section', 'success')
      }
    }
    saveState()
  }

  function openBookmarkModal(id) {
    const entry = STATE.bookmarks.find(b => b.id === id)
    if (!entry) return
    const modal = document.getElementById('history-modal')
    if (!modal) return
    document.getElementById('hm-title').textContent = '📌 ' + entry.tool
    document.getElementById('hm-meta').textContent =
      new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const contentEl = document.getElementById('hm-content')
    contentEl.innerHTML = entry.contentHTML
      ? `<div class="prose max-w-none">${entry.contentHTML}</div>`
      : `<p class="text-slate-400 text-sm">No content saved.</p>`
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
  }

  function removeBookmark(id) {
    STATE.bookmarks = STATE.bookmarks.filter(b => b.id !== id)
    saveState()
    delete STATE.toolCache['bookmarks']
    renderTool('bookmarks', document.getElementById('tool-container'))
    showToast('Bookmark removed', 'info')
  }

  // ═══════════════════════════════════════════════════════════
  // SHARED UI HELPERS
  // ═══════════════════════════════════════════════════════════
  function loadingHTML(msg = 'Generating…') {
    return `<div class="animate-fade-in" style="padding:48px 0;display:flex;flex-direction:column;align-items:center;gap:16px">
      <div style="display:flex;flex-direction:column;gap:8px;width:220px">
        <div class="skeleton skeleton-text" style="height:12px;border-radius:6px"></div>
        <div class="skeleton skeleton-text" style="height:12px;border-radius:6px;width:85%"></div>
        <div class="skeleton skeleton-text" style="height:12px;border-radius:6px;width:70%"></div>
      </div>
      <div class="loading-bar" style="width:140px;margin-top:4px"></div>
      <span style="font-size:12px;color:var(--text-muted);letter-spacing:0.02em">${msg}</span>
    </div>`
  }

  function errorHTML(msg) {
    const isRateLimit = msg && (msg.includes('Rate limit') || msg.includes('quota') || msg.includes('⏳'))
    if (isRateLimit) {
      return `<div style="margin-top:16px;padding:14px 16px;border-radius:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25)">
        <div style="display:flex;align-items:flex-start;gap:10px">
          <i class="fas fa-clock" style="color:#F59E0B;font-size:15px;margin-top:1px;flex-shrink:0"></i>
          <div>
            <p style="font-weight:700;color:#FCD34D;font-size:13px;margin-bottom:4px">Rate Limit Reached</p>
            <p style="color:#FDE68A;font-size:12.5px;line-height:1.55">${msg.replace('⏳ ', '')}</p>
            <p style="color:rgba(253,230,138,0.6);font-size:11.5px;margin-top:8px;line-height:1.5">
              💡 Free Gemini tier: ~15 requests/min.
              <a href="https://ai.google.dev/pricing" target="_blank" style="color:#38BDF8;text-decoration:underline">Upgrade</a>
              or wait 30–60 s and retry.
            </p>
          </div>
        </div>
      </div>`
    }
    return `<div style="display:flex;align-items:flex-start;gap:9px;font-size:12.5px;padding:12px 14px;border-radius:10px;margin-top:14px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.25);color:#FCA5A5;line-height:1.55">
      <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;color:#F87171"></i>
      <span>${msg}</span>
    </div>`
  }

  function sanitizeAIHTML(html, isChat = true) {
    if (!html) return '';
    let clean = typeof html === 'string' ? html.trim() : String(html).trim();

    // 0. Strip markdown code block wrappers like ```html ... ``` or ``` ... ```
    clean = clean.replace(/^```(html|json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();

    // 1. Remove internal model meta-thinking, self-checks, checklists, and draft preambles
    if (/Clean HTML\?|Check for raw LaTeX|Check for Markdown|Final Structure Check|Wait, let's|Target Audience:|Calculation check|Verification:|Draft/i.test(clean)) {
      const contentStartRegex = /(?:<h[1-6]\b|<p\b|<div\b|<table\b|<ul\b|<ol\b|<strong\b|^\s*#{1,6}\s+|(?:<p>)?\s*<strong>(?:Question|Problem|Solution|Concept|Topic|Overview|Shortcuts):)/i;
      const match = clean.match(contentStartRegex);
      if (match && match.index > 0) {
        clean = clean.slice(match.index);
      }
    }
    clean = clean.replace(/(?:^|\n)[^\n]*?(?:Clean HTML\?|Check for raw LaTeX|Check for Markdown|Final Structure Check|Wait, let's|Target Audience:|Calculation check|Verification:)[^\n]*/gi, '');
    clean = clean.replace(/^(?:Let's try|Wait, let's|Final Question Selection|Calculation check|Target Audience:|Okay, let's|Here is|Sure, here|First, let's)[^\n]*\n+/gi, '');
    clean = clean.replace(/^\s*(?:\.\.\.|\---|[*]{3,})\s*/gim, '').trim();

    // 2. Remove mixed Markdown+HTML syntax artifacts:
    clean = clean.replace(/(?:^|\n)\s*(?:---|[*]{3,})\s*(?:#{1,6}\s*)?(?=<h[1-6]|<p|<div|<ul|<ol|<table)/gi, '\n');
    clean = clean.replace(/(?:#{1,6}\s*)(?=<h[1-6]|<p|<div|<ul|<ol|<table)/gi, '');
    clean = clean.replace(/(?:---|[*]{3,})\s*(?=<h[1-6])/gi, '');

    // 3. Convert standalone Markdown headings to HTML headings (if not already HTML tags)
    clean = clean.replace(/^######\s+(.+)$/gim, '<h6 class="chat-heading">$1</h6>');
    clean = clean.replace(/^#####\s+(.+)$/gim, '<h5 class="chat-heading">$1</h5>');
    clean = clean.replace(/^####\s+(.+)$/gim, '<h4 class="chat-heading">$1</h4>');
    clean = clean.replace(/^###\s+(.+)$/gim, '<h3 class="chat-heading">$1</h3>');
    clean = clean.replace(/^##\s+(.+)$/gim, '<h2 class="chat-heading">$1</h2>');
    clean = clean.replace(/^#\s+(.+)$/gim, '<h2 class="chat-heading">$1</h2>');

    // 4. Convert standalone horizontal rules: "---" or "***" on a line by itself -> <hr />
    clean = clean.replace(/^(?:---|[*]{3,})\s*$/gim, '<hr class="chat-hr" />');

    // 5. Convert inline Markdown bold & italic formatting
    clean = clean.replace(/\*\*\*(.*?)\*\*\*/g, '<b><em>$1</em></b>');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    clean = clean.replace(/__(.*?)__/g, '<b>$1</b>');
    clean = clean.replace(/(^|[^\*\_])\*([^\*\_\n]+)\*([^\*\_]|$)/g, '$1<em>$2</em>$3');

    // 6. Convert Markdown list items (* item or - item) if they are not already <li> tags
    clean = clean.replace(/(^|\n)\s*[\*\-]\s+(?!<li)(.+)/gi, '$1<li>$2</li>');

    // Wrap contiguous <li> tags in a clean <ul class="chat-ul"> tag if not already wrapped
    clean = clean.replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/gi, (match) => {
      if (match.includes('<ul') || match.includes('<ol')) return match;
      return `<ul class="chat-ul">${match}</ul>`;
    });

    // Clean up any double-wrapped <ul> tags
    clean = clean.replace(/<ul[^>]*>\s*<ul([^>]*)>/gi, '<ul$1>');
    clean = clean.replace(/<\/ul>\s*<\/ul>/gi, '</ul>');

    // 7. Convert LaTeX math symbols
    clean = clean
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\\\((.*?)\\\)/g, '$1')
      .replace(/\\\[([\s\S]*?)\\\]/g, '$1');

    // 8. Clean residual backticks
    clean = clean.replace(/```\s*$/gi, '').replace(/^`+|`+$/g, '').trim();

    // 9. Strip all inline style attributes from AI HTML output to prevent white cards or dark text blending
    clean = clean.replace(/\s*style\s*=\s*["'][\s\S]*?["']/gi, '');

    // 10. Strip light background, dark text, and card-wrapping Tailwind classes
    clean = clean.replace(/\b(bg-white|bg-light|bg-slate-\d+|bg-gray-\d+|bg-zinc-\d+|bg-neutral-\d+|bg-emerald-\d+|bg-green-\d+|bg-blue-\d+|bg-indigo-\d+|bg-sky-\d+|border|rounded-\w+|shadow-\w+)\b/gi, '');
    clean = clean.replace(/\b(text-black|text-slate-\d+|text-gray-\d+|text-zinc-\d+|text-neutral-\d+|text-emerald-\d+|text-green-\d+|text-blue-\d+)\b/gi, '');

    // 11. Wrap non-chat tool outputs in dynamic-content-card, but keep chat responses plain & un-boxed
    if (!isChat && !clean.includes('dynamic-content-card')) {
      clean = `<div class="dynamic-content-card exam-practice-container">${clean}</div>`;
    }

    return clean;
  }

  function copyOutputText(id) {
    const el = document.getElementById('content-' + id)
    if (!el) return
    const text = el.innerText || el.textContent
    if (!text || !text.trim()) return showToast('Nothing to copy', 'info')
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Response copied to clipboard!', 'success')
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showToast('📋 Response copied to clipboard!', 'success')
    })
  }

  function toggleEditOutput(id, btn) {
    const el = document.getElementById('content-' + id)
    if (!el) return
    const isEditing = el.isContentEditable
    if (isEditing) {
      el.contentEditable = 'false'
      el.classList.remove('output-edit-box')
      if (btn) {
        btn.classList.remove('active')
        btn.querySelector('.edit-label').textContent = 'Edit'
      }
      const updatedHTML = el.innerHTML
      const bkm = STATE.bookmarks.find(b => b.id === id)
      if (bkm) bkm.contentHTML = updatedHTML
      const hist = STATE.historyLog.find(h => h.id === id || h.id === Number(id))
      if (hist) hist.outputHTML = updatedHTML
      saveState()
      showToast('✏️ Edits saved!', 'success')
    } else {
      el.contentEditable = 'true'
      el.classList.add('output-edit-box')
      el.focus()
      if (btn) {
        btn.classList.add('active')
        btn.querySelector('.edit-label').textContent = 'Done Editing'
      }
      showToast('✏️ Editing enabled. Edit text directly and click Done Editing when finished.', 'info')
    }
  }

  function copyInputText(inputId) {
    const inputEl = document.getElementById(inputId)
    if (!inputEl) return
    const text = inputEl.value || ''
    if (!text.trim()) return showToast('Nothing in input to copy', 'info')
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Input copied to clipboard!', 'success')
    }).catch(() => {
      showToast('📋 Input copied!', 'success')
    })
  }

  function clearOrEditInput(inputId) {
    const inputEl = document.getElementById(inputId)
    if (!inputEl) return
    if (inputEl.value.trim()) {
      inputEl.value = ''
      inputEl.style.height = 'auto'
      inputEl.focus()
      showToast('✏️ Input cleared! Enter your new prompt.', 'info')
    } else {
      inputEl.focus()
      showToast('✏️ Focus on input to edit', 'info')
    }
  }

  function outputCard(html, entryId) {
    const bkmId = entryId || ('bkm_' + Date.now())
    const isBookmarked = STATE.bookmarks.some(b => b.id === bkmId)
    const rawText = (typeof html === 'string') 
      ? html 
      : (html?.result || html?.explanation || html?.summary || (typeof html === 'object' ? JSON.stringify(html) : String(html || '')));
    let cleanHTML = sanitizeAIHTML(rawText, false)
    if (!cleanHTML || !cleanHTML.trim()) {
      cleanHTML = '<p style="color:#94AAC8;font-size:13px">No response received. Please try again.</p>'
    }
    return `<div class="output-card" data-entry-id="${bkmId}">
      <div class="output-card-header">
        <div class="output-card-label">
          <div style="width:18px;height:18px;border-radius:5px;background:rgba(14,165,233,0.15);display:flex;align-items:center;justify-content:center">
            <i class="fas fa-robot" style="font-size:9px;color:#38BDF8"></i>
          </div>
          AI Response
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button onclick="copyOutputText('${bkmId}')" class="card-action-btn" title="Copy output text">
            <i class="fas fa-copy" style="font-size:10.5px"></i>
            <span>Copy</span>
          </button>
          <button onclick="toggleEditOutput('${bkmId}', this)" class="card-action-btn" title="Edit output text">
            <i class="fas fa-edit" style="font-size:10.5px"></i>
            <span class="edit-label">Edit</span>
          </button>
          <button onclick="toggleBookmark('${bkmId}', this)"
                  class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                  title="Bookmark this response">
            <i class="fas fa-bookmark" style="font-size:10.5px"></i>
            <span>${isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
      <div class="prose" id="content-${bkmId}">${cleanHTML}</div>
    </div>`
  }

  function inputArea({ id, placeholder, label, btn, onSubmit, type = 'text', rows = 3 }) {
    const minRows = type === 'textarea' ? Math.max(rows, 3) : 2
    return `<div style="display:flex;flex-direction:column;gap:8px">
      <div style="position:relative">
        <textarea id="${id}" placeholder="${placeholder}" rows="${minRows}"
          style="min-height:${minRows * 24 + 28}px;padding:12px 14px 34px 14px;font-size:13.5px;line-height:1.6"
          class="w-full resize-none overflow-hidden"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey&&${minRows}<=2){event.preventDefault();${onSubmit}}"
        ></textarea>
        <div style="position:absolute;bottom:7px;right:9px;display:flex;gap:5px;z-index:2">
          <button type="button" onclick="copyInputText('${id}')" class="card-action-btn" style="padding:2px 7px;font-size:10.5px;background:rgba(15,22,41,0.85)" title="Copy input prompt">
            <i class="fas fa-copy" style="font-size:9.5px"></i> Copy
          </button>
          <button type="button" onclick="clearOrEditInput('${id}')" class="card-action-btn" style="padding:2px 7px;font-size:10.5px;background:rgba(15,22,41,0.85)" title="Clear/Edit input prompt">
            <i class="fas fa-pen-square" style="font-size:9.5px"></i> Clear/Edit
          </button>
        </div>
      </div>
      <button onclick="${onSubmit}" class="btn-primary w-full" style="padding:11px 16px;font-size:13px">
        <i class="fas fa-paper-plane" style="font-size:12px"></i>
        ${btn}
      </button>
    </div>`
  }

  function surpriseBtn(toolId, inputId, triggerFn) {
    return `<button onclick="surpriseMe('${toolId}','${inputId}','${triggerFn}')"
      style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;
             background:linear-gradient(135deg,rgba(167,139,250,0.18),rgba(56,189,248,0.14));
             border:1.5px solid rgba(167,139,250,0.35);color:#C4B5FD;font-size:12px;font-weight:700;
             cursor:pointer;transition:all 0.18s;letter-spacing:0.02em;white-space:nowrap"
      onmouseover="this.style.background='linear-gradient(135deg,rgba(167,139,250,0.28),rgba(56,189,248,0.22))';this.style.borderColor='rgba(167,139,250,0.6)';this.style.color='#DDD6FE';this.style.transform='translateY(-1px)'"
      onmouseout="this.style.background='linear-gradient(135deg,rgba(167,139,250,0.18),rgba(56,189,248,0.14))';this.style.borderColor='rgba(167,139,250,0.35)';this.style.color='#C4B5FD';this.style.transform='translateY(0)'"
      title="Generate a fresh surprise instantly — no topic needed!">
      🎲 <span>Surprise Me!</span>
    </button>`
  }

  function surpriseMe(toolId, inputId, triggerFn) {
    const inputEl = document.getElementById(inputId)
    if (inputEl) {
      inputEl.value = ''
      inputEl.style.height = 'auto'
    }
    showToast('🎲 Generating a surprise for you…', 'info')
    window[triggerFn] && window[triggerFn]()
  }

  const GOAL_TOOL_MAP = {
    'vocabulary':          0,
    'quant-solver':        1,
    'question-generator':  1,
    'reasoning-solver':    2,
    'current-affairs':     3,
    'ca-linker':           3,
    'ai-mock-test':        4,
    'formula-bank':        5,
    'revision-sheet':      5,
    'pyq-analyser':        6,
    'error-log':           7,
  }

  function autoCompleteGoal(toolId) {
    const goalIndex = GOAL_TOOL_MAP[toolId]
    if (goalIndex === undefined) return
    const goal = STATE.dailyGoals[goalIndex]
    if (!goal || goal.completed) return

    if (typeof goal.count  !== 'number') goal.count  = 0
    if (typeof goal.target !== 'number') goal.target = 1

    goal.count = Math.min(goal.count + 1, goal.target)
    const justCompleted = goal.count >= goal.target
    if (justCompleted) goal.completed = true

    saveState()

    if (justCompleted) {
      showToast(`🎉 Goal complete! "${goal.text.slice(0,40)}${goal.text.length>40?'…':''}"`, 'success')
    } else {
      const remaining = goal.target - goal.count
      showToast(`✅ Progress: ${goal.count}/${goal.target} — ${remaining} more to go!`, 'info')
    }

    if (STATE.activeTool === 'daily-goals') {
      delete STATE.toolCache['daily-goals']
      renderTool('daily-goals', document.getElementById('tool-container'))
    }
    if (STATE.activeTool === 'performance-dashboard') {
      delete STATE.toolCache['performance-dashboard']
      renderTool('performance-dashboard', document.getElementById('tool-container'))
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TOOL RENDERER (switch-board)
  // ═══════════════════════════════════════════════════════════
  function renderTool(id, container) {
    const renders = {
      'performance-dashboard': renderDashboard,
      'daily-goals': renderDailyGoals,
      'ai-mock-test': renderMockTest,
      'question-generator': renderQuestionGenerator,
      'interactive-smart-revision': renderSmartRevision,
      'quant-solver': renderQuantSolver,
      'reasoning-solver': renderReasoningSolver,
      'para-jumble-solver': renderParaJumble,
      'vocabulary': renderVocabulary,
      'writing-assistant': renderWritingAssistant,
      'essay-scorer': renderEssayScorer,
      'rc-practice': renderRCPractice,
      'current-affairs': renderCurrentAffairs,
      'static-gk': renderStaticGK,
      'concept-explainer': renderConceptExplainer,
      'compare-contrast': renderCompareContrast,
      'acronym-explainer': renderAcronyms,
      'ca-linker': renderCALinker,
      'flashcards': renderFlashcards,
      'mind-map-generator': renderMindMap,
      'mnemonic-generator': renderMnemonics,
      'document-summarizer': renderSummarizer,
      'revision-sheet': renderRevisionSheet,
      'tts': renderTTS,
      'ai-tutor': renderAITutor,
      'study-buddy': renderStudyBuddy,
      'debate-simulator': renderDebateSimulator,
      'interview-simulator': renderInterviewSim,
      'gk-story-weaver': renderGKStory,
      'hobby-connector': renderHobbyConnector,
      'history-logs': renderHistoryLogs,
      'bookmarks': renderBookmarks,
      'formula-bank': renderFormulaBank,
      'pyq-analyser': renderPYQAnalyser,
      'error-log': renderErrorLog,
      'pomodoro-timer': renderPomodoroTimer,
    }
    const fn = renders[id]
    if (fn) fn(container)
    else container.innerHTML = `<div class="text-center py-16 text-gray-400"><i class="fas fa-tools text-4xl mb-4 block"></i><p>Tool "${TOOLS[id]?.name}" coming soon!</p></div>`
  }

  // ═══════════════════════════════════════════════════════════
  // PERFORMANCE DASHBOARD
  // ═══════════════════════════════════════════════════════════
  function renderDashboard(el) {
    const history = STATE.mockTestHistory
    const quotes = [
      { q: "Har din ek naya mauka hai – uthao isse!", a: "SSC CGL Aspirant" },
      { q: "Success is not final, failure is not fatal: It is the courage to continue that counts.", a: "Winston Churchill" },
      { q: "जो मेहनत करता है, वो ज़रूर चमकता है।", a: "Motivational" },
      { q: "The dream is free. The hustle is sold separately.", a: "Unknown" },
      { q: "Padhai karo aaj – Officer bano kal!", a: "SSC CGL Aspirant" },
      { q: "Small daily improvements lead to staggering long-term results.", a: "Robin Sharma" },
      { q: "कल जो तुमने सोचा था, वो आज करो।", a: "Anonymous" },
    ]
    const todayQuote = quotes[new Date().getDay() % quotes.length]
    const now = new Date(TODAY.iso)
    const examDates = [
      { date: new Date('2025-11-30'), label: 'SSC CGL 2025 Mains', sub: 'Nov 30, 2025' },
      { date: new Date('2026-06-15'), label: 'SSC CGL 2026 Tier-I', sub: 'Jun 15, 2026 (est.)' },
      { date: new Date('2026-11-30'), label: 'SSC CGL 2026 Mains', sub: 'Nov 30, 2026 (est.)' },
    ]
    const nextExam = examDates.find(e => e.date > now) || examDates[examDates.length - 1]
    const daysLeft = Math.max(0, Math.ceil((nextExam.date - now) / (1000 * 60 * 60 * 24)))
    const completedGoals = STATE.dailyGoals.filter(g => g.completed).length
    const goalPct = Math.round(completedGoals / STATE.dailyGoals.length * 100)
    el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px" class="animate-fade-in">

      <!-- Top row: Quote + Countdown -->
      <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:stretch">
        <div style="padding:16px 18px;border-radius:14px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(14,165,233,0.07));border:1px solid rgba(124,58,237,0.2);display:flex;align-items:flex-start;gap:12px">
          <i class="fas fa-quote-left" style="color:rgba(139,92,246,0.7);font-size:18px;margin-top:2px;flex-shrink:0"></i>
          <div>
            <p style="color:#E2E8F0;font-size:13.5px;font-style:italic;line-height:1.65;margin:0">"${todayQuote.q}"</p>
            <p style="font-size:11px;color:var(--text-muted);margin-top:6px">— ${todayQuote.a}</p>
          </div>
        </div>
        <div style="padding:16px 20px;border-radius:14px;background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(239,68,68,0.06));border:1px solid rgba(249,115,22,0.2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:110px;text-align:center">
          <div style="font-size:36px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FB923C;line-height:1">${daysLeft}</div>
          <div style="font-size:10px;font-weight:700;color:#FED7AA;letter-spacing:0.03em">DAYS LEFT</div>
          <div style="font-size:9.5px;color:var(--text-muted);margin-top:2px">${nextExam.label}</div>
          <div style="font-size:16px;margin-top:4px">🎯</div>
        </div>
      </div>

      <!-- Stat cards -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div class="stat-card stat-teal" style="text-align:center">
          <div class="stat-card-orb" style="background:#0EA5E9"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#38BDF8;position:relative;z-index:1">${history.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Mock Tests</div>
        </div>
        <div class="stat-card stat-coral" style="text-align:center">
          <div class="stat-card-orb" style="background:#F97316"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FB923C;position:relative;z-index:1">${STATE.studyStreak}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Day Streak 🔥</div>
        </div>
        <div class="stat-card stat-amber" style="text-align:center">
          <div class="stat-card-orb" style="background:#F59E0B"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FCD34D;position:relative;z-index:1">${STATE.historyLog.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Activities</div>
        </div>
        <div class="stat-card stat-violet" style="text-align:center">
          <div class="stat-card-orb" style="background:#8B5CF6"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#A78BFA;position:relative;z-index:1">${getAvgScore()}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Avg Score %</div>
        </div>
      </div>

      <!-- Chart or empty state -->
      ${history.length > 0 ? `
      <div class="card-dark" style="padding:18px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 class="font-headline" style="font-size:13.5px;font-weight:700;color:var(--text-primary)">Score Trend</h3>
          <span class="chip chip-muted">Last 10 Tests</span>
        </div>
        <canvas id="score-chart" height="110"></canvas>
      </div>
      ` : `
      <div class="card-dark" style="padding:36px 20px;text-align:center">
        <div style="width:48px;height:48px;border-radius:12px;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
          <i class="fas fa-chart-line" style="color:rgba(14,165,233,0.5);font-size:20px"></i>
        </div>
        <p class="font-headline" style="font-weight:700;font-size:14px;color:var(--text-primary);margin-bottom:4px">No test data yet</p>
        <p style="font-size:12.5px;color:var(--text-muted)">Complete a Mock Test to see your score trends.</p>
      </div>
      `}

      ${renderTopicStrengths()}

      <!-- Daily Goals -->
      <div class="card-dark" style="padding:18px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 class="font-headline" style="font-size:13.5px;font-weight:700;color:var(--text-primary)">Today's Goals</h3>
          <span class="chip ${goalPct === 100 ? 'chip-green' : goalPct >= 50 ? 'chip-amber' : 'chip-muted'}">${completedGoals}/${STATE.dailyGoals.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${STATE.dailyGoals.map((g, i) => {
            const cnt  = typeof g.count  === 'number' ? g.count  : 0
            const tgt  = typeof g.target === 'number' ? g.target : 1
            const done = g.completed || cnt >= tgt
            const isOne = tgt === 1
            const pct  = Math.min(Math.round(cnt / tgt * 100), 100)
            return `
            <div style="padding:7px 10px;border-radius:8px;background:${done ? 'rgba(16,185,129,0.07)' : 'var(--bg-elevated)'};border:1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:16px;height:16px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;${done ? 'background:#10B981' : 'border:1.5px solid rgba(14,165,233,0.35)'}">
                  ${done ? '<i class="fas fa-check" style="color:#fff;font-size:7px"></i>' : ''}
                </div>
                <span style="flex:1;font-size:12px;${done ? 'text-decoration:line-through;color:var(--text-muted)' : 'color:var(--text-secondary)'}">${g.text}</span>
                ${!isOne ? `<span style="font-size:10.5px;font-weight:700;color:${done ? '#34D399' : 'var(--accent)'};flex-shrink:0">${cnt}/${tgt}</span>` : ''}
              </div>
              ${!isOne ? `
              <div style="margin-top:5px;margin-left:24px;height:3px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">
                <div style="height:100%;width:${pct}%;border-radius:99px;background:${done ? 'linear-gradient(90deg,#10B981,#34D399)' : 'linear-gradient(90deg,#38BDF8,#818CF8)'};transition:width 0.4s"></div>
              </div>` : ''}
            </div>`
          }).join('')}
        </div>
        <div style="margin-top:12px">
          <div class="prog-track" style="height:4px">
            <div class="prog-fill prog-accent" style="width:${goalPct}%"></div>
          </div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:5px">${goalPct}% complete · ${STATE.dailyGoals.length - completedGoals} remaining</p>
        </div>
      </div>
    </div>
    `

    if (history.length > 0) {
      setTimeout(() => {
        const ctx = document.getElementById('score-chart')?.getContext('2d')
        if (!ctx) return
        const recent = history.slice(-10)
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: recent.map((_, i) => `Test ${i+1}`),
            datasets: [
              { label: 'Quant', data: recent.map(t => t.quant || 0), borderColor: '#38BDF8', backgroundColor: 'rgba(14,165,233,0.12)', tension: 0.4, fill: true },
              { label: 'Reasoning', data: recent.map(t => t.reasoning || 0), borderColor: '#34D399', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
              { label: 'English', data: recent.map(t => t.english || 0), borderColor: '#FCD34D', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.4, fill: true },
              { label: 'GA', data: recent.map(t => t.ga || 0), borderColor: '#C084FC', backgroundColor: 'rgba(167,139,250,0.1)', tension: 0.4, fill: true },
            ]
          },
          options: { responsive: true, plugins: { legend: { position: 'top', labels: { color: '#94A3B8', font: { size: 11 } } } }, scales: { y: { min: 0, max: 50, grid: { color: 'rgba(14,165,233,0.1)' }, ticks: { color: '#64748B' } }, x: { grid: { color: 'rgba(14,165,233,0.1)' }, ticks: { color: '#64748B' } } } }
        })
      }, 100)
    }
  }

  function getAvgScore() {
    if (!STATE.mockTestHistory.length) return '–'
    const sums = STATE.mockTestHistory.map(t => ((t.quant||0)+(t.reasoning||0)+(t.english||0)+(t.ga||0)))
    const total = sums.reduce((a,b)=>a+b,0)
    return Math.round(total / STATE.mockTestHistory.length)
  }

  function renderTopicStrengths() {
    const data = STATE.topicPerformanceData
    const topics = {}
    for (const subj of Object.keys(data)) {
      for (const [topic, stats] of Object.entries(data[subj])) {
        if (!topics[topic]) topics[topic] = { correct: 0, total: 0 }
        topics[topic].correct += stats.correct || 0
        topics[topic].total += stats.total || 0
      }
    }
    const sorted = Object.entries(topics)
      .filter(([_, v]) => v.total > 0)
      .map(([k, v]) => ({ topic: k, pct: Math.round(v.correct/v.total*100) }))
      .sort((a, b) => b.pct - a.pct)

    if (!sorted.length) return ''
    return `
    <div class="card-dark" style="padding:18px 20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <h3 class="font-headline" style="font-size:13.5px;font-weight:700;color:var(--text-primary)">Topic Mastery</h3>
        <span class="chip chip-muted">Strongest → Weakest</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:9px">
        ${sorted.slice(0, 8).map(t => {
          const color = t.pct >= 75 ? '#34D399' : t.pct >= 50 ? '#FCD34D' : '#FCA5A5'
          const bar = t.pct >= 75 ? 'prog-green' : t.pct >= 50 ? 'prog-amber' : 'prog-coral'
          return `<div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:12px;color:var(--text-muted);width:140px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.topic}</span>
            <div class="prog-track" style="flex:1;height:4px">
              <div class="prog-fill ${bar}" style="width:${t.pct}%"></div>
            </div>
            <span style="font-size:11.5px;font-weight:700;color:${color};width:34px;text-align:right;flex-shrink:0">${t.pct}%</span>
          </div>`
        }).join('')}
      </div>
    </div>`
  }

  // ═══════════════════════════════════════════════════════════
  // DAILY GOALS
  // ═══════════════════════════════════════════════════════════
  function renderDailyGoals(el) {
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <h2 class="font-headline" style="font-size:18px;font-weight:800;color:var(--text-primary)">Daily Goals</h2>
        <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Complete these every day to build a consistent study habit.</p>
      </div>
      <div class="card-dark" style="padding:16px 18px;display:flex;flex-direction:column;gap:8px" id="goals-list">
        ${STATE.dailyGoals.map((g, i) => {
          const cnt    = typeof g.count  === 'number' ? g.count  : 0
          const tgt    = typeof g.target === 'number' ? g.target : 1
          const pct    = Math.min(Math.round(cnt / tgt * 100), 100)
          const done   = g.completed || cnt >= tgt
          const isOne  = tgt === 1
          return `
          <div style="padding:10px 12px;border-radius:10px;background:${done ? 'rgba(16,185,129,0.07)' : 'var(--bg-elevated)'};border:1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'};transition:all 0.15s">
            <div style="display:flex;align-items:center;gap:10px">
              <div onclick="toggleGoal(${i})" style="width:20px;height:20px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;${done ? 'background:#10B981' : 'border:1.5px solid rgba(14,165,233,0.4)'}">
                ${done ? '<i class="fas fa-check" style="color:#fff;font-size:8px"></i>' : ''}
              </div>
              <span style="flex:1;font-size:13px;${done ? 'text-decoration:line-through;color:var(--text-muted)' : 'color:var(--text-secondary)'}">${g.text}</span>
              ${!isOne ? `<span style="font-size:11px;font-weight:700;color:${done ? '#34D399' : 'var(--accent)'};flex-shrink:0">${cnt}/${tgt}</span>` : ''}
              <button onclick="event.stopPropagation();switchTool('${g.tool}')" style="font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;flex-shrink:0;padding:2px 6px;border-radius:4px" onmouseover="this.style.background='rgba(14,165,233,0.1)'" onmouseout="this.style.background='none'">Open →</button>
            </div>
            ${!isOne && !done ? `
            <div style="margin-top:7px;margin-left:30px">
              <div style="height:4px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">
                <div style="height:100%;width:${pct}%;border-radius:99px;background:linear-gradient(90deg,#38BDF8,#818CF8);transition:width 0.4s ease"></div>
              </div>
            </div>` : ''}
            ${!isOne && done ? `
            <div style="margin-top:7px;margin-left:30px">
              <div style="height:4px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">
                <div style="height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,#10B981,#34D399)"></div>
              </div>
            </div>` : ''}
          </div>`
        }).join('')}
      </div>
      <div class="card-dark-sm" style="padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
          <span style="font-size:12.5px;font-weight:600;color:var(--text-secondary)">Daily Progress</span>
          <span style="font-size:13px;font-weight:800;color:var(--accent)">${STATE.dailyGoals.filter(g=>g.completed).length}/${STATE.dailyGoals.length} done</span>
        </div>
        <div class="prog-track" style="height:5px">
          <div class="prog-fill prog-accent" style="width:${(STATE.dailyGoals.filter(g=>g.completed).length/STATE.dailyGoals.length*100).toFixed(0)}%"></div>
        </div>
        ${STATE.dailyGoals.every(g=>g.completed) ? '<p style="color:#34D399;font-weight:700;text-align:center;margin-top:10px;font-size:13px">🎉 All goals complete! Excellent work today!</p>' : ''}
      </div>
      <button onclick="resetGoals()" style="font-size:11px;color:var(--text-faint);background:none;border:none;cursor:pointer;align-self:flex-start;padding:4px 0" onmouseover="this.style.color='#F87171'" onmouseout="this.style.color='var(--text-faint)'">Reset today's goals</button>
    </div>`
  }

  function toggleGoal(i) {
    const g = STATE.dailyGoals[i]
    if (g.completed) {
      g.completed = false
      g.count = 0
    } else {
      g.count = g.target ?? 1
      g.completed = true
    }
    saveState()
    renderTool('daily-goals', document.getElementById('tool-container'))
  }

  function resetGoals() {
    STATE.dailyGoals = STATE.dailyGoals.map(g => ({ ...g, completed: false, count: 0 }))
    saveState()
    renderTool('daily-goals', document.getElementById('tool-container'))
  }

  // ═══════════════════════════════════════════════════════════
  // QUESTION GENERATOR
  // ═══════════════════════════════════════════════════════════
  function toolHeader(icon, title, desc, chipText = '', chipClass = 'chip-primary') {
    return `<div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <div style="width:32px;height:32px;border-radius:9px;background:rgba(14,165,233,0.12);border:1px solid rgba(14,165,233,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas ${icon}" style="color:#38BDF8;font-size:13px"></i>
        </div>
        <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">${title}</h2>
        ${chipText ? `<span class="chip ${chipClass}" style="flex-shrink:0">${chipText}</span>` : ''}
      </div>
      <p style="font-size:12.5px;color:var(--text-muted);padding-left:42px">${desc}</p>
    </div>`
  }

  function renderQuestionGenerator(el) {
    el.innerHTML = `
    <div class="w-full">
      ${toolHeader('fa-question-circle', 'Question Generator', 'Generate 5 SSC CGL–level MCQs on any topic instantly.')}
      ${inputArea({ id: 'qg-topic', placeholder: 'e.g. Profit & Loss, Indian Constitution, Synonyms…', btn: 'Generate 5 Questions', onSubmit: 'generateQuestions()' })}
      <div style="margin-top:8px">${surpriseBtn('question-generator','qg-topic','generateQuestions')}</div>
      <div id="qg-output"></div>
    </div>`
  }

  const QG_TOPIC_POOL = [
    'Mixture and Alligation','Profit Loss Discount','Time Speed Distance',
    'Compound Interest','Simple Interest','Percentage','Ratio and Proportion',
    'Time and Work','Pipes and Cisterns','Number System','HCF and LCM',
    'Algebra','Geometry — Triangles','Geometry — Circles','Mensuration',
    'Trigonometry','Data Interpretation','Average','Sequence and Series',
    'Analogy','Coding Decoding','Blood Relations','Syllogism','Direction Sense',
    'Indian Polity — Fundamental Rights','Indian History — Freedom Movement',
    'Indian Geography — Rivers','Science — Physics Basics','Indian Economy',
    'Idioms and Phrases','One Word Substitution','Error Spotting','Fill in the Blanks',
    'Reading Comprehension','Synonyms Antonyms'
  ]
  let _qgTopicIdx = Math.floor(Math.random() * QG_TOPIC_POOL.length)

  async function generateQuestions() {
    const raw = document.getElementById('qg-topic').value.trim()
    if (!raw) _qgTopicIdx = (_qgTopicIdx + 1 + Math.floor(Math.random() * 5)) % QG_TOPIC_POOL.length
    const topic = raw || QG_TOPIC_POOL[_qgTopicIdx]
    if (!raw) showToast(`🎲 Surprise topic: "${topic}"`, 'info')
    const out = document.getElementById('qg-output')
    out.innerHTML = loadingHTML('Generating questions...')
    try {
      const res = await callFlow('questions', { topic, count: 5, _apiKey: STATE.apiKey })
      const questions = res.questions || []
      if (!questions.length) { out.innerHTML = errorHTML('No questions generated. Try a different topic.'); return }
      renderQuiz(out, questions, topic)
      addHistory({ id: Date.now(), tool: 'Question Generator', input: topic, output: questions.length + ' questions', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('question-generator')
    } catch (e) { out.innerHTML = errorHTML(e.message) }
  }

  function copyQuizText(btn) {
    const quizWrap = btn.closest('.animate-fade-in') || btn.closest('.space-y-5')
    if (!quizWrap) return
    const text = quizWrap.innerText || quizWrap.textContent
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Quiz questions copied to clipboard!', 'success')
    }).catch(() => {
      showToast('📋 Questions copied!', 'success')
    })
  }

  function toggleEditQuiz(btn) {
    const quizWrap = btn.closest('.animate-fade-in') || btn.closest('.space-y-5')
    if (!quizWrap) return
    const cards = quizWrap.querySelectorAll('.card-dark')
    if (!cards.length) return
    const isEditing = cards[0]?.isContentEditable
    cards.forEach(card => {
      if (isEditing) {
        card.contentEditable = 'false'
        card.classList.remove('output-edit-box')
      } else {
        card.contentEditable = 'true'
        card.classList.add('output-edit-box')
      }
    })
    if (isEditing) {
      btn.classList.remove('active')
      const label = btn.querySelector('.edit-label')
      if (label) label.textContent = 'Edit Quiz'
      showToast('✏️ Quiz edits saved!', 'success')
    } else {
      btn.classList.add('active')
      const label = btn.querySelector('.edit-label')
      if (label) label.textContent = 'Done Editing'
      showToast('✏️ Quiz editing enabled. Click Done Editing when finished.', 'info')
    }
  }

  function renderQuiz(container, questions, topic) {
    let score = 0, answered = 0
    const total = questions.length
    container.innerHTML = `
    <div class="space-y-5 animate-fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:99px;background:var(--bg-elevated);border:1px solid var(--border-subtle)">
        <span class="font-headline" style="font-size:14px;font-weight:700;color:var(--text-primary)">Quiz — ${topic}</span>
        <div style="display:flex;align-items:center;gap:7px">
          <button onclick="copyQuizText(this)" class="card-action-btn" title="Copy all questions">
            <i class="fas fa-copy" style="font-size:10.5px"></i>
            <span>Copy</span>
          </button>
          <button onclick="toggleEditQuiz(this)" class="card-action-btn" title="Edit questions">
            <i class="fas fa-edit" style="font-size:10.5px"></i>
            <span class="edit-label">Edit</span>
          </button>
          <span class="chip chip-primary" id="quiz-score">0 / ${total} correct</span>
        </div>
      </div>
      ${questions.map((q, qi) => `
      <div class="card-dark" style="padding:16px 18px" id="q-${qi}">
        <p style="font-size:13.5px;font-weight:500;color:var(--text-primary);line-height:1.65;margin-bottom:12px">
          <span style="color:#38BDF8;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;margin-right:6px">Q${qi+1}.</span>${q.question}
        </p>
        <div style="display:flex;flex-direction:column;gap:6px" class="options-${qi}">
          ${q.options.map((opt, oi) => `
            <button onclick="handleQuizClick(this, ${qi})"
              data-opt="${encodeURIComponent(opt)}"
              class="quiz-option"
              style="padding:9px 13px;font-size:12.5px;border-radius:8px">
              <span style="color:#38BDF8;font-weight:700;margin-right:8px;font-size:10.5px">${String.fromCharCode(65+oi)}</span>${opt}
            </button>
          `).join('')}
        </div>
        <div id="exp-${qi}" class="hidden" style="margin-top:10px;padding:10px 12px;border-radius:8px;font-size:12.5px;background:rgba(14,165,233,0.07);color:#BAE6FD;border:1px solid rgba(14,165,233,0.18);line-height:1.6"></div>
      </div>
      `).join('')}
    </div>`

    window._quizAnswered = {}
    window._quizData = questions
    window._updateQuizScore = () => {
      const s = Object.values(window._quizAnswered).filter(Boolean).length
      document.getElementById('quiz-score').textContent = `${s} / ${total} correct`
      if (Object.keys(window._quizAnswered).length === total) {
        const pct = Math.round(s/total*100)
        const banner = document.createElement('div')
        const bgColor = pct >= 80 ? 'rgba(16,185,129,0.15)' : pct >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)'
        const borderColor = pct >= 80 ? 'rgba(16,185,129,0.4)' : pct >= 60 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.3)'
        const textColor = pct >= 80 ? '#34D399' : pct >= 60 ? '#FCD34D' : '#FCA5A5'
        banner.style.cssText = `margin-top:16px;padding:16px;border-radius:12px;text-align:center;font-weight:600;background:${bgColor};border:1px solid ${borderColor};color:${textColor}`
        banner.textContent = `Quiz Complete! ${s}/${total} (${pct}%) – ${pct >= 80 ? '🌟 Excellent!' : pct >= 60 ? '👍 Good effort!' : '📚 Keep practising!'}`
        container.querySelector('[style*="flex-direction:column"]').appendChild(banner)
        updateTopicPerformance(topic, s, total)
      }
    }
  }

  function handleQuizClick(btn, qi) {
    if (window._quizAnswered?.[qi] !== undefined) return
    const selected = decodeURIComponent(btn.dataset.opt || '')
    const qData = window._quizData?.[qi]
    if (!qData) return
    const correct = qData.answer
    const explanation = qData.explanation
    const btns = document.querySelectorAll('.options-' + qi + ' button')
    btns.forEach(b => {
      const opt = decodeURIComponent(b.dataset.opt || '')
      b.disabled = true
      if (opt === correct) b.classList.add('correct')
      else if (opt === selected) b.classList.add('wrong')
    })
    const isCorrect = selected === correct
    window._quizAnswered[qi] = isCorrect
    const expEl = document.getElementById('exp-' + qi)
    expEl.classList.remove('hidden')
    expEl.innerHTML = '<strong>' + (isCorrect ? '&#x2705; Correct!' : '&#x274C; Incorrect. Answer: ' + correct) + '</strong> &ndash; ' + explanation
    window._updateQuizScore()
  }

  function updateTopicPerformance(topic, correct, total) {
    const subj = 'ga'
    if (!STATE.topicPerformanceData[subj]) STATE.topicPerformanceData[subj] = {}
    const cur = STATE.topicPerformanceData[subj][topic] || { correct: 0, total: 0 }
    STATE.topicPerformanceData[subj][topic] = { correct: cur.correct + correct, total: cur.total + total }
    saveState()
  }

  // ═══════════════════════════════════════════════════════════
  // MOCK TEST
  // ═══════════════════════════════════════════════════════════
  function renderMockTest(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📝 AI Mock Test Generator</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Generate a timed mini mock test with MCQs across subjects.</p>
      <div class="card-dark p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Topic / Subject</label>
          <input type="text" id="mock-topic" placeholder="e.g. Mixed (Quant + English + GK)" class="w-full px-4 py-2.5 text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Number of Questions</label>
          <select id="mock-count" class="w-full px-4 py-2.5 text-sm">
            <option value="5">5 Questions</option>
            <option value="10" selected>10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">20 Questions</option>
          </select>
        </div>
        <button onclick="generateMockTest()" class="btn-primary w-full py-3 text-sm font-semibold">
          <i class="fas fa-play mr-2"></i>Start Mock Test
        </button>
      </div>
      <div id="mock-output"></div>
    </div>`
  }

  async function generateMockTest() {
    const topic = document.getElementById('mock-topic').value.trim() || 'Mixed SSC CGL topics'
    const count = document.getElementById('mock-count').value
    const out = document.getElementById('mock-output')
    out.innerHTML = loadingHTML('Generating mock test...')
    try {
      const res = await callFlow('questions', { topic, count: parseInt(count), _apiKey: STATE.apiKey })
      let questions = (res.questions || []).slice(0, parseInt(count))
      if (!questions.length) { out.innerHTML = errorHTML('Failed to generate questions.'); return }
      const startTime = Date.now()
      out.innerHTML = `<div id="mock-timer" class="text-right text-sm font-semibold mb-2" style="color:#A5B4FC">⏱ 0:00</div>`
      const timerDiv = document.getElementById('mock-timer')
      const timer = setInterval(() => {
        const sec = Math.floor((Date.now() - startTime) / 1000)
        timerDiv.textContent = `⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`
      }, 1000)
      const quizContainer = document.createElement('div')
      out.appendChild(quizContainer)
      renderQuiz(quizContainer, questions, topic)
      addHistory({ id: Date.now(), tool: 'AI Mock Test', input: topic + ' (' + count + ' Qs)', output: questions.length + ' questions', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('ai-mock-test')
    } catch (e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // SMART REVISION
  // ═══════════════════════════════════════════════════════════
  function renderSmartRevision(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🧠 Smart Revision Plan</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get an AI-curated revision plan based on your weak areas.</p>
      ${inputArea({ id: 'rev-topics', placeholder: 'Enter weak topics (e.g. Geometry, Synonyms, Indian History)...', btn: 'Generate Plan', onSubmit: 'generateRevisionPlan()' })}
      <div id="rev-output"></div>
    </div>`
  }

  async function generateRevisionPlan() {
    const topics = document.getElementById('rev-topics').value.trim()
    if (!topics) return showToast('Please enter weak topics', 'error')
    const out = document.getElementById('rev-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create a structured 7-day smart revision plan for an SSC CGL aspirant focusing on these weak areas: ${topics}. 
      Include: daily time allocation, specific subtopics, practice suggestions, and tips. Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Smart Revision', input: topics, output: 'Plan generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch (e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // QUANT SOLVER
  // ═══════════════════════════════════════════════════════════
  function renderQuantSolver(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🔢 Quant Solver</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Paste any Quant problem and get step-by-step solutions with shortcuts.</p>
      ${inputArea({ id: 'quant-input', placeholder: 'Paste your quantitative problem here...', btn: 'Solve', onSubmit: 'solveQuant()', type: 'textarea', rows: 3 })}
      <div style="margin-top:4px">${surpriseBtn('quant-solver','quant-input','solveQuant')}</div>
      <div id="quant-output"></div>
    </div>`
  }

  async function solveQuant() {
    const raw = document.getElementById('quant-input').value.trim()
    if (!raw) showToast('🎲 Generating a surprise quant problem…', 'info')
    const out = document.getElementById('quant-output')
    out.innerHTML = loadingHTML('Solving...')
    try {
      const prompt = raw
        ? `Solve this SSC CGL Quantitative Aptitude problem:

PROBLEM: ${raw}

Provide:
1. Topic and Problem Analysis
2. BEST & FASTEST SHORTCUT METHOD (do this first)
3. Detailed Step-by-Step Solution
4. Key Formula & Concept
5. Exam Speed Tips

Use normal math symbols (√x, a/b, 25 × 4, x²). Format in clean HTML.`

        : `Provide a high-quality SSC CGL Quantitative Aptitude question with its complete solution.

Include:
- Question & Exam Source
- BEST & FASTEST SHORTCUT METHOD (first)
- Detailed Step-by-Step Solution
- Key Concept & Formula
- Exam Speed Tips

Use normal math symbols (√x, a/b, 25 × 4, x²). Format in clean HTML.`

      const res = await callGeneric(prompt)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Quant Solver', input: (raw || 'Surprise problem').slice(0, 100), output: 'Solution provided', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('quant-solver')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // REASONING SOLVER
  // ═══════════════════════════════════════════════════════════
  function renderReasoningSolver(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🧩 Reasoning Solver</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Solve any reasoning problem with step-by-step explanation.</p>
      ${inputArea({ id: 'reason-input', placeholder: 'Paste your reasoning problem here...', btn: 'Solve', onSubmit: 'solveReasoning()', type: 'textarea', rows: 3 })}
      <div style="margin-top:4px">${surpriseBtn('reasoning-solver','reason-input','solveReasoning')}</div>
      <div id="reason-output"></div>
    </div>`
  }

  async function solveReasoning() {
    const raw = document.getElementById('reason-input').value.trim()
    if (!raw) showToast('🎲 Generating a surprise reasoning problem…', 'info')
    const out = document.getElementById('reason-output')
    out.innerHTML = loadingHTML()
    try {
      const prompt = raw
        ? `Solve this SSC CGL Reasoning problem:

PROBLEM: ${raw}

Provide:
1. Reasoning Category
2. FASTEST SHORTCUT APPROACH (first)
3. Step-by-Step Solution
4. Exam Speed Tips

Format in clean HTML.`

        : `Provide a high-quality SSC CGL Reasoning question with its complete solution.

Include:
- Question & Exam Source
- FASTEST SHORTCUT APPROACH (first)
- Step-by-Step Solution
- Exam Speed Tips

Format in clean HTML.`

      const res = await callGeneric(prompt)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Reasoning Solver', input: (raw || 'Surprise problem').slice(0, 100), output: 'Solution provided', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('reasoning-solver')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // PARA JUMBLE
  // ═══════════════════════════════════════════════════════════
  function renderParaJumble(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🔀 Para-Jumble Solver</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Arrange jumbled sentences or get practice paragraphs.</p>
      ${inputArea({ id: 'pj-input', placeholder: 'Paste jumbled sentences (one per line) or ask for practice...', btn: 'Solve', onSubmit: 'solveParaJumble()', type: 'textarea', rows: 4 })}
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px">
        <button onclick="generateParaJumble()" class="text-sm text-primary hover:underline">Generate a practice para-jumble →</button>
        ${surpriseBtn('para-jumble-solver','pj-input','generateParaJumble')}
      </div>
      <div id="pj-output"></div>
    </div>`
  }

  async function solveParaJumble() {
    const input = document.getElementById('pj-input').value.trim()
    if (!input) return showToast('Please enter sentences', 'error')
    const out = document.getElementById('pj-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Solve this para-jumble exercise for SSC CGL English. Arrange the sentences in the correct order and explain the logic: ${input}
      Format in clean HTML showing: correct order, sequence reasoning, and tips.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Para Jumble', input: input.slice(0, 100), output: 'Solved', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function generateParaJumble() {
    const out = document.getElementById('pj-output')
    out.innerHTML = loadingHTML('Generating exercise...')
    try {
      const res = await callGeneric(todayContext() + `Use Google Search to find a real para-jumble question that actually appeared in an SSC CGL, SSC CHSL, or SSC MTS exam. Show: 1) The exact jumbled sentences (A-E) from the original paper with exam source and year, 2) The correct sequence with full explanation. NEVER fabricate sentences — use only real exam para-jumbles. Format in clean HTML.`, 'html', true)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Para Jumble', input: 'Random exercise', output: 'Exercise generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // VOCABULARY
  // ═══════════════════════════════════════════════════════════
  function renderVocabulary(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📖 Vocabulary Builder</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Deep-dive into any English word with exam-relevant context.</p>
      ${inputArea({ id: 'vocab-input', placeholder: 'Enter a word (e.g. Ephemeral, Garrulous, Munificent)...', btn: 'Learn', onSubmit: 'buildVocabulary()' })}
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px">
        <button onclick="learnRandomWord()" class="text-sm text-primary hover:underline">Learn a random SSC word →</button>
        ${surpriseBtn('vocabulary','vocab-input','buildVocabulary')}
      </div>
      <div id="vocab-output"></div>
    </div>`
  }

  async function buildVocabulary() {
    const raw = document.getElementById('vocab-input').value.trim()
    if (!raw) { learnRandomWord(); return }
    const out = document.getElementById('vocab-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Provide a comprehensive analysis of the word "${raw}" for SSC CGL English preparation:
      1) Meaning and definition, 2) Etymology/origin, 3) Synonyms (5+), 4) Antonyms (5+), 5) Usage in an SSC-style sentence, 
      6) Word family (noun/verb/adjective forms), 7) Mnemonic to remember it, 8) Common SSC CGL usage context.
      Format in clean, visually clear HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Vocabulary Builder', input: raw, output: 'Word analysis', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('vocabulary')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function learnRandomWord() {
    const out = document.getElementById('vocab-output')
    out.innerHTML = loadingHTML()
    const randomWords = ['Eloquent', 'Tenacious', 'Pragmatic', 'Obstinate', 'Ameliorate', 'Ephemeral', 'Parsimonious', 'Vociferous', 'Magnanimous', 'Sycophant']
    const word = randomWords[Math.floor(Math.random() * randomWords.length)]
    document.getElementById('vocab-input').value = word
    try {
      const res = await callGeneric(todayContext() + `Provide a comprehensive analysis of the word "${word}" for SSC CGL English preparation:
      1) Meaning, 2) Synonyms (5+), 3) Antonyms (5+), 4) Usage in an SSC-style sentence, 5) Mnemonic to remember it.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Vocabulary Builder', input: word + ' (random)', output: 'Word analysis', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('vocabulary')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // WRITING ASSISTANT
  // ═══════════════════════════════════════════════════════════
  function renderWritingAssistant(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">✍️ Writing Assistant</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get grammar corrections and writing improvements.</p>
      ${inputArea({ id: 'write-input', placeholder: 'Paste your text here for grammar check and improvement...', btn: 'Improve', onSubmit: 'improveWriting()', type: 'textarea', rows: 5 })}
      <div id="write-output"></div>
    </div>`
  }

  async function improveWriting() {
    const text = document.getElementById('write-input').value.trim()
    if (!text) return showToast('Please enter text to improve', 'error')
    const out = document.getElementById('write-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `As an SSC CGL English expert, analyse this text: "${text}"
      Provide: 1) Grammar corrections with explanations, 2) Improved version, 3) Vocabulary enhancements, 4) Common mistakes identified, 5) Tips for SSC CGL English section.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Writing Assistant', input: text.slice(0, 100), output: 'Writing improved', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // ESSAY SCORER
  // ═══════════════════════════════════════════════════════════
  function renderEssayScorer(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">⭐ Essay Scorer</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get AI feedback and score on your essays.</p>
      <div class="space-y-3">
        <input type="text" id="essay-topic" placeholder="Essay topic (e.g. India's Digital Revolution)..." class="w-full px-4 py-2.5 text-sm">
        <textarea id="essay-text" placeholder="Paste your essay here..." rows="8" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
        <button onclick="scoreEssay()" class="btn-primary w-full py-3 text-sm font-semibold">
          <i class="fas fa-star mr-2"></i>Score My Essay
        </button>
      </div>
      <div id="essay-output"></div>
    </div>`
  }

  async function scoreEssay() {
    const topic = document.getElementById('essay-topic').value.trim()
    const text = document.getElementById('essay-text').value.trim()
    if (!text) return showToast('Please write your essay', 'error')
    const out = document.getElementById('essay-output')
    out.innerHTML = loadingHTML('Evaluating...')
    try {
      const res = await callGeneric(todayContext() + `Evaluate this essay on "${topic || 'the given topic'}" for SSC CGL preparation:
      Essay: ${text}
      Provide: 1) Overall score out of 10 with breakdown (Content/8, Language/10, Structure/7, Examples/5), 
      2) Detailed feedback on strengths, 3) Areas to improve, 4) Specific grammar corrections, 5) Suggested improvements.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Essay Scorer', input: (topic || 'Essay') + ' – ' + text.slice(0, 60), output: 'Essay scored', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // RC PRACTICE
  // ═══════════════════════════════════════════════════════════
  function renderRCPractice(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">👓 Reading Comprehension</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Practice RC with AI-generated passages and questions.</p>
      <div class="card-dark p-5 space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Topic/Genre</label>
          <input type="text" id="rc-topic" placeholder="e.g. Environment, Economy, Science, History..." class="w-full px-4 py-2.5 text-sm">
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button onclick="generateRC()" class="btn-primary py-3 px-6 text-sm font-semibold" style="flex:1">
            <i class="fas fa-glasses mr-2"></i>Generate RC Exercise
          </button>
          ${surpriseBtn('rc-practice','rc-topic','generateRC')}
        </div>
      </div>
      <div id="rc-output"></div>
    </div>`
  }

  async function generateRC() {
    const topic = document.getElementById('rc-topic').value.trim() || 'Mixed general topic'
    const out = document.getElementById('rc-output')
    out.innerHTML = loadingHTML('Generating RC passage...')
    try {
      const res = await callGeneric(todayContext() + `Use Google Search to find a real Reading Comprehension passage with questions that appeared in an SSC CGL, SSC CHSL, or SSC MTS exam${topic && topic !== 'Mixed general topic' ? ` on the topic of "${topic}"` : ''}. YEAR PRIORITY: search for the most recent year first (current year), then previous year, then earlier years. Show: 1) The original passage (exact text from the paper), 2) The MCQ questions from that paper (with 4 options each), 3) Answers with explanations, 4) Exam source and year (cite the most recent available). NEVER create a new passage — use only real past paper RCs. Format in clean HTML with the passage in a highlighted box.`, 'html', true)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'RC Practice', input: topic, output: 'RC passage generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // CURRENT AFFAIRS
  // ═══════════════════════════════════════════════════════════
  function renderCurrentAffairs(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📰 Current Affairs</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get exam-relevant current affairs on any topic.</p>
      ${inputArea({ id: 'ca-input', placeholder: 'Enter a topic (e.g. Union Budget 2025, G20, ISRO missions)...', btn: 'Get Notes', onSubmit: 'getCurrentAffairs()' })}
      <div style="margin-top:-4px">${surpriseBtn('current-affairs','ca-input','getCurrentAffairs')}</div>
      <div class="flex flex-wrap gap-2" id="ca-chips">
        ${['Union Budget', 'Indian Economy', 'Space Missions', 'International Relations', 'Sports Awards', 'Government Schemes'].map(t => `
          <button onclick="quickCA('${t}')" class="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">${t}</button>
        `).join('')}
      </div>
      <div id="ca-output"></div>
    </div>`
  }

  async function getCurrentAffairs() {
    const raw = document.getElementById('ca-input').value.trim()
    const topic = raw || 'a recent trending national or international event relevant to SSC CGL General Awareness (pick something important and recent)'
    if (!raw) showToast('🎲 Fetching a surprise current affairs topic…', 'info')
    const out = document.getElementById('ca-output')
    out.innerHTML = loadingHTML()
    try {
      const curYear = new Date(TODAY.iso).getFullYear() || new Date().getFullYear()
      const prevYear = curYear - 1
      const res = await callGeneric(todayContext() + `Provide comprehensive current affairs notes on "${topic}" for SSC CGL preparation (as of ${TODAY.full}). YEAR PRIORITY: Use ${curYear} data FIRST (most important, search this first), then ${prevYear} data, then earlier years only as background context.
      Focus on: key facts from ${curYear}/${prevYear}, important dates/numbers, exam-relevant questions, static GK connections.
      Format in clean HTML with bullet points and highlight exam-important facts. Always cite the year/source of each fact.`, 'html', true)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Current Affairs', input: (raw || 'Surprise topic'), output: 'Notes generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('current-affairs')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function quickCA(topic) {
    document.getElementById('ca-input').value = topic
    getCurrentAffairs()
  }

  // ═══════════════════════════════════════════════════════════
  // STATIC GK
  // ═══════════════════════════════════════════════════════════
  function renderStaticGK(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🌍 Static GK</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Quick revision notes on any Static GK topic.</p>
      ${inputArea({ id: 'gk-input', placeholder: 'Enter a topic (e.g. Indian Rivers, National Parks, Constitutional Articles)...', btn: 'Get Notes', onSubmit: 'getStaticGK()' })}
      <div style="margin-top:-4px">${surpriseBtn('static-gk','gk-input','getStaticGK')}</div>
      <div class="flex flex-wrap gap-2">
        ${['Indian Geography', 'History', 'Polity', 'Economics', 'Science & Tech', 'Awards & Prizes'].map(t => `
          <button onclick="quickGK('${t}')" class="chip chip-primary cursor-pointer hover:opacity-80 transition-opacity">${t}</button>
        `).join('')}
      </div>
      <div id="gk-output"></div>
    </div>`
  }

  async function getStaticGK() {
    const raw = document.getElementById('gk-input').value.trim()
    const topic = raw || 'a random static GK topic from SSC CGL syllabus (pick something from: History, Geography, Polity, Economy, Science & Tech, or Awards)'
    if (!raw) showToast('🎲 Generating a surprise GK topic…', 'info')
    const out = document.getElementById('gk-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create comprehensive static GK revision notes on "${topic}" for SSC CGL:
      Include: key facts, important figures/data, exam-tested questions, and memory tips.
      Format in clean HTML with tables where appropriate.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Static GK', input: (raw || 'Surprise topic'), output: 'Notes generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function quickGK(topic) {
    document.getElementById('gk-input').value = topic
    getStaticGK()
  }

  // ═══════════════════════════════════════════════════════════
  // CONCEPT EXPLAINER
  // ═══════════════════════════════════════════════════════════
  function renderConceptExplainer(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">💡 Concept Explainer</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get simple, clear explanations of any concept.</p>
      ${inputArea({ id: 'concept-input', placeholder: 'Enter a concept (e.g. Compound Interest, Blood Relations, Tenses)...', btn: 'Explain', onSubmit: 'explainConcept()' })}
      <div style="margin-top:4px">${surpriseBtn('concept-explainer','concept-input','explainConcept')}</div>
      <div id="concept-output"></div>
    </div>`
  }

  async function explainConcept() {
    const raw = document.getElementById('concept-input').value.trim()
    const concept = raw || 'a random SSC CGL concept (pick something interesting from Quant, Reasoning, or English sections)'
    if (!raw) showToast('🎲 Picking a surprise concept…', 'info')
    const out = document.getElementById('concept-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callFlow('explain', { concept, _apiKey: STATE.apiKey })
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.explanation, eid)
      addHistory({ id: Date.now(), tool: 'Concept Explainer', input: (raw || 'Surprise concept'), output: 'Explanation provided', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // COMPARE CONTRAST
  // ═══════════════════════════════════════════════════════════
  function renderCompareContrast(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">⚖️ Compare & Contrast</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get a clear comparison between two concepts or topics.</p>
      <div class="card-dark p-5 space-y-3">
        <input type="text" id="cmp-a" placeholder="First topic (e.g. Lok Sabha)..." class="w-full px-4 py-2.5 text-sm">
        <input type="text" id="cmp-b" placeholder="Second topic (e.g. Rajya Sabha)..." class="w-full px-4 py-2.5 text-sm">
        <button onclick="compareTopics()" class="btn-primary w-full py-3 text-sm font-semibold">
          <i class="fas fa-balance-scale mr-2"></i>Compare
        </button>
      </div>
      <div id="cmp-output"></div>
    </div>`
  }

  async function compareTopics() {
    const a = document.getElementById('cmp-a').value.trim()
    const b = document.getElementById('cmp-b').value.trim()
    if (!a || !b) return showToast('Please enter both topics', 'error')
    const out = document.getElementById('cmp-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create a comprehensive comparison table for SSC CGL between "${a}" and "${b}":
      Include: definition, key features, similarities, differences, exam-relevant facts, and memory tips.
      Use an HTML table format for the comparison.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Compare & Contrast', input: a + ' vs ' + b, output: 'Comparison generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // ACRONYMS
  // ═══════════════════════════════════════════════════════════
  function renderAcronyms(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🔤 Acronym Explainer</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Decode important acronyms and abbreviations for SSC CGL.</p>
      ${inputArea({ id: 'acro-input', placeholder: 'Enter an acronym (e.g. NABARD, SEBI, IRDAI, NATO)...', btn: 'Decode', onSubmit: 'explainAcronym()' })}
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px">
        <button onclick="listImportantAcronyms()" class="text-sm text-primary hover:underline">Show top 20 SSC CGL acronyms →</button>
        ${surpriseBtn('acronym-explainer','acro-input','explainAcronym')}
      </div>
      <div id="acro-output"></div>
    </div>`
  }

  async function explainAcronym() {
    const raw = document.getElementById('acro-input').value.trim()
    const acronym = raw || 'a random important acronym from the SSC CGL General Awareness syllabus (pick a financial, scientific, or governmental body acronym)'
    if (!raw) showToast('🎲 Picking a surprise acronym…', 'info')
    const out = document.getElementById('acro-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Explain the acronym "${acronym}" for SSC CGL:
      1) Full form, 2) What it does/represents, 3) When established, 4) Headquarters (if applicable), 5) Key exam-relevant facts.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Acronyms', input: (raw || 'Surprise acronym'), output: 'Acronym explained', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function listImportantAcronyms() {
    const out = document.getElementById('acro-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `List the 25 most important acronyms for SSC CGL General Awareness in a clean HTML table with columns: Acronym, Full Form, Brief Note.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Acronyms', input: 'Top 25 SSC CGL acronyms', output: 'List generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // CA LINKER
  // ═══════════════════════════════════════════════════════════
  function renderCALinker(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🔗 Current Affairs Linker</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Link current events to static GK for deeper understanding.</p>
      ${inputArea({ id: 'link-input', placeholder: 'Enter a current affairs article/topic...', btn: 'Link to Static', onSubmit: 'linkCAtoStatic()', type: 'textarea', rows: 3 })}
      <div style="margin-top:4px">${surpriseBtn('ca-linker','link-input','linkCAtoStatic')}</div>
      <div id="link-output"></div>
    </div>`
  }

  async function linkCAtoStatic() {
    const raw = document.getElementById('link-input').value.trim()
    const article = raw || 'a recent important national or international current affairs event that has deep connections to static GK (choose something interesting and exam-relevant)'
    if (!raw) showToast('🎲 Picking a surprise current affairs link…', 'info')
    const out = document.getElementById('link-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `For this current affairs topic: "${article}"
      Provide: 1) Summary of the current event, 2) Connections to SSC CGL static GK topics, 3) Historical background, 4) Related previous year questions, 5) Key facts to remember.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'CA Linker', input: (raw || 'Surprise event').slice(0, 100), output: 'CA linked to static GK', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('ca-linker')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // FLASHCARDS
  // ═══════════════════════════════════════════════════════════
  let flashcards = [], fcIndex = 0, fcFlipped = false

  function renderFlashcards(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🗂️ Flashcards</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Generate and study active recall flashcards.</p>
      ${inputArea({ id: 'fc-topic', placeholder: 'Enter a topic (e.g. Indian Rivers, Idioms, Percentage Formulas)...', btn: 'Create Cards', onSubmit: 'generateFlashcards()' })}
      <div style="margin-top:4px">${surpriseBtn('flashcards','fc-topic','generateFlashcards')}</div>
      <div id="fc-output"></div>
    </div>`
  }

  async function generateFlashcards() {
    const raw = document.getElementById('fc-topic').value.trim()
    const topic = raw || 'a random SSC CGL topic (pick something from: Indian History, Geography, Polity, Vocabulary, Formulas, or Science)'
    if (!raw) showToast('🎲 Creating surprise flashcards…', 'info')
    const out = document.getElementById('fc-output')
    out.innerHTML = loadingHTML('Creating flashcards...')
    try {
      const res = await callGeneric(todayContext() + `Create 10 flashcards on "${topic}" for SSC CGL. Return as JSON array: [{"front": "question/term", "back": "answer/definition"}]`, 'json')
      let cards = []
      try {
        const raw = res.result.trim()
        cards = JSON.parse(raw)
      } catch { cards = [] }
      if (!cards.length) { out.innerHTML = errorHTML('Could not generate flashcards'); return }
      flashcards = cards; fcIndex = 0; fcFlipped = false
      renderFlashcardPlayer(out)
      addHistory({ id: Date.now(), tool: 'Flashcards', input: (raw || 'Surprise topic'), output: cards.length + ' cards', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  function renderFlashcardPlayer(container) {
    const card = flashcards[fcIndex]
    container.innerHTML = `
    <div class="animate-fade-in space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-slate-500">Card ${fcIndex+1} of ${flashcards.length}</span>
        <span class="chip chip-primary">Click to flip</span>
      </div>
      <div class="card-flip h-48 cursor-pointer" onclick="flipCard()">
        <div class="card-flip-inner w-full h-full rounded-2xl ${fcFlipped ? 'flipped' : ''}" id="fc-inner">
          <div class="card-face absolute inset-0 rounded-2xl flex items-center justify-center p-6" style="background:linear-gradient(135deg,#0EA5E9,#8B5CF6)">
            <p class="text-center font-semibold text-lg text-white">${card.front}</p>
          </div>
          <div class="card-back card-face absolute inset-0 card-dark rounded-2xl flex items-center justify-center p-6">
            <p class="text-center text-slate-300 font-medium">${card.back}</p>
          </div>
        </div>
      </div>
      <div class="flex gap-3 justify-center">
        <button onclick="prevCard()" ${fcIndex === 0 ? 'disabled' : ''} class="btn-secondary px-5 py-2 text-sm disabled:opacity-40">
          <i class="fas fa-arrow-left mr-1"></i> Prev
        </button>
        <button onclick="nextCard()" ${fcIndex === flashcards.length-1 ? 'disabled' : ''} class="btn-primary px-5 py-2 text-sm disabled:opacity-40">
          Next <i class="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>`
  }

  function flipCard() {
    fcFlipped = !fcFlipped
    document.getElementById('fc-inner')?.classList.toggle('flipped')
  }

  function nextCard() {
    if (fcIndex < flashcards.length - 1) { fcIndex++; fcFlipped = false; renderFlashcardPlayer(document.getElementById('fc-output')) }
  }
  function prevCard() {
    if (fcIndex > 0) { fcIndex--; fcFlipped = false; renderFlashcardPlayer(document.getElementById('fc-output')) }
  }

  // ═══════════════════════════════════════════════════════════
  // MIND MAP
  // ═══════════════════════════════════════════════════════════
  function renderMindMap(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🗺️ Mind Map Generator</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get structured mind maps to visualise complex topics.</p>
      ${inputArea({ id: 'mm-input', placeholder: 'Enter a topic (e.g. Indian Constitution, Profit & Loss)...', btn: 'Create Map', onSubmit: 'generateMindMap()' })}
      <div style="margin-top:4px">${surpriseBtn('mind-map-generator','mm-input','generateMindMap')}</div>
      <div id="mm-output"></div>
    </div>`
  }

  async function generateMindMap() {
    const raw = document.getElementById('mm-input').value.trim()
    const topic = raw || 'a random SSC CGL topic suitable for a mind map (pick from: Indian Polity, History, Science, Maths concepts, or Economics)'
    if (!raw) showToast('🎲 Building a surprise mind map…', 'info')
    const out = document.getElementById('mm-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create a detailed mind map for "${topic}" for SSC CGL preparation. 
      Format it as a well-structured HTML mind map with the central topic in the centre, main branches, and sub-branches. 
      Use colored divs/boxes to represent the hierarchy visually. Make it clear and easy to study.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Mind Map', input: (raw || 'Surprise topic'), output: 'Mind map created', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // MNEMONICS
  // ═══════════════════════════════════════════════════════════
  function renderMnemonics(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🪄 Mnemonic Generator</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Create memorable mnemonics to remember any list or concept.</p>
      ${inputArea({ id: 'mnem-input', placeholder: 'Enter what you need to remember (e.g. Planet names in order, Types of soil)...', btn: 'Create Mnemonic', onSubmit: 'generateMnemonic()' })}
      <div style="margin-top:4px">${surpriseBtn('mnemonic-generator','mnem-input','generateMnemonic')}</div>
      <div id="mnem-output"></div>
    </div>`
  }

  async function generateMnemonic() {
    const raw = document.getElementById('mnem-input').value.trim()
    const input = raw || 'a random list or concept from the SSC CGL syllabus that is commonly hard to memorise (e.g. Constitutional Schedules, Vitamins, Indian dance forms, Trigonometry identities)'
    if (!raw) showToast('🎲 Generating a surprise mnemonic…', 'info')
    const out = document.getElementById('mnem-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create 2-3 creative, memorable mnemonics to help an SSC CGL aspirant remember: "${input}"
      Include: acronym-based, story-based, and visual mnemonics if applicable. Explain how each mnemonic works.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Mnemonics', input: (raw || 'Surprise topic').slice(0, 100), output: 'Mnemonics created', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARIZER
  // ═══════════════════════════════════════════════════════════
  function renderSummarizer(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📋 Document Summarizer</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Paste any text and get a concise summary with key points.</p>
      ${inputArea({ id: 'summ-input', placeholder: 'Paste your notes, article, or text here...', btn: 'Summarize', onSubmit: 'summarizeDocument()', type: 'textarea', rows: 6 })}
      <div id="summ-output"></div>
    </div>`
  }

  async function summarizeDocument() {
    const text = document.getElementById('summ-input').value.trim()
    if (!text) return showToast('Please enter text to summarize', 'error')
    const out = document.getElementById('summ-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callFlow('summarize', { text, _apiKey: STATE.apiKey })
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.summary, eid)
      addHistory({ id: Date.now(), tool: 'Summarizer', input: text.slice(0, 80) + '...', output: 'Summary generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // REVISION SHEET
  // ═══════════════════════════════════════════════════════════
  function renderRevisionSheet(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📃 Revision Sheet Generator</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Get a quick-reference cheatsheet on any topic.</p>
      ${inputArea({ id: 'rev-sheet-input', placeholder: 'Enter topics (e.g. Trigonometry formulas, Prepositions, Presidents of India)...', btn: 'Create Sheet', onSubmit: 'generateRevisionSheet()' })}
      <div style="margin-top:4px">${surpriseBtn('revision-sheet','rev-sheet-input','generateRevisionSheet')}</div>
      <div id="rev-sheet-output"></div>
    </div>`
  }

  async function generateRevisionSheet() {
    const raw = document.getElementById('rev-sheet-input').value.trim()
    const topics = raw || 'a random high-value SSC CGL topic (pick something frequently tested: Formulas, Grammar rules, GK facts, or Polity)'
    if (!raw) showToast('🎲 Creating a surprise revision sheet…', 'info')
    const out = document.getElementById('rev-sheet-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Create a concise, print-ready revision sheet for "${topics}" for SSC CGL.
      Include: formulas, key facts, shortcuts, important dates/numbers, and common question types.
      Format in clean, dense HTML suitable for quick revision – use tables and structured lists.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Revision Sheet', input: (raw || 'Surprise topic'), output: 'Sheet created', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('revision-sheet')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // TTS
  // ═══════════════════════════════════════════════════════════
  function renderTTS(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">🎧 Audio Revision</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Listen to your notes with text-to-speech.</p>
      ${inputArea({ id: 'tts-input', placeholder: 'Paste text to convert to audio...', btn: 'Listen', onSubmit: 'playTTS()', type: 'textarea', rows: 4 })}
      <div id="tts-output"></div>
    </div>`
  }

  async function playTTS() {
    const text = document.getElementById('tts-input').value.trim()
    if (!text) return showToast('Please enter text', 'error')
    const out = document.getElementById('tts-output')
    out.innerHTML = loadingHTML('Converting to audio...')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, _apiKey: STATE.apiKey })
      })
      const data = await res.json()
      if (data.useBrowserTTS || !data.audioUri) {
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(text)
          utt.lang = 'en-IN'; utt.rate = 0.85; utt.pitch = 1
          window.speechSynthesis.speak(utt)
          out.innerHTML = `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:16px;color:#6EE7B7;font-size:14px">
            <i class="fas fa-volume-up mr-2"></i> Playing via browser speech synthesis...
            <button onclick="window.speechSynthesis.cancel()" class="ml-3 text-red-500 hover:underline">Stop</button>
          </div>`
        } else {
          out.innerHTML = errorHTML('TTS not available in this browser')
        }
      } else {
        out.innerHTML = `<audio class="w-full mt-2 rounded-lg" controls autoplay src="${data.audioUri}"></audio>`
      }
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // CHAT COMPONENTS (AI Tutor, Study Buddy, Debate, Interview)
  // ═══════════════════════════════════════════════════════════
  function copyMsgText(btn) {
    const bubble = btn.closest('.chat-bubble-user') || btn.closest('.chat-bubble-model')
    if (!bubble) return
    const prose = bubble.querySelector('.prose') || bubble
    const text = prose.innerText || prose.textContent
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Message copied to clipboard!', 'success')
    }).catch(() => {
      showToast('📋 Message copied!', 'success')
    })
  }

  function toggleEditMsg(btn) {
    const bubble = btn.closest('.chat-bubble-user') || btn.closest('.chat-bubble-model')
    if (!bubble) return
    const prose = bubble.querySelector('.prose')
    if (!prose) return
    const isEditing = prose.isContentEditable
    if (isEditing) {
      prose.contentEditable = 'false'
      prose.classList.remove('output-edit-box')
      btn.classList.remove('active')
      showToast('✏️ Message edits saved!', 'success')
    } else {
      prose.contentEditable = 'true'
      prose.classList.add('output-edit-box')
      prose.focus()
      btn.classList.add('active')
      showToast('✏️ Editing message. Edit text directly.', 'info')
    }
  }

  function chatUI(title, icon, desc, historyKey, type, inputId, btnLabel) {
    const history = STATE[historyKey]
    return `
    <div style="display:flex;flex-direction:column;height:72vh;width:100%">
      <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle)">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">${icon}</span>
            <h2 class="font-headline" style="font-size:16px;font-weight:800;color:var(--text-primary)">${title}</h2>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:2px;padding-left:26px">${desc}</p>
        </div>
        <button onclick="clearChat('${historyKey}')" class="btn-ghost" style="font-size:11.5px;padding:6px 10px;color:var(--text-muted)">
          <i class="fas fa-trash" style="font-size:10px"></i> Clear
        </button>
      </div>
      <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 2px" id="chat-${type}">
        ${history.length === 0
          ? `<div style="display:flex;align-items:center;justify-content:center;flex:1;color:var(--text-muted);font-size:13px">
               <div style="text-align:center">
                 <i class="fas fa-comments" style="font-size:28px;margin-bottom:10px;opacity:0.3;display:block"></i>
                 Start the conversation…
               </div>
             </div>`
          : history.map(msg => `
            <div style="display:flex;justify-content:${msg.role === 'user' ? 'flex-end' : 'flex-start'}" class="animate-fade-in">
              <div style="max-width:78%;padding:10px 14px" class="${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-model'}">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:5px">
                  <span style="font-size:10.5px;font-weight:700;color:${msg.role === 'user' ? '#38BDF8' : 'var(--text-muted)'}">
                    ${msg.role === 'user' ? 'You' : title}
                  </span>
                  <div style="display:flex;align-items:center;gap:4px">
                    <button onclick="copyMsgText(this)" class="card-action-btn" style="padding:1px 6px;font-size:9.5px" title="Copy message">
                      <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="toggleEditMsg(this)" class="card-action-btn" style="padding:1px 6px;font-size:9.5px" title="Edit message">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                <div class="prose" style="font-size:13px">${msg.role === 'user' ? msg.content[0].text : sanitizeAIHTML(msg.content[0].text)}</div>
              </div>
            </div>
          `).join('')}
        <div id="chat-end-${type}"></div>
      </div>
      <div style="margin-top:10px;display:flex;gap:6px">
        <input type="text" id="${inputId}" placeholder="Type your message…"
          style="flex:1;padding:10px 14px;font-size:13.5px;border-radius:8px"
          onkeydown="if(event.key==='Enter') sendChat('${historyKey}', '${type}', '${inputId}')">
        <button type="button" onclick="copyInputText('${inputId}')" class="card-action-btn" style="padding:9px 12px" title="Copy input text">
          <i class="fas fa-copy"></i> Copy
        </button>
        <button type="button" onclick="clearOrEditInput('${inputId}')" class="card-action-btn" style="padding:9px 12px" title="Clear/Edit input text">
          <i class="fas fa-pen-square"></i> Clear/Edit
        </button>
        <button onclick="sendChat('${historyKey}', '${type}', '${inputId}')"
          class="btn-primary" style="padding:10px 18px;flex-shrink:0">
          <i class="fas fa-paper-plane" style="font-size:12px"></i>
        </button>
    </div>`
  }

  function renderAITutor(el) { el.innerHTML = chatUI('AI Tutor', '👨‍🏫', 'Expert SSC CGL tutor – ask anything about syllabus topics', 'aiTutorHistory', 'tutor', 'tutor-input', 'Ask') }
  function renderStudyBuddy(el) { el.innerHTML = chatUI('Study Buddy', '🤝', 'Your motivational buddy for stress & encouragement', 'studyBuddyHistory', 'buddy', 'buddy-input', 'Chat') }
  function renderDebateSimulator(el) { el.innerHTML = chatUI('Debate Simulator', '🗣️', 'Sharpen your arguments – AI takes the opposite stance', 'debateHistory', 'debate', 'debate-input', 'Argue') }
  function renderInterviewSim(el) {
    const html = chatUI('Interview Simulator', '👔', 'Government job interview practice with Mr. Sharma', 'interviewHistory', 'interview', 'interview-input', 'Respond')
    el.innerHTML = html
    if (STATE.interviewHistory.length === 0) {
      setTimeout(() => sendChat('interviewHistory', 'interview', 'interview-input', 'Start'), 300)
    }
  }

  function clearChat(historyKey) {
    STATE[historyKey] = []
    saveState()
    const toolMap = { aiTutorHistory: 'ai-tutor', studyBuddyHistory: 'study-buddy', debateHistory: 'debate-simulator', interviewHistory: 'interview-simulator' }
    switchTool(toolMap[historyKey])
  }

  async function sendChat(historyKey, type, inputId, override) {
    const inputEl = document.getElementById(inputId)
    const text = override || inputEl?.value?.trim()
    if (!text) return
    if (inputEl) inputEl.value = ''

    const newHistory = [...STATE[historyKey], { role: 'user', content: [{ text }] }]
    STATE[historyKey] = newHistory
    saveState()

    const chatEl = document.getElementById(`chat-${type}`)
    const chatBubble = (msg) => `
      <div style="display:flex;justify-content:${msg.role === 'user' ? 'flex-end' : 'flex-start'}" class="animate-fade-in">
        <div style="max-width:78%;padding:10px 14px" class="${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-model'}">
          <div style="font-size:10.5px;font-weight:700;margin-bottom:5px;color:${msg.role === 'user' ? '#38BDF8' : 'var(--text-muted)'}">
            ${msg.role === 'user' ? 'You' : type.charAt(0).toUpperCase()+type.slice(1)}
          </div>
          <div class="prose" style="font-size:13px">${msg.role === 'user' ? msg.content[0].text : sanitizeAIHTML(msg.content[0].text)}</div>
        </div>
      </div>`

    if (chatEl) {
      chatEl.innerHTML = newHistory.map(chatBubble).join('') + `<div style="padding:8px 0">${loadingHTML('Typing…')}</div>`
      chatEl.scrollTop = chatEl.scrollHeight
    }

    try {
      const reply = await callChat(type, newHistory)
      const finalHistory = [...newHistory, { role: 'model', content: [{ text: reply }] }]
      STATE[historyKey] = finalHistory
      saveState()
      if (chatEl) {
        chatEl.innerHTML = finalHistory.map(chatBubble).join('')
        chatEl.scrollTop = chatEl.scrollHeight
      }
    } catch(e) {
      if (chatEl) chatEl.innerHTML += errorHTML(e.message)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GK STORY WEAVER
  // ═══════════════════════════════════════════════════════════
  function renderGKStory(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📚 GK Story Weaver</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Learn GK through engaging stories – great for retention!</p>
      ${inputArea({ id: 'story-input', placeholder: 'Enter a GK topic (e.g. India\'s Space Programme, British Raj, Indian Rivers)...', btn: 'Weave Story', onSubmit: 'generateGKStory()' })}
      <div style="margin-top:4px">${surpriseBtn('gk-story-weaver','story-input','generateGKStory')}</div>
      <div id="story-output"></div>
    </div>`
  }

  async function generateGKStory() {
    const raw = document.getElementById('story-input').value.trim()
    const topic = raw || 'a random fascinating GK topic from Indian History, Science, or Geography that makes for a great story'
    if (!raw) showToast('🎲 Weaving a surprise story…', 'info')
    const out = document.getElementById('story-output')
    out.innerHTML = loadingHTML('Weaving a story...')
    try {
      const res = await callGeneric(todayContext() + `Create an engaging, easy-to-remember story about "${topic}" for SSC CGL aspirants.
      The story should: be factually accurate, weave in all key facts and dates naturally, have memorable characters or metaphors, and end with a "Key Facts" summary box.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'GK Story Weaver', input: (raw || 'Surprise topic'), output: 'Story generated', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // HOBBY CONNECTOR
  // ═══════════════════════════════════════════════════════════
  function renderHobbyConnector(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">❤️ Hobby Connector</h2>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:3px">Connect your hobbies to SSC CGL topics for interesting answers.</p>
      <div class="card-dark p-5 space-y-3">
        <input type="text" id="hobby-name" placeholder="Your hobby (e.g. Cricket, Cooking, Photography)..." class="w-full px-4 py-2.5 text-sm">
        <input type="text" id="hobby-topic" placeholder="GK topic to connect to (e.g. Geography, Science)..." class="w-full px-4 py-2.5 text-sm">
        <button onclick="connectHobby()" class="btn-primary w-full py-3 text-sm font-semibold">
          <i class="fas fa-heart mr-2"></i>Connect & Learn
        </button>
      </div>
      <div id="hobby-output"></div>
    </div>`
  }

  async function connectHobby() {
    const hobby = document.getElementById('hobby-name').value.trim()
    const topic = document.getElementById('hobby-topic').value.trim()
    if (!hobby) return showToast('Please enter your hobby', 'error')
    const out = document.getElementById('hobby-output')
    out.innerHTML = loadingHTML()
    try {
      const res = await callGeneric(todayContext() + `Connect the hobby "${hobby}" with SSC CGL topics ${topic ? 'especially ' + topic : '(General Awareness)'}.
      Create interesting connections, fun facts, and GK notes that a ${hobby} enthusiast would enjoy learning.
      Format in clean HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Hobby Connector', input: hobby + (topic ? ' → ' + topic : ''), output: 'Connections found', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // HISTORY LOGS
  // ═══════════════════════════════════════════════════════════
  function renderHistoryLogs(el) {
    const logs = STATE.historyLog
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:14px">
      <div class="flex items-center justify-between">
        <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📜 History & Logs</h2>
        <button onclick="clearHistory()" class="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-colors">
          <i class="fas fa-trash mr-1"></i>Clear All
        </button>
      </div>
      <p class="text-xs text-slate-500">Click any entry to view full details.</p>
      ${logs.length === 0 ? `<div class="text-center py-16 text-slate-500"><i class="fas fa-history text-4xl block mb-3" style="color:rgba(14,165,233,0.3)"></i><p>No history yet. Start using the tools!</p></div>` :
        logs.map(entry => `
          <div class="card-dark-sm p-4 cursor-pointer hover:border-sky-500/50 hover:shadow-sky-900/20 hover:shadow-lg transition-all group" onclick="openHistoryModal(${entry.id})">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="chip chip-primary">${entry.tool}</span>
                  <span class="text-xs text-slate-500">${new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <p class="text-sm text-slate-400 truncate"><span class="text-slate-600">Input:</span> ${entry.input}</p>
                <p class="text-sm text-slate-500 truncate"><span class="text-slate-600">Output:</span> ${entry.output?.slice(0, 80)}...</p>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex items-center gap-1 text-sky-400">
                <i class="fas fa-eye text-sm"></i>
                <span class="text-xs">View</span>
              </div>
            </div>
          </div>
        `).join('')}
    </div>`
  }

  function clearHistory() {
    if (confirm('Clear all history?')) {
      STATE.historyLog = []
      saveState()
      delete STATE.toolCache['history-logs']
      switchTool('history-logs')
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BOOKMARKS SECTION
  // ═══════════════════════════════════════════════════════════
  function renderBookmarks(el) {
    const bkms = STATE.bookmarks
    const grouped = {}
    bkms.forEach(b => {
      if (!grouped[b.tool]) grouped[b.tool] = []
      grouped[b.tool].push(b)
    })

    el.innerHTML = `
    <div class="w-full space-y-5 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📌 Bookmarks</h2>
          <p class="text-xs text-slate-500 mt-0.5">Saved responses for quick revision. Click to open, unbookmark to remove.</p>
        </div>
        ${bkms.length > 0 ? `<button onclick="clearAllBookmarks()" class="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-colors"><i class="fas fa-trash mr-1"></i>Clear All</button>` : ''}
      </div>

      ${bkms.length === 0 ? `
        <div class="text-center py-20 text-slate-500">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style="background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.15)">
            <i class="fas fa-bookmark text-2xl text-sky-400/40"></i>
          </div>
          <p class="font-medium text-slate-400 mb-1">No bookmarks yet</p>
          <p class="text-sm text-slate-600">Use any tool and click the <strong class="text-slate-500">Bookmark</strong> button on any response to save it here for revision.</p>
        </div>
      ` : Object.entries(grouped).map(([toolName, entries]) => `
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background:#0EA5E9"></div>
            <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">${toolName}</span>
            <span class="chip chip-primary">${entries.length}</span>
          </div>
          ${entries.map(bkm => `
            <div class="card-dark-sm p-4 group cursor-pointer hover:border-amber-500/40 transition-all"
                 onclick="openBookmarkModal('${bkm.id}')">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-bookmark text-xs text-amber-400"></i>
                    <span class="text-xs text-slate-500">${new Date(bkm.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  </div>
                  <div class="text-sm text-slate-300 line-clamp-2 prose-preview">
                    ${(bkm.contentHTML || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)}...
                  </div>
                </div>
                <div class="flex flex-col gap-2 flex-shrink-0">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sky-400 text-xs">
                    <i class="fas fa-eye text-xs"></i>
                    <span>Revise</span>
                  </div>
                  <button onclick="event.stopPropagation(); removeBookmark('${bkm.id}')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <i class="fas fa-times text-xs"></i>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>`
  }

  function clearAllBookmarks() {
    if (confirm('Remove all bookmarks?')) {
      STATE.bookmarks = []
      saveState()
      delete STATE.toolCache['bookmarks']
      renderTool('bookmarks', document.getElementById('tool-container'))
      showToast('All bookmarks cleared', 'info')
    }
  }

  // Intercept fetch to inject API key header & route to backend port 5000 if running on port 3000
  const originalFetch = window.fetch
  window.fetch = function(url, options = {}) {
    let targetUrl = url
    if (typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('/modules/') || url.startsWith('/users/'))) {
      if (window.location.port === '3000') {
        targetUrl = 'http://localhost:5000' + url
      }
      if (!options.headers) options.headers = {}
      options.headers['X-API-Key'] = STATE.apiKey
    }
    return originalFetch.call(this, targetUrl, options)
  }

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  init()

  // ═══════════════════════════════════════════════════════════
  // FORMULA BANK
  // ═══════════════════════════════════════════════════════════
  function renderFormulaBank(el) {
    const subjects = ['Quant - Arithmetic', 'Quant - Algebra', 'Quant - Geometry', 'Quant - Trigonometry', 'Quant - Mensuration', 'Reasoning - Series', 'Reasoning - Blood Relations', 'Reasoning - Coding-Decoding', 'English - Grammar Rules', 'Number System']
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <div>
        <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📐 Formula Bank</h2>
        <p class="text-slate-500 text-sm mt-1">Instant access to all shortcuts & formulas for SSC CGL. Never miss a trick!</p>
      </div>
      <div class="flex flex-wrap gap-2">
        ${subjects.map(s => `<button onclick="loadFormulas('${s}')" class="chip chip-primary cursor-pointer hover:opacity-80 transition-opacity">${s}</button>`).join('')}
      </div>
      ${inputArea({ id: 'formula-input', placeholder: 'Or type a custom topic (e.g. Profit & Loss shortcuts, Pipes & Cisterns)...', btn: 'Get Formulas', onSubmit: 'loadFormulaCustom()' })}
      <div style="margin-top:4px">${surpriseBtn('formula-bank','formula-input','loadFormulaCustom')}</div>
      <div id="formula-output"></div>
    </div>`
  }

  async function loadFormulas(subject) {
    const out = document.getElementById('formula-output')
    out.innerHTML = loadingHTML('Loading formulas...')
    try {
      const res = await callGeneric(todayContext() + `Create a comprehensive formula & shortcut sheet for "${subject}" for SSC CGL Tier-1.\n      Include: all formulas with examples, shortcut tricks, common question patterns, and memory tips.\n      Format as a well-structured HTML table + tips. Make it dense and revision-ready.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Formula Bank', input: subject, output: 'Formulas loaded', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('formula-bank')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function loadFormulaCustom() {
    const raw = document.getElementById('formula-input')?.value?.trim()
    const topic = raw || 'a random Quantitative Aptitude or Reasoning topic from the SSC CGL syllabus (pick something formula-heavy like Mensuration, Trigonometry, or Profit & Loss)'
    if (!raw) showToast('🎲 Loading a surprise formula sheet…', 'info')
    const out = document.getElementById('formula-output')
    out.innerHTML = loadingHTML('Loading formulas...')
    try {
      const res = await callGeneric(todayContext() + `Create a comprehensive formula & shortcut sheet for "${topic}" for SSC CGL Tier-1.\n      Include all formulas, shortcut tricks, examples, and memory tricks. Format in dense HTML with tables.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'Formula Bank', input: (raw || 'Surprise topic'), output: 'Formulas loaded', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('formula-bank')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // PYQ ANALYSER
  // ═══════════════════════════════════════════════════════════
  function renderPYQAnalyser(el) {
    const pyqTopics = ['Percentage & Profit', 'Trigonometry', 'Geometry Circles', 'Reading Comprehension', 'Cloze Test', 'Error Spotting', 'History Ancient', 'Indian Polity Articles', 'Science Biology', 'Current Affairs 2024']
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <div>
        <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">📚 PYQ Analyser</h2>
        <p class="text-slate-500 text-sm mt-1">Analyse SSC CGL previous year questions – understand patterns, difficulty, and what to expect.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        ${pyqTopics.map(t => `<button onclick="analysePYQ('${t}')" class="chip chip-coral cursor-pointer hover:opacity-80 transition-opacity">${t}</button>`).join('')}
      </div>
      ${inputArea({ id: 'pyq-input', placeholder: 'Enter a topic to get PYQ-style questions + detailed analysis (e.g. Simple Interest 2019-2024)...', btn: 'Analyse PYQs', onSubmit: 'analysePYQCustom()' })}
      <div style="margin-top:4px">${surpriseBtn('pyq-analyser','pyq-input','analysePYQCustom')}</div>
      <div id="pyq-output"></div>
    </div>`
  }

  async function analysePYQ(topic) {
    const out = document.getElementById('pyq-output')
    out.innerHTML = loadingHTML('Analysing previous year questions...')
    try {
      const curYear = new Date(TODAY.iso).getFullYear() || new Date().getFullYear()
      const prevYear = curYear - 1
      const res = await callGeneric(todayContext() + `Use Google Search to find REAL SSC CGL previous year questions on the topic: "${topic}". YEAR PRIORITY: search ${curYear} papers FIRST, then ${prevYear}, then earlier years back to 2018.
      Provide:
      1) At least 5 REAL, VERIFIED PYQ questions with exact wording from actual SSC papers — cite the exam name and year for each (e.g. "SSC CGL Tier-1 ${curYear}, Shift 2"). NEVER fabricate questions. Prioritise the most recent years.
      2) The correct answer and detailed explanation for each question
      3) Topic frequency trend — which years asked this topic and how many questions (from 2018 to ${curYear})
      4) Difficulty pattern and key sub-topics tested
      5) What to expect in future SSC CGL exams based on the ${curYear}/${prevYear} trend
      Format in rich HTML. Prioritise accuracy — fewer real questions is better than many fake ones.`, 'html', true)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
      addHistory({ id: Date.now(), tool: 'PYQ Analyser', input: topic, output: 'PYQs analysed', outputHTML: out.innerHTML, timestamp: new Date().toISOString() })
      autoCompleteGoal('pyq-analyser')
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  async function analysePYQCustom() {
    const raw = document.getElementById('pyq-input')?.value?.trim()
    if (!raw) showToast('🎲 Picking a surprise PYQ topic…', 'info')
    const topic = raw || 'a random high-frequency SSC CGL topic from previous years (pick from: Percentage, Trigonometry, Idioms, Indian Polity, Number Series, or Geometry)'
    analysePYQ(topic)
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR LOG (Mistake Tracker)
  // ═══════════════════════════════════════════════════════════
  function renderErrorLog(el) {
    const logs = STATE.errorLog || []
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:16px">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">❌ Error Log</h2>
          <p class="text-slate-500 text-sm mt-1">Track your mistakes. Review them daily. Never repeat them.</p>
        </div>
        ${logs.length > 0 ? `<button onclick="clearErrorLog()" class="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-colors"><i class="fas fa-trash mr-1"></i>Clear All</button>` : ''}
      </div>
      <div class="card-dark p-5 space-y-3">
        <h3 class="text-sm font-semibold text-slate-300">Log a New Mistake</h3>
        <input type="text" id="err-question" placeholder="The question you got wrong..." class="w-full px-4 py-2.5 text-sm">
        <input type="text" id="err-wrong" placeholder="Your wrong answer..." class="w-full px-4 py-2.5 text-sm">
        <input type="text" id="err-correct" placeholder="Correct answer..." class="w-full px-4 py-2.5 text-sm">
        <select id="err-subject" class="w-full px-4 py-2.5 text-sm">
          <option value="">Select Subject</option>
          <option>Quantitative Aptitude</option>
          <option>Reasoning</option>
          <option>English Language</option>
          <option>General Awareness</option>
        </select>
        <button onclick="addErrorEntry()" class="btn-coral w-full py-3 text-sm font-semibold">
          <i class="fas fa-plus mr-2"></i>Add to Error Log
        </button>
      </div>

      ${logs.length === 0
        ? `<div class="text-center py-16 text-slate-500"><i class="fas fa-clipboard-check text-4xl block mb-3" style="color:rgba(16,185,129,0.4)"></i><p class="text-slate-400 font-medium">No mistakes logged yet!</p><p class="text-sm mt-1">Start logging your wrong answers to identify patterns.</p></div>`
        : `<div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm text-slate-400 font-medium">${logs.length} mistake${logs.length>1?'s':''} logged</span>
              <button onclick="getAIAnalysis()" class="ml-auto btn-secondary text-xs px-3 py-1.5"><i class="fas fa-brain mr-1"></i>AI Analysis</button>
            </div>
            ${logs.map((entry, i) => `
              <div class="card-dark-sm p-4 group">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="chip chip-red">${entry.subject || 'General'}</span>
                      <span class="text-xs text-slate-500">${new Date(entry.timestamp).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p class="text-sm text-slate-300 mb-2"><strong>Q:</strong> ${entry.question}</p>
                    <p class="text-xs text-red-400 mb-1"><i class="fas fa-times mr-1"></i>Wrong: ${entry.wrong}</p>
                    <p class="text-xs text-emerald-400"><i class="fas fa-check mr-1"></i>Correct: ${entry.correct}</p>
                  </div>
                  <button onclick="removeError(${i})" class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-xs ml-3">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>`
      }
      <div id="error-ai-output"></div>
    </div>`
  }

  function addErrorEntry() {
    const q = document.getElementById('err-question')?.value?.trim()
    const wrong = document.getElementById('err-wrong')?.value?.trim()
    const correct = document.getElementById('err-correct')?.value?.trim()
    const subject = document.getElementById('err-subject')?.value
    if (!q || !correct) return showToast('Please fill question and correct answer', 'error')
    if (!STATE.errorLog) STATE.errorLog = []
    STATE.errorLog.unshift({ question: q, wrong: wrong || '–', correct, subject: subject || 'General', timestamp: new Date().toISOString() })
    if (STATE.errorLog.length > 200) STATE.errorLog = STATE.errorLog.slice(0, 200)
    saveState()
    autoCompleteGoal('error-log')
    delete STATE.toolCache['error-log']
    renderTool('error-log', document.getElementById('tool-container'))
    showToast('Mistake logged! 📝 Review it daily!', 'info')
  }

  function removeError(index) {
    STATE.errorLog.splice(index, 1)
    saveState()
    delete STATE.toolCache['error-log']
    renderTool('error-log', document.getElementById('tool-container'))
  }

  function clearErrorLog() {
    if (confirm('Clear all logged mistakes?')) {
      STATE.errorLog = []
      saveState()
      delete STATE.toolCache['error-log']
      renderTool('error-log', document.getElementById('tool-container'))
    }
  }

  async function getAIAnalysis() {
    const logs = STATE.errorLog || []
    if (!logs.length) return showToast('No errors to analyse', 'error')
    const out = document.getElementById('error-ai-output')
    out.innerHTML = loadingHTML('AI analysing your mistake patterns...')
    const summary = logs.slice(0, 30).map(e => `[${e.subject}] Q: ${e.question} | Wrong: ${e.wrong} | Correct: ${e.correct}`).join('\n')
    try {
      const res = await callGeneric(todayContext() + `Analyse these SSC CGL mistakes made by an aspirant:\n${summary}\n\nProvide:\n1) Weak areas identified by subject\n2) Common mistake patterns\n3) Root cause analysis (conceptual gap? careless? time pressure?)\n4) Specific remediation plan for each weak area\n5) Daily practice recommendations\nFormat in clean, actionable HTML.`)
      const eid = 'bkm_' + Date.now()
      out.innerHTML = outputCard(res.result, eid)
    } catch(e) { out.innerHTML = errorHTML(e.message) }
  }

  // ═══════════════════════════════════════════════════════════
  // POMODORO STUDY TIMER
  // ═══════════════════════════════════════════════════════════
  let _pomodoroInterval = null
  let _pomodoroSeconds = 25 * 60
  let _pomodoroRunning = false
  let _pomodoroMode = 'study'  // 'study' | 'break'
  let _pomodoroCount = 0

  function renderPomodoroTimer(el) {
    el.innerHTML = `
    <div class="w-full" style="display:flex;flex-direction:column;gap:18px">
      <div>
        <h2 class="font-headline" style="font-size:17px;font-weight:800;color:var(--text-primary)">⏱️ Pomodoro Study Timer</h2>
        <p class="text-slate-500 text-sm mt-1">25 min focused study + 5 min break. Proven technique for maximum retention!</p>
      </div>
      <div class="card-dark p-8 text-center space-y-6">
        <div id="pom-mode-label" class="chip chip-primary mx-auto" style="width:fit-content">📚 Study Session</div>
        <div id="pom-display" class="text-7xl font-bold font-headline" style="color:#0EA5E9;letter-spacing:0.05em">25:00</div>
        <div class="w-full rounded-full h-2" style="background:rgba(14,165,233,0.15)">
          <div id="pom-progress" class="h-2 rounded-full transition-all" style="width:100%;background:linear-gradient(90deg,#0EA5E9,#8B5CF6)"></div>
        </div>
        <div class="flex gap-3 justify-center flex-wrap">
          <button onclick="pomodoroStart()" id="pom-btn-start" class="btn-primary py-3 px-8 text-sm font-semibold">
            <i class="fas fa-play mr-2"></i>Start
          </button>
          <button onclick="pomodoroPause()" id="pom-btn-pause" class="btn-secondary py-3 px-6 text-sm hidden">
            <i class="fas fa-pause mr-2"></i>Pause
          </button>
          <button onclick="pomodoroReset()" class="btn-secondary py-3 px-6 text-sm">
            <i class="fas fa-redo mr-2"></i>Reset
          </button>
        </div>
        <div class="flex gap-4 justify-center text-sm">
          <button onclick="pomodoroSetTime(25,'study')" class="chip chip-primary cursor-pointer hover:opacity-80">25 min Study</button>
          <button onclick="pomodoroSetTime(5,'break')" class="chip chip-green cursor-pointer hover:opacity-80">5 min Break</button>
          <button onclick="pomodoroSetTime(15,'break')" class="chip chip-amber cursor-pointer hover:opacity-80">15 min Long Break</button>
        </div>
      </div>
      <div class="card-dark-sm" style="padding:12px 14px">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-slate-300">Today's Sessions</span>
          <span class="chip chip-violet" id="pom-count">${_pomodoroCount} 🍅</span>
        </div>
        <p class="text-xs text-slate-500">Each completed 25-min session = 1 Pomodoro 🍅. Target: <strong class="text-sky-400">8+ per day</strong> for SSC CGL selection!</p>
      </div>
      <div class="card-dark-sm p-4 space-y-2">
        <h3 class="text-sm font-semibold text-slate-300">💡 How to use Pomodoro for SSC CGL</h3>
        <ul class="text-xs text-slate-500 space-y-1.5">
          <li>🍅 <strong class="text-slate-400">25 min:</strong> Single topic – no distractions, no phone</li>
          <li>☕ <strong class="text-slate-400">5 min:</strong> Walk, stretch, water – never study in break</li>
          <li>🧘 <strong class="text-slate-400">After 4 sessions:</strong> 15–30 min long break</li>
          <li>📊 <strong class="text-slate-400">Target:</strong> 8 sessions/day = 3.5 hrs focused study</li>
          <li>🎯 <strong class="text-slate-400">Best subjects per session:</strong> 1 session = 1 chapter/topic only</li>
        </ul>
      </div>
    </div>`
    updatePomodoroDisplay()
  }

  function updatePomodoroDisplay() {
    const mins = Math.floor(_pomodoroSeconds / 60)
    const secs = _pomodoroSeconds % 60
    const display = document.getElementById('pom-display')
    if (display) display.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    const total = _pomodoroMode === 'study' ? 25*60 : (_pomodoroSeconds <= 5*60 ? 5*60 : 15*60)
    const pct = Math.min(100, (_pomodoroSeconds / total) * 100)
    const prog = document.getElementById('pom-progress')
    if (prog) prog.style.width = pct + '%'
    const modeLabel = document.getElementById('pom-mode-label')
    if (modeLabel) {
      modeLabel.textContent = _pomodoroMode === 'study' ? '📚 Study Session' : '☕ Break Time'
      modeLabel.className = _pomodoroMode === 'study' ? 'chip chip-primary mx-auto' : 'chip chip-green mx-auto'
      modeLabel.style.width = 'fit-content'
    }
    const countEl = document.getElementById('pom-count')
    if (countEl) countEl.textContent = _pomodoroCount + ' 🍅'
    if (display) display.style.color = _pomodoroMode === 'study' ? '#0EA5E9' : '#10B981'
  }

  function pomodoroStart() {
    if (_pomodoroRunning) return
    _pomodoroRunning = true
    document.getElementById('pom-btn-start')?.classList.add('hidden')
    document.getElementById('pom-btn-pause')?.classList.remove('hidden')
    _pomodoroInterval = setInterval(() => {
      _pomodoroSeconds--
      updatePomodoroDisplay()
      if (_pomodoroSeconds <= 0) {
        clearInterval(_pomodoroInterval)
        _pomodoroRunning = false
        if (_pomodoroMode === 'study') {
          _pomodoroCount++
          showToast('🍅 Pomodoro complete! Time for a break!', 'success')
          _pomodoroMode = 'break'
          _pomodoroSeconds = 5 * 60
        } else {
          showToast('☕ Break over! Back to study! 💪', 'info')
          _pomodoroMode = 'study'
          _pomodoroSeconds = 25 * 60
        }
        document.getElementById('pom-btn-start')?.classList.remove('hidden')
        document.getElementById('pom-btn-pause')?.classList.add('hidden')
        updatePomodoroDisplay()
      }
    }, 1000)
  }

  function pomodoroPause() {
    if (!_pomodoroRunning) return
    clearInterval(_pomodoroInterval)
    _pomodoroRunning = false
    document.getElementById('pom-btn-start')?.classList.remove('hidden')
    document.getElementById('pom-btn-pause')?.classList.add('hidden')
    showToast('⏸ Timer paused', 'info')
  }

  function pomodoroReset() {
    clearInterval(_pomodoroInterval)
    _pomodoroRunning = false
    _pomodoroSeconds = 25 * 60
    _pomodoroMode = 'study'
    document.getElementById('pom-btn-start')?.classList.remove('hidden')
    document.getElementById('pom-btn-pause')?.classList.add('hidden')
    updatePomodoroDisplay()
  }

  function pomodoroSetTime(mins, mode) {
    clearInterval(_pomodoroInterval)
    _pomodoroRunning = false
    _pomodoroSeconds = mins * 60
    _pomodoroMode = mode
    document.getElementById('pom-btn-start')?.classList.remove('hidden')
    document.getElementById('pom-btn-pause')?.classList.add('hidden')
    updatePomodoroDisplay()
    showToast(`Timer set to ${mins} min ${mode} session`, 'info')
  }

  // Universal 2-Color DOM Sanitizer & Hard Overrider
  function forceTwoColorDOM() {
    document.querySelectorAll('*').forEach(el => {
      if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
        if (el.hasAttribute('style')) el.removeAttribute('style');
      }
    });
  }
  setInterval(forceTwoColorDOM, 250);
