const searchInput = document.getElementById('searchInput');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');
const compareModeToggle = document.getElementById('compareModeToggle');
const singleView = document.getElementById('singleView');
const compareView = document.getElementById('compareView');
const compareContainer = document.getElementById('compareContainer');
const compareMessage = document.getElementById('compareMessage');

let agents = [];
let compareMode = false;
let selectedAgents = [];

fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;
    renderAgents(agents);
    drawPlaceholder();
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim();
  const filtered = agents.filter((agent) => agent.name.includes(query)); // BUG: search is case-sensitive
  renderAgents(filtered);
});

compareModeToggle.addEventListener('change', (event) => {
  compareMode = event.target.checked;
  selectedAgents = [];
  
  if (compareMode) {
    singleView.style.display = 'none';
    compareView.style.display = 'block';
    compareMessage.textContent = 'Select up to 2 agents to compare.';
    compareContainer.innerHTML = '';
  } else {
    singleView.style.display = 'block';
    compareView.style.display = 'none';
    drawPlaceholder();
    suggestionPanel.textContent = 'Select an agent to see a suggestion.';
  }
});

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
  drawAgentOnCanvas(canvas, agent);
}

function drawAgentOnCanvas(canvasElem, agent) {
  const context = canvasElem.getContext('2d');
  context.clearRect(0, 0, canvasElem.width, canvasElem.height);

  context.fillStyle = '#f7f9fc';
  context.fillRect(0, 0, canvasElem.width, canvasElem.height);

  context.fillStyle = agent.color;
  context.fillRect(20, 25, 100, 70);

  context.strokeStyle = '#132432';
  context.lineWidth = 2;
  context.strokeRect(16, 21, 108, 78);

  context.fillStyle = '#1b2430';
  context.font = 'bold 14px sans-serif';
  context.fillText(agent.name, 140, 52);

  context.font = '12px sans-serif';
  context.fillStyle = '#5f6b7a';
  context.fillText(agent.role, 140, 74);
}

function selectAgent(agent) {
  if (compareMode) {
    selectAgentForCompare(agent);
  } else {
    selectAgentSingle(agent);
  }
}

function selectAgentSingle(agent) {
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  // BUG: delayed updates are not cancelled or ignored, so stale clicks can overwrite newer selections.
  setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
}

function selectAgentForCompare(agent) {
  if (selectedAgents.length >= 2) {
    const existingIndex = selectedAgents.findIndex(a => a.id === agent.id);
    if (existingIndex === -1) {
      compareMessage.textContent = '⚠️ You can only compare 2 agents at a time. Deselect one first.';
      compareMessage.style.color = '#c92a2a';
      return;
    }
  }
  
  const existingIndex = selectedAgents.findIndex(a => a.id === agent.id);
  if (existingIndex !== -1) {
    selectedAgents.splice(existingIndex, 1);
  } else {
    selectedAgents.push(agent);
  }
  
  renderCompareView();
}

function renderCompareView() {
  compareContainer.innerHTML = '';
  
  if (selectedAgents.length === 0) {
    compareMessage.textContent = 'Select up to 2 agents to compare.';
    compareMessage.style.color = '';
    return;
  }
  
  if (selectedAgents.length === 1) {
    compareMessage.textContent = 'Select one more agent to compare.';
    compareMessage.style.color = '';
  } else {
    compareMessage.textContent = 'Comparing 2 agents:';
    compareMessage.style.color = '';
  }
  
  selectedAgents.forEach((agent) => {
    const agentCard = document.createElement('div');
    agentCard.className = 'compare-card';
    
    const nameElem = document.createElement('h3');
    nameElem.textContent = agent.name;
    
    const roleElem = document.createElement('p');
    roleElem.className = 'compare-role';
    roleElem.textContent = agent.role;
    
    const suggestionElem = document.createElement('p');
    suggestionElem.className = 'compare-suggestion';
    suggestionElem.textContent = agent.suggestion;
    
    const canvasElem = document.createElement('canvas');
    canvasElem.width = 260;
    canvasElem.height = 120;
    canvasElem.className = 'compare-canvas';
    
    agentCard.appendChild(nameElem);
    agentCard.appendChild(roleElem);
    agentCard.appendChild(suggestionElem);
    agentCard.appendChild(canvasElem);
    
    compareContainer.appendChild(agentCard);
    
    drawAgentOnCanvas(canvasElem, agent);
  });
}
