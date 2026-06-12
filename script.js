document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Opening Screen & Typewriter Logic ---
    const openingScreen = document.getElementById("opening-screen");
    const typeWriterEl = document.getElementById("typewriter-text");

    if (openingScreen) {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get("hero") === "skip") {
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

    // --- 2. Home Screen (Grid Logic & Scroll Reveal) ---
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

            // --- NEU: Dynamische Suche auch für das Cover! ---
            const extensionsToTry = ['.jpg', '.JPG', '.jpeg', '.png', '.PNG', '.mp4', '.MP4', '.mov', '.MOV'];
            
            function autoLoadCover(extIndex) {
                if (extIndex >= extensionsToTry.length) return; // Stoppt, wenn kein Cover gefunden wurde

                const folderPath = `images/projekt${parseInt(project.id)}/`;
                const ext = extensionsToTry[extIndex];
                const mediaUrl = `${folderPath}cover${ext}`;
                const isVideo = ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.mov';
                
                if (isVideo) {
                    const testVid = document.createElement("video");
                    
                    testVid.onloadeddata = function() {
                        testVid.muted = true; 
                        testVid.loop = true;
                        testVid.playsInline = true;
                        
                        projectLink.addEventListener('mouseenter', () => testVid.play());
                        projectLink.addEventListener('mouseleave', () => testVid.pause());
                        
                        imgWrapper.appendChild(testVid);
                    };
                    
                    testVid.onerror = function() {
                        autoLoadCover(extIndex + 1);
                    };
                    
                    testVid.src = mediaUrl;
                    testVid.load(); 
                } else {
                    const testImg = new Image();
                    
                    testImg.onload = function() {
                        testImg.loading = "lazy";
                        imgWrapper.appendChild(testImg);
                    };
                    
                    testImg.onerror = function() {
                        autoLoadCover(extIndex + 1);
                    };
                    
                    testImg.src = mediaUrl;
                }
            }

            autoLoadCover(0); // Starte die Cover-Suche
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, {
            threshold: 0.1, 
            rootMargin: "0px 0px -50px 0px" 
        });

        document.querySelectorAll('.project-item').forEach(item => {
            revealObserver.observe(item);
        });
    }

    // --- 3. Project Detail Page Logic (JPG, PNG, MP4, MOV BILDERSUCHE) ---
    const titleEl = document.getElementById("project-title");
    const descEl = document.getElementById("project-desc");
    const sliderEl = document.getElementById("project-slider");

    if (titleEl && descEl && sliderEl && typeof projects !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("id");
        const currentProject = projects.find(p => p.id === projectId);

        if (currentProject) {
            titleEl.innerText = currentProject.name;
            descEl.innerText = currentProject.description;
            document.title = `${currentProject.name} — work by anna kreil`;

            let imgIndex = 1;
            let loadedMedia = []; 
            const extensionsToTry = ['.jpg', '.JPG', '.jpeg', '.png', '.PNG', '.mp4', '.MP4', '.mov', '.MOV'];

            function addMediaToDOM(url, type) {
                let mediaEl;
                if (type === 'image') {
                    mediaEl = document.createElement("img");
                } else {
                    mediaEl = document.createElement("video");
                    mediaEl.muted = true; 
                    mediaEl.loop = true;
                    mediaEl.playsInline = true;
                    
                    mediaEl.addEventListener('mouseenter', () => mediaEl.play());
                    mediaEl.addEventListener('mouseleave', () => mediaEl.pause());
                }
                
                mediaEl.src = url;
                mediaEl.dataset.index = imgIndex - 1; 
                sliderEl.appendChild(mediaEl);
                
                loadedMedia.push({ src: url, type: type }); 
                
                imgIndex++;
                autoLoadMedia(0); 
            }

            function autoLoadMedia(extIndex) {
                if (extIndex >= extensionsToTry.length) {
                    if (loadedMedia.length > 0) {
                        initLightbox(loadedMedia);
                    } else {
                        sliderEl.innerHTML = "<p>keine medien für dieses projekt gefunden.</p>";
                    }
                    return;
                }

                const folderPath = `images/projekt${parseInt(currentProject.id)}/`;
                const ext = extensionsToTry[extIndex];
                const mediaUrl = `${folderPath}${imgIndex}${ext}`;
                const isVideo = ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.mov';
                
                if (isVideo) {
                    const testVid = document.createElement("video");
                    
                    testVid.onloadeddata = function() {
                        addMediaToDOM(mediaUrl, 'video');
                    };
                    
                    testVid.onerror = function() {
                        autoLoadMedia(extIndex + 1);
                    };
                    
                    testVid.src = mediaUrl;
                    testVid.load(); 
                } else {
                    const testImg = new Image();
                    
                    testImg.onload = function() {
                        addMediaToDOM(mediaUrl, 'image');
                    };
                    
                    testImg.onerror = function() {
                        autoLoadMedia(extIndex + 1);
                    };
                    
                    testImg.src = mediaUrl;
                }
            }

            autoLoadMedia(0);

        } else {
            titleEl.innerText = "project not found";
            descEl.innerText = "please return to the home page.";
        }
    }

    // --- 4. Lightbox Logic (Mit Video & Sound) ---
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

            if (currentMedia.type === 'image') {
                lightboxImg.src = currentMedia.src;
                lightboxImg.style.display = "block";
            } else {
                lightboxVid.src = currentMedia.src;
                lightboxVid.style.display = "block";
                
                lightboxVid.muted = false; 
                lightboxVid.volume = 0.8; 
                
                lightboxVid.play().catch(e => {
                    console.log("Browser blockiert Autoplay. Nutzer muss manuell starten.");
                });
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