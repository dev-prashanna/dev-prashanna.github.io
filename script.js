// ==================== MATRIX RAIN ====================
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]=/\\;:@#$%';
const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
});

// ==================== SCANLINE OVERLAY ====================
const scanCanvas = document.getElementById('scanline-canvas');
const scanCtx = scanCanvas.getContext('2d');

function resizeScanCanvas() {
    scanCanvas.width = window.innerWidth;
    scanCanvas.height = window.innerHeight;
}
resizeScanCanvas();
window.addEventListener('resize', resizeScanCanvas);

let scanY = 0;
function drawScanline() {
    scanCtx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
    scanCtx.fillStyle = 'rgba(0, 255, 65, 0.08)';
    scanCtx.fillRect(0, scanY, scanCanvas.width, 2);
    scanY += 1;
    if (scanY > scanCanvas.height) scanY = 0;
    requestAnimationFrame(drawScanline);
}
drawScanline();

// ==================== NAVBAR ====================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ==================== TYPING EFFECT ====================
const typingElement = document.getElementById('typing-text');
const phrases = [
    'AI-driven offensive tools',
    'intelligent threat analysis',
    'adversarial ML systems',
    'autonomous exploit platforms',
    'security research frameworks',
    'edge AI solutions',
    'CYPHEX platform'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingDelay = 40;
    } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingDelay = 80;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingDelay = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingDelay = 400;
    }

    setTimeout(typeEffect, typingDelay);
}

typeEffect();

// ==================== SCROLL ANIMATIONS (AOS-like) ====================
const observedAosElements = new Set();

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
        if (observedAosElements.has(el)) return;
        observedAosElements.add(el);
        observer.observe(el);
    });
}

// ==================== ACTIVE NAV LINK ====================
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = '#00ff41';
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==================== GITHUB API INTEGRATION ====================
const GITHUB_USER = 'dev-prashanna';
const GITHUB_API = 'https://api.github.com';
const PROJECTS_CACHE_KEY = 'gh_projects_v1';
const PROJECTS_CACHE_TTL = 5 * 60 * 1000;
const PROJECTS_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const PROJECTS_PER_BATCH = 12;
const HIDDEN_REPOS = new Set(['dev-prashanna.github.io', 'Personal-Website', 'dev-prashanna']);

const LANG_COLORS = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'Jupyter Notebook': '#DA5B0B',
    'TeX': '#3D6117',
    'C++': '#f34b7d',
    'C': '#555555',
    'Bash': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'TypeScript': '#2b7489',
    'Rust': '#dea584',
    'Go': '#00ADD8',
    'Java': '#b07219',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'Makefile': '#427819',
    'default': '#00ff41'
};

const REPO_ICON_OVERRIDES = {
    'CYPHEX': 'fa-dharmachakra',
    'CYPHEX-SENTINEL': 'fa-tower-broadcast',
    'NEURAQUIRE': 'fa-brain',
    'Image-Segmentation-Naterida': 'fa-image',
    'Spatial_Preception': 'fa-eye',
    'Guardrailer': 'fa-user-secret',
    'PROMPT-GUARDRAILS': 'fa-language',
    'netguard': 'fa-network-wired',
    'Project_BALANCE': 'fa-weight-scale',
    'flappy-bird-dqn': 'fa-dove'
};

const REPO_ICON_RULES = [
    { icon: 'fa-shield-halved', keywords: ['security', 'secure', 'guardrail', 'prompt', 'injection', 'jailbreak', 'vulnerab', 'cyber', 'pentest', 'attack', 'wireless', 'wifi', 'esp32', 'malware', 'threat', 'exploit', 'sentinel', 'netguard'] },
    { icon: 'fa-brain', keywords: ['ai', ' ml', 'machine-learning', 'deep-learning', 'neural', 'llm', 'rag', 'nlp', 'agent', 'dqn', 'reinforcement', 'transformer', 'model'] },
    { icon: 'fa-eye', keywords: ['vision', 'segmentation', 'image', 'detection', 'perception', 'hyperspectral', 'yolo', 'unet', 'u-net'] },
    { icon: 'fa-robot', keywords: ['robot', 'drone', 'firmware', 'hardware', 'balanc', 'embedded', 'arduino'] },
    { icon: 'fa-chart-line', keywords: ['data', 'analysis', 'plot', 'statistic', 'forecast'] },
    { icon: 'fa-globe', keywords: ['website', 'web ', 'portfolio', 'site', 'landing'] }
];

let visibleProjects = [];
let renderedProjects = 0;

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function timeAgo(dateString) {
    if (!dateString) return '';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 0) return 'just now';
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [name, size] of units) {
        const value = Math.floor(seconds / size);
        if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}

function setSyncStatus(state, message) {
    const el = document.getElementById('projects-sync');
    if (!el) return;
    el.classList.remove('is-live', 'is-error');
    if (state) el.classList.add(state);
    el.textContent = message;
}

function repoIcon(repo) {
    if (REPO_ICON_OVERRIDES[repo.name]) return REPO_ICON_OVERRIDES[repo.name];
    const haystack = [repo.name, repo.description || '', repo.language || '', ...(repo.topics || [])]
        .join(' ').toLowerCase();
    for (const rule of REPO_ICON_RULES) {
        if (rule.keywords.some(keyword => haystack.includes(keyword))) return rule.icon;
    }
    return 'fa-terminal';
}

function repoTopics(repo) {
    const format = value => value.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
    const topics = (repo.topics || []).slice(0, 3).map(format);
    if (topics.length) return topics;
    if (repo.language) return [repo.language];
    return ['GitHub'];
}

function selectProjects(repos) {
    return repos
        .filter(repo => repo && !repo.fork && !HIDDEN_REPOS.has(repo.name))
        .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
}

function projectCardHTML(repo, index) {
    const description = repo.description
        ? escapeHtml(repo.description)
        : '// no description yet -- open the repo for details.';
    const tech = repoTopics(repo).map(topic => `<span class="tech-badge">${escapeHtml(topic)}</span>`).join('');
    const stars = repo.stargazers_count > 0
        ? `<span class="tech-badge">${repo.stargazers_count} star${repo.stargazers_count === 1 ? '' : 's'}</span>`
        : '';
    const language = repo.language
        ? `<span class="project-lang">${escapeHtml(repo.language)}</span>`
        : `<span class="project-lang">updated ${timeAgo(repo.pushed_at || repo.updated_at)}</span>`;
    const homepage = repo.homepage && /^https?:\/\//.test(repo.homepage)
        ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener" class="project-link" title="live demo"><i class="fas fa-arrow-up-right-from-square"></i></a>`
        : '';

    return `
        <div class="project-card" data-aos="fade-up" data-aos-delay="${(index % PROJECTS_PER_BATCH) * 80}">
            <div class="project-card-inner">
                <div class="project-header">
                    <div class="project-icon"><i class="fas ${repoIcon(repo)}"></i></div>
                    <div class="project-links">
                        ${homepage}
                        <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener" class="project-link"><i class="fab fa-github"></i></a>
                    </div>
                </div>
                <h3 class="project-name">${escapeHtml(repo.name)}</h3>
                <p class="project-description">${description}</p>
                <div class="project-tech-stack">${tech}</div>
                <div class="project-footer">${stars}${language}</div>
            </div>
        </div>`;
}

function appendProjectBatch(grid) {
    const batch = visibleProjects.slice(renderedProjects, renderedProjects + PROJECTS_PER_BATCH);
    if (!batch.length) return false;
    grid.insertAdjacentHTML('beforeend',
        batch.map((repo, i) => projectCardHTML(repo, renderedProjects + i)).join(''));
    renderedProjects += batch.length;
    return true;
}

function updateLoadMore() {
    const btn = document.getElementById('projects-load-more');
    const label = document.getElementById('projects-load-more-label');
    if (!btn) return;
    const remaining = visibleProjects.length - renderedProjects;
    btn.hidden = remaining <= 0;
    if (label && remaining > 0) label.textContent = `load_more() +${remaining}`;
}

function cacheProjects(user, repos) {
    try {
        localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify({ user, repos, at: Date.now() }));
    } catch (e) { /* storage unavailable */ }
}

function readProjectsCache() {
    try {
        const raw = localStorage.getItem(PROJECTS_CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.repos)) return null;
        if (Date.now() - data.at > PROJECTS_CACHE_MAX_AGE) return null;
        return { ...data, stale: Date.now() - data.at > PROJECTS_CACHE_TTL };
    } catch (e) {
        return null;
    }
}

function renderProjects(repos) {
    const grid = document.getElementById('projects-grid');
    if (!grid || !Array.isArray(repos)) return;

    visibleProjects = selectProjects(repos);
    if (!visibleProjects.length) return;

    grid.innerHTML = '';
    renderedProjects = 0;
    appendProjectBatch(grid);
    updateLoadMore();
}

function applyGitHubData(user, repos) {
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    animateCounter('stat-repos', repos.length);
    animateCounter('stat-stars', totalStars);
    animateCounter('stat-forks', totalForks);
    animateCounter('stat-followers', (user && user.followers) || 0);

    buildLanguageBar(repos);
    renderProjects(repos);
bindProjectGlitch();

// ==================== LOAD MORE PROJECTS ====================
const loadMoreBtn = document.getElementById('projects-load-more');

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !visibleProjects.length) return;

        if (appendProjectBatch(grid)) {
            updateLoadMore();
            bindProjectGlitch();
            initScrollAnimations();
        }
    });
}

    // Re-init scroll animations for new elements
    initScrollAnimations();
}

async function fetchGitHubData() {
    const cached = readProjectsCache();

    // Fresh local copy: skip the network so repeated visits never burn API quota
    if (cached && !cached.stale) {
        applyGitHubData(cached.user, cached.repos);
        setSyncStatus('is-live', `// synced locally -- ${visibleProjects.length} repos from @${GITHUB_USER}`);
        return;
    }

    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`${GITHUB_API}/users/${GITHUB_USER}`),
            fetch(`${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error(`GitHub API responded ${userResponse.status}/${reposResponse.status}`);
        }

        const user = await userResponse.json();
        const repos = await reposResponse.json();
        if (!Array.isArray(repos)) throw new Error('Unexpected GitHub payload');

        cacheProjects(user, repos);
        applyGitHubData(user, repos);
        setSyncStatus('is-live', `// live sync -- ${visibleProjects.length} repos from @${GITHUB_USER}`);
    } catch (error) {
        console.error('GitHub API error:', error);

        if (cached) {
            applyGitHubData(cached.user, cached.repos);
            setSyncStatus('is-live', `// cached sync -- ${visibleProjects.length} repos from @${GITHUB_USER}${cached.stale ? ' (offline copy)' : ''}`);
        } else {
            // Static project cards stay in place as fallback
            setSyncStatus('is-error', '// github api unreachable -- showing static project list');
        }
    }
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duration = 1500;
    const increment = target / (duration / 16);
    let current = 0;

    function update() {
        current += increment;
        if (current < target) {
            el.textContent = Math.ceil(current);
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }
    update();
}

function buildLanguageBar(repos) {
    const langCounts = {};
    repos.forEach(repo => {
        if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        }
    });

    const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

    const langBar = document.getElementById('lang-bar');
    langBar.innerHTML = sorted.map(([lang, count]) => {
        const pct = (count / total) * 100;
        const color = LANG_COLORS[lang] || LANG_COLORS['default'];
        return `<div class="lang-segment" style="width: ${pct}%; background: ${color};" data-label="${lang} (${count})" title="${lang}: ${count} repos"></div>`;
    }).join('');
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    fetchGitHubData();
    initVideoFilters();
});

// ==================== VIDEO FILTERS ====================
function initVideoFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const videoCards = document.querySelectorAll('.video-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            videoCards.forEach((card, i) => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 60);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ==================== MOUSE TRAIL ====================
let mouseTrail = [];
const MAX_TRAIL = 5;

document.addEventListener('mousemove', (e) => {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 3px;
        height: 3px;
        background: #00ff41;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.6;
        box-shadow: 0 0 6px #00ff41;
    `;
    document.body.appendChild(particle);

    mouseTrail.push(particle);
    if (mouseTrail.length > MAX_TRAIL) {
        mouseTrail.shift();
    }

    requestAnimationFrame(() => {
        particle.style.transition = 'all 0.5s ease';
        particle.style.opacity = '0';
        particle.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) scale(0)`;
    });

    setTimeout(() => {
        particle.remove();
        mouseTrail = mouseTrail.filter(p => p !== particle);
    }, 600);
});

// ==================== GLITCH EFFECT ON HOVER ====================
function bindProjectGlitch() {
    document.querySelectorAll('.project-name:not([data-glitch-bound])').forEach(el => {
        el.setAttribute('data-glitch-bound', '1');
        el.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            this.offsetHeight;
            this.classList.add('glitch-text');
            setTimeout(() => this.classList.remove('glitch-text'), 500);
        });
    });
}
bindProjectGlitch();

// Add glitch keyframes dynamically
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes glitch-text {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(2px, -2px); }
        60% { transform: translate(-2px, -2px); }
        80% { transform: translate(2px, 2px); }
        100% { transform: translate(0); }
    }
    .glitch-text {
        animation: glitch-text 0.1s infinite !important;
        text-shadow: 2px 0 #ff0040, -2px 0 #00ff41;
    }
`;
document.head.appendChild(glitchStyle);

// ==================== BACKGROUND VIDEO ====================
const bgVideo = document.getElementById('bg-video');

if (bgVideo) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startVideo = () => {
        if (prefersReducedMotion) {
            bgVideo.pause();
            return;
        }
        const playPromise = bgVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                document.addEventListener('click', () => bgVideo.play().catch(() => {}), { once: true });
                document.addEventListener('touchstart', () => bgVideo.play().catch(() => {}), { once: true });
            });
        }
    };

    if (bgVideo.readyState >= 2) {
        startVideo();
    } else {
        bgVideo.addEventListener('loadeddata', startVideo, { once: true });
        bgVideo.load();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            bgVideo.pause();
        } else {
            startVideo();
        }
    });
}
