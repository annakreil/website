document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. Password Protection ---
    const pwScreen = document.getElementById("password-screen");
    const pwInput = document.getElementById("pw-input");
    const pwSubmit = document.getElementById("pw-submit");
    const pwError = document.getElementById("pw-error");

    const secretPassword = "anna"; 

    if (sessionStorage.getItem("siteUnlocked") === "true") {
        if(pwScreen) pwScreen.style.display = "none";
    } else {
        if(pwSubmit) {
            pwSubmit.addEventListener("click", checkPassword);
            pwInput.addEventListener("keypress", (e) => {
                if(e.key === "Enter") checkPassword();
            });
        }
    }

    function checkPassword() {
        if (pwInput.value === secretPassword) {
            sessionStorage.setItem("siteUnlocked", "true");
            if(pwScreen) pwScreen.style.display = "none";
        } else {
            pwError.style.opacity = "1";
            setTimeout(() => pwError.style.opacity = "0", 2000);
        }
    }

    // --- 1. Opening Screen & Typewriter Logic ---
    const openingScreen = document.getElementById("opening-screen");
    const typeWriterEl = document.getElementById("typewriter-text");

    if (openingScreen) {
        const urlParams = new URLSearchParams(window.location.search);
        
        const navEntries = performance.getEntriesByType("navigation");
        const isBackNavigation = navEntries.length > 0 && navEntries[0].type === "back_forward";
        
        if (urlParams.get("hero") === "skip" || isBackNavigation) {
            openingScreen.style.display = "none";
        } else if (typeWriterEl) {
            const textToType = "work by anna kreil";
            let i = 0;
            
            function typeWriter() {
                if (i < textToType.length) {
                    const char = textToType.charAt(i);
                    typeWriterEl.innerHTML += char;
                    i++;
                    setTimeout(typeWriter, 80); 
                } else {
                    setTimeout(() => {
                        openingScreen.classList.add("fade-out");
                        setTimeout(() => {
                            openingScreen.style.display = "none";
                        }, 800); 
                    }, 1200); 
                }
            }
            setTimeout(typeWriter, 100);
        }
    }

    // --- 2. Home Screen (Direct Load from Data) ---
    const projectGrid = document.getElementById("project-grid");
    if (projectGrid && typeof projects !== "undefined") {
        projects.forEach((project, index) => {
            const projectLink = document.createElement("a");
            projectLink.className = "project-item reveal"; 
            projectLink.href = `project.html?id=${project.id}`;
            projectLink.style.transitionDelay = `${(index % 3) * 0.15}s`;

            const imgWrapper = document.createElement("div");
            imgWrapper.className = "image-wrapper";

            const hoverTitle = document.createElement("div");
            hoverTitle.className = "hover-title";
            hoverTitle.innerText = project.name;

            projectLink.appendChild(imgWrapper);
            projectLink.appendChild(hoverTitle);
            projectGrid.appendChild(projectLink);

            // Cover direkt laden (kein Suchen mehr nötig!)
            const isVideo = project.cover.toLowerCase().endsWith('.mp4') || project.cover.toLowerCase().endsWith('.mov');
            
            if (isVideo) {
                const coverVid = document.createElement("video");
                coverVid.muted = true; 
                coverVid.loop = true;
                coverVid.playsInline = true;
                coverVid.autoplay = true; 
                coverVid.src = project.cover;
                coverVid.play().catch(e => console.log("Autoplay blockiert:", e));
                imgWrapper.appendChild(coverVid);
            } else {
                const coverImg = new Image();
                coverImg.loading = "lazy";
                coverImg.src = project.cover;
                imgWrapper.appendChild(coverImg);
            }

            // Hover Preload für das allererste Projekt-Bild
            let preloaded = false;
            projectLink.addEventListener('mouseenter', () => {
                if (preloaded || !project.media || project.media.length === 0) return;
                preloaded = true;
                const firstFile = project.media[0];
                const isFirstVideo = firstFile.toLowerCase().endsWith('.mp4') || firstFile.toLowerCase().endsWith('.mov');
                const link = document.createElement("link");
                link.rel = "preload";
                link.as = isFirstVideo ? "video" : "image";
                link.href = `images/projekt${parseInt(project.id)}/${firstFile}`;
                document.head.appendChild(link);
            });
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.project-item').forEach(item => {
            revealObserver.observe(item);
        });
    }

    // --- 3. Project Detail Page Logic (Instant Load from Data) ---
    const sliderEl = document.getElementById("project-slider");
    const projectInfoContainer = document.querySelector(".project-info");

    if (projectInfoContainer && sliderEl && typeof projects !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("id");
        const currentProject = projects.find(p => p.id === projectId);

        if (currentProject) {
            projectInfoContainer.innerHTML = `
                <h1>${currentProject.name}</h1>
                <div class="project-roles">${currentProject.roles}</div>
                <div class="project-text">${currentProject.text}</div>
                <div class="project-credits">${currentProject.credits}</div>
            `;
            
            document.title = `${currentProject.name} — work by anna kreil`;

            if (currentProject.media && currentProject.media.length > 0) {
                let loadedMedia = [];
                const folderPath = `images/projekt${parseInt(currentProject.id)}/`;

                currentProject.media.forEach((filename, index) => {
                    const url = `${folderPath}${filename}`;
                    const isVideo = filename.toLowerCase().endsWith('.mp4') || filename.toLowerCase().endsWith('.mov');
                    
                    let mediaEl;
                    if (!isVideo) {
                        mediaEl = document.createElement("img");
                        // Smart Lazy Loading: Erste 2 Bilder sofort, den Rest asynchron
                        mediaEl.loading = index < 2 ? "eager" : "lazy"; 
                    } else {
                        mediaEl = document.createElement("video");
                        mediaEl.muted = true; 
                        mediaEl.loop = true;
                        mediaEl.playsInline = true;
                        mediaEl.autoplay = true; 
                        mediaEl.preload = index < 2 ? "auto" : "metadata";
                        mediaEl.play().catch(e => console.log("Autoplay blockiert:", e));
                    }
                    
                    mediaEl.src = url;
                    mediaEl.dataset.index = index; 
                    sliderEl.appendChild(mediaEl);
                    loadedMedia.push({ src: url, type: isVideo ? 'video' : 'image' });
                });

                initLightbox(loadedMedia);
            } else {
                sliderEl.innerHTML = "<p>keine medien für dieses projekt gefunden.</p>";
            }

        } else {
            projectInfoContainer.innerHTML = `
                <h1>project not found</h1>
                <p>please return to the home page.</p>
            `;
        }
    }

    // --- 4. Lightbox Logic ---
    function initLightbox(mediaArray) {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        const lightboxImg = document.getElementById("lightbox-img");
        const lightboxVid = document.getElementById("lightbox-vid");
        const closeBtn = document.querySelector(".lightbox-close");
        const prevBtn = document.querySelector(".lightbox-prev");
        const nextBtn = document.querySelector(".lightbox-next");
        
        let currentIndex = 0;

        const sliderMediaEls = document.querySelectorAll(".slider img, .slider video");
        sliderMediaEls.forEach(media => {
            media.addEventListener("click", (e) => {
                currentIndex = parseInt(e.target.dataset.index);
                updateLightboxMedia();
                lightbox.style.display = "flex";
            });
        });

        function updateLightboxMedia() {
            const currentMedia = mediaArray[currentIndex];
            
            lightboxVid.pause();
            lightboxVid.style.display = "none";
            lightboxImg.style.display = "none";

            if (currentMedia.type === 'video') {
                lightboxVid.src = currentMedia.src;
                lightboxVid.style.display = "block";
                lightboxVid.muted = false; 
                lightboxVid.volume = 0.8; 
                lightboxVid.play().catch(e => console.log("Autoplay blockiert."));
            } else {
                lightboxImg.src = currentMedia.src;
                lightboxImg.style.display = "block";
            }
        }

        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % mediaArray.length;
            updateLightboxMedia();
        });

        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + mediaArray.length) % mediaArray.length;
            updateLightboxMedia();
        });

        closeBtn.addEventListener("click", () => {
            lightbox.style.display = "none";
            lightboxVid.pause(); 
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                lightboxVid.pause(); 
            }
        });
    }

    // --- 5. Mouse Wheel Horizontal Scroll Logic ---
    const sliderWrapper = document.getElementById("slider-wrapper");
    if (sliderWrapper) {
        sliderWrapper.addEventListener("wheel", (evt) => {
            evt.preventDefault(); 
            sliderWrapper.scrollLeft += evt.deltaY;
        }, { passive: false }); 
    }

    // --- 6. Contact Modal Pop-Up Logic ---
    const contactTriggers = document.querySelectorAll('.contact-trigger');
    const contactModal = document.getElementById('contact-modal');

    if (contactModal) {
        contactTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault(); 
                contactModal.classList.add('show');
            });
        });

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('show');
            }
        });
    }
});