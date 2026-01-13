// landing.js - Interaksi untuk landing page DonationHub
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling untuk navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // Update active nav link saat scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Animasi untuk blockchain nodes
    const blockchainNodes = document.querySelectorAll('.blockchain-node');
    blockchainNodes.forEach((node, index) => {
        node.style.animationDelay = `${index * 0.2}s`;
        
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'scale(1.1)';
            node.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.4)';
        });
        
        node.addEventListener('mouseleave', () => {
            node.style.transform = 'scale(1)';
            node.style.boxShadow = 'var(--shadow-glow)';
        });
    });

    // Counter animation untuk stats
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const targetValue = stat.textContent;
                
                if (targetValue === '∞') {
                    stat.style.opacity = '1';
                    return;
                }
                
                let current = 0;
                const target = parseInt(targetValue);
                const increment = target / 50;
                const duration = 1500;
                const stepTime = duration / 50;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current) + '%';
                }, stepTime);
                
                stat.style.opacity = '1';
                observer.unobserve(stat);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        stat.style.opacity = '0';
        observer.observe(stat);
    });

    // Tambahkan efek hover untuk fitur cards
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('mouseenter', () => {
            const icon = feature.querySelector('.feature-icon');
            icon.style.transform = 'rotate(15deg) scale(1.1)';
        });
        
        feature.addEventListener('mouseleave', () => {
            const icon = feature.querySelector('.feature-icon');
            icon.style.transform = 'rotate(0deg) scale(1)';
        });
    });

    // Animasi untuk workflow steps
    const workflowSteps = document.querySelectorAll('.workflow-step');
    workflowSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = 'all 0.5s ease';
        step.style.transitionDelay = `${index * 0.1}s`;
        
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                    stepObserver.unobserve(step);
                }
            });
        }, { threshold: 0.2 });
        
        stepObserver.observe(step);
    });

    // Animasi untuk landing title
    const landingTitle = document.querySelector('.landing-title');
    if (landingTitle) {
        landingTitle.style.opacity = '0';
        landingTitle.style.transform = 'translateY(20px)';
        landingTitle.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            landingTitle.style.opacity = '1';
            landingTitle.style.transform = 'translateY(0)';
        }, 300);
    }

    // Animasi untuk landing description
    const landingDescription = document.querySelector('.landing-description');
    if (landingDescription) {
        landingDescription.style.opacity = '0';
        landingDescription.style.transform = 'translateY(20px)';
        landingDescription.style.transition = 'all 0.8s ease 0.3s';
        
        setTimeout(() => {
            landingDescription.style.opacity = '1';
            landingDescription.style.transform = 'translateY(0)';
        }, 600);
    }

    // Animasi untuk landing features
    const landingFeatures = document.querySelectorAll('.feature');
    landingFeatures.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        feature.style.transition = 'all 0.5s ease';
        feature.style.transitionDelay = `${0.5 + (index * 0.1)}s`;
        
        setTimeout(() => {
            feature.style.opacity = '1';
            feature.style.transform = 'translateY(0)';
        }, 800 + (index * 100));
    });

    // Animasi untuk CTA buttons
    const ctaButtons = document.querySelectorAll('.landing-cta .btn');
    ctaButtons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        btn.style.transition = 'all 0.5s ease';
        btn.style.transitionDelay = `${0.8 + (index * 0.1)}s`;
        
        setTimeout(() => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 1100 + (index * 100));
    });

    // Efek parallax untuk background particles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        document.querySelectorAll('.crypto-particle').forEach((particle, index) => {
            const speed = 0.3 + (index * 0.1);
            particle.style.transform = `translate3d(0px, ${rate * speed}px, 0px)`;
        });
    });
    
    // Update text untuk workflow step 2
    const workflowStep2 = document.querySelector('.workflow-step:nth-child(2) h3');
    if (workflowStep2) {
        workflowStep2.textContent = "Pilih Campaign";
    }
    
    const workflowStep2Desc = document.querySelector('.workflow-step:nth-child(2) p');
    if (workflowStep2Desc) {
        workflowStep2Desc.textContent = "Pilih campaign yang ingin Anda dukung dari daftar yang tersedia";
    }
});
