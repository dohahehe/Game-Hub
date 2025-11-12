// Game Class
class Game {
    constructor(id, title, thumbnail, short_description, description, game_url, genre, platform, publisher, developer, release_date) {
        this.id = id;
        this.title = title;
        this.thumbnail = thumbnail;
        this.short_description = short_description;
        this.description = description;
        this.game_url = game_url;
        this.genre = genre;
        this.platform = platform;
        this.publisher = publisher;
        this.developer = developer;
        this.release_date = release_date;
    }

    // Get platform badge class
    getPlatformBadge() {
        if (this.platform.toLowerCase().includes('pc') || this.platform.toLowerCase().includes('windows')) {
            return 'pc-platform';
        } else if (this.platform.toLowerCase().includes('web') || this.platform.toLowerCase().includes('browser')) {
            return 'browser-platform';
        }
        return 'other-platform';
    }

    // Get platform icon
    getPlatformIcon() {
        if (this.platform.toLowerCase().includes('pc') || this.platform.toLowerCase().includes('windows')) {
            return '<i class="fa-solid fa-computer"></i>';
        } else if (this.platform.toLowerCase().includes('web') || this.platform.toLowerCase().includes('browser')) {
            return '<i class="fa-solid fa-globe"></i>';
        }
        return '<i class="fa-solid fa-gamepad"></i>';
    }

    // Safe image URL
    getSafeThumbnail() {
        return this.thumbnail || '';
    }

    // HTML for game card
    generateCardHTML() {
        const safeThumbnail = this.getSafeThumbnail();
        const imageHTML = safeThumbnail 
            ? `<img src="${safeThumbnail}" alt="${this.title}" onerror="this.style.display='none';">`
            : '';

        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="game-card" data-id="${this.id}">
                    <div class="platform-badge ${this.getPlatformBadge()}">
                         ${this.getPlatformIcon()} ${this.platform}
                    </div>
                    <div class="game-image">
                        ${imageHTML}
                    </div>
                    <div class="game-content">
                        
                        <h3>${this.title}</h3>
                        <p class="genre">${this.genre}</p>
                        <p>${this.short_description.substring(0, 100)}...</p>
                        <button class="btn-read-more" onclick="app.openGameModal(${this.id})">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }

    // HTML for carousel
    generateFeaturedHTML(isActive = false) {
        const safeThumbnail = this.getSafeThumbnail();
        const hasImage = safeThumbnail && safeThumbnail.trim() !== '';
        const imageHTML = hasImage 
            ? `<img src="${safeThumbnail}" alt="${this.title}">`
            : '';

        return `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <div class="carousel-image ${!hasImage ? 'gradient-bg' : ''}">
                    ${imageHTML}
                </div>
                <div class="container carousel-text">
                    <span>${this.genre}</span>
                    <h1>${this.title}</h1>
                    <p>${this.short_description.substring(0, 150)}...</p>
                    <a href="#" class="btn view-d" onclick="event.preventDefault(); app.openGameModal(${this.id});">View Details</a>
                </div>
            </div>
        `;
    }

    // HTML for modal
    generateModalHTML() {
        const safeThumbnail = this.getSafeThumbnail();
        const imageHTML = safeThumbnail 
            ? `<img src="${safeThumbnail}" alt="${this.title}" class="img-fluid rounded">`
            : '<div class="placeholder-image modal-placeholder">Game Image</div>';

        return `
            <div class="row">
                <div class="m-img-container col-lg-6 mt-1 text-center">
                    <div class="modal-img">${imageHTML}</div>
                    <div class="mt-3">
                        <span class="platform-badge ${this.getPlatformBadge()}">
                            ${this.getPlatformIcon()} ${this.platform}
                        </span>
                    </div>
                </div>
                <div class="col-lg-6">
                    <h4>${this.title}</h4>
                    <p><strong>Genre:</strong> ${this.genre}</p>
                    <p><strong>Developer:</strong> ${this.developer}</p>
                    <p><strong>Publisher:</strong> ${this.publisher || 'N/A'}</p>
                    <p><strong>Release Date:</strong> ${new Date(this.release_date).toLocaleDateString()}</p>
                    <p class="mt-3">${this.short_description.substring(0, 150)}</p>
                    <div class="mt-4">
                        <a href="${this.game_url}" target="_blank" class="btn btn-primary me-2">
                            <i class="fa-solid fa-play me-1"></i>Play Game
                        </a>
                        
                    </div>
                </div>
            </div>
        `;
    }
}

// Game Manager Class
class GameManager {
    constructor() {
        this.allGames = [];
        this.filteredGames = [];
        this.displayedGames = 9;
        this.gamesPerLoad = 9;
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
    }

    // API Configuration
    apiConfig = {
        url: 'https://free-to-play-games-database.p.rapidapi.com/api/games',
        options: {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'a64a0e02b1mshe71cde0b4d9832ap11f058jsnd3b815cdd0f6',
                'x-rapidapi-host': 'free-to-play-games-database.p.rapidapi.com'
            }
        }
    };

    // Load games from API
    async loadGames() {
        try {
            const response = await fetch(this.apiConfig.url, this.apiConfig.options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const gamesData = await response.json();
            this.allGames = gamesData.map(game => new Game(
                game.id,
                game.title,
                game.thumbnail,
                game.short_description,
                game.description,
                game.game_url,
                game.genre,
                game.platform,
                game.publisher,
                game.developer,
                game.release_date,
            ));
            // console.log(this.allGames);
            
            this.filterGames('all');
            return this.allGames;
            
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    }

    // Filter games
    filterGames(filter, searchTerm = this.currentSearchTerm) {
        this.currentFilter = filter;
        this.currentSearchTerm = searchTerm; 
        this.displayedGames = 9;

        let filtered = [...this.allGames];

        const containsTerm = (text, term) => {
            return text && typeof text === 'string' && text.toLowerCase().includes(term);
        };

        switch (filter) {
            case 'mmorpg':
                filtered = filtered.filter(game => 
                    containsTerm(game.genre, 'mmorpg')
                );
                break;
            case 'shooter':
                filtered = filtered.filter(game => 
                    containsTerm(game.genre, 'shooter')
                );
                break;
            case 'sailing':
                filtered = filtered.filter(game => 
                    containsTerm(game.title, 'sail') ||
                    containsTerm(game.short_description, 'sail') ||
                    containsTerm(game.description, 'sail') ||
                    containsTerm(game.genre, 'sail') ||
                    containsTerm(game.title, 'boat') ||
                    containsTerm(game.short_description, 'boat') ||
                    containsTerm(game.description, 'boat') ||
                    containsTerm(game.title, 'sea') ||
                    containsTerm(game.short_description, 'sea') ||
                    containsTerm(game.description, 'sea') ||
                    containsTerm(game.title, 'ocean') ||
                    containsTerm(game.short_description, 'ocean') ||
                    containsTerm(game.description, 'ocean') ||
                    containsTerm(game.title, 'naval') ||
                    containsTerm(game.short_description, 'naval') ||
                    containsTerm(game.description, 'naval') ||
                    containsTerm(game.title, 'pirate') ||
                    containsTerm(game.short_description, 'pirate') ||
                    containsTerm(game.description, 'pirate')
                );
                break;
            case 'permadeath':
                filtered = filtered.filter(game => 
                    containsTerm(game.title, 'permadeath') ||
                    containsTerm(game.short_description, 'permadeath') ||
                    containsTerm(game.description, 'permadeath') ||
                    containsTerm(game.title, 'perma death') ||
                    containsTerm(game.short_description, 'perma death') ||
                    containsTerm(game.description, 'perma death') ||
                    containsTerm(game.title, 'perma-death') ||
                    containsTerm(game.short_description, 'perma-death') ||
                    containsTerm(game.description, 'perma-death') ||
                    containsTerm(game.title, 'hardcore') ||
                    containsTerm(game.short_description, 'hardcore') ||
                    containsTerm(game.description, 'hardcore') ||
                    containsTerm(game.title, 'roguelike') ||
                    containsTerm(game.short_description, 'roguelike') ||
                    containsTerm(game.description, 'roguelike')
                );
                break;
            case 'superhero':
                filtered = filtered.filter(game => 
                    containsTerm(game.title, 'superhero') ||
                    containsTerm(game.short_description, 'superhero') ||
                    containsTerm(game.description, 'superhero') ||
                    containsTerm(game.title, 'super hero') ||
                    containsTerm(game.short_description, 'super hero') ||
                    containsTerm(game.description, 'super hero') ||
                    containsTerm(game.title, 'marvel') ||
                    containsTerm(game.short_description, 'marvel') ||
                    containsTerm(game.description, 'marvel') ||
                    containsTerm(game.title, 'dc') ||
                    containsTerm(game.short_description, 'dc') ||
                    containsTerm(game.description, 'dc') ||
                    containsTerm(game.title, 'comic') ||
                    containsTerm(game.short_description, 'comic') ||
                    containsTerm(game.description, 'comic') ||
                    containsTerm(game.genre, 'superhero')
                );
                break;
            case 'pixel':
                filtered = filtered.filter(game => 
                    containsTerm(game.genre, 'pixel') ||
                    containsTerm(game.title, 'pixel') ||
                    containsTerm(game.short_description, 'pixel') ||
                    containsTerm(game.description, 'pixel') ||
                    containsTerm(game.genre, 'retro') ||
                    containsTerm(game.title, 'retro') ||
                    containsTerm(game.short_description, 'retro') ||
                    containsTerm(game.description, 'retro') ||
                    containsTerm(game.title, '8-bit') ||
                    containsTerm(game.short_description, '8-bit') ||
                    containsTerm(game.description, '8-bit') ||
                    containsTerm(game.title, '8bit') ||
                    containsTerm(game.short_description, '8bit') ||
                    containsTerm(game.description, '8bit') ||
                    containsTerm(game.title, '16-bit') ||
                    containsTerm(game.short_description, '16-bit') ||
                    containsTerm(game.description, '16-bit')
                );
                break;
            default:
                // all filter
                filtered = [...this.allGames];
        }

        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(game => 
                containsTerm(game.title, term) ||
                containsTerm(game.genre, term) ||
                containsTerm(game.short_description, term) ||
                containsTerm(game.developer, term)
            );
        }

        this.filteredGames = filtered;
        
        // console.log(`Filter: ${filter}, Results: ${this.filteredGames.length}`);
        
        return this.filteredGames;
    }

    // Search games by term
    searchGames(searchTerm) {
        this.currentSearchTerm = searchTerm;
        return this.filterGames(this.currentFilter, searchTerm);
    }

    // Clear search
    clearSearch() {
        this.currentSearchTerm = '';
        return this.filterGames(this.currentFilter);
    }

    // Get games for display
    getGamesToDisplay() {
        return this.filteredGames.slice(0, this.displayedGames);
    }

    // Load more games
    loadMoreGames() {
        this.displayedGames += this.gamesPerLoad;
        return this.getGamesToDisplay();
    }

    // Check if more games can be loaded
    canLoadMore() {
        return this.displayedGames < this.filteredGames.length;
    }

    // Get featured games for carousel
    getFeaturedGames(count = 5) {
        const gamesWithThumbnails = this.allGames.filter(game => game.thumbnail);
        
        const sourceArray = gamesWithThumbnails.length >= count ? gamesWithThumbnails : this.allGames;
        
        const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Find game by ID
    getGameById(id) {
        return this.allGames.find(game => game.id === id);
    }
}

// Main Application Class
class GameHubApp {
    constructor() {
        this.gameManager = new GameManager();
        this.domElements = {};
        this.searchTimeout = null;
        this.init();
    }

    // Initialize the application
    async init() {
        this.cacheDOM();
        this.setupEventListeners();
        await this.loadGames();
    }

    // Cache DOM elements
    cacheDOM() {
        this.domElements = {
            gamesGrid: document.getElementById('games-grid'),
            loadingSpinner: document.getElementById('loading-spinner'),
            loadMoreBtn: document.getElementById('load-more'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            featuredCarousel: document.getElementById('featured-carousel'),
            gameModal: new bootstrap.Modal(document.getElementById('gameModal')),
            gameModalBody: document.getElementById('gameModalBody'),
            gameModalLabel: document.getElementById('gameModalLabel'),
            searchInput: document.getElementById('search'),
            searchLabel: document.querySelector('label[for="search"]')
        };
    }

    // event listeners
    setupEventListeners() {
        // Load more button
        this.domElements.loadMoreBtn.addEventListener('click', () => this.loadMoreGames());
        
        // Filter buttons
        this.domElements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                this.domElements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter games
                this.filterGames(btn.dataset.filter);
            });
        });

        // Search input with debouncing
        this.domElements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Clear search when input is emptied
        this.domElements.searchInput.addEventListener('keyup', (e) => {
            if (e.target.value === '') {
                this.handleSearch('');
            }
        });

         // Enter key search
        this.domElements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearchImmediately(e.target.value);
            }
        });

        // Search label click
        if (this.domElements.searchLabel) {
            this.domElements.searchLabel.addEventListener('click', (e) => {
                e.preventDefault();
                this.domElements.searchInput.focus();
                
                // If there's text in the input, trigger search immediately
                if (this.domElements.searchInput.value.trim() !== '') {
                    this.performSearchImmediately(this.domElements.searchInput.value);
                }
            });
        }

        // Also allow clicking on the search icon container
        const searchContainer = this.domElements.searchInput.parentElement;
        if (searchContainer) {
            searchContainer.addEventListener('click', (e) => {
                // Only trigger if clicking on the label or empty space around input
                if (e.target === searchContainer || e.target === this.domElements.searchLabel) {
                    this.domElements.searchInput.focus();
                    
                    // If there's text in the input, trigger search immediately
                    if (this.domElements.searchInput.value.trim() !== '') {
                        this.performSearchImmediately(this.domElements.searchInput.value);
                    }
                }
            });
        }
    }

    // Handle search with debouncing
    handleSearch(searchTerm) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout (300ms debounce)
        this.searchTimeout = setTimeout(() => {
            this.performSearch(searchTerm);
        }, 300);
    }

    // Perform search immediately (without debouncing)
    performSearchImmediately(searchTerm) {
        // Clear any pending debounced search
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.performSearch(searchTerm);
    }

    // Perform the actual search
    performSearch(searchTerm) {
        if (searchTerm.trim() === '') {
            this.gameManager.clearSearch();
        } else {
            this.gameManager.searchGames(searchTerm);
        }
        
        this.displayGames();
    }

    // Load games from API
    async loadGames() {
        try {
            this.showLoading();
            await this.gameManager.loadGames();
            this.displayGames();
            this.setupFeaturedCarousel();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading games:', error);
            this.hideLoading();
            this.displayError('Failed to load games. Please check your internet connection and try again.');
        }
    }

    // Display games in the grid
    displayGames() {
        const games = this.gameManager.getGamesToDisplay();
        const searchTerm = this.gameManager.currentSearchTerm;
        
        if (games.length === 0) {
            if (searchTerm && searchTerm.trim() !== '') {
                this.domElements.gamesGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <p>No games found matching "<strong>${searchTerm}</strong>".</p>
                        <button class="clear-btn btn btn-clear-search" onclick="app.clearSearchAndDisplay()">Clear Search</button>
                    </div>
                `;
            } else {
                this.domElements.gamesGrid.innerHTML = '<div class="col-12 text-center"><p>No games found matching your criteria.</p></div>';
            }
            this.domElements.loadMoreBtn.style.display = 'none';
            return;
        }
        
        const gamesHTML = games.map(game => game.generateCardHTML()).join('');
        this.domElements.gamesGrid.innerHTML = gamesHTML;
        
        // Show search results count if searching
        if (searchTerm && searchTerm.trim() !== '') {
            const resultsCount = this.gameManager.filteredGames.length;
            const resultsInfo = document.createElement('div');
            resultsInfo.className = 'col-12 mb-3';
            resultsInfo.innerHTML = `
                <div class="search-results-info">
                    Found ${resultsCount} game${resultsCount !== 1 ? 's' : ''} for "<strong>${searchTerm}</strong>"
                    <button class="close-btn btn btn-clear-search" onclick="app.clearSearchAndDisplay()">Clear</button>
                </div>
            `;
            this.domElements.gamesGrid.insertBefore(resultsInfo, this.domElements.gamesGrid.firstChild);
        }
        
        // Show/hide load more button
        this.domElements.loadMoreBtn.style.display = this.gameManager.canLoadMore() ? 'block' : 'none';
    }

    // Clear search and display all games
    clearSearchAndDisplay() {
        this.domElements.searchInput.value = '';
        this.gameManager.clearSearch();
        this.displayGames();
    }

    // Setup featured carousel
    setupFeaturedCarousel() {
        const featuredGames = this.gameManager.getFeaturedGames(5);
        
        if (featuredGames.length === 0) {
            return;
        }
        
        const carouselItems = featuredGames.map((game, index) => 
            game.generateFeaturedHTML(index === 0)
        ).join('');
        
        this.domElements.featuredCarousel.innerHTML = carouselItems;
    }

    // Filter games
    filterGames(filter) {
        this.gameManager.filterGames(filter);
        this.displayGames();
    }

    // Load more games
    loadMoreGames() {
        const games = this.gameManager.loadMoreGames();
        const gamesHTML = games.map(game => game.generateCardHTML()).join('');
        this.domElements.gamesGrid.innerHTML = gamesHTML;
        
        // Hide load more button if all games are displayed
        if (!this.gameManager.canLoadMore()) {
            this.domElements.loadMoreBtn.style.display = 'none';
        }
    }

    // Open game modal
    openGameModal(gameId) {
        const game = this.gameManager.getGameById(gameId);
        if (!game) return;
        
        this.domElements.gameModalLabel.textContent = game.title;
        this.domElements.gameModalBody.innerHTML = game.generateModalHTML();
        this.domElements.gameModal.show();
    }

    // Utility functions
    showLoading() {
        this.domElements.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.domElements.loadingSpinner.classList.add('hidden');
    }

    displayError(message) {
        this.domElements.gamesGrid.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i>
                    ${message}
                </div>
            </div>
        `;
        this.domElements.loadMoreBtn.style.display = 'none';
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new GameHubApp();
});