const searchInput = document.getElementById('searchInput');
const colorFilter = document.getElementById('colorFilter');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];
let selectedAgent = null;

// Load saved state from localStorage
function loadState() {
  const savedSearch = localStorage.getItem('agentSearch');
  const savedColor = localStorage.getItem('agentColor');
  const savedAgent = localStorage.getItem('selectedAgent');
  
  if (savedSearch) searchInput.value = savedSearch;
  if (savedColor) colorFilter.value = savedColor;
  if (savedAgent) {
    selectedAgent = agents.find(a => a.id === savedAgent);
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('agentSearch', searchInput.value);
  localStorage.setItem('agentColor', colorFilter.value);
  if (selectedAgent) {
    localStorage.setItem('selectedAgent', selectedAgent.id);
  }
}

// Get unique colors from agents
function getUniqueColors() {
  return [...new Set(agents.map(a => a.color))];
}

// Combined filter function
function filterAgents() {
  const query = searchInput.value.trim().toLowerCase();
  const color = colorFilter.value;
  
  let filtered = agents;
  
  // Filter by search (case-insensitive)
  if (query) {
    filtered = filtered.filter(agent => 
      agent.name.toLowerCase().includes(query)
    );
  }
  
  // Filter by color
  if (color) {
    filtered = filtered.filter(agent => agent.color === color);
  }
  
  return filtered;
}

// Render agents
function renderAgents(items) {
  agentList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No agents found.';
    agentList.appendChild(empty);
    return;
  }

  items.forEach(agent => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'agent-btn';
    button.textContent = `${agent.name} (${agent.role})`;
    
    if (selectedAgent && selectedAgent.id === agent.id) {
      button.classList.add('selected');
    }
    
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

let currentTimeout = null;

function selectAgent(agent) {
  // Cancel any pending timeout
  if (currentTimeout) {
    clearTimeout(currentTimeout);
  }
  
  selectedAgent = agent;
  saveState();
  
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  currentTimeout = setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
    renderAgents(filterAgents()); // Re-render to show selection
  }, delayMs);
}

// Initialize
fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;
    
    // Populate color filter
    const colors = getUniqueColors();
    colors.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      colorFilter.appendChild(option);
    });
    
    loadState();
    const filtered = filterAgents();
    renderAgents(filtered);
    
    // Restore selected agent visualization
    if (selectedAgent) {
      drawAgent(selectedAgent);
      suggestionPanel.textContent = selectedAgent.suggestion;
    } else {
      drawPlaceholder();
    }
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

// Event listeners
searchInput.addEventListener('input', () => {
  saveState();
  renderAgents(filterAgents());
});

colorFilter.addEventListener('change', () => {
  saveState();
  renderAgents(filterAgents());
});
