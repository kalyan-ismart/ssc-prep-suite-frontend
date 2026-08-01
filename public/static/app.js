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
    // 📊 Overview & Stats
    'performance-dashboard':   { name: 'Performance Dashboard', icon: 'fa-chart-line', desc: 'Track your preparation & overall stats', cat: '📊 Overview & Stats' },
    'daily-goals':             { name: 'Daily Goals Checklist', icon: 'fa-bullseye', desc: 'Your daily study checklist & targets', cat: '📊 Overview & Stats' },
    'error-log':               { name: 'Mistake & Error Log', icon: 'fa-exclamation-circle', desc: 'Track mistakes & weak problem areas', cat: '📊 Overview & Stats' },
    'pomodoro-timer':          { name: 'Focus Study Timer', icon: 'fa-stopwatch', desc: 'Pomodoro focus timer for study sessions', cat: '📊 Overview & Stats' },

    // 📐 Quant (Maths)
    'quant-solver':            { name: 'Quant Problem Solver', icon: 'fa-calculator', desc: 'Step-by-step math problem solutions with shortcuts', cat: '📐 Quant (Maths)' },
    'formula-bank':            { name: 'Shortcut Formula Bank', icon: 'fa-superscript', desc: 'Essential Quant & Reasoning formulas', cat: '📐 Quant (Maths)' },
    'pyq-analyser':            { name: 'PYQ Exam Analyser', icon: 'fa-archive', desc: 'Previous year questions with detailed breakdown', cat: '📐 Quant (Maths)' },

    // 🧩 Reasoning
    'reasoning-solver':        { name: 'Reasoning Solver', icon: 'fa-puzzle-piece', desc: 'Solve verbal & non-verbal reasoning problems', cat: '🧩 Reasoning' },
    'para-jumble-solver':      { name: 'Para Jumble Solver', icon: 'fa-random', desc: 'Master sentence rearrangement & logic', cat: '🧩 Reasoning' },
    'debate-simulator':        { name: 'Debate Simulator', icon: 'fa-comments', desc: 'Sharpen logic & critical reasoning through debate', cat: '🧩 Reasoning' },

    // 📖 English Language
    'vocabulary':              { name: 'Vocabulary Builder', icon: 'fa-book', desc: 'Expand word power, synonyms & antonyms', cat: '📖 English Language' },
    'rc-practice':             { name: 'RC Comprehension', icon: 'fa-glasses', desc: 'Reading comprehension passages & practice', cat: '📖 English Language' },
    'writing-assistant':       { name: 'English Writing Assistant', icon: 'fa-pen-fancy', desc: 'Improve grammar & writing skills', cat: '📖 English Language' },
    'essay-scorer':            { name: 'Essay & Letter Evaluator', icon: 'fa-star-half-alt', desc: 'Get detailed scoring & feedback on essays', cat: '📖 English Language' },

    // 🌍 General Awareness (GK)
    'current-affairs':         { name: 'Current Affairs Digest', icon: 'fa-newspaper', desc: 'Latest exam-relevant news & daily updates', cat: '🌍 General Awareness (GK)' },
    'static-gk':               { name: 'Static GK Repository', icon: 'fa-globe', desc: 'High-yield notes on History, Polity & Science', cat: '🌍 General Awareness (GK)' },
    'ca-linker':               { name: 'CA to Static Linker', icon: 'fa-link', desc: 'Connect current news to static concepts', cat: '🌍 General Awareness (GK)' },
    'acronym-explainer':       { name: 'Acronym Decrypter', icon: 'fa-font', desc: 'Decode key government & exam acronyms', cat: '🌍 General Awareness (GK)' },
    'gk-story-weaver':         { name: 'GK Story Weaver', icon: 'fa-book-open', desc: 'Memorize complex GK topics through stories', cat: '🌍 General Awareness (GK)' },
    'hobby-connector':         { name: 'Hobby to GK Connector', icon: 'fa-heart', desc: 'Relate personal hobbies to exam GK', cat: '🌍 General Awareness (GK)' },

    // 🧠 Test Prep & Revision
    'ai-mock-test':            { name: 'Full AI Mock Test', icon: 'fa-file-alt', desc: 'Full-length timed mock tests with analysis', cat: '🧠 Test Prep & Revision' },
    'question-generator':      { name: 'Target Question Generator', icon: 'fa-question-circle', desc: 'Generate topic-wise MCQs with detailed explanations', cat: '🧠 Test Prep & Revision' },
    'concept-explainer':       { name: 'Concept Explainer', icon: 'fa-lightbulb', desc: 'Deep-dive explanation of any exam concept', cat: '🧠 Test Prep & Revision' },
    'interactive-smart-revision': { name: 'Smart Revision Planner', icon: 'fa-brain', desc: 'AI-curated weak-area revision plan', cat: '🧠 Test Prep & Revision' },
    'compare-contrast':        { name: 'Compare & Contrast', icon: 'fa-balance-scale', desc: 'Side-by-side comparison of confusing topics', cat: '🧠 Test Prep & Revision' },
    'flashcards':              { name: 'Active Recall Flashcards', icon: 'fa-layer-group', desc: 'Interactive flashcards for fast retrieval', cat: '🧠 Test Prep & Revision' },
    'mind-map-generator':      { name: 'Visual Mind Maps', icon: 'fa-project-diagram', desc: 'Generate structured visual mind maps', cat: '🧠 Test Prep & Revision' },
    'mnemonic-generator':      { name: 'Memory Mnemonics', icon: 'fa-magic', desc: 'Create memorable mnemonics for hard facts', cat: '🧠 Test Prep & Revision' },
    'document-summarizer':     { name: 'Document Summarizer', icon: 'fa-compress-alt', desc: 'Summarize long articles & study notes', cat: '🧠 Test Prep & Revision' },
    'revision-sheet':          { name: 'Quick Revision Cheatsheet', icon: 'fa-clipboard-list', desc: 'One-page summary sheets for fast revision', cat: '🧠 Test Prep & Revision' },
    'tts':                     { name: 'Audio Revision (TTS)', icon: 'fa-headphones', desc: 'Listen to audio versions of your notes', cat: '🧠 Test Prep & Revision' },

    // 🤖 AI Tutors & Mentors
    'ai-tutor':                { name: '24/7 AI Tutor Chat', icon: 'fa-chalkboard-teacher', desc: 'Personalized 1-on-1 exam tutor', cat: '🤖 AI Tutors & Mentors' },
    'study-buddy':             { name: 'Study Buddy & Motivator', icon: 'fa-user-friends', desc: 'Exam strategy, guidance & encouragement', cat: '🤖 AI Tutors & Mentors' },
    'interview-simulator':     { name: 'Mock Interview Simulator', icon: 'fa-user-tie', desc: 'Simulated government job interviews', cat: '🤖 AI Tutors & Mentors' },

    // 📁 Saved & History
    'history-logs':            { name: 'History & Session Logs', icon: 'fa-history', desc: 'Review all past AI practice sessions', cat: '📁 Saved & History' },
    'bookmarks':               { name: 'Saved Bookmarks', icon: 'fa-bookmark', desc: 'Your bookmarked answers & key notes', cat: '📁 Saved & History' },
  }

  const CATEGORIES = [
    '📊 Overview & Stats',
    '📐 Quant (Maths)',
    '🧩 Reasoning',
    '📖 English Language',
    '🌍 General Awareness (GK)',
    '🧠 Test Prep & Revision',
    '🤖 AI Tutors & Mentors',
    '📁 Saved & History'
  ]

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

    document.getElementById('streak-display').textContent = STATE.studyStreak
    switchTool('performance-dashboard')
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

  function saveApiKey() {}
  function showApiModal() {}

  function updateClock() {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    document.getElementById('current-time').textContent = now + ' IST'
  }

  // ═══════════════════════════════════════════════════════════
  // NAV BUILDER
  // ═══════════════════════════════════════════════════════════
  function buildNav() {
    const nav = document.getElementById('nav-menu')
    if (!nav) return
    nav.innerHTML = ''
    CATEGORIES.forEach(cat => {
      const tools = Object.entries(TOOLS).filter(([_, t]) => t.cat === cat)
      if (tools.length === 0) return
      const section = document.createElement('div')
      section.style.marginBottom = '14px'
      section.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 8px 5px;font-size:10px;font-weight:800;color:#00F0FF;letter-spacing:0.05em;text-shadow:0 0 8px rgba(0,240,255,0.25)">
          <span>${cat}</span>
          <span style="font-size:9px;background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.25);padding:1px 7px;border-radius:99px;color:#60FAFF;box-shadow:0 0 6px rgba(0,240,255,0.06)">${tools.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px">
        ${tools.map(([id, t]) => `
          <button onclick="switchTool('${id}')" id="nav-${id}" class="nav-tool-btn">
            <span class="nav-icon"><i class="fas ${t.icon}" style="font-size:10.5px"></i></span>
            <span class="truncate" style="flex:1;min-width:0;font-size:12.5px;font-weight:600">${t.name}</span>
          </button>
        `).join('')}
        </div>
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
      return '⏳ Rate limit reached. The free Gemini tier has request limits. Please wait 30–60 seconds and try again.'
    }
    if (msg.includes('API key error') || msg.includes('API_KEY_INVALID') || msg.includes('No API key')) {
      return '🔑 API key missing or invalid. Please add your GEMINI_API_KEY to the backend/.env file.'
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
    const entry = STATE.historyLog.find(e => String(e.id) === String(id))
    if (!entry) return
    const modal = document.getElementById('history-modal')
    if (!modal) return
    document.getElementById('hm-title').textContent = (entry.tool || 'History Log') + ' Question & Solution'
    document.getElementById('hm-meta').textContent =
      (entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'History Record') +
      '  ·  Question: ' + (entry.input || entry.prompt || 'Generated Practice Question').slice(0, 70)
    const contentEl = document.getElementById('hm-content')
    const rawContent = entry.outputHTML || entry.output || entry.input || 'No detail available.'
    contentEl.innerHTML = sanitizeAIHTML(rawContent, false)
    modal.style.display = 'flex'
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  function closeHistoryModal() {
    const modal = document.getElementById('history-modal')
    if (modal) {
      modal.style.display = 'none'
      modal.classList.remove('open')
    }
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

    const existing = STATE.bookmarks.findIndex(b => String(b.id) === String(id))
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
    const entry = STATE.bookmarks.find(b => String(b.id) === String(id))
    if (!entry) return
    const modal = document.getElementById('history-modal')
    if (!modal) return
    document.getElementById('hm-title').textContent = (entry.tool || 'Saved Bookmark') + ' Question & Solution'
    document.getElementById('hm-meta').textContent =
      entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Saved Bookmark'
    const contentEl = document.getElementById('hm-content')
    const rawContent = entry.contentHTML || entry.outputHTML || entry.output || 'No content saved.'
    contentEl.innerHTML = sanitizeAIHTML(rawContent, false)
    modal.style.display = 'flex'
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  function removeBookmark(id) {
    STATE.bookmarks = STATE.bookmarks.filter(b => b.id !== id)
    saveState()
    delete STATE.toolCache['bookmarks']
    delete STATE.toolCache['saved-bookmarks']
    if (STATE.activeTool === 'bookmarks') {
      renderTool('bookmarks', document.getElementById('tool-container'))
    }
    showToast('🗑️ Question removed from Saved Bookmarks!', 'info')
  }

  function removeHistoryItem(id) {
    STATE.historyLog = STATE.historyLog.filter(h => String(h.id) !== String(id))
    saveState()
    delete STATE.toolCache['history-logs']
    delete STATE.toolCache['history-log']
    if (STATE.activeTool === 'history-logs') {
      renderTool('history-logs', document.getElementById('tool-container'))
    }
    showToast('🗑️ History entry deleted!', 'info')
  }

  function viewItemInTool(toolId, promptText, htmlContent, sourceTag = 'Saved Bookmarks') {
    if (!toolId || !TOOLS[toolId]) toolId = 'quant-solver'
    switchTool(toolId)
    
    setTimeout(() => {
      const inputIdMap = {
        'quant-solver': 'quant-input',
        'reasoning-solver': 'reasoning-input',
        'vocabulary': 'vocab-input',
        'pyq-analyser': 'pyq-input',
        'formula-bank': 'formula-input',
        'current-affairs': 'ca-input',
        'concept-explainer': 'concept-input',
        'question-generator': 'qgen-input',
        'revision-sheet': 'rev-input',
        'error-log': 'err-q-input',
        'para-jumble-solver': 'pj-input',
        'debate-simulator': 'debate-input',
        'rc-practice': 'rc-input',
        'writing-assistant': 'writing-input',
        'essay-scorer': 'essay-input',
        'ca-linker': 'cal-input',
        'static-gk': 'sgk-input',
        'acronym-explainer': 'acro-input',
        'gk-story-weaver': 'story-input',
        'hobby-connector': 'hobby-name',
        'ai-mock-test': 'mock-input',
        'compare-contrast': 'cc-input',
        'flashcards': 'flash-input',
        'mind-map-generator': 'mm-input',
        'mnemonic-generator': 'mnem-input',
        'document-summarizer': 'doc-input',
        'tts': 'tts-input'
      }
      const inputId = inputIdMap[toolId] || (toolId + '-input')
      const inputEl = document.getElementById(inputId)
      if (inputEl && promptText) {
        inputEl.value = promptText
        inputEl.style.height = 'auto'
        if (inputEl.scrollHeight) inputEl.style.height = inputEl.scrollHeight + 'px'
      }

      const outputId = toolId + '-output'
      const outEl = document.getElementById(outputId) || document.getElementById('error-ai-output')
      if (outEl && htmlContent) {
        const cleanContent = sanitizeAIHTML(htmlContent, false)
        outEl.innerHTML = `
        <div class="output-card card-3d animate-fade-in" style="border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 10px 30px rgba(0,0,0,0.6);margin-top:16px">
          <div class="output-card-header" style="padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(56,189,248,0.2);display:flex;align-items:center;justify-content:space-between">
            <div class="output-card-label" style="display:flex;align-items:center;gap:10px">
              <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(14,165,233,0.4)">
                <i class="fas fa-eye" style="color:#FFF;font-size:12px"></i>
              </div>
              <div>
                <span style="font-size:14px;font-weight:800;color:#F0F6FF">${TOOLS[toolId].name} Response</span>
                <span class="highlight-pill-3d" style="background:rgba(56,189,248,0.2);color:#7DD3FC;border:1px solid rgba(56,189,248,0.4);margin-left:8px">📌 Loaded from ${sourceTag}</span>
              </div>
            </div>
            <button onclick="copyOutputText('view-loaded')" class="card-action-btn" title="Copy response">
              <i class="fas fa-copy" style="font-size:11px;color:#38BDF8"></i> Copy
            </button>
          </div>
          <div class="prose" id="content-view-loaded">${cleanContent}</div>
        </div>`
        outEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      showToast(`📖 Loaded inside ${TOOLS[toolId].name}`, 'success')
    }, 60)
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
    return `<div class="output-card card-3d" data-entry-id="${bkmId}">
      <div class="output-card-header">
        <div class="output-card-label">
          <div style="width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(14,165,233,0.4)">
            <i class="fas fa-robot" style="font-size:11px;color:#FFF"></i>
          </div>
          <span style="font-size:13px;font-weight:800;color:#F0F6FF">AI Output Studio</span>
          <span class="highlight-pill-3d" style="background:rgba(56,189,248,0.15);color:#7DD3FC;border:1px solid rgba(56,189,248,0.3)">⚡ Verified Response</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button onclick="copyOutputText('${bkmId}')" class="card-action-btn" title="Copy output text">
            <i class="fas fa-copy" style="font-size:11px;color:#38BDF8"></i>
            <span>Copy</span>
          </button>
          <button onclick="toggleEditOutput('${bkmId}', this)" class="card-action-btn" title="Edit output text">
            <i class="fas fa-edit" style="font-size:11px;color:#A78BFA"></i>
            <span class="edit-label">Edit</span>
          </button>
          <button onclick="toggleBookmark('${bkmId}', this)"
                  class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                  title="Bookmark this response">
            <i class="fas fa-bookmark" style="font-size:11px"></i>
            <span>${isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
      <div class="prose" id="content-${bkmId}">${cleanHTML}</div>
    </div>`
  }

  function applyPreset(inputId, text) {
    const el = document.getElementById(inputId)
    if (el) {
      el.value = text
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
      el.focus()
      showToast(`Selected: "${text.slice(0,35)}${text.length>35?'…':''}"`, 'info')
    }
  }

  const CAT_THEMES = {
    '📐 Quant (Maths)': {
      accent: '#38BDF8',
      bgGrad: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(56,189,248,0.35)',
      iconGrad: 'linear-gradient(135deg, #0EA5E9, #2563EB)',
      glow: '0 6px 24px rgba(14,165,233,0.25)',
      badgeBg: 'rgba(56,189,248,0.14)',
      badgeText: '#7DD3FC'
    },
    '🧩 Reasoning': {
      accent: '#A78BFA',
      bgGrad: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(139,92,246,0.35)',
      iconGrad: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      glow: '0 6px 24px rgba(139,92,246,0.25)',
      badgeBg: 'rgba(167,139,250,0.14)',
      badgeText: '#DDD6FE'
    },
    '📖 English Language': {
      accent: '#FCD34D',
      bgGrad: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(245,158,11,0.35)',
      iconGrad: 'linear-gradient(135deg, #F59E0B, #D97706)',
      glow: '0 6px 24px rgba(245,158,11,0.25)',
      badgeBg: 'rgba(252,211,77,0.14)',
      badgeText: '#FDE68A'
    },
    '🌍 General Awareness (GK)': {
      accent: '#34D399',
      bgGrad: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(16,185,129,0.35)',
      iconGrad: 'linear-gradient(135deg, #10B981, #059669)',
      glow: '0 6px 24px rgba(16,185,129,0.25)',
      badgeBg: 'rgba(52,211,153,0.14)',
      badgeText: '#A7F3D0'
    },
    '🧠 Test Prep & Revision': {
      accent: '#FB7185',
      bgGrad: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(244,63,94,0.35)',
      iconGrad: 'linear-gradient(135deg, #F43F5E, #E11D48)',
      glow: '0 6px 24px rgba(244,63,94,0.25)',
      badgeBg: 'rgba(251,113,133,0.14)',
      badgeText: '#FECDD3'
    },
    '🤖 AI Tutors & Mentors': {
      accent: '#818CF8',
      bgGrad: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(99,102,241,0.35)',
      iconGrad: 'linear-gradient(135deg, #6366F1, #4F46E5)',
      glow: '0 6px 24px rgba(99,102,241,0.25)',
      badgeBg: 'rgba(129,140,248,0.14)',
      badgeText: '#C7D2FE'
    },
    '📌 Saved & History': {
      accent: '#38BDF8',
      bgGrad: 'linear-gradient(135deg, rgba(2,132,199,0.15), rgba(15,22,41,0.92))',
      border: '1.5px solid rgba(2,132,199,0.35)',
      iconGrad: 'linear-gradient(135deg, #0284C7, #0369A1)',
      glow: '0 6px 24px rgba(2,132,199,0.25)',
      badgeBg: 'rgba(56,189,248,0.14)',
      badgeText: '#7DD3FC'
    }
  }

  function getToolTheme(toolId = '', category = '') {
    const tool = TOOLS[toolId] || {}
    const catName = category || tool.cat || '📐 Quant (Maths)'
    return CAT_THEMES[catName] || CAT_THEMES['📐 Quant (Maths)']
  }

  function inputArea({ id, placeholder, label = 'Enter Topic, Question, or Concept', btn, onSubmit, type = 'text', rows = 3, toolId = '', triggerFn = '' }) {
    const minRows = type === 'textarea' ? Math.max(rows, 3) : 2
    const theme = getToolTheme(toolId)
    return `<div class="card-dark" style="padding:22px 24px;display:flex;flex-direction:column;gap:14px;margin-bottom:20px;border:1.5px solid ${theme.accent}40 !important;background:rgba(17,28,53,0.95);box-shadow:0 6px 24px rgba(0,0,0,0.4)">
      ${label ? `<div style="display:flex;align-items:center;justify-content:space-between">
        <label style="font-size:13px;font-weight:800;color:#F0F6FF;letter-spacing:0.01em;display:flex;align-items:center;gap:7px">
          <i class="fas fa-edit" style="font-size:12px;color:${theme.accent}"></i> ${label}
        </label>
        <span style="font-size:11px;color:#94AAC8;font-weight:500">Press Enter to run</span>
      </div>` : ''}
      <div style="position:relative">
        <textarea id="${id}" placeholder="${placeholder}" rows="${minRows}"
          style="min-height:${minRows * 24 + 32}px;padding:14px 16px 42px 16px;font-size:13.5px;line-height:1.65;background:rgba(10,15,30,0.95);border:1.5px solid ${theme.accent}35;border-radius:12px;color:#F0F6FF;box-shadow:inset 0 2px 4px rgba(0,0,0,0.5)"
          class="w-full resize-none overflow-hidden"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey&&${minRows}<=2){event.preventDefault();${onSubmit}}"
        ></textarea>
        <div style="position:absolute;bottom:10px;right:12px;display:flex;gap:8px;z-index:2">
          <button type="button" onclick="copyInputText('${id}')" class="card-action-btn" title="Copy prompt text">
            <i class="fas fa-copy" style="font-size:10px;color:${theme.accent}"></i> Copy
          </button>
          <button type="button" onclick="clearOrEditInput('${id}')" class="card-action-btn" title="Clear prompt text">
            <i class="fas fa-trash-alt" style="font-size:10px;color:#F87171"></i> Clear
          </button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <button onclick="${onSubmit}" class="btn-primary" style="flex:1;padding:12px 20px;font-size:13.5px;font-weight:700;background:${theme.iconGrad} !important;border:none !important">
          <i class="fas fa-paper-plane" style="font-size:12px"></i>
          ${btn}
        </button>
        ${toolId && triggerFn ? surpriseBtn(toolId, id, triggerFn) : ''}
      </div>
    </div>`
  }

  function surpriseBtn(toolId, inputId, triggerFn) {
    const theme = getToolTheme(toolId)
    return `<button onclick="surpriseMe('${toolId}','${inputId}','${triggerFn}')"
      style="display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:99px;
             background:linear-gradient(135deg,${theme.accent}22,rgba(15,22,41,0.9));
             border:1.5px solid ${theme.accent}50;color:${theme.badgeText};font-size:12.5px;font-weight:700;
             cursor:pointer;transition:all 0.18s;letter-spacing:0.02em;white-space:nowrap"
      onmouseover="this.style.background='${theme.iconGrad}';this.style.color='#FFFFFF';this.style.transform='translateY(-1px)'"
      onmouseout="this.style.background='linear-gradient(135deg,${theme.accent}22,rgba(15,22,41,0.9))';this.style.color='${theme.badgeText}';this.style.transform='translateY(0)'"
      title="Generate a fresh surprise instantly — no topic needed!">
      🎲 <span>Surprise Me!</span>
    </button>`
  }

  function toolFooter(relatedTools = [], tips = [], toolId = '') {
    const theme = getToolTheme(toolId)
    return `<div style="margin-top:24px;padding:18px 22px;border-radius:14px;background:rgba(17,28,53,0.9);border:1.5px solid ${theme.accent}35;display:flex;flex-direction:column;gap:12px">
      ${tips && tips.length > 0 ? `
      <div style="display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#CBD5E1">
        <i class="fas fa-lightbulb" style="color:#FCD34D;font-size:14px;margin-top:2px;flex-shrink:0"></i>
        <div><strong style="color:#F0F6FF;font-weight:700">Exam Strategy Tip:</strong> ${tips[Math.floor(Math.random() * tips.length)]}</div>
      </div>` : ''}
      ${relatedTools && relatedTools.length > 0 ? `
      <div style="display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap">
        <span style="font-size:11.5px;font-weight:800;color:${theme.accent};letter-spacing:0.02em;display:inline-flex;align-items:center;gap:5px">
          <i class="fas fa-link" style="font-size:10px"></i> Complementary Tools:
        </span>
        ${relatedTools.map(tId => {
          const t = TOOLS[tId]
          if (!t) return ''
          return `<button type="button" onclick="switchTool('${tId}')" class="related-tool-chip" style="border-color:${theme.accent}40 !important"><i class="fas ${t.icon}" style="font-size:10px;color:${theme.accent}"></i><span>${t.name}</span></button>`
        }).join('')}
      </div>` : ''}
    </div>`
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

      <!-- Top row: Quote + Countdown 3D Hero Banner -->
      <div class="tool-hero-header-3d card-3d" style="background:linear-gradient(135deg,rgba(17,28,53,0.98),rgba(10,15,30,0.95)) !important;border:1.5px solid rgba(56,189,248,0.4) !important">
        <div style="display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center">
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div class="tool-header-icon-3d" style="background:linear-gradient(135deg,#7C3AED,#0EA5E9) !important">
              <i class="fas fa-quote-left" style="color:#FFF;font-size:20px"></i>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                <h2 class="font-headline" style="font-size:18px;font-weight:800;color:#F0F6FF">SSC CGL Aspirant Daily Motivation</h2>
                <span class="highlight-pill-3d" style="background:rgba(124,58,237,0.18);color:#C7D2FE;border:1px solid rgba(124,58,237,0.35)">✨ Daily Inspiration</span>
              </div>
              <p style="color:#E2E8F0;font-size:14px;font-style:italic;line-height:1.65;margin:0">"${todayQuote.q}"</p>
              <p style="font-size:11.5px;font-weight:700;color:#38BDF8;margin-top:6px">— ${todayQuote.a}</p>
            </div>
          </div>

          <div class="stat-3d-box" style="background:linear-gradient(135deg,rgba(249,115,22,0.18),rgba(10,15,30,0.95)) !important;border:1.5px solid rgba(249,115,22,0.4) !important;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 24px !important;min-width:140px;text-align:center">
            <div style="font-size:38px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FB923C;line-height:1;text-shadow:0 0 16px rgba(251,146,60,0.4)">${daysLeft}</div>
            <div style="font-size:10px;font-weight:800;color:#FED7AA;letter-spacing:0.06em;margin-top:4px">DAYS REMAINING</div>
            <span class="highlight-pill-3d" style="background:rgba(249,115,22,0.2);color:#FDBA74;border:1px solid rgba(249,115,22,0.4);margin-top:6px;font-size:10px">${nextExam.label}</span>
          </div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stat-card-grid">
        <div class="stat-card stat-teal">
          <div class="stat-card-orb" style="background:#0EA5E9"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#38BDF8;position:relative;z-index:1">${history.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Mock Tests</div>
        </div>
        <div class="stat-card stat-coral">
          <div class="stat-card-orb" style="background:#F97316"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FB923C;position:relative;z-index:1">${STATE.studyStreak}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Day Streak 🔥</div>
        </div>
        <div class="stat-card stat-amber">
          <div class="stat-card-orb" style="background:#F59E0B"></div>
          <div style="font-size:28px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;color:#FCD34D;position:relative;z-index:1">${STATE.historyLog.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;position:relative;z-index:1">Activities</div>
        </div>
        <div class="stat-card stat-violet">
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
      <div class="card-dark" style="padding:22px 24px;border:1.5px solid rgba(56,189,248,0.28);background:rgba(17,28,53,0.95);box-shadow:0 6px 24px rgba(0,0,0,0.4)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(56,189,248,0.18)">
          <div style="display:flex;align-items:center;gap:10px">
            <i class="fas fa-tasks" style="color:#38BDF8;font-size:15px"></i>
            <h3 class="font-headline" style="font-size:15px;font-weight:800;color:#F0F6FF">Today's SSC CGL Preparation Goals</h3>
          </div>
          <span class="chip ${goalPct === 100 ? 'chip-green' : goalPct >= 50 ? 'chip-amber' : 'chip-muted'}" style="font-size:11px;font-weight:700;padding:4px 10px">${completedGoals}/${STATE.dailyGoals.length} Completed</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${STATE.dailyGoals.map((g, i) => {
            const cnt  = typeof g.count  === 'number' ? g.count  : 0
            const tgt  = typeof g.target === 'number' ? g.target : 1
            const done = g.completed || cnt >= tgt
            const isOne = tgt === 1
            const pct  = Math.min(Math.round(cnt / tgt * 100), 100)
            return `
            <div class="goal-card-item ${done ? 'completed' : ''}" style="background:${done ? 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(10,15,30,0.95))' : 'linear-gradient(135deg,rgba(17,28,53,0.95),rgba(10,15,30,0.9))'} !important">
              <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
                <div onclick="toggleGoal(${i})" style="width:22px;height:22px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;${done ? 'background:#10B981;box-shadow:0 0 8px rgba(16,185,129,0.4)' : 'border:2px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.08)'}">
                  ${done ? '<i class="fas fa-check" style="color:#fff;font-size:10px"></i>' : ''}
                </div>
                <span style="font-size:13.5px;font-weight:700;${done ? 'text-decoration:line-through;color:#94A3B8' : 'color:#F0F6FF'}">${g.text}</span>
              </div>
              <span class="goal-target-badge ${done ? 'done' : ''}">
                ${cnt}/${tgt} Target
              </span>
            </div>`
          }).join('')}
        </div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(56,189,248,0.18)">
          <div class="prog-track" style="height:6px;border-radius:99px">
            <div class="prog-fill prog-accent" style="width:${goalPct}%;border-radius:99px"></div>
          </div>
          <p style="font-size:11.5px;font-weight:600;color:#94AAC8;margin-top:6px;display:flex;justify-content:space-between">
            <span>Overall Daily Progress</span>
            <span style="color:#38BDF8;font-weight:800">${goalPct}% Complete · ${STATE.dailyGoals.length - completedGoals} Remaining</span>
          </p>
        </div>
      </div>

      <!-- Structured Tool Suite Quick Explorer -->
      <div class="card-dark" style="padding:24px 26px;border:1.5px solid rgba(56,189,248,0.3);background:rgba(17,28,53,0.95);box-shadow:0 8px 32px rgba(0,0,0,0.5)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(56,189,248,0.2)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px rgba(56,189,248,0.4)">
              <i class="fas fa-th-large" style="color:#FFF;font-size:15px"></i>
            </div>
            <div>
              <h3 class="font-headline" style="font-size:16px;font-weight:800;color:#F0F6FF;letter-spacing:-0.01em">CGL Prep Suite — Structured Tool Directory</h3>
              <p style="font-size:12px;color:#94AAC8;margin-top:2px">All 35 tools organized into 8 subject modules with dedicated cards & controls</p>
            </div>
          </div>
          <span class="chip chip-primary" style="font-size:11px;padding:5px 12px">35 Tools Active</span>
        </div>

        <div class="directory-grid">
          ${CATEGORIES.filter(c => !c.includes('Overview')).map(cat => {
            const tools = Object.entries(TOOLS).filter(([_, t]) => t.cat === cat)
            const catIcons = {
              '📐 Quant (Maths)': 'fa-calculator',
              '🧩 Reasoning': 'fa-puzzle-piece',
              '📖 English Language': 'fa-book-open',
              '🌍 General Awareness (GK)': 'fa-globe-asia',
              '🧠 Test Prep & Revision': 'fa-brain',
              '🤖 AI Tutors & Mentors': 'fa-user-astronaut',
              '📌 Saved & History': 'fa-bookmark'
            }
            const icon = catIcons[cat] || 'fa-folder'
            return `
            <div class="module-card">
              <div class="module-card-header">
                <div style="display:flex;align-items:center;gap:8px">
                  <i class="fas ${icon}" style="color:#38BDF8;font-size:14px"></i>
                  <span style="font-size:13px;font-weight:800;color:#F0F6FF">${cat}</span>
                </div>
                <span style="font-size:10px;font-weight:700;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.28);padding:2px 8px;border-radius:99px;color:#7DD3FC">${tools.length} Tools</span>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px">
                ${tools.map(([id, t]) => `
                  <button type="button" onclick="switchTool('${id}')" class="tool-link-card">
                    <div style="width:28px;height:28px;border-radius:7px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.28);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      <i class="fas ${t.icon}" style="font-size:11px;color:#38BDF8"></i>
                    </div>
                    <span style="font-size:12.5px;font-weight:600;color:#F0F6FF;flex:1;min-width:0" class="truncate">${t.name}</span>
                    <i class="fas fa-chevron-right" style="font-size:10px;color:#38BDF8;opacity:0.7"></i>
                  </button>
                `).join('')}
              </div>
            </div>
            `
          }).join('')}
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
    const completedGoals = STATE.dailyGoals.filter(g => g.completed).length
    const goalPct = Math.round((completedGoals / STATE.dailyGoals.length) * 100)
    const tips = [
      "Consistency is king: completing 8 micro-goals daily leads to 240 completed topic revisions every month."
    ]

    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-tasks', "Today's SSC CGL Preparation Goals", 'Track your daily study target checklist and build consistent study habits.', '📊 Overview & Stats')}
      
      <div class="card-dark card-3d" style="padding:24px 26px;margin-bottom:20px;border:1.5px solid rgba(56,189,248,0.35)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(56,189,248,0.2)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(56,189,248,0.4)">
              <i class="fas fa-check-double" style="color:#FFF;font-size:15px"></i>
            </div>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;color:#F0F6FF">Daily Goal Execution Checklist</h3>
              <p style="font-size:12px;color:#94AAC8;margin-top:2px">Click checkmark or Open Tool to jump directly into the target tool</p>
            </div>
          </div>
          <span class="highlight-pill-3d" style="background:${goalPct === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)'};color:${goalPct === 100 ? '#34D399' : '#7DD3FC'};border:1px solid ${goalPct === 100 ? 'rgba(16,185,129,0.4)' : 'rgba(56,189,248,0.4)'}">
            ${completedGoals}/${STATE.dailyGoals.length} Completed
          </span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px" id="goals-list">
          ${STATE.dailyGoals.map((g, i) => {
            const cnt    = typeof g.count  === 'number' ? g.count  : 0
            const tgt    = typeof g.target === 'number' ? g.target : 1
            const pct    = Math.min(Math.round(cnt / tgt * 100), 100)
            const done   = g.completed || cnt >= tgt
            const isOne  = tgt === 1
            return `
            <div class="goal-card-row card-3d" style="background:${done ? 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(10,15,30,0.95))' : 'linear-gradient(135deg,rgba(17,28,53,0.95),rgba(10,15,30,0.9))'};border:1.5px solid ${done ? 'rgba(16,185,129,0.4)' : 'rgba(56,189,248,0.25)'}">
              <div class="goal-card-left">
                <div onclick="toggleGoal(${i})" style="width:24px;height:24px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;${done ? 'background:#10B981;box-shadow:0 0 10px rgba(16,185,129,0.5)' : 'border:2px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.08)'}">
                  ${done ? '<i class="fas fa-check" style="color:#fff;font-size:11px"></i>' : ''}
                </div>
                <div style="flex:1;min-width:0">
                  <span style="font-size:13.5px;font-weight:700;${done ? 'text-decoration:line-through;color:#94A3B8' : 'color:#F0F6FF'}">${g.text}</span>
                  ${!isOne ? `
                  <div style="margin-top:6px;height:5px;border-radius:99px;background:rgba(255,255,255,0.08);overflow:hidden;max-width:280px">
                    <div style="height:100%;width:${pct}%;border-radius:99px;background:${done ? 'linear-gradient(90deg,#10B981,#34D399)' : 'linear-gradient(90deg,#38BDF8,#818CF8)'};transition:width 0.4s"></div>
                  </div>` : ''}
                </div>
              </div>
              <div class="goal-card-right">
                <span class="goal-target-badge ${done ? 'done' : ''}">
                  ${cnt}/${tgt} Target
                </span>
                <button type="button" onclick="switchTool('${g.tool}')" class="goal-open-btn">
                  Open Tool <i class="fas fa-arrow-right" style="font-size:10px;margin-left:4px"></i>
                </button>
              </div>
            </div>`
          }).join('')}
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(56,189,248,0.2)">
          <div class="prog-track" style="height:8px;border-radius:99px">
            <div class="prog-fill prog-accent" style="width:${goalPct}%;border-radius:99px;background:linear-gradient(90deg,#0EA5E9,#10B981)"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
            <span style="font-size:12px;font-weight:700;color:#94AAC8">Overall Today Progress: <strong style="color:#F0F6FF">${goalPct}% Complete</strong></span>
            <button onclick="resetGoals()" class="card-action-btn" style="border-color:rgba(239,68,68,0.35);color:#FCA5A5">
              <i class="fas fa-undo" style="font-size:9.5px;color:#F87171"></i> Reset Today's Goals
            </button>
          </div>
        </div>
      </div>
      ${toolFooter(['performance-dashboard', 'focus-study-timer', 'ai-mock-test'], tips)}
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
  function toolHeader(icon, title, desc, category = '', presets = []) {
    const tool = Object.values(TOOLS).find(t => t.name === title) || {}
    const catName = category || tool.cat || '📐 Quant (Maths)'
    const theme = CAT_THEMES[catName] || CAT_THEMES['📐 Quant (Maths)']

    return `<div class="tool-hero-header-3d" style="background:${theme.bgGrad} !important;border:${theme.border} !important;box-shadow:${theme.glow} !important">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="tool-header-icon-3d" style="background:${theme.iconGrad} !important">
            <i class="fas ${icon}" style="color:#FFF;font-size:21px"></i>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:10px">
              <h2 class="font-headline" style="font-size:20px;font-weight:800;color:#F0F6FF;letter-spacing:-0.015em">${title}</h2>
              <span class="highlight-pill-3d" style="background:${theme.badgeBg};color:${theme.badgeText};border:1px solid ${theme.accent}40">${catName}</span>
            </div>
            <p style="font-size:13px;color:#CBD5E1;margin-top:4px">${desc}</p>
          </div>
        </div>
      </div>
      ${presets && presets.length > 0 ? `
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap">
        <span style="font-size:11.5px;font-weight:800;color:${theme.accent};letter-spacing:0.02em;display:inline-flex;align-items:center;gap:5px">
          <i class="fas fa-bolt" style="color:#FCD34D;font-size:11px"></i> Quick Presets:
        </span>
        ${presets.map(p => {
          const inputId = p.inputId || ''
          const txt = typeof p === 'string' ? p : (p.text || '')
          const label = typeof p === 'string' ? p : (p.label || p.text || '')
          return `<button type="button" onclick="applyPreset('${inputId}','${txt.replace(/'/g, "\\'")}')" class="preset-chip" style="border-color:${theme.accent}60 !important;color:${theme.badgeText} !important"><i class="fas fa-tag" style="font-size:9.5px;color:${theme.accent}"></i> ${label}</button>`
        }).join('')}
      </div>` : ''}
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
    const presets = [
      { inputId: 'mock-topic', text: 'Mixed Tier-1 (Quant + Reasoning + English + GA)', label: 'Full Tier-1 Practice' },
      { inputId: 'mock-topic', text: 'Quantitative Aptitude (Algebra, Geometry, Profit & Loss)', label: 'Quant Special' },
      { inputId: 'mock-topic', text: 'Reasoning (Syllogism, Analogy, Coding-Decoding)', label: 'Reasoning Special' },
      { inputId: 'mock-topic', text: 'English Language (Grammar, Vocabulary, Synonyms)', label: 'English Special' },
      { inputId: 'mock-topic', text: 'General Awareness (History, Polity, Current Affairs)', label: 'GA Special' }
    ]
    const tips = [
      "In Tier-1, spend no more than 35-40 seconds per question. Skip immediately if stuck for over 60 seconds.",
      "Attempt General Awareness and English first to build momentum before tackling Quant and Reasoning."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-pen-to-square', 'AI Mock Test Generator', 'Generate a timed mini mock test with MCQs across subjects with instant score analytics.', '🧠 Test Prep & Revision', presets)}
      
      <div class="card-dark" style="padding:22px 24px;display:flex;flex-direction:column;gap:14px;margin-bottom:20px;border:1.5px solid rgba(244,63,94,0.35);background:rgba(17,28,53,0.95);box-shadow:0 6px 24px rgba(0,0,0,0.4)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <label style="font-size:13px;font-weight:800;color:#F0F6FF;letter-spacing:0.01em;display:flex;align-items:center;gap:7px">
            <i class="fas fa-sliders" style="color:#FB7185"></i> Configure Mock Test
          </label>
          <span style="font-size:11px;color:#94AAC8">Timed Simulation</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div>
            <label style="display:block;font-size:11.5px;font-weight:700;color:#CBD5E1;margin-bottom:6px">Test Subject / Topic Focus</label>
            <input type="text" id="mock-topic" placeholder="e.g. Mixed Tier-1, Geometry, Modern History..."
              style="width:100%;padding:11px 14px;font-size:13px;background:rgba(10,15,30,0.95);border:1.5px solid rgba(244,63,94,0.3);border-radius:10px;color:#F0F6FF">
          </div>
          <div>
            <label style="display:block;font-size:11.5px;font-weight:700;color:#CBD5E1;margin-bottom:6px">Number of MCQs</label>
            <select id="mock-count" style="width:100%;padding:11px 14px;font-size:13px;background:rgba(10,15,30,0.95);border:1.5px solid rgba(244,63,94,0.3);border-radius:10px;color:#F0F6FF">
              <option value="5">5 Questions (Express)</option>
              <option value="10" selected>10 Questions (Standard)</option>
              <option value="15">15 Questions (Intensive)</option>
              <option value="20">20 Questions (Full Drill)</option>
            </select>
          </div>
        </div>
        <button onclick="generateMockTest()" class="btn-primary" style="padding:12px;font-size:13.5px;font-weight:700;background:linear-gradient(135deg,#F43F5E,#E11D48) !important;border:none !important">
          <i class="fas fa-play" style="font-size:12px;margin-right:6px"></i> Start Timed Mock Test
        </button>
      </div>
      <div id="mock-output"></div>
      ${toolFooter(['formula-bank', 'pyq-analyser', 'error-log'], tips, '🧠 Test Prep & Revision')}
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
    const presets = [
      { inputId: 'rev-topics', text: 'Geometry (Triangles), Profit & Loss, Indian Polity Articles', label: 'Quant & Polity Weak Areas' },
      { inputId: 'rev-topics', text: 'Synonyms & Antonyms, Error Spotting, Reading Comprehension', label: 'English Comprehension' },
      { inputId: 'rev-topics', text: 'Syllogism, Blood Relations, Seating Arrangement', label: 'Reasoning Weak Areas' }
    ]
    const tips = [
      "Target high-weightage weak topics first during 7-day revision sprints for maximum score multiplier."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-brain', 'Smart Revision Planner', 'Get an AI-curated weak-area revision plan personalized to your focus topics.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'rev-topics', placeholder: 'Enter weak topics (e.g. Geometry, Synonyms, Indian History)...', label: 'Weak Topics or Focus Areas', btn: 'Generate Smart 7-Day Plan', onSubmit: 'generateRevisionPlan()', toolId: 'interactive-smart-revision', triggerFn: 'generateRevisionPlan' })}
      <div id="rev-output"></div>
      ${toolFooter(['ai-mock-test', 'flashcards', 'error-log'], tips)}
    </div>`
  }

  async function generateRevisionPlan() {
    const topics = document.getElementById('rev-topics').value.trim()
    if (!topics) return showToast('Please enter weak topics', 'error')
    const out = document.getElementById('rev-output')
    out.innerHTML = loadingHTML('Curating 7-day revision plan...')
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
    const presets = [
      { inputId: 'quant-input', text: 'If cost price of 15 articles is equal to selling price of 12 articles, find the profit percentage.', label: 'Profit & Loss' },
      { inputId: 'quant-input', text: 'A and B can do a work in 12 and 18 days respectively. A works for 4 days then B joins. In how many days is work completed?', label: 'Time & Work' },
      { inputId: 'quant-input', text: 'A sum of money at compound interest doubles itself in 4 years. In how many years will it become 8 times itself?', label: 'Compound Interest' },
      { inputId: 'quant-input', text: 'In a triangle ABC, angle B = 90 deg, AB = 6 cm, BC = 8 cm. Find the radius of its incircle.', label: 'Geometry' }
    ]
    const tips = [
      "Always check if option elimination or value assumption (e.g. x = 0 or x = 1) can solve the problem in 10 seconds before starting algebraic expansion.",
      "For Compound Interest, use the net percentage change formula (x + y + xy/100) for rapid calculation."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-calculator', 'Quant Problem Solver', 'Solve quantitative aptitude problems step-by-step with instant shortcut tricks.', '📐 Quant (Maths)', presets)}
      ${inputArea({ id: 'quant-input', placeholder: 'Paste your quantitative problem here or select a quick preset above...', label: 'Quantitative Problem or Math Question', btn: 'Solve Step-by-Step', onSubmit: 'solveQuant()', type: 'textarea', rows: 3, toolId: 'quant-solver', triggerFn: 'solveQuant' })}
      <div id="quant-output"></div>
      ${toolFooter(['formula-bank', 'pyq-analyser', 'interactive-smart-revision'], tips)}
    </div>`
  }

  async function solveQuant() {
    const raw = document.getElementById('quant-input').value.trim()
    if (!raw) showToast('🎲 Generating a surprise quant problem…', 'info')
    const out = document.getElementById('quant-output')
    out.innerHTML = loadingHTML('Solving problem with shortcut methods...')
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
    const presets = [
      { inputId: 'reason-input', text: 'Pointing to a photograph, A says "He is the son of the only daughter of my mother". How is A related to the person?', label: 'Blood Relations' },
      { inputId: 'reason-input', text: 'Statements: All dogs are cats. Some cats are birds. Conclusion I: Some dogs are birds. II: No dog is a bird.', label: 'Syllogism' },
      { inputId: 'reason-input', text: 'In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?', label: 'Coding-Decoding' },
      { inputId: 'reason-input', text: 'Find the next number in series: 7, 10, 16, 28, 52, ?', label: 'Number Series' }
    ]
    const tips = [
      "For Syllogisms, draw a quick 2-circle Venn diagram or check 100-50 distribution rules for 100% accuracy.",
      "For Coding-Decoding, quickly jot down letter positions (A=1...Z=26) to spot addition/subtraction patterns."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-puzzle-piece', 'Reasoning Solver', 'Solve verbal, non-verbal, and logical reasoning problems with detailed shortcut breakdowns.', '🧩 Reasoning', presets)}
      ${inputArea({ id: 'reason-input', placeholder: 'Paste your reasoning problem here or select a quick preset above...', label: 'Reasoning Problem or Logical Question', btn: 'Solve Reasoning Problem', onSubmit: 'solveReasoning()', type: 'textarea', rows: 3, toolId: 'reasoning-solver', triggerFn: 'solveReasoning' })}
      <div id="reason-output"></div>
      ${toolFooter(['para-jumble-solver', 'debate-simulator', 'pyq-analyser'], tips)}
    </div>`
  }

  async function solveReasoning() {
    const raw = document.getElementById('reason-input').value.trim()
    if (!raw) showToast('🎲 Generating a surprise reasoning problem…', 'info')
    const out = document.getElementById('reason-output')
    out.innerHTML = loadingHTML('Analyzing logical patterns...')
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
    const presets = [
      { inputId: 'pj-input', text: 'A. However, modern research suggests otherwise.\nB. People used to believe that the Earth was flat.\nC. This shift in perspective revolutionized navigation.\nD. Ships can now sail around the globe using satellite GPS.', label: 'Sample Para Jumble' }
    ]
    const tips = [
      "Find mandatory pairs first (pronoun referencing, cause & effect) to eliminate 2–3 options immediately."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-random', 'Para Jumble Solver', 'Master sentence rearrangement & paragraph logic with step-by-step explanations.', '🧩 Reasoning', presets)}
      ${inputArea({ id: 'pj-input', placeholder: 'Paste jumbled sentences (one per line) or use preset above...', label: 'Jumbled Sentences (A-D)', btn: 'Solve & Rearrange', onSubmit: 'solveParaJumble()', type: 'textarea', rows: 4, toolId: 'para-jumble-solver', triggerFn: 'generateParaJumble' })}
      <div id="pj-output"></div>
      ${toolFooter(['vocabulary', 'rc-practice', 'writing-assistant'], tips)}
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
    const presets = [
      { inputId: 'vocab-input', text: 'Ephemeral', label: 'Ephemeral' },
      { inputId: 'vocab-input', text: 'Garrulous', label: 'Garrulous' },
      { inputId: 'vocab-input', text: 'Munificent', label: 'Munificent' },
      { inputId: 'vocab-input', text: 'Obstinate', label: 'Obstinate' },
      { inputId: 'vocab-input', text: 'Pugnacious', label: 'Pugnacious' }
    ]
    const tips = [
      "Learn words in root-word clusters (e.g. Bene = Good -> Benevolent, Benefactor, Beneficial) to double your recall speed."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-book', 'Vocabulary Builder', 'Expand word power, synonyms, antonyms, memory tricks, and real exam sentences.', '📖 English Language', presets)}
      ${inputArea({ id: 'vocab-input', placeholder: 'Enter an English word (e.g. Ephemeral, Garrulous)...', label: 'English Word or Vocabulary Topic', btn: 'Analyze Word & Context', onSubmit: 'buildVocabulary()', type: 'text', rows: 2, toolId: 'vocabulary', triggerFn: 'learnRandomWord' })}
      <div id="vocab-output"></div>
      ${toolFooter(['rc-practice', 'writing-assistant', 'essay-scorer'], tips)}
    </div>`
  }

  async function buildVocabulary() {
    const raw = document.getElementById('vocab-input').value.trim()
    if (!raw) { learnRandomWord(); return }
    const out = document.getElementById('vocab-output')
    out.innerHTML = loadingHTML('Analyzing word etymology & synonyms...')
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
    out.innerHTML = loadingHTML('Selecting random high-yield word...')
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
    const presets = [
      { inputId: 'write-input', text: 'Neither the manager nor the employees was aware about the new safety rule.', label: 'Sample Sentence 1' },
      { inputId: 'write-input', text: 'He discussed about the matter with his friend yesterday.', label: 'Sample Sentence 2' }
    ]
    const tips = [
      "Pay special attention to Subject-Verb Agreement and Preposition errors as they account for over 40% of Error Spotting questions in Tier-1 & Tier-2."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-pen-fancy', 'English Writing Assistant', 'Get instant grammar corrections, error breakdowns, and tone enhancements.', '📖 English Language', presets)}
      ${inputArea({ id: 'write-input', placeholder: 'Paste your sentence or essay paragraph here for grammar check...', label: 'Text for Grammar & Improvement Analysis', btn: 'Check Grammar & Improve', onSubmit: 'improveWriting()', type: 'textarea', rows: 4, toolId: 'writing-assistant', triggerFn: 'improveWriting' })}
      <div id="write-output"></div>
      ${toolFooter(['vocabulary', 'essay-scorer', 'rc-practice'], tips)}
    </div>`
  }

  async function improveWriting() {
    const text = document.getElementById('write-input').value.trim()
    if (!text) return showToast('Please enter text to improve', 'error')
    const out = document.getElementById('write-output')
    out.innerHTML = loadingHTML('Analyzing grammar & structure...')
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
    const presets = [
      { inputId: 'essay-topic', text: 'Impact of Digital India on Governance and Economy', label: 'Digital India' },
      { inputId: 'essay-topic', text: 'Climate Change: Challenges and India\'s Commitments', label: 'Climate Change' }
    ]
    const tips = [
      "Always structure your essay into 4 distinct paragraphs: Introduction, Key Arguments & Examples, Challenges/Solution, and Conclusion."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-star-half-alt', 'Essay & Letter Evaluator', 'Get detailed scoring breakdown, content feedback, and grammatical corrections.', '📖 English Language', presets)}
      <div class="card-dark" style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
        <div>
          <label style="font-size:12px;font-weight:700;color:#38BDF8;letter-spacing:0.02em">Essay or Letter Topic</label>
          <input type="text" id="essay-topic" placeholder="e.g. India's Digital Revolution, Renewable Energy..." style="margin-top:6px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
        </div>
        <div>
          <label style="font-size:12.5px;font-weight:700;color:#38BDF8;letter-spacing:0.02em">Essay / Letter Content</label>
          <textarea id="essay-text" placeholder="Paste your essay draft here..." rows="7" style="margin-top:6px;padding:12px 14px;font-size:13.5px;line-height:1.6;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full resize-none"></textarea>
        </div>
        <button onclick="scoreEssay()" class="btn-primary w-full" style="padding:12px 18px;font-size:13.5px;font-weight:700">
          <i class="fas fa-star" style="font-size:12px"></i> Score & Evaluate Essay
        </button>
      </div>
      <div id="essay-output"></div>
      ${toolFooter(['writing-assistant', 'vocabulary'], tips)}
    </div>`
  }

  async function scoreEssay() {
    const topic = document.getElementById('essay-topic').value.trim()
    const text = document.getElementById('essay-text').value.trim()
    if (!text) return showToast('Please write your essay', 'error')
    const out = document.getElementById('essay-output')
    out.innerHTML = loadingHTML('Evaluating essay parameters & scoring...')
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
    const presets = [
      { inputId: 'rc-topic', text: 'Climate Change & Global Economy', label: 'Economy & Climate' },
      { inputId: 'rc-topic', text: 'Artificial Intelligence in Education', label: 'Technology' },
      { inputId: 'rc-topic', text: 'Indian Freedom Movement & Social Reforms', label: 'History' }
    ]
    const tips = [
      "Read the RC questions first before reading the passage to know exactly which keywords to locate."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-glasses', 'RC Comprehension', 'Practice Reading Comprehension with AI-generated exam-level passages & questions.', '📖 English Language', presets)}
      ${inputArea({ id: 'rc-topic', placeholder: 'Enter RC genre or topic (e.g. Environment, Economy, History)...', label: 'Reading Comprehension Genre / Topic', btn: 'Generate RC Passage & Quiz', onSubmit: 'generateRC()', type: 'text', rows: 2, toolId: 'rc-practice', triggerFn: 'generateRC' })}
      <div id="rc-output"></div>
      ${toolFooter(['vocabulary', 'para-jumble-solver', 'writing-assistant'], tips)}
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
    const presets = [
      { inputId: 'ca-input', text: 'Union Budget Key Highlights & Tax Slabs', label: 'Union Budget' },
      { inputId: 'ca-input', text: 'ISRO Space Missions & Gaganyaan', label: 'ISRO & Space' },
      { inputId: 'ca-input', text: 'National Sports Awards & Winners', label: 'Sports Awards' },
      { inputId: 'ca-input', text: 'Government Welfare Schemes & Portals', label: 'Govt Schemes' }
    ]
    const tips = [
      "For Current Affairs, focus heavily on Appointments, Schemes, Awards, and Defense Exercises from the last 6–8 months."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-newspaper', 'Current Affairs Digest', 'Get exam-relevant current affairs notes with static GK links and high-yield facts.', '🌍 General Awareness (GK)', presets)}
      ${inputArea({ id: 'ca-input', placeholder: 'Enter a topic (e.g. Union Budget, ISRO Missions)...', label: 'Current Affairs Topic or News Event', btn: 'Fetch Exam Notes', onSubmit: 'getCurrentAffairs()', type: 'text', rows: 2, toolId: 'current-affairs', triggerFn: 'getCurrentAffairs' })}
      <div id="ca-output"></div>
      ${toolFooter(['static-gk', 'ca-linker', 'acronym-explainer'], tips)}
    </div>`
  }

  async function getCurrentAffairs() {
    const raw = document.getElementById('ca-input').value.trim()
    const topic = raw || 'a recent trending national or international event relevant to SSC CGL General Awareness (pick something important and recent)'
    if (!raw) showToast('🎲 Fetching a surprise current affairs topic…', 'info')
    const out = document.getElementById('ca-output')
    out.innerHTML = loadingHTML('Searching latest exam-relevant news...')
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
    const presets = [
      { inputId: 'gk-input', text: 'Fundamental Rights and Articles 12-35', label: 'Polity: Fundamental Rights' },
      { inputId: 'gk-input', text: 'Major Rivers of India and their Tributaries', label: 'Geography: Rivers' },
      { inputId: 'gk-input', text: 'Important Battles in Medieval & Modern Indian History', label: 'History: Battles' },
      { inputId: 'gk-input', text: 'Vitamins and Deficiency Diseases', label: 'Science: Biology' }
    ]
    const tips = [
      "In Indian Polity, memorize Articles 14–32 (Fundamental Rights) and Articles 52–151 (Union Government) thoroughly."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-globe', 'Static GK Repository', 'Comprehensive revision notes on History, Polity, Geography, Science & Economy.', '🌍 General Awareness (GK)', presets)}
      ${inputArea({ id: 'gk-input', placeholder: 'Enter a topic (e.g. Indian Rivers, Fundamental Rights)...', label: 'Static GK Topic or Subject', btn: 'Fetch Revision Notes', onSubmit: 'getStaticGK()', type: 'text', rows: 2, toolId: 'static-gk', triggerFn: 'getStaticGK' })}
      <div id="gk-output"></div>
      ${toolFooter(['current-affairs', 'ca-linker', 'gk-story-weaver'], tips)}
    </div>`
  }

  async function getStaticGK() {
    const raw = document.getElementById('gk-input').value.trim()
    const topic = raw || 'a random static GK topic from SSC CGL syllabus (pick something from: History, Geography, Polity, Economy, Science & Tech, or Awards)'
    if (!raw) showToast('🎲 Generating a surprise GK topic…', 'info')
    const out = document.getElementById('gk-output')
    out.innerHTML = loadingHTML('Compiling static GK notes...')
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
    const presets = [
      { inputId: 'concept-input', text: 'Trigonometric Identities & Quadrants', label: 'Trigonometry' },
      { inputId: 'concept-input', text: 'Syllogism 100-50 Method', label: 'Syllogism Method' },
      { inputId: 'concept-input', text: 'Inflation: CPI vs WPI', label: 'Economics: Inflation' }
    ]
    const tips = [
      "Understand the core concept first before attempting shortcut memorization for long-term retention."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-lightbulb', 'Concept Explainer', 'Get deep, simple, step-by-step explanations of complex exam concepts.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'concept-input', placeholder: 'Enter a concept (e.g. Compound Interest, Syllogism, Tenses)...', label: 'Concept to Explain', btn: 'Explain Concept', onSubmit: 'explainConcept()', type: 'text', rows: 2, toolId: 'concept-explainer', triggerFn: 'explainConcept' })}
      <div id="concept-output"></div>
      ${toolFooter(['mind-map-generator', 'revision-sheet', 'compare-contrast'], tips)}
    </div>`
  }

  async function explainConcept() {
    const raw = document.getElementById('concept-input').value.trim()
    const concept = raw || 'a random SSC CGL concept (pick something interesting from Quant, Reasoning, or English sections)'
    if (!raw) showToast('🎲 Picking a surprise concept…', 'info')
    const out = document.getElementById('concept-output')
    out.innerHTML = loadingHTML('Breaking down concept step-by-step...')
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
    const presets = [
      { inputId: 'cmp-a', text: 'Lok Sabha', label: 'Lok Sabha vs Rajya Sabha' },
      { inputId: 'cmp-b', text: 'Rajya Sabha', label: '' }
    ]
    const tips = [
      "Comparison tables are extremely effective for confusing Polity and History concepts."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-balance-scale', 'Compare & Contrast', 'Side-by-side comparative analysis of confusing topics or exam concepts.', '🧠 Test Prep & Revision', presets)}
      <div class="card-dark" style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#38BDF8">First Topic</label>
            <input type="text" id="cmp-a" placeholder="e.g. Lok Sabha, Simple Interest..." style="margin-top:6px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#38BDF8">Second Topic</label>
            <input type="text" id="cmp-b" placeholder="e.g. Rajya Sabha, Compound Interest..." style="margin-top:6px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
          </div>
        </div>
        <button onclick="compareTopics()" class="btn-primary w-full" style="padding:12px 18px;font-size:13.5px;font-weight:700">
          <i class="fas fa-balance-scale" style="font-size:12px"></i> Generate Comparison Table
        </button>
      </div>
      <div id="cmp-output"></div>
      ${toolFooter(['concept-explainer', 'static-gk'], tips)}
    </div>`
  }

  async function compareTopics() {
    const a = document.getElementById('cmp-a').value.trim()
    const b = document.getElementById('cmp-b').value.trim()
    if (!a || !b) return showToast('Please enter both topics', 'error')
    const out = document.getElementById('cmp-output')
    out.innerHTML = loadingHTML('Building comparison matrix...')
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
    const presets = [
      { inputId: 'acro-input', text: 'NABARD', label: 'NABARD' },
      { inputId: 'acro-input', text: 'IRDAI', label: 'IRDAI' },
      { inputId: 'acro-input', text: 'NITI Aayog', label: 'NITI Aayog' },
      { inputId: 'acro-input', text: 'UNICEF', label: 'UNICEF' }
    ]
    const tips = [
      "Look out for full forms of financial regulatory bodies and international organizations in SSC CGL Tier-1 GA."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-font', 'Acronym Decrypter', 'Decode important abbreviations, government bodies, and international organizations.', '🌍 General Awareness (GK)', presets)}
      ${inputArea({ id: 'acro-input', placeholder: 'Enter an acronym (e.g. NABARD, SEBI, IRDAI)...', label: 'Acronym or Abbreviation', btn: 'Decode & Explain', onSubmit: 'explainAcronym()', type: 'text', rows: 2, toolId: 'acronym-explainer', triggerFn: 'listImportantAcronyms' })}
      <div id="acro-output"></div>
      ${toolFooter(['current-affairs', 'static-gk'], tips)}
    </div>`
  }

  async function explainAcronym() {
    const raw = document.getElementById('acro-input').value.trim()
    const acronym = raw || 'a random important acronym from the SSC CGL General Awareness syllabus (pick a financial, scientific, or governmental body acronym)'
    if (!raw) showToast('🎲 Picking a surprise acronym…', 'info')
    const out = document.getElementById('acro-output')
    out.innerHTML = loadingHTML('Decoding acronym & fetching facts...')
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
    out.innerHTML = loadingHTML('Compiling top 25 exam acronyms...')
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
    const presets = [
      { inputId: 'link-input', text: 'India launches new satellite Chandrayaan-4 mission.', label: 'Space Mission' },
      { inputId: 'link-input', text: 'Supreme Court bench rules on Electoral Bonds validity.', label: 'Polity & Judiciary' }
    ]
    const tips = [
      "SSC examiners frequently frame Static GK questions based on recent news events (e.g. asking about Constitutional Articles related to a recent court ruling)."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-link', 'CA to Static Linker', 'Connect recent news headlines to underlying static GK concepts for 360° preparation.', '🌍 General Awareness (GK)', presets)}
      ${inputArea({ id: 'link-input', placeholder: 'Enter a current news event or headline...', label: 'Current News Headline or Event', btn: 'Link News to Static GK', onSubmit: 'linkCAtoStatic()', type: 'textarea', rows: 3, toolId: 'ca-linker', triggerFn: 'linkCAtoStatic' })}
      <div id="link-output"></div>
      ${toolFooter(['current-affairs', 'static-gk'], tips)}
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
  // ═══════════════════════════════════════════════════════════
  // FLASHCARDS
  // ═══════════════════════════════════════════════════════════
  let flashcards = [], fcIndex = 0, fcFlipped = false

  function renderFlashcards(el) {
    const presets = [
      { inputId: 'fc-topic', text: 'Important Constitutional Articles & Schedules', label: 'Polity Articles' },
      { inputId: 'fc-topic', text: 'High-Frequency SSC CGL Synonyms & Antonyms', label: 'Vocab Flashcards' },
      { inputId: 'fc-topic', text: 'Quant Mensuration 2D & 3D Formulas', label: 'Quant Formulas' }
    ]
    const tips = [
      "Use spaced repetition: test yourself on cards you got wrong 24 hours later to lock facts into long-term memory."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-layer-group', 'Active Recall Flashcards', 'Generate digital flashcards for fast retrieval and spaced repetition study.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'fc-topic', placeholder: 'Enter a topic (e.g. Indian Rivers, Vocab, Formulas)...', label: 'Flashcard Topic or Subject', btn: 'Generate 10 Flashcards', onSubmit: 'generateFlashcards()', type: 'text', rows: 2, toolId: 'flashcards', triggerFn: 'generateFlashcards' })}
      <div id="fc-output"></div>
      ${toolFooter(['mind-map-generator', 'mnemonic-generator', 'interactive-smart-revision'], tips)}
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
    const presets = [
      { inputId: 'mm-input', text: 'Indian Constitution Architecture & Sources', label: 'Polity Map' },
      { inputId: 'mm-input', text: 'Mughal Empire Rulers & Achievements', label: 'History Map' },
      { inputId: 'mm-input', text: 'Algebraic Identities & Formulas', label: 'Maths Map' }
    ]
    const tips = [
      "Visual mind maps improve retention by 40% compared to reading linear textbook paragraphs."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-project-diagram', 'Visual Mind Maps', 'Generate structured visual mind maps to grasp complex topic hierarchies.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'mm-input', placeholder: 'Enter a topic (e.g. Indian Constitution, Profit & Loss)...', label: 'Mind Map Topic', btn: 'Generate Visual Mind Map', onSubmit: 'generateMindMap()', type: 'text', rows: 2, toolId: 'mind-map-generator', triggerFn: 'generateMindMap' })}
      <div id="mm-output"></div>
      ${toolFooter(['concept-explainer', 'revision-sheet', 'flashcards'], tips)}
    </div>`
  }

  async function generateMindMap() {
    const raw = document.getElementById('mm-input').value.trim()
    const topic = raw || 'a random SSC CGL topic suitable for a mind map (pick from: Indian Polity, History, Science, Maths concepts, or Economics)'
    if (!raw) showToast('🎲 Building a surprise mind map…', 'info')
    const out = document.getElementById('mm-output')
    out.innerHTML = loadingHTML('Building visual mind map structure...')
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
    const presets = [
      { inputId: 'mnem-input', text: 'Names of Fundamental Rights Articles 14-32', label: 'Fundamental Rights' },
      { inputId: 'mnem-input', text: '9 Neighboring Countries of India', label: 'India Neighbors' },
      { inputId: 'mnem-input', text: 'Order of Taxonomical Classification (Kingdom, Phylum...)', label: 'Biology Classification' }
    ]
    const tips = [
      "Rhyming and acronym mnemonics are best for memorizing long ordered lists."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-magic', 'Memory Mnemonics', 'Create catchy memory aids and acronym tricks for hard-to-remember facts.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'mnem-input', placeholder: 'Enter what you need to remember (e.g. Planet names, Soil types)...', label: 'Concept or List to Memorize', btn: 'Generate Mnemonics', onSubmit: 'generateMnemonic()', type: 'text', rows: 2, toolId: 'mnemonic-generator', triggerFn: 'generateMnemonic' })}
      <div id="mnem-output"></div>
      ${toolFooter(['flashcards', 'acronym-explainer', 'gk-story-weaver'], tips)}
    </div>`
  }

  async function generateMnemonic() {
    const raw = document.getElementById('mnem-input').value.trim()
    const input = raw || 'a random list or concept from the SSC CGL syllabus that is commonly hard to memorise (e.g. Constitutional Schedules, Vitamins, Indian dance forms, Trigonometry identities)'
    if (!raw) showToast('🎲 Generating a surprise mnemonic…', 'info')
    const out = document.getElementById('mnem-output')
    out.innerHTML = loadingHTML('Crafting memory tricks...')
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
    const presets = [
      { inputId: 'summ-input', text: 'The Reserve Bank of India (RBI) is India\'s central bank and regulatory body responsible for regulation of the Indian banking system. It is under the ownership of Ministry of Finance, Government of India. It is responsible for the control, issue and maintaining supply of the Indian rupee.', label: 'Sample RBI Text' }
    ]
    const tips = [
      "Summarizing long editorials daily boosts your reading speed for Tier-2 English."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-compress-alt', 'Document Summarizer', 'Paste long articles, study notes, or news editorials for high-yield summaries.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'summ-input', placeholder: 'Paste your notes or article text here...', label: 'Article / Notes Text to Summarize', btn: 'Summarize Text', onSubmit: 'summarizeDocument()', type: 'textarea', rows: 5, toolId: 'document-summarizer', triggerFn: 'summarizeDocument' })}
      <div id="summ-output"></div>
      ${toolFooter(['revision-sheet', 'rc-practice'], tips)}
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
    const presets = [
      { inputId: 'rev-sheet-input', text: 'Trigonometry Ratios, Identities & Heights', label: 'Trigonometry Cheatsheet' },
      { inputId: 'rev-sheet-input', text: 'Indian Polity Articles, Schedules & Amendments', label: 'Polity Cheatsheet' },
      { inputId: 'rev-sheet-input', text: 'SSC CGL Tier-1 English Grammar Rules & Prepositions', label: 'Grammar Cheatsheet' }
    ]
    const tips = [
      "Print or screenshot revision sheets and review them 30 minutes before taking any Mock Test."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-clipboard-list', 'Quick Revision Cheatsheet', 'Generate dense, high-yield one-page cheatsheets for fast pre-exam revision.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'rev-sheet-input', placeholder: 'Enter topics (e.g. Trigonometry formulas, Polity Articles)...', label: 'Cheatsheet Topics or Subject', btn: 'Generate Revision Cheatsheet', onSubmit: 'generateRevisionSheet()', type: 'text', rows: 2, toolId: 'revision-sheet', triggerFn: 'generateRevisionSheet' })}
      <div id="rev-sheet-output"></div>
      ${toolFooter(['formula-bank', 'mind-map-generator', 'document-summarizer'], tips)}
    </div>`
  }

  async function generateRevisionSheet() {
    const raw = document.getElementById('rev-sheet-input').value.trim()
    const topics = raw || 'a random high-value SSC CGL topic (pick something frequently tested: Formulas, Grammar rules, GK facts, or Polity)'
    if (!raw) showToast('🎲 Creating a surprise revision sheet…', 'info')
    const out = document.getElementById('rev-sheet-output')
    out.innerHTML = loadingHTML('Compiling one-page cheatsheet...')
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
    const presets = [
      { inputId: 'tts-input', text: 'Fundamental Rights under Article 12 to 35 of the Indian Constitution guarantee civil liberties to all citizens.', label: 'Sample Audio Text' }
    ]
    const tips = [
      "Listening to audio revisions while commuting or resting helps build passive recall of GK facts."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-headphones', 'Audio Revision (TTS)', 'Convert your notes and facts into clear audio playback for hands-free study.', '🧠 Test Prep & Revision', presets)}
      ${inputArea({ id: 'tts-input', placeholder: 'Paste text or notes to convert to audio...', label: 'Text to Play as Audio', btn: 'Play Audio Revision', onSubmit: 'playTTS()', type: 'textarea', rows: 4, toolId: 'tts', triggerFn: 'playTTS' })}
      <div id="tts-output"></div>
      ${toolFooter(['document-summarizer', 'revision-sheet'], tips)}
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
    const history = STATE[historyKey] || []
    const presets = [
      { inputId, text: 'Explain the most important short-tricks for Mensuration & Geometry in SSC CGL.', label: 'Math Shortcuts' },
      { inputId, text: 'Give me 5 high-frequency vocabulary words with mnemonics for SSC CGL Tier-1.', label: 'Vocab Boost' },
      { inputId, text: 'Explain Article 32 of Indian Constitution and its 5 Writs with memory tricks.', label: 'Polity Writs' },
      { inputId, text: 'How should I structure my last 30 days revision for Tier-1 to maximize score?', label: 'Strategy Guide' }
    ]
    return `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-user-astronaut', title, desc, '🤖 AI Tutors & Mentors', presets)}
      <div class="card-dark" style="padding:22px 24px;border:1.5px solid rgba(99,102,241,0.35);background:rgba(17,28,53,0.95);box-shadow:0 6px 24px rgba(0,0,0,0.4)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid rgba(99,102,241,0.2)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#4F46E5);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(99,102,241,0.4)">
              <span style="font-size:16px">${icon}</span>
            </div>
            <div>
              <span style="font-size:14px;font-weight:800;color:#F0F6FF">${title} Workspace</span>
              <div style="font-size:11px;color:#C7D2FE">Live AI Session Active</div>
            </div>
          </div>
          <button onclick="clearChat('${historyKey}')" class="card-action-btn" style="border-color:rgba(239,68,68,0.4);color:#FCA5A5" title="Clear chat history">
            <i class="fas fa-trash-alt" style="font-size:10.5px;color:#F87171"></i> Clear Chat
          </button>
        </div>

        <div id="chat-${type}" style="min-height:300px;max-height:480px;overflow-y:auto;padding:16px 12px;display:flex;flex-direction:column;gap:14px;margin-top:12px">
          ${history.length === 0 ? `
            <div style="text-align:center;padding:40px 20px;color:#94AAC8">
              <div style="font-size:32px;margin-bottom:10px">${icon}</div>
              <p style="font-size:13.5px;font-weight:700;color:#F0F6FF">Start a conversation with your ${title}</p>
              <p style="font-size:12px;color:#94AAC8;margin-top:4px">Select a quick prompt preset above or type your question below!</p>
            </div>
          ` : history.map((msg) => `
            <div style="display:flex;justify-content:${msg.role === 'user' ? 'flex-end' : 'flex-start'}" class="animate-fade-in">
              <div style="max-width:82%;padding:14px 18px;border-radius:14px;background:${msg.role === 'user' ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(56,189,248,0.18))' : 'rgba(10,15,30,0.92)'};border:1.5px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.45)' : 'rgba(56,189,248,0.22)'};box-shadow:0 4px 16px rgba(0,0,0,0.3)">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
                  <span style="font-size:11px;font-weight:800;color:${msg.role === 'user' ? '#818CF8' : '#38BDF8'}">
                    ${msg.role === 'user' ? '👤 You' : `${icon} ${title}`}
                  </span>
                  <button onclick="copyMsgText(this)" class="card-action-btn" style="padding:2px 7px;font-size:10px" title="Copy message">
                    <i class="fas fa-copy" style="font-size:9px"></i>
                  </button>
                </div>
                <div class="prose" style="font-size:13px">${msg.role === 'user' ? msg.content[0].text : sanitizeAIHTML(msg.content[0].text)}</div>
              </div>
            </div>
          `).join('')}
          <div id="chat-end-${type}"></div>
        </div>

        <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
          <input type="text" id="${inputId}" placeholder="Ask your ${title} anything about SSC CGL..."
            style="flex:1;padding:12px 16px;font-size:13.5px;background:rgba(10,15,30,0.95);border:1.5px solid rgba(99,102,241,0.35);border-radius:10px;color:#F0F6FF"
            onkeydown="if(event.key==='Enter') sendChat('${historyKey}', '${type}', '${inputId}')">
          <button onclick="sendChat('${historyKey}', '${type}', '${inputId}')"
            class="btn-primary" style="padding:12px 22px;flex-shrink:0;font-weight:700;background:linear-gradient(135deg,#6366F1,#4F46E5) !important;border:none !important">
            <i class="fas fa-paper-plane" style="font-size:12px"></i> ${btnLabel || 'Send'}
          </button>
        </div>
      </div>
      ${toolFooter(['ai-tutor', 'study-buddy', 'debate-simulator', 'interview-simulator'], ['Break down complex subjects into 10-minute micro-study sessions to maximize memory retention.'], '🤖 AI Tutors & Mentors')}
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
    const presets = [
      { inputId: 'story-input', text: 'India\'s Space Programme & ISRO Achievements', label: 'ISRO History' },
      { inputId: 'story-input', text: 'Revolt of 1857 & Freedom Struggle Pioneers', label: 'Revolt of 1857' },
      { inputId: 'story-input', text: 'The Journey of Indian Constitution Framing', label: 'Constitution Story' }
    ]
    const tips = [
      "Narrative memory anchors make history dates and polity facts 3x easier to recall in exam situations."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-book-open', 'GK Story Weaver', 'Learn complex General Awareness topics through engaging, memorable narrative stories.', '🤖 AI Tutors & Mentors', presets)}
      ${inputArea({ id: 'story-input', placeholder: 'Enter a GK topic (e.g. India\'s Space Programme, British Raj, Indian Rivers)...', label: 'GK Topic or Historical Event', btn: 'Weave Story', onSubmit: 'generateGKStory()', type: 'text', rows: 2, toolId: 'gk-story-weaver', triggerFn: 'generateGKStory' })}
      <div id="story-output"></div>
      ${toolFooter(['static-gk', 'current-affairs', 'mnemonic-generator'], tips)}
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
    const presets = [
      { inputId: 'hobby-name', text: 'Cricket', label: 'Cricket' },
      { inputId: 'hobby-name', text: 'Photography', label: 'Photography' },
      { inputId: 'hobby-name', text: 'Cooking', label: 'Cooking' }
    ]
    const tips = [
      "Connecting personal interests to syllabus topics builds natural curiosity and effortless retention."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-heart', 'Hobby Connector', 'Connect your hobbies and interests to SSC CGL General Awareness & exam concepts.', '🤖 AI Tutors & Mentors', presets)}
      
      <div class="card-dark" style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;margin-bottom:16px;border:1px solid rgba(56,189,248,0.18)">
        <div>
          <label style="font-size:12px;font-weight:700;color:#38BDF8">Your Hobby or Interest</label>
          <input type="text" id="hobby-name" placeholder="e.g. Cricket, Cooking, Photography, Gaming..." style="margin-top:4px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#38BDF8">SSC CGL Subject / Topic (Optional)</label>
          <input type="text" id="hobby-topic" placeholder="e.g. Physics, Geography, Indian Economy..." style="margin-top:4px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
        </div>
        <button onclick="connectHobby()" class="btn-primary" style="padding:12px 18px;font-size:13.5px;font-weight:700">
          <i class="fas fa-link" style="font-size:12px"></i> Connect Hobby to SSC Syllabus
        </button>
      </div>

      <div id="hobby-output"></div>
      ${toolFooter(['static-gk', 'gk-story-weaver'], tips)}
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
    const logs = STATE.historyLog || []
    const tips = [
      "Reviewing past generated questions helps reinforce long-term memory and prevents repeating past mistakes."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-history', 'History & Session Logs', 'Complete history of all generated practice questions, solutions & sessions.', '📁 Saved & History')}
      
      <div class="card-dark card-3d" style="padding:24px 26px;border:1.5px solid rgba(56,189,248,0.35);margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(56,189,248,0.2)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0284C7,#0369A1);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(56,189,248,0.4)">
              <i class="fas fa-history" style="color:#FFF;font-size:16px"></i>
            </div>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;color:#F0F6FF">Session History Record</h3>
              <p style="font-size:12px;color:#94AAC8;margin-top:2px">Hover over any question box to reveal <b>View</b> and <b>Remove</b> options</p>
            </div>
          </div>
          ${logs.length > 0 ? `
          <button onclick="clearHistory()" class="btn-danger-3d">
            <i class="fas fa-trash-alt"></i> Clear All History
          </button>` : ''}
        </div>

        <div style="max-height:620px;overflow-y:auto;padding-right:8px;display:flex;flex-direction:column;gap:12px">
          ${logs.length === 0 ? `
          <div style="text-align:center;padding:54px 20px;color:#94AAC8">
            <i class="fas fa-history" style="font-size:42px;color:rgba(56,189,248,0.3);margin-bottom:14px;display:block"></i>
            <p style="font-size:16px;font-weight:800;color:#F0F6FF">No practice history recorded yet</p>
            <p style="font-size:13px;margin-top:4px">Solve questions using any tool and your history will be logged here automatically.</p>
          </div>` :
          logs.map(entry => {
            const promptText = entry.input || entry.prompt || 'Generated Question'
            const dateStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recent'
            return `
            <div class="history-card-box card-3d" onclick="openHistoryModal('${entry.id}')">
              <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="highlight-pill-3d" style="background:rgba(56,189,248,0.18);color:#7DD3FC;border:1px solid rgba(56,189,248,0.35)">${entry.tool || 'AI Practice'}</span>
                  <span style="font-size:11.5px;color:#94AAC8;font-weight:500"><i class="fas fa-clock" style="font-size:10px;margin-right:4px"></i>${dateStr}</span>
                </div>
                <div style="font-size:13.5px;color:#F0F6FF;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  <span style="color:#38BDF8;font-size:11.5px;text-transform:uppercase;letter-spacing:0.04em;font-weight:800">Question:</span> ${promptText}
                </div>
              </div>
              <div class="history-card-actions">
                <button type="button" onclick="event.stopPropagation(); openHistoryModal('${entry.id}')" class="btn-view-3d">
                  <i class="fas fa-eye" style="font-size:10px"></i> View
                </button>
                <button type="button" onclick="event.stopPropagation(); removeHistoryItem('${entry.id}')" class="btn-danger-3d" style="min-width:80px !important">
                  <i class="fas fa-trash-alt" style="font-size:10px"></i> Remove
                </button>
              </div>
            </div>`
          }).join('')}
        </div>
      </div>
      ${toolFooter(['bookmarks', 'performance-dashboard'], tips)}
    </div>`
  }

  function clearHistory() {
    if (confirm('Clear all history entries?')) {
      STATE.historyLog = []
      saveState()
      delete STATE.toolCache['history-logs']
      delete STATE.toolCache['history-log']
      renderTool('history-logs', document.getElementById('tool-container'))
      showToast('All history entries cleared', 'info')
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BOOKMARKS SECTION
  // ═══════════════════════════════════════════════════════════
  function renderBookmarks(el) {
    const bkms = STATE.bookmarks || []
    const tips = [
      "Targeted revision of saved bookmarks 48 hours before mock tests significantly increases conceptual accuracy."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-bookmark', 'Saved Bookmarks', 'Your saved questions, solutions & notes for quick revision.', '📁 Saved & History')}
      
      <div class="card-dark card-3d" style="padding:24px 26px;border:1.5px solid rgba(56,189,248,0.35);margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(56,189,248,0.2)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#F59E0B,#D97706);display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(245,158,11,0.4)">
              <i class="fas fa-bookmark" style="color:#FFF;font-size:16px"></i>
            </div>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;color:#F0F6FF">Saved Bookmarks Repository</h3>
              <p style="font-size:12px;color:#94AAC8;margin-top:2px">Hover over any question box to reveal <b>View</b> and <b>Remove</b> options</p>
            </div>
          </div>
          ${bkms.length > 0 ? `
          <button onclick="clearAllBookmarks()" class="btn-danger-3d">
            <i class="fas fa-trash-alt"></i> Clear All Bookmarks
          </button>` : ''}
        </div>

        <div style="max-height:620px;overflow-y:auto;padding-right:8px;display:flex;flex-direction:column;gap:12px">
          ${bkms.length === 0 ? `
          <div style="text-align:center;padding:54px 20px;color:#94AAC8">
            <i class="fas fa-bookmark" style="font-size:42px;color:rgba(252,211,77,0.3);margin-bottom:14px;display:block"></i>
            <p style="font-size:16px;font-weight:800;color:#F0F6FF">No bookmarked questions saved yet</p>
            <p style="font-size:13px;margin-top:4px">Click the <b>Save / Bookmark</b> button on any AI solution to save questions for revision.</p>
          </div>` :
          bkms.map(bkm => {
            const promptText = bkm.prompt || bkm.title || bkm.tool || 'Saved Question'
            const dateStr = bkm.timestamp ? new Date(bkm.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Saved'
            return `
            <div class="history-card-box card-3d" onclick="openBookmarkModal('${bkm.id}')">
              <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="highlight-pill-3d" style="background:rgba(252,211,77,0.18);color:#FDE68A;border:1px solid rgba(252,211,77,0.35)">${bkm.tool || 'Saved Note'}</span>
                  <span style="font-size:11.5px;color:#94AAC8;font-weight:500"><i class="fas fa-clock" style="font-size:10px;margin-right:4px"></i>${dateStr}</span>
                </div>
                <div style="font-size:13.5px;color:#F0F6FF;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  <span style="color:#FCD34D;font-size:11.5px;text-transform:uppercase;letter-spacing:0.04em;font-weight:800">Question:</span> ${promptText}
                </div>
              </div>
              <div class="history-card-actions">
                <button type="button" onclick="event.stopPropagation(); openBookmarkModal('${bkm.id}')" class="btn-view-3d">
                  <i class="fas fa-eye" style="font-size:10px"></i> View
                </button>
                <button type="button" onclick="event.stopPropagation(); removeBookmark('${bkm.id}')" class="btn-danger-3d" style="min-width:80px !important">
                  <i class="fas fa-trash-alt" style="font-size:10px"></i> Remove
                </button>
              </div>
            </div>`
          }).join('')}
        </div>
      </div>
      ${toolFooter(['history-logs', 'performance-dashboard'], tips)}
    </div>`
  }

  function clearAllBookmarks() {
    if (confirm('Remove all saved bookmarks?')) {
      STATE.bookmarks = []
      saveState()
      delete STATE.toolCache['bookmarks']
      delete STATE.toolCache['saved-bookmarks']
      renderTool('bookmarks', document.getElementById('tool-container'))
      showToast('All bookmarks cleared', 'info')
    }
  }

  // Intercept fetch to inject API key header & route to correct backend
  const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '3000' ? 'http://localhost:5000' : '')
    : 'https://ssc-prep-suite-backend-123.onrender.com';

  const originalFetch = window.fetch
  window.fetch = function(url, options = {}) {
    let targetUrl = url
    if (typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('/modules/') || url.startsWith('/users/'))) {
      if (BACKEND_URL) {
        targetUrl = BACKEND_URL + url
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
    const presets = [
      { inputId: 'formula-input', text: 'Quant - Mensuration 2D & 3D', label: 'Mensuration' },
      { inputId: 'formula-input', text: 'Quant - Trigonometry Identities', label: 'Trigonometry' },
      { inputId: 'formula-input', text: 'Quant - Algebra Shortcuts', label: 'Algebra' },
      { inputId: 'formula-input', text: 'Reasoning - Coding & Series Shortcuts', label: 'Reasoning Series' }
    ]
    const tips = [
      "Revise 2D/3D Mensuration formulas daily – 3-4 direct formula-based questions appear in Tier-1 every year."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-superscript', 'Shortcut Formula Bank', 'Instant access to all Quant & Reasoning shortcut formulas, theorems, and exam tricks.', '📐 Quant (Maths)', presets)}
      ${inputArea({ id: 'formula-input', placeholder: 'Enter custom topic (e.g. Profit & Loss shortcuts, Pipes & Cisterns)...', label: 'Formula Topic or Math Branch', btn: 'Fetch Formula Sheet', onSubmit: 'loadFormulaCustom()', type: 'text', rows: 2, toolId: 'formula-bank', triggerFn: 'loadFormulaCustom' })}
      <div id="formula-output"></div>
      ${toolFooter(['quant-solver', 'pyq-analyser', 'revision-sheet'], tips)}
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
    const presets = [
      { inputId: 'pyq-input', text: 'Percentage & Profit Loss 2021-2024', label: 'Profit & Loss PYQs' },
      { inputId: 'pyq-input', text: 'Trigonometry & Heights 2020-2024', label: 'Trigonometry PYQs' },
      { inputId: 'pyq-input', text: 'Indian Polity Fundamental Rights 2019-2024', label: 'Polity PYQs' }
    ]
    const tips = [
      "Over 60% of SSC CGL Quant questions are direct pattern repetitions from previous 5 years' papers."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-archive', 'PYQ Exam Analyser', 'Analyse real previous year questions (PYQs) with shift-wise breakdown & trend analysis.', '📐 Quant (Maths)', presets)}
      ${inputArea({ id: 'pyq-input', placeholder: 'Enter a topic to get PYQs + detailed trend analysis...', label: 'Previous Year Question Topic or Subject', btn: 'Analyse Real PYQs', onSubmit: 'analysePYQCustom()', type: 'text', rows: 2, toolId: 'pyq-analyser', triggerFn: 'analysePYQCustom' })}
      <div id="pyq-output"></div>
      ${toolFooter(['quant-solver', 'formula-bank', 'ai-mock-test'], tips)}
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
    const topic = raw || 'a random high-frequency SSC CGL topic (pick from: Profit Loss, Geometry, Trigonometry, Reasoning Syllogism, or Indian Polity)'
    analysePYQ(topic)
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR LOG (Mistake Tracker)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // ERROR LOG (Mistake Tracker)
  // ═══════════════════════════════════════════════════════════
  function renderErrorLog(el) {
    const logs = STATE.errorLog || []
    const presets = [
      { inputId: 'err-question', text: 'If 2x + 3y = 12 and xy = 4, find 4x² + 9y².', label: 'Sample Quant Mistake' },
      { inputId: 'err-question', text: 'In a row of 40 students, A is 12th from left. What is his position from right?', label: 'Sample Reasoning Mistake' }
    ]
    const tips = [
      "Reviewing your Error Log weekly is proven to increase score by 20+ marks by eliminating repeat mistakes."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-exclamation-circle', 'Mistake & Error Log', 'Track your wrong answers, identify recurring weak patterns, and analyze root causes.', '📊 Overview & Stats', presets)}
      
      <!-- Log New Mistake Card -->
      <div class="card-dark" style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;margin-bottom:18px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3 style="font-size:14px;font-weight:800;color:#F0F6FF;letter-spacing:-0.01em;display:flex;align-items:center;gap:6px">
            <i class="fas fa-plus-circle" style="color:#38BDF8"></i> Log a New Mistake
          </h3>
          <span style="font-size:11px;color:#94AAC8">Identify & Eliminate Weaknesses</span>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#38BDF8">Question or Problem</label>
            <input type="text" id="err-question" placeholder="Paste the question you got wrong..." style="margin-top:4px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF" class="w-full">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;font-weight:700;color:#FB923C">Your Wrong Answer</label>
              <input type="text" id="err-wrong" placeholder="What you selected..." style="margin-top:4px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(251,146,60,0.3);border-radius:10px;color:#FED7AA" class="w-full">
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;color:#34D399">Correct Answer & Method</label>
              <input type="text" id="err-correct" placeholder="Correct solution..." style="margin-top:4px;padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(52,211,153,0.3);border-radius:10px;color:#A7F3D0" class="w-full">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center">
            <select id="err-subject" style="padding:11px 14px;font-size:13.5px;background:rgba(10,15,30,0.9);border:1.5px solid rgba(56,189,248,0.22);border-radius:10px;color:#F0F6FF">
              <option value="">Select Subject Category</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Reasoning">Reasoning</option>
              <option value="English Language">English Language</option>
              <option value="General Awareness">General Awareness</option>
            </select>
            <button onclick="addErrorEntry()" class="btn-coral" style="padding:11px 20px;font-size:13px;font-weight:700;white-space:nowrap">
              <i class="fas fa-plus" style="font-size:11px"></i> Add Mistake
            </button>
          </div>
        </div>
      </div>

      <!-- Logged Entries List -->
      <div class="card-dark" style="padding:20px 22px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:8px">
            <h3 style="font-size:14px;font-weight:800;color:#F0F6FF">Logged Mistakes (${logs.length})</h3>
            <span style="font-size:11px;color:#94AAC8">Review regularly</span>
          </div>
          ${logs.length > 0 ? `
          <div style="display:flex;align-items:center;gap:8px">
            <button onclick="getAIAnalysis()" class="btn-primary" style="padding:6px 12px;font-size:11.5px">
              <i class="fas fa-brain" style="font-size:10px"></i> Run AI Error Analysis
            </button>
            <button onclick="clearErrorLog()" class="btn-ghost" style="padding:6px 10px;font-size:11px;color:#F87171">
              <i class="fas fa-trash" style="font-size:10px"></i> Clear All
            </button>
          </div>` : ''}
        </div>

        ${logs.length === 0 ? `
        <div style="text-align:center;padding:36px 20px">
          <i class="fas fa-clipboard-check" style="font-size:36px;color:rgba(56,189,248,0.3);margin-bottom:10px;display:block"></i>
          <p style="font-size:14px;font-weight:700;color:#F0F6FF">No mistakes logged yet!</p>
          <p style="font-size:12px;color:#94AAC8;margin-top:4px">Start logging questions you answer wrong in mock tests to track weak topics.</p>
        </div>
        ` : `
        <div style="display:flex;flex-direction:column;gap:10px">
          ${logs.map((entry, i) => `
          <div style="padding:14px 16px;border-radius:10px;background:rgba(15,22,41,0.8);border:1px solid rgba(56,189,248,0.18);display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="chip chip-primary" style="font-size:10px">${entry.subject || 'General'}</span>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:11px;color:#637A96">${new Date(entry.timestamp).toLocaleDateString('en-IN')}</span>
                <button onclick="removeError(${i})" style="color:#F87171;background:none;border:none;cursor:pointer;font-size:11px" title="Delete entry"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <p style="font-size:13px;font-weight:600;color:#F0F6FF;margin:0"><strong style="color:#38BDF8">Q:</strong> ${entry.question}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">
              <span style="font-size:12px;color:#FCA5A5;background:rgba(239,68,68,0.08);padding:6px 10px;border-radius:6px;border:1px solid rgba(239,68,68,0.2)"><i class="fas fa-times" style="margin-right:4px"></i>Wrong: ${entry.wrong}</span>
              <span style="font-size:12px;color:#6EE7B7;background:rgba(16,185,129,0.08);padding:6px 10px;border-radius:6px;border:1px solid rgba(16,185,129,0.2)"><i class="fas fa-check" style="margin-right:4px"></i>Correct: ${entry.correct}</span>
            </div>
          </div>
          `).join('')}
        </div>`}
      </div>

      <div id="error-ai-output" style="margin-top:16px"></div>
      ${toolFooter(['performance-dashboard', 'interactive-smart-revision', 'ai-mock-test'], tips)}
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
    const tips = [
      "25 minutes of deep focus with zero phone distractions produces double the learning retention of 2 hours of fragmented study."
    ]
    el.innerHTML = `
    <div class="w-full animate-fade-in" style="display:flex;flex-direction:column">
      ${toolHeader('fa-stopwatch', 'Focus Study Timer', 'Pomodoro study technique: 25 minutes focused study + 5 minutes break for peak concentration.', '📊 Overview & Stats')}
      
      <div class="card-dark" style="padding:32px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px;margin-bottom:18px">
        <div id="pom-mode-label" class="chip chip-primary" style="font-size:12px;padding:4px 14px">📚 Focus Study Session</div>
        <div id="pom-display" class="font-headline" style="font-size:72px;font-weight:800;color:#38BDF8;letter-spacing:0.04em;line-height:1;text-shadow:0 0 24px rgba(56,189,248,0.3)">25:00</div>
        
        <div class="w-full" style="height:8px;border-radius:99px;background:rgba(255,255,255,0.08);overflow:hidden;max-width:480px">
          <div id="pom-progress" style="height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,#0EA5E9,#8B5CF6);transition:width 0.4s ease"></div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:6px">
          <button onclick="pomodoroStart()" id="pom-btn-start" class="btn-primary" style="padding:12px 28px;font-size:14px;font-weight:700">
            <i class="fas fa-play" style="font-size:12px"></i> Start Focus Session
          </button>
          <button onclick="pomodoroPause()" id="pom-btn-pause" class="btn-secondary hidden" style="padding:12px 22px;font-size:14px;font-weight:700">
            <i class="fas fa-pause" style="font-size:12px"></i> Pause
          </button>
          <button onclick="pomodoroReset()" class="btn-secondary" style="padding:12px 22px;font-size:14px;font-weight:700">
            <i class="fas fa-redo" style="font-size:12px"></i> Reset
          </button>
        </div>

        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);width:100%">
          <button onclick="pomodoroSetTime(25,'study')" class="chip chip-primary cursor-pointer" style="font-size:11.5px;padding:5px 12px">25 min Study</button>
          <button onclick="pomodoroSetTime(5,'break')" class="chip chip-green cursor-pointer" style="font-size:11.5px;padding:5px 12px">5 min Break</button>
          <button onclick="pomodoroSetTime(15,'break')" class="chip chip-amber cursor-pointer" style="font-size:11.5px;padding:5px 12px">15 min Long Break</button>
        </div>
      </div>

      <div class="card-dark-sm" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <span style="font-size:13px;font-weight:700;color:#F0F6FF">Completed Sessions Today</span>
          <p style="font-size:11.5px;color:#94AAC8;margin-top:2px">Target: <strong style="color:#38BDF8">8+ sessions/day</strong> (approx. 3.5 hours focused study)</p>
        </div>
        <span class="chip chip-violet" id="pom-count" style="font-size:14px;font-weight:800;padding:6px 14px">${_pomodoroCount} 🍅</span>
      </div>

      ${toolFooter(['daily-goals', 'performance-dashboard'], tips)}
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


