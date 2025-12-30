// frontend/assets/js/main.js
// Extracted page JavaScript: particles, navigation, threat simulation, upload handling, and Element SDK mapping

document.addEventListener('DOMContentLoaded', () => {
  const defaultConfig = {
    system_title: "Civic AI Shield",
    system_subtitle: "AI-Powered Real-Time Public Safety System",
    primary_button_text: "Start Live Detection",
    secondary_button_text: "Upload Video for Analysis",
    background_color: "#0a0e27",
    accent_color: "#00d9ff",
    secondary_accent_color: "#00ffcc",
    primary_action_color: "#0066ff",
    alert_color: "#ff3366"
  };

  // Particles
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 15 + 's';
      p.style.animationDuration = (Math.random() * 10 + 10) + 's';
      container.appendChild(p);
    }
  }
  createParticles();

  // Navigation & page switching
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  const ctaButtons = document.querySelectorAll('[data-page]');

  function navigateToPage(pageName) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const targetPage = document.getElementById(pageName);
    const targetLink = document.querySelector(`[data-page="${pageName}"]`);
    if (targetPage) targetPage.classList.add('active');
    if (targetLink && targetLink.classList.contains('nav-link')) targetLink.classList.add('active');
    // scroll to top of content container
    const content = document.querySelector('.content-container');
    if (content) content.scrollTop = 0;
  }

  navLinks.forEach(link => link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    if (page) navigateToPage(page);
  }));

  ctaButtons.forEach(btn => btn.addEventListener('click', (e) => {
    const page = btn.getAttribute('data-page');
    if (page) navigateToPage(page);
  }));

  // Threat simulation
  let threatLevel = 0;
  const threatStatus = document.getElementById('threat-status');
  const confidenceValue = document.getElementById('confidence-value');

  if (threatStatus && confidenceValue) {
    setInterval(() => {
      threatLevel = Math.floor(Math.random() * 3);
      const confidence = Math.floor(Math.random() * 20 + 80);
      threatStatus.className = 'glass-card threat-badge';
      if (threatLevel === 0) {
        threatStatus.classList.add('threat-safe');
        threatStatus.textContent = 'SAFE';
      } else if (threatLevel === 1) {
        threatStatus.classList.add('threat-medium');
        threatStatus.textContent = 'MEDIUM';
      } else {
        threatStatus.classList.add('threat-high');
        threatStatus.textContent = 'HIGH ALERT';
      }
      confidenceValue.textContent = confidence + '%';
    }, 5000);
  }

  // Video upload handling (simulated)
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const timelineContainer = document.getElementById('timeline-container');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'rgba(0,217,255,0.8)'; uploadZone.style.background = 'rgba(0,217,255,0.15)'; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = 'rgba(0,217,255,0.4)'; uploadZone.style.background = 'rgba(0,217,255,0.05)'; });
    uploadZone.addEventListener('drop', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'rgba(0,217,255,0.4)'; uploadZone.style.background = 'rgba(0,217,255,0.05)'; const files = e.dataTransfer.files; if (files.length) handleFileUpload(files[0]); });

    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFileUpload(e.target.files[0]); });
  }

  function handleFileUpload(file) {
    if (!progressContainer || !progressBar || !progressText || !timelineContainer) return;
    progressContainer.style.display = 'block';
    timelineContainer.style.display = 'none';
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        progressText.textContent = 'Analysis Complete!';
        setTimeout(() => { progressContainer.style.display = 'none'; timelineContainer.style.display = 'block'; }, 1000);
      }
      progressBar.style.width = progress + '%';
      progressText.textContent = `Processing: ${Math.floor(progress)}%`;
    }, 300);
  }

  // Element SDK integration
  async function onConfigChange(config) {
    const systemTitle = document.getElementById('system-title');
    const systemSubtitle = document.getElementById('system-subtitle');
    const primaryCta = document.getElementById('primary-cta');
    const secondaryCta = document.getElementById('secondary-cta');

    if (systemTitle) systemTitle.textContent = config.system_title || defaultConfig.system_title;
    if (systemSubtitle) systemSubtitle.textContent = config.system_subtitle || defaultConfig.system_subtitle;
    if (primaryCta) primaryCta.textContent = config.primary_button_text || defaultConfig.primary_button_text;
    if (secondaryCta) secondaryCta.textContent = config.secondary_button_text || defaultConfig.secondary_button_text;

    const backgroundElements = document.querySelectorAll('body, .app-wrapper');
    backgroundElements.forEach(el => { el.style.background = config.background_color || defaultConfig.background_color; });

    const accentElements = document.querySelectorAll('.hero-title, .nav-logo, .nav-link.active, .confidence-value, .timeline-header, .status-label');
    accentElements.forEach(el => { el.style.color = config.accent_color || defaultConfig.accent_color; });
  }

  function mapToCapabilities(config) {
    return {
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: (value) => window.elementSdk && window.elementSdk.setConfig({ background_color: value }) },
        { get: () => config.accent_color || defaultConfig.accent_color, set: (value) => window.elementSdk && window.elementSdk.setConfig({ accent_color: value }) },
        { get: () => config.secondary_accent_color || defaultConfig.secondary_accent_color, set: (value) => window.elementSdk && window.elementSdk.setConfig({ secondary_accent_color: value }) },
        { get: () => config.primary_action_color || defaultConfig.primary_action_color, set: (value) => window.elementSdk && window.elementSdk.setConfig({ primary_action_color: value }) },
        { get: () => config.alert_color || defaultConfig.alert_color, set: (value) => window.elementSdk && window.elementSdk.setConfig({ alert_color: value }) }
      ],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    };
  }

  function mapToEditPanelValues(config) {
    return new Map([
      ["system_title", config.system_title || defaultConfig.system_title],
      ["system_subtitle", config.system_subtitle || defaultConfig.system_subtitle],
      ["primary_button_text", config.primary_button_text || defaultConfig.primary_button_text],
      ["secondary_button_text", config.secondary_button_text || defaultConfig.secondary_button_text]
    ]);
  }

  if (window.elementSdk) {
    window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
  }
});
/* Extracted JS from original index.html */

const defaultConfig = {
  main_title: "Civic AI Shield",
  subtitle: "AI-Powered Real-Time Public Safety System",
  cta_primary: "Start Live Detection",
  cta_secondary: "Upload Video for Analysis",
  dashboard_title: "Live Detection Dashboard",
  upload_title: "Video Analysis Upload",
  alerts_title: "Recent Alerts & History",
  background_color: "#0a0e27",
  surface_color: "#1e293b",
  text_color: "#e0e7ff",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#60a5fa",
  font_family: "Inter",
  font_size: 16
};

async function onConfigChange(config) {
  const customFont = config.font_family || defaultConfig.font_family;
  const baseSize = config.font_size || defaultConfig.font_size;
  const baseFontStack = 'sans-serif';
  const orbitronStack = 'Orbitron, sans-serif';

  // Update text content
  document.getElementById('main-title').textContent = config.main_title || defaultConfig.main_title;
  document.getElementById('subtitle').textContent = config.subtitle || defaultConfig.subtitle;
  document.getElementById('btn-primary').textContent = config.cta_primary || defaultConfig.cta_primary;
  document.getElementById('btn-secondary').textContent = config.cta_secondary || defaultConfig.cta_secondary;
  document.getElementById('dashboard-title').textContent = config.dashboard_title || defaultConfig.dashboard_title;
  document.getElementById('upload-title').textContent = config.upload_title || defaultConfig.upload_title;
  document.getElementById('alerts-title').textContent = config.alerts_title || defaultConfig.alerts_title;

  // Update colors
  const bgColor = config.background_color || defaultConfig.background_color;
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const primaryColor = config.primary_action_color || defaultConfig.primary_action_color;
  const secondaryColor = config.secondary_action_color || defaultConfig.secondary_action_color;

  document.body.style.background = bgColor;
  document.querySelector('.app-wrapper').style.background = `linear-gradient(135deg, ${bgColor} 0%, ${surfaceColor} 100%)`;
  document.body.style.color = textColor;

  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.style.background = `${surfaceColor}99`;
  });

  const primaryButtons = document.querySelectorAll('.btn-primary');
  primaryButtons.forEach(btn => {
    btn.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`;
  });

  const secondaryButtons = document.querySelectorAll('.btn-secondary');
  secondaryButtons.forEach(btn => {
    btn.style.borderColor = `${secondaryColor}80`;
    btn.style.color = secondaryColor;
  });

  // Update fonts
  document.getElementById('main-title').style.fontFamily = `${customFont}, ${orbitronStack}`;
  document.getElementById('subtitle').style.fontFamily = `${customFont}, ${baseFontStack}`;
  document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

  // Update font sizes
  document.getElementById('main-title').style.fontSize = `${baseSize * 3}px`;
  document.getElementById('subtitle').style.fontSize = `${baseSize * 1.25}px`;
  document.getElementById('dashboard-title').style.fontSize = `${baseSize * 2}px`;
  document.getElementById('upload-title').style.fontSize = `${baseSize * 2}px`;
  document.getElementById('alerts-title').style.fontSize = `${baseSize * 2}px`;
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      {
        get: () => config.background_color || defaultConfig.background_color,
        set: (value) => {
          config.background_color = value;
          window.elementSdk.setConfig({ background_color: value });
        }
      },
      {
        get: () => config.surface_color || defaultConfig.surface_color,
        set: (value) => {
          config.surface_color = value;
          window.elementSdk.setConfig({ surface_color: value });
        }
      },
      {
        get: () => config.text_color || defaultConfig.text_color,
        set: (value) => {
          config.text_color = value;
          window.elementSdk.setConfig({ text_color: value });
        }
      },
      {
        get: () => config.primary_action_color || defaultConfig.primary_action_color,
        set: (value) => {
          config.primary_action_color = value;
          window.elementSdk.setConfig({ primary_action_color: value });
        }
      },
      {
        get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
        set: (value) => {
          config.secondary_action_color = value;
          window.elementSdk.setConfig({ secondary_action_color: value });
        }
      }
    ],
    borderables: [],
    fontEditable: {
      get: () => config.font_family || defaultConfig.font_family,
      set: (value) => {
        config.font_family = value;
        window.elementSdk.setConfig({ font_family: value });
      }
    },
    fontSizeable: {
      get: () => config.font_size || defaultConfig.font_size,
      set: (value) => {
        config.font_size = value;
        window.elementSdk.setConfig({ font_size: value });
      }
    }
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ["main_title", config.main_title || defaultConfig.main_title],
    ["subtitle", config.subtitle || defaultConfig.subtitle],
    ["cta_primary", config.cta_primary || defaultConfig.cta_primary],
    ["cta_secondary", config.cta_secondary || defaultConfig.cta_secondary],
    ["dashboard_title", config.dashboard_title || defaultConfig.dashboard_title],
    ["upload_title", config.upload_title || defaultConfig.upload_title],
    ["alerts_title", config.alerts_title || defaultConfig.alerts_title]
  ]);
}

// Initialize Element SDK
if (window.elementSdk && typeof window.elementSdk.init === 'function') {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.getAttribute('href');
    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
  });
});

// CTA Buttons
const btnPrimary = document.getElementById('btn-primary');
if (btnPrimary) btnPrimary.addEventListener('click', () => {
  document.querySelector('#dashboard').scrollIntoView({ behavior: 'smooth' });
});

const btnSecondary = document.getElementById('btn-secondary');
if (btnSecondary) btnSecondary.addEventListener('click', () => {
  document.querySelector('#upload').scrollIntoView({ behavior: 'smooth' });
});

// Live Detection
let isDetecting = false;
const startDetectionBtn = document.getElementById('start-detection');
const detectionOverlay = document.getElementById('detection-overlay');
const detectionStatus = document.getElementById('detection-status');
const threatBadge = document.getElementById('threat-badge');
const confidenceValue = document.getElementById('confidence-value');
const confidenceBar = document.getElementById('confidence-bar');
const detectionList = document.getElementById('detection-list');

if (startDetectionBtn) {
  startDetectionBtn.addEventListener('click', () => {
    isDetecting = !isDetecting;
    
    if (isDetecting) {
      startDetectionBtn.textContent = 'Stop Detection';
      startDetectionBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      startDetectionBtn.classList.add('bg-red-600', 'hover:bg-red-700');
      if (detectionOverlay) detectionOverlay.style.display = 'block';
      if (detectionStatus) {
        detectionStatus.textContent = 'ACTIVE';
        detectionStatus.classList.remove('text-green-500');
        detectionStatus.classList.add('text-blue-500');
      }
      
      simulateDetection();
    } else {
      startDetectionBtn.textContent = 'Start Detection';
      startDetectionBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
      startDetectionBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      if (detectionOverlay) detectionOverlay.style.display = 'none';
      if (detectionStatus) {
        detectionStatus.textContent = 'MONITORING';
        detectionStatus.classList.remove('text-blue-500');
        detectionStatus.classList.add('text-green-500');
      }
    }
  });
}

function simulateDetection() {
  if (!isDetecting) return;

  const threats = ['SAFE', 'MEDIUM', 'HIGH'];
  const randomThreat = threats[Math.floor(Math.random() * threats.length)];
  const confidence = Math.floor(Math.random() * 20) + 80;

  if (threatBadge) threatBadge.textContent = randomThreat;

  if (confidenceValue) confidenceValue.textContent = `${confidence}%`;
  if (confidenceBar) confidenceBar.style.width = `${confidence}%`;

  if (detectionOverlay) {
    if (randomThreat === 'SAFE') {
      if (confidenceBar) {
        confidenceBar.classList.remove('bg-yellow-500', 'bg-red-500');
        confidenceBar.classList.add('bg-green-500');
      }
      detectionOverlay.innerHTML = '<div class="absolute -top-6 left-0 bg-green-500 px-2 py-1 rounded text-xs font-bold">SAFE</div>';
      detectionOverlay.className = 'absolute top-1/4 left-1/4 w-32 h-32 border-2 border-green-500 rounded';
    } else if (randomThreat === 'MEDIUM') {
      if (confidenceBar) {
        confidenceBar.classList.remove('bg-green-500', 'bg-red-500');
        confidenceBar.classList.add('bg-yellow-500');
      }
      detectionOverlay.innerHTML = '<div class="absolute -top-6 left-0 bg-yellow-500 px-2 py-1 rounded text-xs font-bold">CAUTION</div>';
      detectionOverlay.className = 'absolute top-1/4 left-1/4 w-32 h-32 border-2 border-yellow-500 rounded';
    } else {
      if (confidenceBar) {
        confidenceBar.classList.remove('bg-green-500', 'bg-yellow-500');
        confidenceBar.classList.add('bg-red-500');
      }
      detectionOverlay.innerHTML = '<div class="absolute -top-6 left-0 bg-red-500 px-2 py-1 rounded text-xs font-bold">THREAT</div>';
      detectionOverlay.className = 'absolute top-1/4 left-1/4 w-32 h-32 border-2 border-red-500 rounded alert-pulse';
    }
  }

  addDetectionToList(randomThreat, confidence);
  
  setTimeout(simulateDetection, 3000);
}

function addDetectionToList(threat, confidence) {
  const time = new Date().toLocaleTimeString();
  const listItem = document.createElement('div');
  listItem.className = 'flex justify-between items-center p-2 bg-gray-800/50 rounded fade-in';
  listItem.innerHTML = `
    <span class="text-xs">${threat} - ${confidence}%</span>
    <span class="text-xs text-gray-500">${time}</span>
  `;
  
  if (detectionList && detectionList.querySelector('.text-center')) {
    detectionList.innerHTML = '';
  }
  
  if (detectionList) detectionList.insertBefore(listItem, detectionList.firstChild);
  
  if (detectionList && detectionList.children.length > 5) {
    detectionList.removeChild(detectionList.lastChild);
  }
}

// Upload functionality
const uploadArea = document.getElementById('upload-area');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const analysisResults = document.getElementById('analysis-results');
const threatTimeline = document.getElementById('threat-timeline');

if (uploadArea) {
  uploadArea.addEventListener('click', () => {
    simulateUpload();
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    simulateUpload();
  });
}

function simulateUpload() {
  if (uploadProgress) uploadProgress.style.display = 'block';
  if (analysisResults) analysisResults.style.display = 'none';
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(showAnalysisResults, 500);
    }
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressPercentage) progressPercentage.textContent = `${Math.floor(progress)}%`;
  }, 300);
}

function showAnalysisResults() {
  if (uploadProgress) uploadProgress.style.display = 'none';
  if (analysisResults) analysisResults.style.display = 'block';
  
  const threats = [
    { type: 'Suspicious Activity', time: '00:45', confidence: 87, severity: 'medium' },
    { type: 'Unauthorized Access', time: '02:15', confidence: 94, severity: 'high' },
    { type: 'Normal Activity', time: '04:30', confidence: 98, severity: 'safe' }
  ];
  
  if (threatTimeline) threatTimeline.innerHTML = '';
  
  threats.forEach((threat, index) => {
    const card = document.createElement('div');
    card.className = 'glass-card p-4 slide-in';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="badge-${threat.severity} px-3 py-1 rounded-full text-xs font-semibold">
          ${threat.severity.toUpperCase()}
        </div>
        <span class="text-sm font-semibold text-blue-400">${threat.confidence}%</span>
      </div>
      <h4 class="font-semibold mb-2">${threat.type}</h4>
      <div class="flex items-center text-sm text-gray-400">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Timestamp: ${threat.time}
      </div>
    `;
    if (threatTimeline) threatTimeline.appendChild(card);
  });
}

// Retain the small iframe-injection script behavior (moved from inline)
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9b26b56da2da7f48',t:'MTc2NjQ4MDg0Ny4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
