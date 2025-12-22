import { checkHealth, uploadVideo as uploadVideoAPI, sendLiveFrame } from './api.js';

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
const uploadVideoEl = document.getElementById('upload-video');
const uploadStatus = document.getElementById('upload-status');
const progressBar = document.getElementById('progress-bar');
const uploadOverlay = document.getElementById('upload-overlay');
const downloadReport = document.getElementById('download-report');
const alertBanner = document.createElement('div');
alertBanner.className = 'alert-banner hidden';
alertBanner.innerHTML = '<span>⚠️ HIGH THREAT DETECTED</span><button class="close-alert">×</button>';
document.body.insertBefore(alertBanner, document.body.firstChild);

let liveInterval = null;
let threatCount = 0;
let videoStream = null;
let detectionCache = [];

function showPage(id) {
  pages.forEach(page => page.classList.toggle('hidden', page.id !== id));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === id));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function showAlertBanner() {
  alertBanner.classList.remove('hidden');
  setTimeout(() => alertBanner.classList.add('hidden'), 4000);
}

function mapThreatLevel(label, confidence) {
  const threatLabels = ['fight', 'accident', 'fall', 'harassment', 'animal_attack', 'weapon', 'unattended'];
  const isThreat = threatLabels.some(t => label.toLowerCase().includes(t));
  if (isThreat && confidence > 0.75) return 'danger';
  if (isThreat || confidence > 0.65) return 'warn';
  return 'safe';
}

function renderFeed() {
  const items = detectionCache.slice(-5).map(item => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    const conf = Math.round(item.confidence * 100);
    const now = new Date();
    const time = now.toLocaleTimeString();
    return `
      <div class="timeline-item">
        <span class="muted">${time}</span>
        <div>
          <div class="value">${item.label}</div>
          <div class="muted">Camera: Live</div>
        </div>
        <span class="tag ${badge}">${conf}%</span>
      </div>
    `;
  }).join('');
  liveFeed.innerHTML = items || '<p class="muted">Waiting for detections...</p>';
}

function renderUploadTimeline() {
  uploadTimelineEl.innerHTML = detectionCache.map((item, i) => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    const ts = item.timestamp || (i * 0.5).toFixed(1);
    return `
      <div class="timeline-item">
        <span class="muted">${ts}s</span>
        <div>
          <div class="value">${item.label}</div>
          <div class="muted">${item.severity} threat</div>
        </div>
        <span class="tag ${badge}">${Math.round(item.confidence * 100)}%</span>
      </div>
    `;
  }).join('') || '<p class="muted">No detections yet</p>';
}

function renderHistory() {
  historyList.innerHTML = detectionCache.slice(-10).map(item => {
    const badge = item.severity === 'danger' ? 'danger' : item.severity === 'warn' ? 'warn' : 'safe';
    const now = new Date();
    const time = now.toLocaleTimeString();
    return `
      <div class="history-item">
        <div class="thumb"></div>
        <div>
          <div class="value">${item.label}</div>
          <div class="muted">${time} · Live Camera</div>
        </div>
        <span class="tag ${badge}">${item.severity}</span>
      </div>
    `;
  }).join('') || '<p class="muted">No history yet</p>';
}

function updateStats(latest) {
  threatCount += 1;
  statThreats.textContent = threatCount;
  statLastAlert.textContent = latest.time;
  statStatus.textContent = latest.severity === 'danger' ? 'Alerting' : 'Online';
  const statusColor = latest.severity === 'danger' ? 'rgba(255,77,103,0.2)' : 'rgba(66,165,255,0.12)';
  statStatus.style.background = statusColor;
}

function setLiveStatus(label, severity, confidence) {
  liveStatus.dataset.level = severity;
  liveStatus.textContent = severity === 'danger' ? 'Threat Detected' : severity === 'warn' ? 'Suspicious' : 'Safe';
  liveLabel.textContent = label || 'Idle';
  liveConfidence.textContent = `${Math.round(confidence * 100)}%`;
  heroStatus.textContent = liveStatus.textContent;
  heroLabel.textContent = label || 'Person';
  heroConfidence.textContent = `${Math.round(confidence * 100)}%`;
  if (severity === 'safe' && label === 'Idle') {
    liveBox.style.display = 'none';
  } else {
    liveBox.style.display = 'block';
    liveBox.style.left = `${10 + Math.random() * 60}%`;
    liveBox.style.top = `${10 + Math.random() * 50}%`;
    liveBox.style.width = `${20 + Math.random() * 30}%`;
    liveBox.style.height = `${20 + Math.random() * 35}%`;
  }
  if (severity === 'danger') showAlertBanner();
}

function startLive() {
  if (liveInterval) return;
  showToast('Requesting camera access...');
  
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    .then(stream => {
      videoStream = stream;
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      showToast('Camera started, sending frames...');
      liveInterval = setInterval(async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const b64 = canvas.toDataURL('image/jpeg').split(',')[1];
        
        try {
          const result = await sendLiveFrame(b64);
          const severity = result.threat_level === 'HIGH' ? 'danger' : result.threat_level === 'MEDIUM' ? 'warn' : 'safe';
          setLiveStatus(result.label || 'Analyzing', severity, result.confidence || 0);
          
          if (result.label && result.label !== 'none') {
            detectionCache.push({
              label: result.label,
              confidence: result.confidence || 0,
              severity: severity,
              timestamp: new Date().toLocaleTimeString()
            });
            threatCount += 1;
            statThreats.textContent = threatCount;
            statLastAlert.textContent = new Date().toLocaleTimeString();
            renderFeed();
            renderHistory();
          }
        } catch (error) {
          console.error('Frame send failed:', error);
        }
      }, 1000);
    })
    .catch(err => {
      showToast(`Camera error: ${err.message}`);
      console.error('Camera error:', err);
    });
}

function stopLive() {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  setLiveStatus('Idle', 'safe', 1);
  showToast('Live camera stopped');
}

function handleUpload(file) {
  if (!file) return;
  uploadStatus.textContent = `Uploading ${file.name}...`;
  progressBar.style.width = '0%';
  uploadOverlay.textContent = 'Processing video...';
  detectionCache = [];
  
  uploadVideoAPI(file)
    .then(result => {
      uploadStatus.textContent = `Analysis complete: ${result.count || 0} detections`;
      uploadOverlay.textContent = 'Ready for playback';
      
      if (result.detections) {
        detectionCache = result.detections.map(d => ({
          label: d.label || 'object',
          confidence: d.confidence || 0,
          severity: d.threat_level || 'safe',
          timestamp: d.timestamp || 0
        }));
        renderUploadTimeline();
        
        const hasHighThreat = detectionCache.some(d => d.severity === 'danger');
        if (hasHighThreat) showAlertBanner();
      }
      
      progressBar.style.width = '100%';
      showToast('Video analyzed successfully');
    })
    .catch(error => {
      uploadStatus.textContent = `Error: ${error.message}`;
      uploadOverlay.textContent = 'Analysis failed';
      showToast(`Upload failed: ${error.message}`);
      console.error('Upload error:', error);
    });

  const url = URL.createObjectURL(file);
  uploadVideoEl.src = url;
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
  checkHealth()
    .then(() => {
      showToast('Connected to backend');
      statStatus.textContent = 'Online';
    })
    .catch(err => {
      showToast('Backend unavailable');
      statStatus.textContent = 'Offline';
      console.error('Health check failed:', err);
    });
  
  renderFeed();
  renderUploadTimeline();
  renderHistory();
  wireNavigation();
  wireUpload();
  wireActions();
  setLiveStatus('Idle', 'safe', 1);
  
  alertBanner.querySelector('.close-alert').addEventListener('click', () => {
    alertBanner.classList.add('hidden');
  });
}

init();
