const searchInput = document.getElementById('searchInput');
const colorFilter = document.getElementById('colorFilter');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];
let selectedAgentId = null;

// Load persisted state from localStorage
function loadPersistedState() {
  const savedSearch = localStorage.getItem('agentSearch');
  const savedColor = localStorage.getItem('agentColor');
  const savedAgent = localStorage.getItem('selectedAgentId');
  
  if (savedSearch) searchInput.value = savedSearch;
  if (savedColor) colorFilter.value = savedColor;
  if (savedAgent) selectedAgentId = savedAgent;
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('agentSearch', searchInput.value);
  localStorage.setItem('agentColor', colorFilter.value);
  if (selectedAgentId) {
    localStorage.setItem('selectedAgentId', selectedAgentId);
  }
}

// Filter agents by search query (case-insensitive) and color
function filterAgents(agentList) {
  const query = searchInput.value.trim().toLowerCase();
  const color = colorFilter.value;
  
  return agentList.filter((agent) => {
    // Case-insensitive search
    const matchesSearch = query === '' || agent.name.toLowerCase().includes(query);
    // Exact color match
    const matchesColor = color === '' || agent.color === color;
    return matchesSearch && matchesColor;
  });
}

fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;
    loadPersistedState();
    applyFiltersAndRender();
    drawPlaceholder();
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

searchInput.addEventListener('input', () => {
  saveState();
  applyFiltersAndRender();
});

colorFilter.addEventListener('change', () => {
  saveState();
  applyFiltersAndRender();
});

function applyFiltersAndRender() {
  const filtered = filterAgents(agents);
  
  // Preserve selected agent if still visible, otherwise select first
  const selectedVisible = filtered.find(a => a.id === selectedAgentId);
  if (!selectedVisible && filtered.length > 0) {
    selectedAgentId = filtered[0].id;
    saveState();
  }
  
  renderAgents(filtered);
  
  // If we have a selected agent that's visible, show it
  if (selectedVisible) {
    selectAgent(selectedVisible);
  } else {
    drawPlaceholder();
    suggestionPanel.textContent = 'Select an agent to see a suggestion.';
  }
}

function renderAgents(items) {
  agentList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No agents found.';
    agentList.appendChild(empty);
    return;
  }

  items.forEach((agent) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'agent-btn';
    // Highlight selected agent
    if (agent.id === selectedAgentId) {
      button.style.background = '#e8f4fd';
      button.style.borderColor = '#3498db';
    }
    button.textContent = `${agent.name} (${agent.role})`;
    button.addEventListener('click', () => {
      selectAgent(agent);
    });

    li.appendChild(button);
    agentList.appendChild(li);
  });
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
  saveState();
  
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
  
  // Re-render to highlight selected
  applyFiltersAndRender();
}
