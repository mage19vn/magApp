/**
 * Mage__08 Software Center - Main Script
 * Handles UI interactions, API fetching, Command Palette, Easter Egg, and Theme.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Variables & State ===
    const apps = [
        { id: 'resize', repo: 'mage19vn/resizeVideo', name: 'Resize Video Utility', desc: 'Resize Video Utility', icon: 'fa-video' },
        { id: 'magdown', repo: 'mage19vn/magDown', name: 'magDown', desc: 'Video Downloader', icon: 'fa-download' },
        { id: 'magconvert', repo: 'mage19vn/magConvertFile', name: 'magConvertFile', desc: 'File Converter', icon: 'fa-file-export' },
        { id: 'magautotone', repo: 'mage19vn/magAutoTone', name: 'magAutoTone', desc: 'Auto Tone Utility', icon: 'fa-music' }
    ];

    const commands = [
        { name: 'Resize Video Utility', icon: 'fa-video', action: () => scrollToSection('apps') },
        { name: 'magDown', icon: 'fa-download', action: () => scrollToSection('apps') },
        { name: 'magConvertFile', icon: 'fa-file-export', action: () => scrollToSection('apps') },
        { name: 'magAutoTone', icon: 'fa-music', action: () => scrollToSection('apps') },
        { name: 'Blockly RoboSim', icon: 'fa-robot', action: () => window.open('https://mage19vn.github.io/BlocklyRbSim/', '_blank') },
        { name: 'PVT Robot Coding', icon: 'fa-code-branch', action: () => window.open('https://pvtrobotcoding.netlify.app/', '_blank') },
        { name: 'Github Profile', icon: 'fa-github', action: () => scrollToSection('github') },
        { name: 'About', icon: 'fa-user', action: () => scrollToSection('about') },
        { name: 'Toggle Theme', icon: 'fa-palette', action: toggleThemeDropdown }
    ];

    let secretBuffer = '';
    const secretCode = '120408';
    
    // === DOM Elements ===
    const header = document.getElementById('header');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const backToTopBtn = document.getElementById('backToTop');
    
    const cmdPalette = document.getElementById('cmdPalette');
    const searchBtn = document.getElementById('searchBtn');
    const cmdInput = document.getElementById('cmdInput');
    const cmdList = document.getElementById('cmdList');
    const closeCmdBtn = document.querySelector('.close-btn');
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    
    const appsContainer = document.getElementById('appsContainer');
    const githubProfile = document.getElementById('githubProfile');
    const mainSearch = document.getElementById('mainSearch');
    
    const easterEggModal = document.getElementById('easterEggModal');
    const closeDevBtn = document.querySelector('.close-dev-btn');

    // === Initialization ===
    initTheme();
    setupEventListeners();
    fetchAppData();
    fetchGithubProfile();
    initIntersectionObserver();

    // === Event Listeners Setup ===
    function setupEventListeners() {
        // Scroll events
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                        backToTopBtn.classList.add('visible');
                    } else {
                        header.classList.remove('scrolled');
                        backToTopBtn.classList.remove('visible');
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        // Mobile Menu
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileBtn.innerHTML = navMenu.classList.contains('active') ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        // Close mobile menu on click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });

        // Theme Toggle Dropdown
        themeToggleBtn.addEventListener('click', toggleThemeDropdown);
        
        document.addEventListener('click', (e) => {
            if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('show');
            }
        });

        themeOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-set-theme');
                setTheme(theme);
                themeDropdown.classList.remove('show');
            });
        });

        // Command Palette (Ctrl + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                toggleCmdPalette();
            }
            if (e.key === 'Escape') {
                closeModals();
            }
            
            // Easter Egg Logic
            handleSecretTyping(e.key);
        });

        searchBtn.addEventListener('click', toggleCmdPalette);
        closeCmdBtn.addEventListener('click', closeModals);
        modalBackdrops.forEach(bg => bg.addEventListener('click', closeModals));

        cmdInput.addEventListener('input', (e) => {
            renderCmdList(e.target.value);
        });

        // Main Search (filtering apps and web projects on the page)
        mainSearch.addEventListener('input', handleMainSearch);

        // Back to top
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Easter egg close
        closeDevBtn.addEventListener('click', () => {
            easterEggModal.classList.remove('active');
        });

        // Mouse glow effect removed for performance
    }

    // === Theme Management ===
    function initTheme() {
        const savedTheme = localStorage.getItem('mageTheme') || 'dark';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mageTheme', theme);
        showToast(`Theme set to ${theme}`, 'success');
    }

    function toggleThemeDropdown() {
        themeDropdown.classList.toggle('show');
    }

    // === Data Fetching & Rendering ===
    async function fetchAppData() {
        appsContainer.innerHTML = ''; // clear skeletons
        
        for (const app of apps) {
            try {
                const response = await fetch(`https://api.github.com/repos/${app.repo}/releases/latest`);
                
                let version = 'v1.0.0';
                let date = 'Unknown';
                let downloadUrl = `https://github.com/${app.repo}`;
                let statusHtml = `<span class="badge status-ok"><i class="fa-solid fa-check-circle"></i> Active</span>`;
                let hasRelease = false;

                if (response.ok) {
                    const data = await response.json();
                    hasRelease = true;
                    version = data.tag_name || version;
                    date = new Date(data.published_at).toLocaleDateString();
                    
                    if (data.assets && data.assets.length > 0) {
                        // Priority: .exe > .zip > .msi > first available
                        const exe = data.assets.find(a => a.name.endsWith('.exe'));
                        const zip = data.assets.find(a => a.name.endsWith('.zip'));
                        const msi = data.assets.find(a => a.name.endsWith('.msi'));
                        const asset = exe || zip || msi || data.assets[0];
                        downloadUrl = asset.browser_download_url;
                    }
                } else {
                    statusHtml = `<span class="badge status-err"><i class="fa-solid fa-exclamation-circle"></i> No Release</span>`;
                }

                renderAppCard(app, version, date, downloadUrl, statusHtml, hasRelease);

            } catch (error) {
                console.error(`Error fetching ${app.repo}:`, error);
                const statusHtml = `<span class="badge status-err"><i class="fa-solid fa-wifi"></i> API Error</span>`;
                renderAppCard(app, 'Unknown', 'Unknown', `https://github.com/${app.repo}`, statusHtml, false);
            }
        }
    }

    function renderAppCard(app, version, date, downloadUrl, statusHtml, hasRelease) {
        const btnHtml = hasRelease 
            ? `<a href="${downloadUrl}" class="btn btn-primary btn-sm ripple"><i class="fa-solid fa-download"></i> Download</a>`
            : `<a href="${downloadUrl}" target="_blank" class="btn btn-primary btn-sm ripple"><i class="fa-brands fa-github"></i> Open Repo</a>`;

        const card = document.createElement('div');
        card.className = 'card glass app-card fade-in-up';
        card.setAttribute('data-name', `${app.name.toLowerCase()} ${app.desc.toLowerCase()}`);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon"><i class="fa-solid ${app.icon}"></i></div>
                <h3 class="card-title">${app.name}</h3>
            </div>
            <div class="card-body">
                <p class="card-desc">${app.desc}</p>
                <div class="card-meta">
                    <span class="badge"><i class="fa-solid fa-tag"></i> ${version}</span>
                    <span class="badge"><i class="fa-solid fa-calendar"></i> ${date}</span>
                    ${statusHtml}
                </div>
            </div>
            <div class="card-footer">
                ${btnHtml}
                <a href="https://github.com/${app.repo}" target="_blank" class="btn btn-outline btn-sm ripple"><i class="fa-brands fa-github"></i></a>
            </div>
        `;
        appsContainer.appendChild(card);
        observeElement(card);
    }

    async function fetchGithubProfile() {
        try {
            const response = await fetch('https://api.github.com/users/mage19vn');
            if (response.ok) {
                const data = await response.json();
                renderGithubProfile(data);
            } else {
                githubProfile.innerHTML = `<p class="text-danger">Unable to load GitHub profile data.</p><button class="btn btn-outline btn-sm mt-3" onclick="location.reload()">Retry</button>`;
            }
        } catch (error) {
            githubProfile.innerHTML = `<p class="text-danger">Unable to load GitHub profile data.</p><button class="btn btn-outline btn-sm mt-3" onclick="location.reload()">Retry</button>`;
        }
    }

    function renderGithubProfile(data) {
        githubProfile.innerHTML = `
            <div class="gh-avatar">
                <img src="${data.avatar_url}" alt="${data.login}">
            </div>
            <div class="gh-info w-100">
                <h3>${data.name || data.login}</h3>
                <a href="${data.html_url}" target="_blank">@${data.login}</a>
                <p class="mt-2 text-secondary">${data.bio || 'Developer'}</p>
                
                <div class="gh-stats">
                    <div class="gh-stat">
                        <span class="gh-stat-val">${data.public_repos}</span>
                        <span class="gh-stat-label">Repositories</span>
                    </div>
                    <div class="gh-stat">
                        <span class="gh-stat-val">${data.followers}</span>
                        <span class="gh-stat-label">Followers</span>
                    </div>
                </div>
                
                <div class="gh-repos">
                    <h4>Main Repository</h4>
                    <div class="card glass mt-3 p-3">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="fa-solid fa-book text-primary"></i>
                            <strong><a href="https://github.com/mage19vn/magApp" target="_blank">magApp</a></strong>
                        </div>
                        <p class="text-secondary text-sm">Personal Software Center source code.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // === Command Palette ===
    function toggleCmdPalette() {
        cmdPalette.classList.toggle('active');
        if (cmdPalette.classList.contains('active')) {
            cmdInput.value = '';
            renderCmdList('');
            setTimeout(() => cmdInput.focus(), 100);
        }
    }

    function closeModals() {
        cmdPalette.classList.remove('active');
        easterEggModal.classList.remove('active');
    }

    function renderCmdList(query) {
        cmdList.innerHTML = '';
        const q = query.toLowerCase();
        const filtered = commands.filter(c => c.name.toLowerCase().includes(q));
        
        if (filtered.length === 0) {
            cmdList.innerHTML = `<li class="cmd-item text-secondary"><i class="fa-solid fa-circle-exclamation"></i> No commands found</li>`;
            return;
        }

        filtered.forEach((cmd, index) => {
            const li = document.createElement('li');
            li.className = 'cmd-item';
            li.innerHTML = `<i class="fa-solid ${cmd.icon}"></i> <span>${cmd.name}</span>`;
            li.addEventListener('click', () => {
                closeModals();
                cmd.action();
            });
            cmdList.appendChild(li);
        });
    }

    // === Search ===
    function handleMainSearch(e) {
        const query = e.target.value.toLowerCase();
        
        // Filter Apps
        document.querySelectorAll('.app-card').forEach(card => {
            const name = card.getAttribute('data-name');
            card.style.display = name.includes(query) ? 'flex' : 'none';
        });

        // Filter Web Projects
        document.querySelectorAll('.web-card').forEach(card => {
            const name = card.getAttribute('data-name');
            card.style.display = name.includes(query) ? 'flex' : 'none';
        });
    }

    // === Utilities ===
    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // === Animation Observer ===
    function initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    }
    
    function observeElement(el) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        observer.observe(el);
    }

    // === Easter Egg (Developer Mode) ===
    function handleSecretTyping(key) {
        // Ignore modifier keys
        if (key.length > 1) return;
        
        secretBuffer += key;
        
        // Keep buffer length same as secret code length
        if (secretBuffer.length > secretCode.length) {
            secretBuffer = secretBuffer.substring(1);
        }
        
        if (secretBuffer === secretCode) {
            unlockDeveloperMode();
            secretBuffer = ''; // Reset
        }
    }

    function unlockDeveloperMode() {
        easterEggModal.classList.add('active');
        
        // Populate Developer Info
        document.getElementById('devBrowser').textContent = getBrowserInfo();
        document.getElementById('devRes').textContent = `${window.screen.width} x ${window.screen.height}`;
        document.getElementById('devTheme').textContent = document.documentElement.getAttribute('data-theme').toUpperCase();
        
        showToast('Developer Mode Unlocked!', 'success');
    }

    function getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("SamsungBrowser")) return "Samsung Browser";
        if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
        if (ua.includes("Trident")) return "IE";
        if (ua.includes("Edge")) return "Edge";
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Safari")) return "Safari";
        return "Unknown";
    }

    // === PWA Registration ===
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(reg => {
                console.log('Service Worker Registered');
            }).catch(err => {
                console.log('Service Worker Registration Failed:', err);
            });
        });
    }

    // Add ripple effect logic
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.ripple');
        if (!target) return;

        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - target.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - target.getBoundingClientRect().top - radius}px`;
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = 'rgba(255,255,255,0.4)';
        circle.style.transform = 'scale(0)';
        circle.style.animation = 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        circle.style.pointerEvents = 'none';

        const existingRipple = target.querySelector('.ripple-effect');
        if (existingRipple) existingRipple.remove();

        circle.classList.add('ripple-effect');
        target.appendChild(circle);

        setTimeout(() => circle.remove(), 600);
    });
});
