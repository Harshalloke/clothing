// 1. Initialize Lenis Smooth Scroll
const initLenis = () => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return lenis;
};

// 2. Custom Cursor & Environment logic
const initCursor = () => {
    const cursor = document.querySelector('.cursor-follower');
    const cursorLabel = document.querySelector('.cursor-label');
    const spotlight = document.querySelector('.spotlight-env');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
    });

    const updateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.35;
        cursorY += (mouseY - cursorY) * 0.35;
        gsap.set(cursor, { x: cursorX - 4, y: cursorY - 4 });
        gsap.set(cursorLabel, { x: mouseX + 20, y: mouseY + 20 });
        requestAnimationFrame(updateCursor);
    };
    updateCursor();

    const interactibles = document.querySelectorAll('a, button, .product-card, .magnetic-btn');
    interactibles.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            if (el.classList.contains('product-card')) cursorLabel.style.display = 'block';
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorLabel.style.display = 'none';
        });
    });
};

// 3. Hero 3D Tilt
const initHeroTilt = () => {
    const titleGroup = document.querySelector('.hero-title-group');
    const heroImg = document.querySelector('#hero-img-container');
    if (!titleGroup) return;

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;

        gsap.to(titleGroup, { rotateY: xPos * 25, rotateX: -yPos * 25, duration: 1.2, ease: 'power2.out' });
        gsap.to(heroImg, { rotateY: xPos * 20, rotateX: -yPos * 20, x: xPos * 40, y: yPos * 40, duration: 1.5, ease: 'power3.out' });
    });
};

// 4. Product Card 3D Tilt
const initCard3D = () => {
    const productCards = document.querySelectorAll('.product-card.tilt-3d');
    productCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (centerX = rect.width / 2, e.clientX - rect.left);
            const y = (centerY = rect.height / 2, e.clientY - rect.top);
            gsap.to(card, { rotateX: (y - centerY) / 10, rotateY: (centerX - x) / 10, scale: 1.02, duration: 0.5, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        });
    });
};

// 5. Magnetic Buttons
const initMagneticButtons = () => {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
    });
};

// 6. Preloader
const initPreloader = (onComplete) => {
    const languages = ["Hello", "Bonjour", "Ciao", "Hola", "Konnichiwa", "Namaste", "Hej", "Cloth®"];
    const preloaderText = document.getElementById('preloader-text');
    const preloaderProgress = document.getElementById('preloader-progress');
    const preloaderOverlay = document.getElementById('preloader');

    // Check if preloader already played this session
    if (sessionStorage.getItem('preloader_played')) {
        if (preloaderOverlay) preloaderOverlay.style.display = 'none';
        if (onComplete) onComplete(true); // Tag as skipped
        return;
    }

    let langIndex = 0;
    const updateText = () => {
        if (langIndex < languages.length) {
            preloaderText.textContent = languages[langIndex];
            const tl = gsap.timeline();
            tl.to(preloaderText, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" })
                .to(preloaderProgress, { width: `${(langIndex + 1) / languages.length * 100}%`, duration: 0.3, ease: "none" }, "<")
                .to(preloaderText, { opacity: 0, scale: 1.1, duration: 0.3, ease: "power2.in", delay: 0.2 });
            langIndex++;
            setTimeout(updateText, 600);
        } else {
            sessionStorage.setItem('preloader_played', 'true');
            if (onComplete) onComplete(false);
        }
    };
    updateText();
};

// Load All Components
window.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initCursor();
    initCard3D();
    initMagneticButtons();
    updateCartDisplay();

    // Intersection Observer for 3D Reveals
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-3d').forEach(el => revealObserver.observe(el));
});

// 7. Cart Management
const getCart = () => JSON.parse(localStorage.getItem('cloth_cart')) || [];
const saveCart = (cart) => localStorage.setItem('cloth_cart', JSON.stringify(cart));

const addToCart = (product) => {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === product.size);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateCartDisplay();
};

const updateCartDisplay = () => {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartBtns = document.querySelectorAll('.magnetic-btn');
    cartBtns.forEach(btn => {
        if (btn.textContent.includes('Cart')) {
            btn.innerHTML = `Cart (${count})`;
        }
    });
};

