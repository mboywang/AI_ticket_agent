import './style.css';

/* ══════════ NAVIGATION ══════════ */
const navLinks = document.querySelectorAll('.nav-links a');
const pages = document.querySelectorAll('.page');
const gotoButtons = document.querySelectorAll('[data-goto]');

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(a => a.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    document.querySelector(`[data-page="${id}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerAnimations();
  }
}

navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
gotoButtons.forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.goto)));

/* ══════════ SCROLL ANIMATIONS ══════════ */
function triggerAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-animate]:not(.visible)').forEach(el => observer.observe(el));
}
triggerAnimations();

/* ══════════ KPI COUNTER ANIMATION ══════════ */
function animateCounters() {
  document.querySelectorAll('.kpi-value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = prefix + current.toLocaleString() + suffix;
    }, 25);
  });
}

const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { animateCounters(); kpiObserver.unobserve(entry.target); } });
}, { threshold: 0.3 });
const kpiSection = document.getElementById('kpi-section');
if (kpiSection) kpiObserver.observe(kpiSection);

/* ══════════ ONBOARDING WIZARD ══════════ */
let selectedPSA = null;
let currentWizStep = 1;
const totalWizSteps = 5;

const psaNames = { connectwise: 'ConnectWise Manage', autotask: 'Datto Autotask', halopsa: 'HaloPSA' };
const psaURLs = {
  connectwise: 'https://api.connectwise.com/v4_6_release',
  autotask: 'https://webservices.autotask.net/ATServicesRest',
  halopsa: 'https://yourcompany.halopsa.com'
};
const psaCompany = { connectwise: 'davidsmsp_corp', autotask: 'api.user@davidsmsp.com', halopsa: 'davidsmsp' };

// PSA Card Selection
document.querySelectorAll('.psa-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.psa-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPSA = card.dataset.psa;
    const btn = document.getElementById('btn-wiz-1-next');
    btn.disabled = false;
    btn.textContent = `Continue with ${psaNames[selectedPSA]} →`;
  });
});

// Wizard Navigation
function goToWizStep(step) {
  if (step < 1 || step > totalWizSteps) return;
  currentWizStep = step;

  // Update panels
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`wiz-panel-${step}`);
  if (panel) panel.classList.add('active');

  // Update progress bar
  const wizSteps = document.querySelectorAll('.wiz-step');
  const connectors = document.querySelectorAll('.wiz-connector');
  wizSteps.forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i + 1 === step) s.classList.add('active');
    else if (i + 1 < step) s.classList.add('completed');
  });
  connectors.forEach((c, i) => {
    c.classList.toggle('completed', i + 1 < step);
  });

  // Update PSA name in step 2
  if (step === 2 && selectedPSA) {
    document.getElementById('selected-psa-name').textContent = psaNames[selectedPSA];
    document.getElementById('manual-psa-type').textContent = psaNames[selectedPSA];
    document.getElementById('pulled-psa-type').textContent = psaNames[selectedPSA];
    // Show correct field set
    document.querySelectorAll('.psa-fields').forEach(f => f.classList.add('hidden'));
    const fields = document.getElementById(`fields-${selectedPSA}`);
    if (fields) fields.classList.remove('hidden');
    // Update auto-pull mock data
    document.getElementById('pull-url').textContent = psaURLs[selectedPSA] || '';
    document.getElementById('pull-company').textContent = psaCompany[selectedPSA] || '';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  triggerAnimations();
}

// Step 1 → Step 2
document.getElementById('btn-wiz-1-next')?.addEventListener('click', () => {
  if (selectedPSA) goToWizStep(2);
});

// Client Toggle (Step 2)
document.querySelectorAll('.toggle-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.toggle-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const type = card.dataset.client;
    document.getElementById('flow-existing').classList.toggle('hidden', type !== 'existing');
    document.getElementById('flow-new').classList.toggle('hidden', type !== 'new');
  });
});

// Existing Client: Verify Account
document.getElementById('btn-verify-account')?.addEventListener('click', function () {
  const result = document.getElementById('verify-result');
  const emailInput = document.getElementById('mspbots-email');
  const email = emailInput?.value || 'david@davidsmsp.com';
  this.textContent = '⏳ Looking up account…';
  this.disabled = true;
  result.textContent = '';
  result.className = 'connection-result';

  setTimeout(() => {
    result.textContent = `✅ Account found for ${email}! Retrieving API keys…`;
    result.className = 'connection-result success';

    setTimeout(() => {
      document.getElementById('auto-pulled-keys').classList.remove('hidden');
      this.textContent = '✅ Account Verified';

      // Animate sync items sequentially
      const items = document.querySelectorAll('.sync-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(8px)';
        item.style.transition = 'all 0.4s ease';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 300 + i * 250);
      });
    }, 1200);
  }, 1500);
});

// New Client: Test Manual Connection
document.getElementById('btn-test-manual')?.addEventListener('click', function () {
  const result = document.getElementById('manual-connect-result');
  this.textContent = '⏳ Connecting…';
  this.disabled = true;
  result.textContent = '';

  setTimeout(() => {
    result.textContent = '✅ Connected! 142 companies, 3,847 contacts synced.';
    result.className = 'connection-result success';
    this.textContent = '🔗 Connected';

  }, 1800);
});

// Step 2 → Step 3
document.getElementById('btn-wiz-2-next')?.addEventListener('click', () => goToWizStep(3));
document.getElementById('btn-wiz-2-back')?.addEventListener('click', () => goToWizStep(1));

// Step 3 → Step 4 (Channels)
document.getElementById('btn-wiz-3-next')?.addEventListener('click', () => goToWizStep(4));
document.getElementById('btn-wiz-3-back')?.addEventListener('click', () => goToWizStep(2));

// Step 4 (Channels) → Step 5 (Voice)
document.getElementById('btn-wiz-4-next')?.addEventListener('click', () => goToWizStep(5));
document.getElementById('btn-wiz-4-back')?.addEventListener('click', () => goToWizStep(3));

// Step 5 back
document.getElementById('btn-wiz-5-back')?.addEventListener('click', () => goToWizStep(4));

/* ══════════ CHANNEL TOGGLE (Step 4) ══════════ */
const channelNames = { phone: 'Phone', sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', teams: 'Microsoft Teams' };

function updateChannelSummary() {
  const active = [...document.querySelectorAll('.channel-config-card.selected')].map(c => channelNames[c.dataset.channel]);
  document.getElementById('channel-count').textContent = active.length;
  document.getElementById('channel-list').textContent = active.length ? active.join(', ') : 'None';
}

document.querySelectorAll('.channel-config-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('selected');
    const toggle = card.querySelector('.toggle-switch');
    toggle.classList.toggle('active');
    updateChannelSummary();
  });
});

// Agent Name & Personality (Step 4)
function getAgentName() {
  return document.getElementById('agent-name')?.value?.trim() || 'Anna';
}

document.getElementById('agent-name')?.addEventListener('input', function () {
  const name = getAgentName();
  const phoneAgentName = document.getElementById('phone-agent-name');
  const goLiveAgentName = document.getElementById('golive-agent-name');
  if (phoneAgentName) phoneAgentName.textContent = name;
  if (goLiveAgentName) goLiveAgentName.textContent = name;
});

// Personality Chips
document.querySelectorAll('.personality-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.personality-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
  });
});

// Phone Number Search & Pick (Step 4)
const cityNames = ['Dallas, TX', 'Houston, TX', 'Austin, TX', 'San Antonio, TX', 'Fort Worth, TX', 'Plano, TX', 'Arlington, TX', 'El Paso, TX', 'Irving, TX', 'Frisco, TX', 'Los Angeles, CA', 'San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Miami, FL', 'Denver, CO', 'Seattle, WA', 'Phoenix, AZ', 'Boston, MA', 'Atlanta, GA'];
let selectedPhoneNumber = null;

function generatePhoneNumbers(areaCode) {
  const numbers = [];
  for (let i = 0; i < 5; i++) {
    const mid = String(Math.floor(Math.random() * 900) + 100);
    const last = String(Math.floor(Math.random() * 9000) + 1000);
    const city = cityNames[Math.floor(Math.random() * cityNames.length)];
    numbers.push({
      number: `+1 (${areaCode}) ${mid}-${last}`,
      location: city,
      caps: ['Voice', 'SMS', 'MMS']
    });
  }
  return numbers;
}

document.getElementById('btn-search-numbers')?.addEventListener('click', function () {
  const areaCode = document.getElementById('area-code')?.value || '555';
  if (areaCode.length < 3) {
    document.getElementById('area-code').focus();
    return;
  }
  this.textContent = '⏳ Searching…';
  this.disabled = true;

  setTimeout(() => {
    const numbers = generatePhoneNumbers(areaCode);
    const list = document.getElementById('phone-number-list');
    list.innerHTML = numbers.map((n, i) => `
      <div class="phone-number-card" data-phone="${n.number}" style="animation-delay:${i * 0.08}s">
        <div class="phone-num-info">
          <div class="phone-num-icon">📞</div>
          <div>
            <div class="phone-num-text">${n.number}</div>
            <div class="phone-num-location">📍 ${n.location}</div>
          </div>
        </div>
        <div class="phone-num-caps">
          ${n.caps.map(c => `<span class="phone-cap">${c}</span>`).join('')}
        </div>
        <div class="phone-check"></div>
      </div>
    `).join('');

    document.getElementById('phone-results').classList.remove('hidden');
    this.textContent = '🔍 Search Available Numbers';
    this.disabled = false;

    // Attach selection listeners
    list.querySelectorAll('.phone-number-card').forEach(card => {
      card.addEventListener('click', () => {
        list.querySelectorAll('.phone-number-card').forEach(c => {
          c.classList.remove('selected');
          c.querySelector('.phone-check').textContent = '';
        });
        card.classList.add('selected');
        card.querySelector('.phone-check').textContent = '✓';
        selectedPhoneNumber = card.dataset.phone;
        // Show provision button
        document.getElementById('provision-action').classList.remove('hidden');
      });
    });
  }, 1200);
});

// Area code input: digits only
document.getElementById('area-code')?.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

// Provision & Go Live (Step 4)
document.getElementById('btn-provision')?.addEventListener('click', function () {
  if (!selectedPhoneNumber) return;
  const name = getAgentName();
  this.textContent = '⏳ Provisioning…';
  this.disabled = true;
  setTimeout(() => {
    this.textContent = '✅ Number Provisioned';
    document.getElementById('provision-result').textContent = `✅ ${selectedPhoneNumber} is now active and assigned to ${name}.`;

  }, 1500);
});

document.getElementById('btn-go-live')?.addEventListener('click', function () {
  const name = getAgentName();
  this.textContent = `🎉 ${name} is LIVE!`;
  this.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
  setTimeout(() => showPage('aisop'), 1200);
});

/* ══════════ TICKET BOARD ══════════ */
const tickets = [
  { id: 'TK-4821', title: 'Cannot print to HP LaserJet', sub: 'Printer offline', client: 'TechCorp', priority: 'low', time: '2m ago', status: 'resolved', filter: 'ai-resolved' },
  { id: 'TK-4822', title: 'M365 account locked out', sub: 'Password reset needed', client: 'Acme Legal', priority: 'medium', time: '5m ago', status: 'resolved', filter: 'ai-resolved' },
  { id: 'TK-4823', title: 'VPN connection dropping', sub: 'Intermittent connectivity', client: 'Nova Health', priority: 'high', time: '8m ago', status: 'in-progress', filter: 'in-progress' },
  { id: 'TK-4824', title: 'Server RAID degraded — Disk 3', sub: 'Critical infrastructure', client: 'Summit Financial', priority: 'critical', time: '12m ago', status: 'escalated', filter: 'escalated' },
  { id: 'TK-4825', title: 'Outlook calendar not syncing', sub: 'Exchange connectivity', client: 'Bright Marketing', priority: 'low', time: '15m ago', status: 'resolved', filter: 'ai-resolved' },
  { id: 'TK-4826', title: 'New employee onboarding — IT setup', sub: 'Account provisioning', client: 'TechCorp', priority: 'medium', time: '20m ago', status: 'in-progress', filter: 'in-progress' },
  { id: 'TK-4827', title: 'WiFi password request — Guest', sub: 'Access request', client: 'Acme Legal', priority: 'low', time: '22m ago', status: 'resolved', filter: 'ai-resolved' },
  { id: 'TK-4828', title: 'Firewall blocking Teams calls', sub: 'Port configuration', client: 'Nova Health', priority: 'high', time: '30m ago', status: 'escalated', filter: 'escalated' },
  { id: 'TK-4829', title: 'MFA setup assistance', sub: 'Security configuration', client: 'Summit Financial', priority: 'low', time: '35m ago', status: 'resolved', filter: 'ai-resolved' },
  { id: 'TK-4830', title: 'Shared drive permissions error', sub: 'Access denied on \\\\fileserver\\shared', client: 'Bright Marketing', priority: 'medium', time: '41m ago', status: 'in-progress', filter: 'in-progress' },
];

function renderTickets(filter = 'all') {
  const board = document.getElementById('ticket-board');
  if (!board) return;
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.filter === filter);
  board.innerHTML = filtered.map(t => `
    <div class="ticket-row" data-filter="${t.filter}">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-title">${t.title}<small>${t.sub}</small></div>
      <div class="ticket-client">${t.client}</div>
      <div class="ticket-priority ${t.priority}">${t.priority.toUpperCase()}</div>
      <div class="ticket-time">${t.time}</div>
      <div class="ticket-status ${t.status}">${t.status === 'ai-resolved' || t.status === 'resolved' ? '🤖 AI Resolved' : t.status === 'in-progress' ? '⏳ In Progress' : '🔴 Escalated'}</div>
    </div>
  `).join('');
}
renderTickets();

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTickets(btn.dataset.filter);
  });
});

/* ══════════ ANNA CHAT SIMULATION ══════════ */
const chatScript = [
  { role: 'anna', text: '👋 Thank you for calling MSPbots support. This is Anna, your AI technician. Can I verify your identity first?', delay: 0 },
  { role: 'user', text: 'Hi Anna, this is Daniel from TechCorp.', delay: 1500 },
  { role: 'anna', text: '✅ I\'ve confirmed your identity, Daniel. You\'re listed as IT Manager at TechCorp. How can I help you today?', delay: 2500 },
  { role: 'user', text: 'I\'m locked out of my Microsoft 365 account.', delay: 4000 },
  { role: 'anna', text: 'I understand. I\'ll need to perform a hard verification before I can reset your credentials. I\'m sending a 6-digit code to your phone ending in **4821**. One moment…', delay: 5000 },
  { role: 'anna', text: '📱 Verification code sent via SMS.', action: 'MFA SENT', delay: 6500 },
  { role: 'user', text: 'Got it — the code is 847291.', delay: 8000 },
  { role: 'anna', text: '✅ Verified! I\'m resetting your M365 password now via our secure API…', action: 'RESETTING PASSWORD', delay: 9000 },
  { role: 'anna', text: '🎉 Done! Your temporary password has been sent to your recovery email. You\'ll be prompted to change it on first login. Ticket **TK-4831** has been logged and **auto-closed**. Is there anything else?', action: 'TICKET RESOLVED', delay: 10500 },
  { role: 'user', text: 'That was incredible — thank you, Anna!', delay: 12500 },
  { role: 'anna', text: 'Happy to help, Daniel! Have a great day. 🙂', delay: 13500 },
];

let chatTimers = [];
function runChatSim() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';
  chatTimers.forEach(clearTimeout);
  chatTimers = [];
  chatScript.forEach(msg => {
    const timer = setTimeout(() => {
      const div = document.createElement('div');
      div.className = `chat-msg ${msg.role}`;
      div.innerHTML = `<div class="msg-label">${msg.role === 'anna' ? '🤖 Anna AI' : '👤 Daniel (Client)'}</div>${msg.text}${msg.action ? `<span class="msg-action">⚡ ${msg.action}</span>` : ''}`;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }, msg.delay);
    chatTimers.push(timer);
  });
}

document.getElementById('btn-replay')?.addEventListener('click', runChatSim);

// Auto-play when Dashboard (which now contains Anna) is shown
const annaTarget = document.getElementById('page-dashboard');
if (annaTarget) {
  const annaObserver = new MutationObserver(() => {
    if (annaTarget.classList.contains('active')) runChatSim();
  });
  annaObserver.observe(annaTarget, { attributes: true, attributeFilter: ['class'] });
}

/* ══════════ ROI CALCULATOR ══════════ */
function updateCalc() {
  const techs = parseInt(document.getElementById('calc-techs')?.value || 15);
  const salary = parseInt(document.getElementById('calc-salary')?.value || 60);
  const ticketsVal = parseInt(document.getElementById('calc-tickets')?.value || 1200);

  document.getElementById('calc-techs-val').textContent = techs;
  document.getElementById('calc-salary-val').textContent = '$' + salary + 'K';
  document.getElementById('calc-tickets-val').textContent = ticketsVal.toLocaleString();

  const savings = Math.round(techs * salary * 0.8 * 0.5);
  const autoResolved = Math.round(ticketsVal * 0.8);
  const fteFreed = Math.round(techs * 0.8);

  document.getElementById('calc-savings').textContent = '$' + savings.toLocaleString() + ',000';
  document.getElementById('calc-auto').textContent = autoResolved.toLocaleString();
  document.getElementById('calc-fte').textContent = fteFreed;
}

['calc-techs', 'calc-salary', 'calc-tickets'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateCalc);
});

/* ══════════ SCROLL TO ANNA SECTION ══════════ */
document.getElementById('btn-scroll-anna')?.addEventListener('click', () => {
  document.getElementById('anna-section')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════ WIZARD STEP 3 — DOC CONNECTION ══════════ */
let wizSelectedSource = null;

const wizPlatforms = {
  itglue: {
    name: 'IT Glue',
    hint: 'IT Glue → Admin → Settings → API Keys',
    subPlaceholder: 'e.g. yourcompany'
  },
  hudu: {
    name: 'Hudu',
    hint: 'Hudu → Admin → API → Manage API Keys',
    subPlaceholder: 'e.g. docs.yourcompany.com'
  }
};

// Platform card clicks inside wizard
document.querySelectorAll('#wiz-source-cards .sop-source-card').forEach(card => {
  card.addEventListener('click', () => {
    wizSelectedSource = card.dataset.source;
    const platform = wizPlatforms[wizSelectedSource];

    document.querySelectorAll('#wiz-source-cards .sop-source-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    document.getElementById('wiz-api-title').textContent = `🔗 Connect to ${platform.name}`;
    document.getElementById('wiz-platform-name').textContent = platform.name;
    document.getElementById('wiz-api-label').textContent = platform.name;
    document.getElementById('wiz-subdomain-label').textContent = platform.name;
    document.getElementById('wiz-api-subdomain').placeholder = platform.subPlaceholder;
    document.getElementById('wiz-api-hint').innerHTML = `Find your API key in <strong>${platform.hint}</strong>`;

    // Reset
    document.getElementById('wiz-api-result').classList.add('hidden');
    document.getElementById('wiz-api-result').className = 'sop-api-result hidden';
    document.getElementById('wiz-connect-progress').classList.add('hidden');
    document.getElementById('wiz-connect-success').classList.add('hidden');
    document.getElementById('wiz-btn-api-connect').disabled = true;
    document.getElementById('wiz-api-key').value = '';
    document.getElementById('wiz-api-subdomain').value = '';
    const pullBtn = document.getElementById('wiz-btn-api-pull');
    if (pullBtn) { pullBtn.textContent = 'Check MSPbots'; pullBtn.disabled = false; }

    document.getElementById('wiz-api-panel').classList.remove('hidden');
  });
});

// Back button
document.getElementById('wiz-btn-api-back')?.addEventListener('click', () => {
  document.getElementById('wiz-api-panel').classList.add('hidden');
  document.querySelectorAll('#wiz-source-cards .sop-source-card').forEach(c => c.classList.remove('selected'));
  wizSelectedSource = null;
});

// Check MSPbots
document.getElementById('wiz-btn-api-pull')?.addEventListener('click', function () {
  const platform = wizPlatforms[wizSelectedSource];
  this.textContent = '⏳ Checking…';
  this.disabled = true;
  const resultEl = document.getElementById('wiz-api-result');

  setTimeout(() => {
    const found = Math.random() > 0.5;
    resultEl.classList.remove('hidden', 'success', 'not-found');
    if (found) {
      resultEl.classList.add('success');
      resultEl.innerHTML = `✅ <strong>API key found!</strong> Your ${platform.name} API key is already stored in MSPbots.`;
      document.getElementById('wiz-api-key').value = '••••••••-••••-••••-••••-••••••••••••';
      document.getElementById('wiz-api-subdomain').value = 'acme-msp';
      document.getElementById('wiz-btn-api-connect').disabled = false;
      this.textContent = '✅ Found';
    } else {
      resultEl.classList.add('not-found');
      resultEl.innerHTML = `⚠️ <strong>Not found in MSPbots.</strong> Please enter your ${platform.name} API key manually below.`;
      this.textContent = '❌ Not Found';
    }
  }, 1500);
});

// Manual inputs enable connect button
['wiz-api-key', 'wiz-api-subdomain'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    const key = document.getElementById('wiz-api-key')?.value.trim();
    const sub = document.getElementById('wiz-api-subdomain')?.value.trim();
    document.getElementById('wiz-btn-api-connect').disabled = !(key && sub);
  });
});

// Toggle visibility
document.getElementById('wiz-btn-api-toggle')?.addEventListener('click', () => {
  const inp = document.getElementById('wiz-api-key');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
});

// Connect & Verify
document.getElementById('wiz-btn-api-connect')?.addEventListener('click', function () {
  const platform = wizPlatforms[wizSelectedSource];
  this.disabled = true;
  this.textContent = '⏳ Connecting…';

  const progress = document.getElementById('wiz-connect-progress');
  const fill = document.getElementById('wiz-progress-fill');
  const text = document.getElementById('wiz-progress-text');
  progress.classList.remove('hidden');

  const steps = [
    { pct: 20, msg: `Authenticating with ${platform.name}…` },
    { pct: 50, msg: 'Verifying API access…' },
    { pct: 80, msg: 'Scanning documentation…' },
    { pct: 100, msg: '✅ Connected successfully!' }
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      fill.style.width = step.pct + '%';
      text.textContent = step.msg;

      if (i === steps.length - 1) {
        setTimeout(() => {
          // Show success
          const success = document.getElementById('wiz-connect-success');
          success.classList.remove('hidden');
          success.className = 'sop-api-result success';
          success.innerHTML = `✅ <strong>${platform.name} connected!</strong> 24 SOPs and 8 runbooks found. These will be imported when you go live.`;


        }, 400);
      }
    }, 600 * (i + 1));
  });
});

/* ══════════ AI SOP TRAINING CENTER ══════════ */
const sopSkillFiles = [
  {
    id: 'call-greeting',
    name: 'call_greeting.skill.md',
    icon: '📞',
    description: 'Greeting script & caller authentication flow',
    status: 'active',
    content: `---
name: Call Greeting & Authentication
description: Controls how Anna greets callers, verifies identity, and routes the call
triggers:
  - inbound call
  - greeting
  - hello
  - who is this
  - verify identity
priority: highest
---

# Call Greeting & Authentication SOP

## Step 1: Initial Greeting
- Answer within 2 rings
- Use the following script:
  > "Thank you for calling [Company Name] IT support. This is Anna, your AI technician. How can I help you today?"
- If after-hours (outside 8 AM–6 PM local):
  > "Thank you for calling [Company Name] after-hours support. This is Anna. I'm here 24/7 to help."
- Tone: Professional, warm, and confident

## Step 2: Caller Identification
- Ask: "Can I get your full name and the company you're calling from?"
- Look up caller in PSA contact database by:
  - [ ] Full name match
  - [ ] Phone number (caller ID) match
  - [ ] Email address match
- If multiple matches found, ask for their email to disambiguate

## Step 3: Identity Verification (Authentication)
- **Standard verification** (for general inquiries):
  - Confirm name + company is sufficient
- **Hard verification** (for password resets, account changes, access requests):
  - Ask for employee ID or last 4 of SSN
  - OR send 6-digit MFA code to registered phone/email
  - Allow up to 3 verification attempts
  - After 3 failures → escalate to human technician

## Step 4: Determine Intent & Route
- Ask: "What can I help you with today?"
- Match caller's description to skill file triggers
- If matched → hand off to the appropriate skill SOP
- If no match → create a new ticket and escalate:
  > "I'm going to create a ticket for our team and have someone follow up. Can you describe the issue in a bit more detail?"

## Step 5: Call Wrap-Up (if resolved during greeting)
- "Is there anything else I can help you with?"
- If no: "Thank you for calling. Have a great day!"
- Log call duration, caller info, and outcome in PSA
`
  },
  {
    id: 'password-reset',
    name: 'password_reset.skill.md',
    icon: '🔑',
    description: 'M365 & AD password reset intake flow',
    status: 'active',
    content: `---
name: Password Reset
description: Handle Microsoft 365 and Active Directory password reset requests
triggers:
  - locked out
  - password reset
  - can't login
  - forgot password
  - account locked
---

# Password Reset SOP

## Step 1: Verify Caller Identity
- Ask for full name, email, and employee ID
- Cross-reference with PSA contact database
- If unverified, escalate to human technician

## Step 2: Determine Account Type
- [ ] Microsoft 365
- [ ] Active Directory (on-prem)
- [ ] VPN / Remote Access
- [ ] Other application

## Step 3: MFA Verification
- Send 6-digit code to registered phone
- Allow up to 3 attempts
- If MFA fails, create escalation ticket

## Step 4: Reset Password
- Generate temporary password via secure API
- Send to recovery email on file
- Log action in ticket notes

## Step 5: Post-Reset
- Instruct user to change password on first login
- Confirm access restored
- Auto-close ticket if resolved
`
  },
  {
    id: 'printer-troubleshoot',
    name: 'printer_troubleshoot.skill.md',
    icon: '🖨️',
    description: 'Network printer diagnosis and resolution',
    status: 'active',
    content: `---
name: Printer Troubleshooting
description: Diagnose and resolve common printer issues
triggers:
  - printer not working
  - can't print
  - printer offline
  - print job stuck
  - paper jam
---

# Printer Troubleshooting SOP

## Step 1: Identify the Printer
- Ask for printer name or location
- Look up printer in asset management
- Confirm make/model and IP address

## Step 2: Basic Diagnostics
- [ ] Is the printer powered on?
- [ ] Are there any error lights?
- [ ] Is it connected to the network? (ping test)
- [ ] Is there paper and toner?

## Step 3: Software Checks
- Clear the print queue
- Restart the print spooler service
- Verify correct printer driver installed

## Step 4: Resolution
- If resolved: document fix in ticket
- If hardware issue: dispatch onsite tech
- If driver issue: push updated driver via RMM
`
  },
  {
    id: 'vpn-connectivity',
    name: 'vpn_connectivity.skill.md',
    icon: '🔒',
    description: 'VPN connection troubleshooting',
    status: 'active',
    content: `---
name: VPN Connectivity
description: Troubleshoot VPN connection issues for remote workers
triggers:
  - vpn not connecting
  - vpn disconnecting
  - can't access server
  - remote access
  - work from home connection
---

# VPN Connectivity SOP

## Step 1: Gather Information
- VPN client in use (GlobalProtect, AnyConnect, etc.)
- OS and version
- Home network type (WiFi vs Ethernet)
- Error message if any

## Step 2: Quick Fixes
- [ ] Restart VPN client
- [ ] Reboot computer
- [ ] Switch to Ethernet if on WiFi
- [ ] Check internet connectivity (can you browse?)

## Step 3: Advanced Troubleshooting
- Verify VPN credentials haven't expired
- Check if MFA token is synced
- Test alternate VPN server/gateway
- Flush DNS and renew IP

## Step 4: Escalation
- If firewall suspected: escalate to Network team
- If ISP issue: document and advise user
- If client corruption: push reinstall via RMM
`
  },
  {
    id: 'new-user-onboard',
    name: 'new_user_onboarding.skill.md',
    icon: '👤',
    description: 'New employee IT provisioning checklist',
    status: 'active',
    content: `---
name: New User Onboarding
description: Complete IT provisioning for new employees
triggers:
  - new employee
  - new hire
  - onboarding
  - setup new user
  - provision account
---

# New User Onboarding SOP

## Step 1: Create Accounts
- [ ] Active Directory user account
- [ ] Microsoft 365 license assignment
- [ ] Email alias configuration
- [ ] Distribution group memberships

## Step 2: Hardware Provisioning
- [ ] Laptop/desktop from inventory
- [ ] Monitor and peripherals
- [ ] Desk phone extension
- [ ] Badge/access card

## Step 3: Software Deployment
- [ ] Push standard software bundle via RMM
- [ ] Install line-of-business applications
- [ ] Configure VPN client
- [ ] Set up MFA enrollment

## Step 4: Documentation
- Send welcome email with credentials
- Schedule 15-min IT orientation call
- Add to IT asset tracking
- Notify hiring manager of completion
`
  },
  {
    id: 'email-issues',
    name: 'email_troubleshoot.skill.md',
    icon: '📧',
    description: 'Email delivery and Outlook problems',
    status: 'draft',
    content: `---
name: Email Troubleshooting
description: Resolve Outlook and email delivery issues
triggers:
  - email not working
  - outlook crash
  - not receiving email
  - email bounce
  - calendar not syncing
---

# Email Troubleshooting SOP

## Step 1: Identify the Problem
- [ ] Cannot send emails
- [ ] Cannot receive emails
- [ ] Outlook crashing or freezing
- [ ] Calendar sync issues
- [ ] Shared mailbox access

## Step 2: Basic Checks
- Verify Outlook is up to date
- Check mailbox size (quota)
- Test via OWA (Outlook Web Access)
- Check for service outages on admin.microsoft.com

## Step 3: Resolution Steps
- Repair Outlook profile
- Clear Outlook cache
- Re-add email account
- Check mail flow rules in Exchange admin

## Step 4: Escalation Criteria
- If O365 outage: monitor and update user
- If mail flow rule: escalate to M365 admin
- If data loss: engage Microsoft support
`
  },
  {
    id: 'mfa-setup',
    name: 'mfa_setup.skill.md',
    icon: '🛡️',
    description: 'Multi-factor authentication enrollment',
    status: 'active',
    content: `---
name: MFA Setup & Recovery
description: Guide users through MFA enrollment and recovery
triggers:
  - mfa setup
  - authenticator app
  - two factor
  - mfa not working
  - lost phone mfa
---

# MFA Setup & Recovery SOP

## Step 1: Determine MFA Status
- Check if user has MFA enabled in Azure AD
- Identify registered MFA methods
- Determine if this is new setup or recovery

## Step 2: New MFA Enrollment
- Guide user to aka.ms/mfasetup
- Recommend Microsoft Authenticator app
- Walk through QR code scanning
- Verify with test push notification

## Step 3: MFA Recovery (Lost Device)
- Verify identity via manager approval
- Temporary access pass from Azure AD
- Re-enroll on new device
- Remove old device from registered methods

## Step 4: Post-Setup
- Confirm successful login with MFA
- Remind about backup verification methods
- Document in ticket and close
`
  },
  {
    id: 'call-escalation',
    name: 'call_escalation.skill.md',
    icon: '🚨',
    description: 'Call escalation & handoff management',
    status: 'active',
    content: `---
name: Call Escalation & Handoff
description: Manages the escalation process when AI cannot resolve an issue
triggers:
  - escalate
  - speak to a human
  - talk to a person
  - transfer call
  - this is urgent
  - critical issue
  - emergency
  - need a manager
priority: high
---

# Call Escalation & Handoff SOP

## Step 1: Determine Escalation Trigger
Escalate when ANY of the following are true:
- [ ] Caller explicitly requests a human technician
- [ ] Issue requires admin-level access AI does not have
- [ ] 3 failed resolution attempts on the same issue
- [ ] Security incident or potential data breach
- [ ] Hardware failure requiring onsite dispatch
- [ ] Angry or distressed caller (sentiment detection)
- [ ] Issue not matching any existing skill file

## Step 2: Classify Severity
| Level | Criteria | Response Time |
|-------|----------|---------------|
| P1 — Critical | Server down, data breach, all users affected | Immediate (< 5 min) |
| P2 — High | Key service degraded, VIP user impacted | 15 minutes |
| P3 — Medium | Single user impacted, workaround available | 1 hour |
| P4 — Low | General question, feature request | 4 hours |

## Step 3: Prepare Handoff Package
Before transferring, compile:
- Caller name, company, and contact info
- Detailed summary of the issue
- Steps already attempted by AI
- Relevant ticket number (create one if none exists)
- Severity classification and recommended team

## Step 4: Route to Correct Team
- **L2 Desktop Support** → Software, OS, and workstation issues
- **Network Team** → Firewall, switch, routing, DNS
- **Server / Cloud Team** → Azure, AWS, M365 admin, Exchange
- **Security Team** → Phishing, malware, unauthorized access
- **Onsite Dispatch** → Hardware failure, cabling, physical install
- **Management** → Billing disputes, SLA complaints

## Step 5: Execute Transfer
- **Warm Handoff** (preferred):
  > "I'm going to connect you with [Tech Name] from our [Team] team. I've briefed them on the issue so you won't have to repeat yourself."
  - Stay on the line until the technician confirms they have context
- **Cold Handoff** (if no one available):
  > "I've created a priority ticket [TK-XXXX] and flagged it as [Priority Level]. A technician will call you back within [SLA time]. Is this phone number the best way to reach you?"

## Step 6: Post-Escalation
- Log escalation reason in ticket notes
- Set ticket priority and SLA timer
- Send email summary to assigned team
- If P1/P2: trigger Slack/Teams alert to on-call team
- Schedule follow-up check: was the caller contacted?
`
  },
  {
    id: 'shared-drive-permissions',
    name: 'shared_drive_permissions.skill.md',
    icon: '📁',
    description: 'File access, drive mapping & permissions',
    status: 'active',
    content: `---
name: Shared Drive & Permissions
description: Resolve file access, drive mapping, and permission issues
triggers:
  - access denied
  - can't access shared drive
  - drive not mapped
  - file permission
  - SharePoint access
  - OneDrive not syncing
  - network drive
---

# Shared Drive & Permissions SOP

## Step 1: Identify the Resource
- Ask: "What file, folder, or drive are you trying to access?"
- Determine type:
  - [ ] On-prem file share (\\\\server\\share)
  - [ ] SharePoint / OneDrive
  - [ ] Mapped network drive
  - [ ] NAS or other storage

## Step 2: Verify Current Access
- Check user's AD group memberships
- Verify NTFS and share-level permissions
- For SharePoint: check site permissions and sharing settings
- Confirm the resource still exists and is online

## Step 3: Common Fixes
- **Drive not mapped:** Re-map via GPO or login script
- **Access denied:** Add user to the correct AD security group
- **SharePoint:** Grant access through site settings or sharing link
- **OneDrive not syncing:** Reset sync client, re-sign in
- **Credential popup:** Clear Windows Credential Manager entry

## Step 4: Resolution & Documentation
- Confirm user can now access the resource
- If AD group change: allow 15 min for replication, advise sign-out/sign-in
- Document the change in ticket for audit trail
- If filesystem restructure needed: escalate to senior admin
`
  },
  {
    id: 'slow-pc-diagnostics',
    name: 'slow_pc_diagnostics.skill.md',
    icon: '🐌',
    description: 'Slow computer triage & optimization',
    status: 'active',
    content: `---
name: Slow PC Diagnostics
description: Diagnose and resolve slow computer performance
triggers:
  - computer is slow
  - pc running slow
  - laptop freezing
  - takes forever to load
  - performance issues
  - computer lagging
---

# Slow PC Diagnostics SOP

## Step 1: Gather Context
- How long has the issue been occurring?
- Any recent changes? (updates, new software, hardware swap)
- Is it slow on boot, during specific apps, or all the time?
- Wired or wireless connection?

## Step 2: Remote Quick Checks (via RMM)
- [ ] CPU usage — sustained > 80%?
- [ ] RAM usage — near capacity?
- [ ] Disk space — < 10% free?
- [ ] Disk health — SMART status warnings?
- [ ] Startup programs — excessive count?
- [ ] Pending Windows updates or reboot?

## Step 3: Guided Resolution
1. **High CPU:** Identify top process, restart offending app/service
2. **Low RAM:** Close unnecessary apps, check for memory leaks
3. **Low disk:** Run Disk Cleanup, move files to OneDrive, clear temp files
4. **Too many startups:** Disable non-essential startup items
5. **Needs reboot:** Schedule reboot if uptime > 7 days

## Step 4: Advanced / Escalation
- If malware suspected: run full AV scan, escalate to Security
- If hardware failing (SMART alert): schedule hardware replacement
- If persistent after all steps: escalate for reimage consideration
- Document all findings and actions in ticket
`
  },
  {
    id: 'teams-troubleshoot',
    name: 'teams_troubleshoot.skill.md',
    icon: '💬',
    description: 'Microsoft Teams calls, chat & meeting issues',
    status: 'active',
    content: `---
name: Teams Troubleshooting
description: Resolve Microsoft Teams issues including calls, meetings, and chat
triggers:
  - teams not working
  - teams call dropping
  - can't join meeting
  - teams audio issue
  - teams video not working
  - screen sharing not working
  - teams chat not loading
---

# Microsoft Teams Troubleshooting SOP

## Step 1: Identify the Issue
- [ ] Cannot sign in to Teams
- [ ] Audio/microphone not working
- [ ] Video/camera not working
- [ ] Call quality issues (choppy, dropping)
- [ ] Screen sharing not working
- [ ] Chat messages not sending/loading
- [ ] Cannot join meeting

## Step 2: Basic Resolution
- **Sign-in issues:** Clear Teams cache, sign out/in, check M365 license
- **Audio:** Check default audio device in Settings > Devices, test call
- **Video:** Verify camera permissions in OS settings, try in browser
- **Call quality:** Switch to Ethernet, close bandwidth-heavy apps, check QoS
- **Screen sharing:** Grant screen recording permission (macOS), update Teams

## Step 3: Advanced Fixes
- Reset Teams app: delete %AppData%\\Microsoft\\Teams cache
- Reinstall Teams (New Teams vs Classic Teams)
- Check Teams admin center for user policies
- Verify meeting room / conference device firmware
- Test in Teams Web App to isolate client issue

## Step 4: Documentation
- Note the Teams client version and OS
- If call quality: capture network diagnostics
- If recurring: escalate to M365 admin to review tenant health
- Close ticket with resolution details
`
  },
  {
    id: 'security-incident',
    name: 'security_incident.skill.md',
    icon: '🔴',
    description: 'Phishing, malware & security incident response',
    status: 'active',
    content: `---
name: Security Incident Response
description: First-response workflow for phishing, malware, and unauthorized access
triggers:
  - phishing email
  - suspicious email
  - virus detected
  - malware
  - hacked
  - ransomware
  - unauthorized access
  - security breach
  - compromised account
priority: critical
---

# Security Incident Response SOP

## Step 1: Triage & Classify
| Type | Indicators |
|------|-----------|
| Phishing | Suspicious link clicked, credentials entered on fake site |
| Malware | AV alert, unusual processes, ransomware note |
| Account Compromise | Unrecognized sign-ins, MFA prompts not initiated by user |
| Data Exfiltration | Large file transfers, unusual email forwarding rules |

## Step 2: Immediate Containment
- **Phishing / Compromised Account:**
  - [ ] Force password reset immediately
  - [ ] Revoke all active sessions (Azure AD)
  - [ ] Review and remove suspicious mail rules
  - [ ] Enable MFA if not already active
- **Malware / Ransomware:**
  - [ ] Isolate device from network (disable NIC via RMM)
  - [ ] Do NOT power off (preserve forensic evidence)
  - [ ] Block lateral movement — disable AD account if needed
  - [ ] Alert Security Team immediately (P1 escalation)

## Step 3: Investigation
- Collect timeline from user: What did they click/download? When?
- Pull sign-in logs from Azure AD / M365
- Check email headers and URLs against threat intel
- Scan endpoints with EDR tool for IOCs
- Identify blast radius — are other users affected?

## Step 4: Remediation
- Remove malicious emails from all mailboxes (Content Search purge)
- Clean or reimage infected endpoints
- Restore from backup if data was encrypted/deleted
- Update firewall and email filter rules to block threat

## Step 5: Post-Incident
- Document full incident timeline in ticket
- Create incident report for management
- If data breach: notify compliance team for reporting requirements
- Schedule phishing awareness training for affected users
- Update SOPs with lessons learned
`
  }
];

let currentSopFile = null;

function renderSopFileList() {
  const list = document.getElementById('sop-file-list');
  if (!list) return;
  list.innerHTML = sopSkillFiles.map(f => `
    <div class="sop-file-item ${currentSopFile === f.id ? 'active' : ''}" data-file-id="${f.id}">
      <span class="sop-file-icon">${f.icon}</span>
      <div class="sop-file-info">
        <div class="sop-file-name">${f.name}</div>
        <div class="sop-file-desc">${f.description}</div>
      </div>
      <span class="sop-badge ${f.status}">${f.status}</span>
    </div>
  `).join('');

  // Attach click listeners
  list.querySelectorAll('.sop-file-item').forEach(item => {
    item.addEventListener('click', () => openSopFile(item.dataset.fileId));
  });
}

function openSopFile(fileId) {
  const file = sopSkillFiles.find(f => f.id === fileId);
  if (!file) return;
  currentSopFile = fileId;
  renderSopFileList();

  const wrap = document.getElementById('sop-editor-wrap');
  const editor = document.getElementById('sop-editor');
  const filename = document.getElementById('sop-editor-filename');
  const badge = document.getElementById('sop-editor-badge');
  const btns = document.querySelectorAll('.sop-editor-actions .btn');
  const saveStatus = document.getElementById('sop-save-status');

  // wrap.classList.remove('hidden'); // No longer needed, always visible
  editor.value = file.content;
  filename.textContent = file.name;

  badge.textContent = file.status;
  badge.className = `sop-badge ${file.status}`;
  badge.classList.remove('hidden');

  btns.forEach(b => b.classList.remove('hidden'));

  saveStatus.textContent = '';
  updateLineCount();
}

function updateLineCount() {
  const editor = document.getElementById('sop-editor');
  const lineCount = document.getElementById('sop-line-count');
  if (editor && lineCount) {
    const lines = editor.value.split('\n').length;
    lineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
  }
}

document.getElementById('sop-editor')?.addEventListener('input', updateLineCount);

document.getElementById('btn-sop-save')?.addEventListener('click', function () {
  const editor = document.getElementById('sop-editor');
  const saveStatus = document.getElementById('sop-save-status');
  if (!currentSopFile || !editor) return;

  const file = sopSkillFiles.find(f => f.id === currentSopFile);
  if (file) {
    file.content = editor.value;
  }
  saveStatus.textContent = '✅ Saved';
  setTimeout(() => { saveStatus.textContent = ''; }, 2000);
});

document.getElementById('btn-sop-close')?.addEventListener('click', function () {
  // Reset to placeholder state
  currentSopFile = null;
  renderSopFileList();

  const editor = document.getElementById('sop-editor');
  const filename = document.getElementById('sop-editor-filename');
  const badge = document.getElementById('sop-editor-badge');
  const btns = document.querySelectorAll('.sop-editor-actions .btn');
  const lineCount = document.getElementById('sop-line-count');

  editor.value = '';
  filename.textContent = 'Select a skill file to edit';
  badge.classList.add('hidden');
  btns.forEach(b => b.classList.add('hidden'));
  lineCount.textContent = '0 lines';
});

// New Skill button
document.getElementById('btn-add-skill')?.addEventListener('click', function () {
  const name = prompt('Skill file name (e.g. dns_issues):');
  if (!name) return;
  const safeName = name.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  sopSkillFiles.push({
    id: safeName,
    name: `${safeName}.skill.md`,
    icon: '📄',
    description: 'New custom skill',
    status: 'new',
    content: `---\nname: ${name}\ndescription: Describe this skill\ntriggers:\n  - keyword1\n  - keyword2\n---\n\n# ${name} SOP\n\n## Step 1: \n- \n\n## Step 2: \n- \n`
  });
  renderSopFileList();
  openSopFile(safeName);
});

renderSopFileList();

/* -- AI SOP Chat -- */
const sopChatResponses = [
  {
    keywords: ['password', 'reset', 'lockout', 'locked'],
    response: `Great question! I've reviewed your <code>password_reset.skill.md</code> file. Here are a few improvements I'd suggest:\n\n<pre>## Step 2.5: Self-Service Check\n- Ask if user has tried aka.ms/sspr\n- If yes and failed, proceed to manual reset\n- If no, guide through self-service first\n- This reduces manual resets by ~40%</pre>\n\n<p>Want me to add this step directly to the skill file?</p>`
  },
  {
    keywords: ['verify', 'identity', 'caller', 'authentication'],
    response: `I recommend strengthening your identity verification across all SOPs. Here's a universal verification block you could add:\n\n<pre>## Universal Identity Verification\n1. Ask: Full name + email address\n2. Verify: Employee ID matches PSA record\n3. Challenge: Last 4 of phone on file\n4. If 2+ fail → "I need to verify with your manager"\n5. Log verification result in ticket</pre>\n\n<p>Should I add this to all your active skill files?</p>`
  },
  {
    keywords: ['create', 'new', 'sop', 'add'],
    response: `I can help you create a new SOP! Let me draft the structure:\n\n<pre>---\nname: [Your SOP Name]\ndescription: [What this covers]\ntriggers:\n  - [keyword that activates this SOP]\n---\n\n# [SOP Name]\n\n## Step 1: Gather Information\n- Collect key details from the caller\n\n## Step 2: Diagnose\n- Walk through diagnostic checklist\n\n## Step 3: Resolve or Escalate\n- Apply fix or route to appropriate team\n\n## Step 4: Document & Close\n- Log resolution in ticket notes</pre>\n\n<p>Click <strong>+ New Skill</strong> in the left panel and paste this template, or tell me more about what the SOP should cover!</p>`
  },
  {
    keywords: ['dns', 'domain', 'resolve', 'nameserver'],
    response: `DNS issues are common! Here's a skill file I'd suggest:\n\n<pre>---\nname: DNS Troubleshooting\ntriggers:\n  - dns not resolving\n  - website not loading\n  - nslookup failing\n---\n\n## Step 1: Quick Test\n- nslookup target-domain\n- ping 8.8.8.8 (test raw connectivity)\n- ipconfig /flushdns\n\n## Step 2: Check DNS Settings\n- Verify DNS server configuration\n- Test with public DNS (8.8.8.8 / 1.1.1.1)\n- Check DHCP lease for DNS assignment\n\n## Step 3: Escalation\n- If internal DNS: escalate to Domain Admin\n- If ISP DNS: advise switching to public DNS</pre>\n\n<p>Want me to add this as a new skill file?</p>`
  },
  {
    keywords: ['improve', 'better', 'optimize', 'secure', 'security'],
    response: `Here are my top recommendations to improve your intake process:\n\n<p>🔒 <strong>Security Enhancements:</strong></p>\n<ul>\n<li>Add mandatory identity verification to ALL skills (not just password reset)</li>\n<li>Implement a "sensitivity flag" for requests involving admin accounts</li>\n<li>Auto-escalate any request touching domain admin or firewall rules</li>\n</ul>\n\n<p>⚡ <strong>Efficiency Improvements:</strong></p>\n<ul>\n<li>Add self-service links before manual intervention steps</li>\n<li>Include estimated resolution time in each SOP</li>\n<li>Add "common false positives" section to reduce unnecessary escalations</li>\n</ul>\n\n<p>Want me to apply these changes to your active skill files?</p>`
  },
  {
    keywords: ['printer', 'print', 'printing'],
    response: `Looking at your <code>printer_troubleshoot.skill.md</code>, I notice a few gaps:\n\n<pre>## Step 2.5: Remote Diagnostics\n- Check printer status via SNMP (if configured)\n- Review print server queue remotely\n- Check for Windows Update conflicts\n  (KB5005565 known to break network printing)\n\n## Step 3.5: User-Side Quick Fix\n- Remove and re-add printer\n- Print test page from Devices & Printers\n- Try printing from a different application</pre>\n\n<p>These steps can resolve ~60% of printer issues without dispatching a tech. Shall I update the skill file?</p>`
  }
];

const sopGenericResponses = [
  `That's a great idea! Let me think about how to structure that in your intake flow. Could you tell me which specific SOP you'd like to modify? You can select one from the file list on the left.`,
  `I understand. For the best results, try selecting a skill file from the left panel first, then tell me what changes you'd like. I can modify the SOP directly or suggest improvements.`,
  `Interesting request! I can help with that. Here's what I'd recommend:\n\n<p>1. Select the relevant skill file from the left panel</p>\n<p>2. Tell me the specific step or behavior you want to change</p>\n<p>3. I'll generate the updated markdown for you to review</p>\n\n<p>What would you like to tackle first?</p>`
];

function addSopChatMessage(role, html) {
  const container = document.getElementById('sop-chat-messages');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = `sop-chat-msg ${role}`;
  msg.innerHTML = `
    <div class="sop-chat-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
    <div class="sop-chat-bubble">
      <div class="sop-chat-name">${role === 'ai' ? 'AI Skill Coach' : 'You'}</div>
      ${html}
    </div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showSopTyping() {
  const container = document.getElementById('sop-chat-messages');
  if (!container) return;
  const typing = document.createElement('div');
  typing.className = 'sop-chat-msg ai';
  typing.id = 'sop-typing';
  typing.innerHTML = `
    <div class="sop-chat-avatar">🤖</div>
    <div class="sop-chat-bubble">
      <div class="sop-typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeSopTyping() {
  document.getElementById('sop-typing')?.remove();
}

function getAiResponse(userText) {
  const lower = userText.toLowerCase();
  for (const r of sopChatResponses) {
    if (r.keywords.some(k => lower.includes(k))) {
      return r.response;
    }
  }
  return sopGenericResponses[Math.floor(Math.random() * sopGenericResponses.length)];
}

function sendSopChat() {
  const input = document.getElementById('sop-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  addSopChatMessage('user', `<p>${text}</p>`);
  input.value = '';
  input.style.height = 'auto';

  showSopTyping();

  const delay = 1000 + Math.random() * 1500;
  setTimeout(() => {
    removeSopTyping();
    const response = getAiResponse(text);
    addSopChatMessage('ai', response);
  }, delay);
}

document.getElementById('sop-send-btn')?.addEventListener('click', sendSopChat);

document.getElementById('sop-chat-input')?.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendSopChat();
  }
});

// Auto-grow textarea
document.getElementById('sop-chat-input')?.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Voice Input
let sopRecognition = null;
document.getElementById('sop-voice-btn')?.addEventListener('click', function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addSopChatMessage('ai', `<p>⚠️ Voice input isn't supported in this browser. Please use Chrome or Edge for voice features.</p>`);
    return;
  }

  if (sopRecognition) {
    sopRecognition.stop();
    sopRecognition = null;
    this.classList.remove('recording');
    return;
  }

  sopRecognition = new SpeechRecognition();
  sopRecognition.continuous = false;
  sopRecognition.interimResults = true;
  sopRecognition.lang = 'en-US';

  this.classList.add('recording');
  const input = document.getElementById('sop-chat-input');

  sopRecognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (input) input.value = transcript;
  };

  sopRecognition.onend = () => {
    this.classList.remove('recording');
    sopRecognition = null;
    if (input && input.value.trim()) {
      sendSopChat();
    }
  };

  sopRecognition.onerror = () => {
    this.classList.remove('recording');
    sopRecognition = null;
  };

  sopRecognition.start();
});

/* ══════════ COLLAPSIBLE PANELS ══════════ */
function setupCollapsiblePanel(panelId, btnCollapseId, btnExpandId, stripId, storageKey) {
  const panel = document.getElementById(panelId);
  const btnCollapse = document.getElementById(btnCollapseId);
  const btnExpand = document.getElementById(btnExpandId);
  const strip = document.getElementById(stripId);

  if (!panel || !btnCollapse || !btnExpand || !strip) return;

  function setCollapsed(isCollapsed) {
    if (isCollapsed) {
      panel.classList.add('collapsed');
      strip.classList.remove('hidden');
    } else {
      panel.classList.remove('collapsed');
      strip.classList.add('hidden');
    }
    // Save preference
    // localStorage.setItem(storageKey, isCollapsed ? 'true' : 'false');
  }

  btnCollapse.addEventListener('click', () => setCollapsed(true));
  btnExpand.addEventListener('click', () => setCollapsed(false));

  // Restore preference (optional, currently disabled to ensure default state is expanded for demo)
  // const saved = localStorage.getItem(storageKey);
  // if (saved === 'true') setCollapsed(true);
}

setupCollapsiblePanel('sop-panel-left', 'btn-collapse-left', 'btn-expand-left', 'sop-strip-left', 'sop_left_collapsed');
setupCollapsiblePanel('sop-panel-right', 'btn-collapse-right', 'btn-expand-right', 'sop-strip-right', 'sop_right_collapsed');

/* ══════════ PROTOTYPE GROUP SIGNUP FORM ══════════ */

// VIP Detection: show badge when "Paid Answering Service" is selected
document.getElementById('signup-afterhours')?.addEventListener('change', function () {
  const vip = document.getElementById('vip-badge');
  if (this.value === 'outsourced') {
    vip.classList.remove('hidden');
  } else {
    vip.classList.add('hidden');
  }
});

// Form submission
document.getElementById('beta-signup-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const fname = document.getElementById('signup-fname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const afterhours = document.getElementById('signup-afterhours').value;
  const isVip = afterhours === 'outsourced';

  // Disable submit
  const btn = document.getElementById('btn-signup-submit');
  btn.textContent = '⏳ Submitting…';
  btn.disabled = true;

  // Show Magic Moment call overlay
  const overlay = document.getElementById('magic-overlay');
  const fill = document.getElementById('magic-progress-fill');
  const status = document.getElementById('magic-status');
  document.getElementById('magic-phone-display').textContent = '+1 ' + phone;

  overlay.classList.remove('hidden');

  // Simulate call progress
  setTimeout(() => { fill.style.width = '25%'; status.textContent = 'Ringing…'; }, 800);
  setTimeout(() => { fill.style.width = '55%'; status.textContent = `Hi ${fname}, this is Anna! 🤖`; }, 2400);
  setTimeout(() => { fill.style.width = '85%'; status.textContent = 'Sending confirmation email…'; }, 4000);
  setTimeout(() => {
    fill.style.width = '100%';
    status.textContent = '✅ Call complete. Welcome to the prototype group!';
  }, 5200);

  // Transition to success state
  setTimeout(() => {
    overlay.classList.add('hidden');
    fill.style.width = '0%';

    // Hide form, show success
    document.getElementById('signup-form-card').classList.add('hidden');
    document.querySelector('.signup-hero').style.display = 'none';

    const success = document.getElementById('signup-success');
    success.classList.remove('hidden');
    document.getElementById('success-email').textContent = email;

    if (isVip) {
      document.getElementById('success-vip').classList.remove('hidden');
    }

    // Reset button
    btn.textContent = '🚀 Join the Prototype Group';
    btn.disabled = false;

    // Scroll to top
    document.getElementById('page-signup').scrollIntoView({ behavior: 'smooth' });
  }, 6500);
});

// SOP Upload Zone Handlers
function setupUploadZone(zoneId, fileInputId, nameDisplayId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(fileInputId);
  const nameDisplay = document.getElementById(nameDisplayId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      showFileName(e.dataTransfer.files[0], zone, nameDisplay);
    }
  });

  input.addEventListener('change', () => {
    if (input.files.length) {
      showFileName(input.files[0], zone, nameDisplay);
    }
  });

  function showFileName(file, zoneEl, displayEl) {
    displayEl.textContent = '✅ ' + file.name;
    displayEl.classList.remove('hidden');
    zoneEl.classList.add('has-file');
  }
}

setupUploadZone('sop-bh-zone', 'sop-bh-file', 'sop-bh-name');
setupUploadZone('sop-ah-zone', 'sop-ah-file', 'sop-ah-name');

/* ══════════ INITIAL LOAD ══════════ */
setTimeout(triggerAnimations, 200);
