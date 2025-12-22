const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-link, .hero-actions button');
const statThreats = document.getElementById('stat-threats');
const statLastAlert = document.getElementById('stat-last-alert');
const statStatus = document.getElementById('stat-status');
const heroStatus = document.getElementById('hero-status');
const heroLabel = document.getElementById('hero-label');
const heroConfidence = document.getElementById('hero-confidence');
const toast = document.getElementById('toast');
const liveStatus = document.getElementById('live-status');
const liveLabel = document.getElementById('live-label');
const liveConfidence = document.getElementById('live-confidence');
const liveBox = document.getElementById('live-box');
const liveFeed = document.getElementById('live-feed');
const startLiveBtn = document.getElementById('start-live');
const stopLiveBtn = document.getElementById('stop-live');
const uploadTimelineEl = document.getElementById('upload-timeline');
const historyList = document.getElementById('history-list');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const uploadVideo = document.getElementById('upload-video');
const uploadStatus = document.getElementById('upload-status');
const progressBar = document.getElementById('progress-bar');
const uploadOverlay = document.getElementById('upload-overlay');
const downloadReport = document.getElementById('download-report');

let liveInterval = null;
let threatCount = 12;
const detectionFeed = [
  { time: '12:14:03', label: 'Unattended bag', confidence: 0.82, severity: 'warn', camera: 'Station-02' },
  { time: '12:07:44', label: 'Weapon detected', confidence: 0.91, severity: 'danger', camera: 'Mall-Entry' },
  { time: '11:59:10', label: 'Crowd surge', confidence: 0.73, severity: 'warn', camera: 'Arena-05' },
  { time: '11:40:22', label: 'Person', confidence: 0.96, severity: 'safe', camera: 'Harbor-01' }
];
const uploadDetections = [
  { timestamp: '00:14', type: 'Person', severity: 'safe', note: 'Normal movement' },
  { timestamp: '01:22', type: 'Fight risk', severity: 'warn', note: 'Aggressive gesture' },
  { timestamp: '02:05', type: 'Weapon detected', severity: 'danger', note: 'Object resembling knife' },
  { timestamp: '03:47', type: 'Evacuation', severity: 'danger', note: 'People running' }
];
const history = [
  { time: 'Today 09:12', camera: 'Downtown-04', type: 'Weapon detected', severity: 'danger' },
  { time: 'Today 08:33', camera: 'Metro-03', type: 'Unattended bag', severity: 'warn' },
  { time: 'Yesterday 22:14', camera: 'Harbor-01', type: 'Intrusion', severity: 'warn' },
  { time: 'Yesterday 18:55', camera: 'Mall-Entry', type: 'Crowd surge', severity: 'safe' }
];

function showPage(id) {
  pages.forEach(page => page.classList.toggle('hidden', page.id !== id));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === id));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function renderFeed() {
  liveFeed.innerHTML = detectionFeed.map(item => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    const conf = Math.round(item.confidence * 100);
    return `
      <div class="timeline-item">
        <span class="muted">${item.time}</span>
        <div>
          <div class="value">${item.label}</div>
          <div class="muted">Camera: ${item.camera}</div>
        </div>
        <span class="tag ${badge}">${conf}%</span>
      </div>
    `;
  }).join('');
}

function renderUploadTimeline() {
  uploadTimelineEl.innerHTML = uploadDetections.map(item => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    return `
      <div class="timeline-item">
        <span class="muted">${item.timestamp}</span>
        <div>
          <div class="value">${item.type}</div>
          <div class="muted">${item.note}</div>
        </div>
        <span class="tag ${badge}">${item.severity}</span>
      </div>
    `;
  }).join('');
}

function renderHistory() {
  historyList.innerHTML = history.map(item => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    return `
      <div class="history-item">
        <div class="thumb"></div>
        <div>
          <div class="value">${item.type}</div>
          <div class="muted">${item.time} · ${item.camera}</div>
        </div>
        <span class="tag ${badge}">${item.severity}</span>
      </div>
    `;
  }).join('');
}

function updateStats(latest) {
  threatCount += 1;
  statThreats.textContent = threatCount;
  statLastAlert.textContent = latest.time;
  statStatus.textContent = latest.severity === 'danger' ? 'Alerting' : 'Online';
  const statusColor = latest.severity === 'danger' ? 'rgba(255,77,103,0.2)' : 'rgba(66,165,255,0.12)';
  statStatus.style.background = statusColor;
}

function setLiveStatus(level, label, confidence) {
  liveStatus.dataset.level = level;
  liveStatus.textContent = level === 'danger' ? 'Threat Detected' : level === 'warn' ? 'Suspicious' : 'Safe';
  liveLabel.textContent = label;
  liveConfidence.textContent = `${confidence}%`;
  heroStatus.textContent = liveStatus.textContent;
  heroLabel.textContent = label;
  heroConfidence.textContent = `${confidence}%`;
  if (level === 'safe' && label === 'Idle') {
    liveBox.style.display = 'none';
  } else {
    liveBox.style.display = 'block';
    liveBox.style.left = `${10 + Math.random() * 60}%`;
    liveBox.style.top = `${10 + Math.random() * 50}%`;
    liveBox.style.width = `${20 + Math.random() * 30}%`;
    liveBox.style.height = `${20 + Math.random() * 35}%`;
  }
}

function startLive() {
  if (liveInterval) return;
  showToast('Live camera started');
  liveInterval = setInterval(() => {
    const sample = detectionFeed[Math.floor(Math.random() * detectionFeed.length)];
    const confidence = Math.max(60, Math.round(sample.confidence * 100 + Math.random() * 8));
    setLiveStatus(sample.severity === 'danger' ? 'danger' : sample.severity === 'warn' ? 'suspicious' : 'safe', sample.label, confidence);
    updateStats({ time: sample.time, severity: sample.severity });
  }, 2000);
}

function stopLive() {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
  }
  setLiveStatus('safe', 'Idle', 100);
  showToast('Live camera stopped');
}

function handleUpload(file) {
  if (!file) return;
  uploadStatus.textContent = `Uploading ${file.name}`;
  progressBar.style.width = '0%';
  uploadOverlay.textContent = 'Analyzing...';
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      uploadStatus.textContent = 'Analysis complete';
      uploadOverlay.textContent = 'Detections overlay ready';
      showToast('Video processed');
    }
    progressBar.style.width = `${progress}%`;
  }, 400);

  const url = URL.createObjectURL(file);
  uploadVideo.src = url;
  uploadVideo.play();
}

function wireNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.target));
  });
}

function wireUpload() {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => { e.preventDefault(); dropArea.classList.add('hover'); });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => { e.preventDefault(); dropArea.classList.remove('hover'); });
  });
  dropArea.addEventListener('drop', e => handleUpload(e.dataTransfer.files[0]));
  fileInput.addEventListener('change', e => handleUpload(e.target.files[0]));
}

function wireActions() {
  startLiveBtn.addEventListener('click', startLive);
  stopLiveBtn.addEventListener('click', stopLive);
  downloadReport.addEventListener('click', () => showToast('Report download queued'));
  document.getElementById('dark-toggle').addEventListener('click', () => showToast('Dark mode locked'));
}

function init() {
  renderFeed();
  renderUploadTimeline();
  renderHistory();
  wireNavigation();
  wireUpload();
  wireActions();
  setLiveStatus('safe', 'Idle', 100);
}

init();
