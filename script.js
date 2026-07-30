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
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
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

const REPO_ICONS = [
    'fa-shield-halved', 'fa-terminal', 'fa-code', 'fa-bug',
    'fa-dharmachakra', 'fa-robot', 'fa-brain', 'fa-satellite-dish',
    'fa-eye', 'fa-book-open', 'fa-microchip', 'fa-lock',
    'fa-network-wired', 'fa-database', 'fa-cogs', 'fa-bolt'
];

function getRepoIcon(index) {
    return REPO_ICONS[index % REPO_ICONS.length];
}

function getTechBadges(languages, topics) {
    const badges = [];
    if (languages) {
        Object.keys(languages).slice(0, 3).forEach(lang => {
            badges.push(lang);
        });
    }
    if (topics && topics.length > 0) {
        topics.slice(0, 2).forEach(topic => {
            if (!badges.includes(topic)) badges.push(topic);
        });
    }
    return badges.slice(0, 4);
}

function createProjectCard(repo, index) {
    const badges = getTechBadges(repo.language ? { [repo.language]: 100 } : null, repo.topics);
    const description = repo.description || 'No description available.';
    const icon = getRepoIcon(index);

    return `
        <div class="project-card" data-aos="fade-up" data-aos-delay="${Math.min(index * 80, 500)}">
            <div class="project-card-inner">
                <div class="project-header">
                    <div class="project-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
                <h3 class="project-name">${repo.name}</h3>
                <p class="project-description">${description.length > 140 ? description.substring(0, 140) + '...' : description}</p>
                <div class="project-tech-stack">
                    ${badges.map(b => `<span class="tech-badge">${b}</span>`).join('')}
                </div>
                <div class="project-footer">
                    <span class="project-stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    <span class="project-forks"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    <span class="project-lang">${repo.language || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

async function fetchGitHubData() {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`${GITHUB_API}/users/${GITHUB_USER}`),
            fetch(`${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
        ]);

        const user = await userResponse.json();
        const repos = await reposResponse.json();

        // Update stats
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

        animateCounter('stat-repos', repos.length);
        animateCounter('stat-stars', totalStars);
        animateCounter('stat-forks', totalForks);
        animateCounter('stat-followers', user.followers || 0);

        // Language bar
        buildLanguageBar(repos);

        // Projects grid (exclude the profile readme and CYPHEX which is featured)
        const projectRepos = repos.filter(r =>
            r.name !== 'dev-prashanna' &&
            r.name !== 'CYPHEX' &&
            r.name !== 'version2'
        );

        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = projectRepos.slice(0, 9).map((repo, i) => createProjectCard(repo, i)).join('');

        // Re-init scroll animations for new elements
        initScrollAnimations();

    } catch (error) {
        console.error('GitHub API error:', error);
        document.getElementById('projects-grid').innerHTML = `
            <div class="project-loading">
                <span style="color: #ff0040;">// Unable to fetch data from GitHub API. Rate limit may be exceeded.</span>
            </div>
        `;
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
});

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
document.querySelectorAll('.project-name').forEach(el => {
    el.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
        this.offsetHeight;
        this.classList.add('glitch-text');
        setTimeout(() => this.classList.remove('glitch-text'), 500);
    });
});

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
