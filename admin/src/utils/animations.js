import { gsap } from 'gsap';

/**
 * Professional GSAP animations for e-commerce admin panel
 * Standard, smooth, and performant animations
 */

export const pageAnimations = {
    // Fade in elements on page load
    fadeIn: (elements, options = {}) => {
        const { stagger = 0.1, duration = 0.6, delay = 0 } = options;

        gsap.fromTo(
            elements,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration,
                delay,
                stagger,
                ease: 'power2.out'
            }
        );
    },

    // Slide in from left
    slideInLeft: (elements, options = {}) => {
        const { stagger = 0.1, duration = 0.5, delay = 0 } = options;

        gsap.fromTo(
            elements,
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration,
                delay,
                stagger,
                ease: 'power3.out'
            }
        );
    },

    // Slide in from right
    slideInRight: (elements, options = {}) => {
        const { stagger = 0.1, duration = 0.5, delay = 0 } = options;

        gsap.fromTo(
            elements,
            { opacity: 0, x: 30 },
            {
                opacity: 1,
                x: 0,
                duration,
                delay,
                stagger,
                ease: 'power3.out'
            }
        );
    },

    // Scale in with bounce
    scaleIn: (elements, options = {}) => {
        const { stagger = 0.1, duration = 0.6, delay = 0 } = options;

        gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration,
                delay,
                stagger,
                ease: 'back.out(1.4)'
            }
        );
    },

    // Stagger cards animation
    staggerCards: (elements, options = {}) => {
        const { stagger = 0.15, duration = 0.7, delay = 0.2 } = options;

        gsap.fromTo(
            elements,
            {
                opacity: 0,
                y: 40,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration,
                delay,
                stagger,
                ease: 'power2.out'
            }
        );
    },

    // Hover scale effect
    hoverScale: (element, scale = 1.05) => {
        gsap.to(element, {
            scale,
            duration: 0.3,
            ease: 'power2.out'
        });
    },

    // Reset hover
    resetHover: (element) => {
        gsap.to(element, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    },

    // Pulse animation for notifications/badges
    pulse: (element) => {
        gsap.to(element, {
            scale: 1.2,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });
    },

    // Smooth scroll reveal
    scrollReveal: (elements, options = {}) => {
        const { stagger = 0.1, duration = 0.8 } = options;

        gsap.fromTo(
            elements,
            {
                opacity: 0,
                y: 60
            },
            {
                opacity: 1,
                y: 0,
                duration,
                stagger,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elements,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    },

    // Modal/Dialog animations
    modalOpen: (element) => {
        gsap.fromTo(
            element,
            {
                opacity: 0,
                scale: 0.9,
                y: -20
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: 'back.out(1.5)'
            }
        );
    },

    modalClose: (element, onComplete) => {
        gsap.to(element, {
            opacity: 0,
            scale: 0.9,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete
        });
    },

    // List item stagger
    listStagger: (elements, options = {}) => {
        const { stagger = 0.08, duration = 0.5, delay = 0 } = options;

        gsap.fromTo(
            elements,
            {
                opacity: 0,
                x: -20
            },
            {
                opacity: 1,
                x: 0,
                duration,
                delay,
                stagger,
                ease: 'power2.out'
            }
        );
    },

    // Number counter animation
    countUp: (element, endValue, options = {}) => {
        const { duration = 1.5, decimals = 0 } = options;
        const obj = { value: 0 };

        gsap.to(obj, {
            value: endValue,
            duration,
            ease: 'power1.out',
            onUpdate: () => {
                element.textContent = obj.value.toFixed(decimals);
            }
        });
    },

    // Shimmer loading effect
    shimmer: (element) => {
        gsap.to(element, {
            backgroundPosition: '200% center',
            duration: 1.5,
            repeat: -1,
            ease: 'none'
        });
    },

    // Button click feedback
    buttonClick: (element) => {
        gsap.to(element, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
    },

    // Notification slide in
    notificationSlide: (element) => {
        gsap.fromTo(
            element,
            {
                x: 400,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power3.out'
            }
        );
    },

    // Table row reveal
    tableRowReveal: (rows, options = {}) => {
        const { stagger = 0.05, duration = 0.4 } = options;

        gsap.fromTo(
            rows,
            {
                opacity: 0,
                x: -10
            },
            {
                opacity: 1,
                x: 0,
                duration,
                stagger,
                ease: 'power2.out'
            }
        );
    }
};

// Utility to clean up all GSAP animations
export const cleanupAnimations = () => {
    gsap.killTweensOf('*');
};

export default pageAnimations;
