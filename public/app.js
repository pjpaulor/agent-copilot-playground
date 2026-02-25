const searchInput = document.getElementById('searchInput');
const colorFilter = document.getElementById('colorFilter');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];
let selectionToken = 0;
let currentSelectedAgent = null;

fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;
    populateColorFilter();
    restoreFiltersFromStorage();
    applyFilters();
    drawPlaceholder();
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

searchInput.addEventListener('input', (event) => {
  localStorage.setItem('agentSearchQuery', event.target.value);
  applyFilters();
});

colorFilter.addEventListener('change', (event) => {
  localStorage.setItem('agentColorFilter', event.target.value);
  applyFilters();
});

function populateColorFilter() {
  const uniqueColors = [...new Set(agents.map(a => a.color))];
  uniqueColors.forEach(color => {
    const agent = agents.find(a => a.color === color);
    const option = document.createElement('option');
    option.value = color;
    option.textContent = `${color.toUpperCase().replace('#', '')} (${agent.name})`;
    colorFilter.appendChild(option);
  });
}

function restoreFiltersFromStorage() {
  const savedQuery = localStorage.getItem('agentSearchQuery');
  const savedColor = localStorage.getItem('agentColorFilter');
  if (savedQuery) searchInput.value = savedQuery;
  if (savedColor) colorFilter.value = savedColor;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedColor = colorFilter.value;
  
  const filtered = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(query);
    const matchesColor = !selectedColor || agent.color === selectedColor;
    return matchesSearch && matchesColor;
  });
  
  renderAgents(filtered);
}

// To validate: Open browser DevTools Console and run:
// localStorage.setItem('agentSearchQuery', 'Alice'); localStorage.setItem('agentColorFilter', '#ff6b6b'); location.reload();
// Should restore filters and show only Alice. Test search + color filter combinations to verify both filters apply together.

function renderAgents(items) {
  agentList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No agents found';
    agentList.appendChild(empty);
    return;
  }

  // Preserve current selection if it's still in the filtered list; otherwise select first
  const shouldPreserve = currentSelectedAgent && items.some(a => a.id === currentSelectedAgent.id);
  const agentToSelect = shouldPreserve ? currentSelectedAgent : items[0];

  items.forEach((agent) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'agent-btn';
    button.textContent = `${agent.name} (${agent.role})`;
    button.addEventListener('click', () => {
      selectAgent(agent);
    });

    li.appendChild(button);
    agentList.appendChild(li);
  });

  // Auto-select if we have a preserved or first agent
  if (agentToSelect && (!currentSelectedAgent || shouldPreserve || currentSelectedAgent !== agentToSelect)) {
    selectAgent(agentToSelect);
  }
}

function drawPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f1f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#5f6b7a';
  ctx.font = '14px sans-serif';
  ctx.fillText('Select an agent to visualize', 18, 64);
}

function drawAgent(agent) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f7f9fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = agent.color;
  ctx.fillRect(20, 25, 100, 70);

  ctx.strokeStyle = '#132432';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 21, 108, 78);

  ctx.fillStyle = '#1b2430';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(agent.name, 140, 52);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#5f6b7a';
  ctx.fillText(agent.role, 140, 74);
}

function selectAgent(agent) {
  currentSelectedAgent = agent;
  const currentToken = ++selectionToken;
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  // BUG: delayed updates are not cancelled or ignored, so stale clicks can overwrite newer selections.
  setTimeout(() => {
    if (currentToken !== selectionToken) return; // Ignore outdated delayed updates from earlier clicks.
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
}
