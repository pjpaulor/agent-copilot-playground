const searchInput = document.getElementById('searchInput');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];
let selectedAgent;
let searchColor = '';
let searchInputText = '';

fetch('./data/agents.json')
  .then((res) => res.json())
  .then((data) => {
    agents = data;

    searchInputText = localStorage.getItem('search_text') || '';
    searchColor = localStorage.getItem('search_color') || '';

    searchInput.value = searchInputText;
    colorSelect.value = searchColor;

    filterAgents();
    drawPlaceholder();
  })
  .catch(() => {
    suggestionPanel.textContent = 'Could not load agents data.';
  });

searchInput.addEventListener('input', (event) => {
  searchInputText = event.target.value.trim();
  filterAgents();
});

colorSelect.addEventListener('change', (event) => {
  searchColor = event.target.value;
  filterAgents();
});

function filterAgents() {
  localStorage.setItem('search_text', searchInputText);
  localStorage.setItem('search_color', searchColor);

  const filtered = agents.filter((agent) => {
    const matchesName = agent.name
      .toLowerCase()
      .includes(searchInputText.toLowerCase());
    const matchesColor = agent.color
      .toLowerCase()
      .includes(searchColor.toLowerCase());
    return matchesName && matchesColor;
  });

  if (!filtered.includes(selectedAgent)) selectAgent(filtered[0]);
  renderAgents(filtered);
}

function renderAgents(items) {
  agentList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No agents found';
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
  selectedAgent = agent;
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  // BUG: delayed updates are not cancelled or ignored, so stale clicks can overwrite newer selections.
  setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
}
