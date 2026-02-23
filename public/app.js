const searchInput = document.getElementById('searchInput');
const colorFilter = document.getElementById('colorFilter');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];
let selectedAgentId = null;

fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;
    populateColorFilter();
    restoreFilters();
    applyFilters();
    drawPlaceholder();
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

searchInput.addEventListener('input', () => {
  localStorage.setItem('searchText', searchInput.value);
  applyFilters();
});

colorFilter.addEventListener('change', () => {
  localStorage.setItem('selectedColor', colorFilter.value);
  applyFilters();
});

function populateColorFilter() {
  const colors = [...new Set(agents.map(a => a.color))];
  colors.forEach(color => {
    const agent = agents.find(a => a.color === color);
    const option = document.createElement('option');
    option.value = color;
    option.textContent = `${color.toUpperCase().replace('#', '')} (${agent.name})`;
    colorFilter.appendChild(option);
  });
}

function restoreFilters() {
  searchInput.value = localStorage.getItem('searchText') || '';
  colorFilter.value = localStorage.getItem('selectedColor') || '';
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const color = colorFilter.value;
  const filtered = agents.filter((agent) => {
    const matchesSearch = !query || agent.name.toLowerCase().includes(query);
    const matchesColor = !color || agent.color === color;
    return matchesSearch && matchesColor;
  });
  renderAgents(filtered);
}

// To verify: Open browser DevTools → Application → Local Storage → check searchText and selectedColor keys persist across page reloads

function renderAgents(items) {
  agentList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No agents found';
    agentList.appendChild(empty);
    return;
  }

  const currentAgent = selectedAgentId && items.find(a => a.id === selectedAgentId);
  const firstAgent = items[0];

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

  if (currentAgent) {
    selectAgent(currentAgent);
  } else if (!selectedAgentId && firstAgent) {
    selectAgent(firstAgent);
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
  selectedAgentId = agent.id;
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  // BUG: delayed updates are not cancelled or ignored, so stale clicks can overwrite newer selections.
  setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
}
