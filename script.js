document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.game-slider');
    
    sliders.forEach(slider => {
        const screenshots = slider.querySelectorAll('.screenshot-container');
        const dots = slider.querySelectorAll('.slider-dot');
        let currentIndex = 0;

        // Only run slider on mobile
        if (window.innerWidth < 769) {
            // Add click event to each dot
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    updateSlider();
                });
            });

            function updateSlider() {
                screenshots.forEach((screenshot, index) => {
                    if (index === currentIndex) {
                        screenshot.classList.add('active');
                    } else {
                        screenshot.classList.remove('active');
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

            // Auto-slide every 5 seconds
            setInterval(() => {
                if (window.innerWidth < 769) {
                    currentIndex = (currentIndex + 1) % screenshots.length;
                    updateSlider();
                }
            }, 5000);
        }
    });
});