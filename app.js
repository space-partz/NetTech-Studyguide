document.addEventListener('DOMContentLoaded', function() {
    // Ensure page starts at the top
    window.scrollTo(0, 0);
    
    // DOM Elements
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i'); 
    const themeText = themeToggleBtn.querySelector('span');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const prevChapterBtn = document.getElementById('prev-chapter');
    const nextChapterBtn = document.getElementById('next-chapter');
    const currentChapterTitle = document.getElementById('current-chapter');
    
    // Initialize state
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved theme
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        themeText.textContent = 'Light Mode';
    }
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
    
    // Theme toggle functionality
    themeToggleBtn.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        body.classList.toggle('dark-mode');
        
        if (isDarkMode) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            themeText.textContent = 'Dark Mode';
        }
        
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm === '') return;
        
        // Simple search implementation - highlight matches
        const contentElements = document.querySelectorAll('.topic-content p, .topic-content li, .definition-box p, .example-box p');
        let matchFound = false;
        
        // Remove existing highlights
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.outerHTML = el.innerHTML;
        });
        
        contentElements.forEach(element => {
            const content = element.innerHTML;
            if (content.toLowerCase().includes(searchTerm)) {
                matchFound = true;
                
                // Highlight the matching text
                const regex = new RegExp(searchTerm, 'gi');
                element.innerHTML = content.replace(regex, match => 
                    `<span class="search-highlight" style="background-color: #ffeb3b; color: #000;">${match}</span>`
                );
                
                // Scroll to first match
                if (matchFound) {
                    const firstMatch = document.querySelector('.search-highlight');
                    if (firstMatch) {
                        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        });
        
        if (!matchFound) {
            alert('No results found for: ' + searchTerm);
        }
    }
    
    // Chapter navigation
    const chapters = document.querySelectorAll('.sidebar-nav > ul > li');
    let currentChapterIndex = 0;
    
    // Find the active chapter index
    chapters.forEach((chapter, index) => {
        if (chapter.classList.contains('active')) {
            currentChapterIndex = index;
        }
    });
    
    // Update navigation buttons
    updateNavButtons();
    
    nextChapterBtn.addEventListener('click', function() {
        if (currentChapterIndex < chapters.length - 1) {
            chapters[currentChapterIndex].classList.remove('active');
            currentChapterIndex++;
            chapters[currentChapterIndex].classList.add('active');
            
            // Update chapter title and content visibility
            updateChapterView();
            updateNavButtons();
        }
    });
    
    prevChapterBtn.addEventListener('click', function() {
        if (currentChapterIndex > 0) {
            chapters[currentChapterIndex].classList.remove('active');
            currentChapterIndex--;
            chapters[currentChapterIndex].classList.add('active');
            
            // Update chapter title and content visibility
            updateChapterView();
            updateNavButtons();
        }
    });
    
    function updateNavButtons() {
        prevChapterBtn.disabled = currentChapterIndex === 0;
        nextChapterBtn.disabled = currentChapterIndex === chapters.length - 1;
    }
    
    function updateChapterView() {
        const chapterLink = chapters[currentChapterIndex].querySelector('a');
        currentChapterTitle.textContent = chapterLink.textContent;
        
        // Get the target chapter's ID from the link's href
        const targetId = chapterLink.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Scroll to the target chapter with smooth behavior
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Handle topic navigation
    const topicLinks = document.querySelectorAll('.topics-list a');
    
    topicLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Track reading progress (simplified version)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const topicId = entry.target.id;
                // Mark as read in localStorage
                const readTopics = JSON.parse(localStorage.getItem('readTopics') || '[]');
                if (!readTopics.includes(topicId)) {
                    readTopics.push(topicId);
                    localStorage.setItem('readTopics', JSON.stringify(readTopics));
                }
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all topics for reading progress
    document.querySelectorAll('.topic').forEach(topic => {
        observer.observe(topic);
    });
    
    // Apply read status indicators
    function applyReadStatus() {
        const readTopics = JSON.parse(localStorage.getItem('readTopics') || '[]');
        
        topicLinks.forEach(link => {
            const topicId = link.getAttribute('href').substring(1);
            if (readTopics.includes(topicId)) {
                link.classList.add('read');
                // Add a visual indicator
                if (!link.querySelector('.read-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'read-indicator';
                    indicator.innerHTML = ' ✓';
                    indicator.style.color = '#4CAF50';
                    link.appendChild(indicator);
                }
            }
        });
    }
    
    // Apply read status on load
    applyReadStatus();

    // Handle sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar nav a');
    const chapterLinks = document.querySelectorAll('.sidebar nav > ul > li > a');

    // Function to remove all active classes
    function removeAllActive() {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.sidebar nav ul li').forEach(li => {
            li.classList.remove('active');
        });
    }

    // Function to set active state
    function setActiveState(link) {
        removeAllActive();
        link.classList.add('active');
        
        // If it's a section link, also activate its parent chapter
        const parentLi = link.closest('ul').closest('li');
        if (parentLi) {
            parentLi.classList.add('active');
            parentLi.querySelector('a').classList.add('active');
        }
    }

    // Handle clicks on chapter headers
    chapterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const parentLi = this.parentElement;
            
            // If clicking an already active chapter, just toggle its sections
            if (this.classList.contains('active')) {
                parentLi.classList.toggle('active');
            } else {
                // Remove active class from all items
                removeAllActive();
                // Add active class to clicked chapter
                this.classList.add('active');
                parentLi.classList.add('active');
            }

            // Scroll to chapter content
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle clicks on section links
    sidebarLinks.forEach(link => {
        if (!link.parentElement.parentElement.parentElement.classList.contains('sidebar')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                setActiveState(this);

                // Scroll to section content
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // Set initial active state based on current URL hash
    function setInitialActiveState() {
        const hash = window.location.hash;
        if (hash) {
            const activeLink = document.querySelector(`.sidebar nav a[href="${hash}"]`);
            if (activeLink) {
                setActiveState(activeLink);
            }
        }
    }

    setInitialActiveState();
});
