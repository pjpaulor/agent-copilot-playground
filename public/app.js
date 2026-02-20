const searchInput = document.getElementById('searchInput');
const agentList = document.getElementById('agentList');
const suggestionPanel = document.getElementById('suggestionPanel');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');

let agents = [];

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
  suggestionPanel.textContent = `Analyzing ${agent.name}...`;
  const delayMs = agent.id === 'a1' ? 900 : 180;

  // BUG: delayed updates are not cancelled or ignored, so stale clicks can overwrite newer selections.
  setTimeout(() => {
    suggestionPanel.textContent = agent.suggestion;
    drawAgent(agent);
  }, delayMs);
}
