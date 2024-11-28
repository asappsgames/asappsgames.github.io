// Create script.js file
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.game-slider');
    
    sliders.forEach(slider => {
        const screenshots = [
            'images/color-blocks/screenshot1.png',
            'images/color-blocks/screenshot2.png',
            'images/color-blocks/screenshot3.png'
        ];
        const dots = slider.querySelectorAll('.slider-dot');
        const img = slider.querySelector('.game-screenshot');
        let currentIndex = 0;

        // Add click event to each dot
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateSlider();
            });
        });

        function updateSlider() {
            // Update image
            img.src = screenshots[currentIndex];
            
            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Optional: Auto-slide every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % screenshots.length;
            updateSlider();
        }, 5000);
    });
});