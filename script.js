document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.game-slider');
    
    sliders.forEach(async slider => {
        const gameFolder = slider.dataset.game;
        const screenshots = [];
        let currentIndex = 0;

        // Function to check if an image exists
        async function imageExists(url) {
            try {
                const img = new Image();
                img.src = url;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                return true;
            } catch {
                return false;
            }
        }

        // Function to find all available screenshots
        async function findScreenshots() {
            let index = 1;
            while (true) {
                const imagePath = `Images/${gameFolder}/screenshot${index}.png`;
                if (await imageExists(imagePath)) {
                    screenshots.push({
                        path: imagePath,
                        number: index
                    });
                    index++;
                } else {
                    break;
                }
            }
            // Sort screenshots by number
            screenshots.sort((a, b) => a.number - b.number);
            initializeSlider();
        }

        // Function to create screenshot elements
        function initializeSlider() {
            // Create screenshot containers
            screenshots.forEach((screenshot, index) => {
                const container = document.createElement('div');
                container.className = `screenshot-container ${index === 0 ? 'active' : ''}`;
                const img = document.createElement('img');
                img.src = screenshot.path;
                img.alt = `${gameFolder} Gameplay`;
                img.className = 'game-screenshot';
                container.appendChild(img);
                slider.insertBefore(container, slider.querySelector('.slider-nav'));
            });

            // Create navigation dots
            const nav = slider.querySelector('.slider-nav');
            screenshots.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                nav.appendChild(dot);
            });

            // Add click events to dots
            const dots = slider.querySelectorAll('.slider-dot');
            if (window.innerWidth < 769) {
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        currentIndex = index;
                        updateSlider();
                    });
                });

                // Auto-slide every 5 seconds on mobile
                setInterval(() => {
                    if (window.innerWidth < 769) {
                        currentIndex = (currentIndex + 1) % screenshots.length;
                        updateSlider();
                    }
                }, 5000);
            }
        }

        // Function to update slider state
        function updateSlider() {
            const containers = slider.querySelectorAll('.screenshot-container');
            const dots = slider.querySelectorAll('.slider-dot');

            containers.forEach((container, index) => {
                if (index === currentIndex) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            });

            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Start initialization
        await findScreenshots();
    });
});