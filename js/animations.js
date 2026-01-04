// Index Page Specific Animations
const initIndexAnimations = () => {
    const mainTl = gsap.timeline();

    // Initial states
    gsap.set('.hero-title', {
        yPercent: 100,
        rotateX: -90,
        opacity: 0,
        transformOrigin: "50% 100%"
    });

    // Preloader finish callback
    const finishPreloader = (skipped) => {
        if (skipped) {
            gsap.set('#hero-img-container', { scale: 1, opacity: 1 });
            gsap.set('.hero-title', { yPercent: 0, rotateX: 0, opacity: 1 });
            gsap.set('#header', { y: 0 });
            initHeroTilt();
            return;
        }

        mainTl.to('#preloader', {
            yPercent: -100,
            duration: 1.2,
            ease: 'expo.inOut'
        })
            .to('#hero-img-container', {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: 'expo.out'
            }, '-=0.5')
            .to('.hero-title', {
                yPercent: 0,
                rotateX: 0,
                opacity: 1,
                duration: 1.5,
                ease: 'expo.out',
                stagger: 0.1,
                onComplete: initHeroTilt
            }, '-=1')
            .to('#header', {
                y: 0,
                duration: 1,
                ease: 'expo.out'
            }, '-=1');
    };

    initPreloader(finishPreloader);

    // Horizontal Scroll Animation
    document.querySelectorAll(".horizontal-scroll-section").forEach((section) => {
        let container = section.querySelector(".horizontal-container");
        gsap.to(container, {
            x: () => -(container.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: section,
                pin: true,
                scrub: 1,
                end: () => "+=" + container.scrollWidth,
                invalidateOnRefresh: true,
            }
        });
    });

    // Marquee
    gsap.to('.marquee-content', {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: 'none'
    });

    // Reveal items on scroll
    gsap.utils.toArray('.reveal-item').forEach(item => {
        gsap.from(item, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
};
