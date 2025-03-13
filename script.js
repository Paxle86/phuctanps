document.addEventListener('DOMContentLoaded', function() {
    // Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }

    // Slider Functionality
    initSlider();

    // Load News Dynamically
    loadNewsContent();

    // Initialize Form Validation
    initFormValidation();

    // Initialize Newsletter Form
    initNewsletterForm();

    // Initialize FAQ Accordion
    initAccordion();
});

// Slider Functionality
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    let slideInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        slides.forEach(slide => slide.classList.remove('active'));
        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        }

        slides[currentIndex].classList.add('active');
    }

    function startSlideshow() {
        slideInterval = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    if (slides.length > 0) {
        // Initialize slider
        showSlide(currentIndex);
        startSlideshow();

        // Event listeners for slider controls
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopSlideshow();
                showSlide(currentIndex - 1);
                startSlideshow();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopSlideshow();
                showSlide(currentIndex + 1);
                startSlideshow();
            });
        }

        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    stopSlideshow();
                    showSlide(index);
                    startSlideshow();
                });
            });
        }

        // Pause slideshow on hover
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopSlideshow);
            sliderContainer.addEventListener('mouseleave', startSlideshow);
        }
    }
}

// Load News Content Dynamically
function loadNewsContent() {
    // Fetch news data from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Process news data for homepage
            const newsContainer = document.getElementById('news-container');
            if (newsContainer) {
                // Show only first 3 news items on homepage
                const newsItems = data.news.slice(0, 3);
                renderNews(newsItems, newsContainer);
            }
            
            // Process news data for news page
            const newsGrid = document.getElementById('news-grid');
            if (newsGrid) {
                renderNews(data.news, newsGrid);
                initNewsFilters(data.news);
                initPagination(data.news);
            }
        })
        .catch(error => console.error('Error loading news data:', error));
}

// Render News Items
function renderNews(newsItems, container) {
    container.innerHTML = '';
    
    newsItems.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.setAttribute('data-category', news.category);
        
        newsItem.innerHTML = `
            <div class="news-image">
                <img src="${news.image}" alt="${news.title}">
            </div>
            <div class="news-content">
                <div class="news-date">${news.date}</div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <a href="news-detail.html?id=${news.id}" class="btn-link">Đọc tiếp</a>
            </div>
        `;
        
        container.appendChild(newsItem);
    });
}

// Initialize News Filters
function initNewsFilters(newsData) {
    const categorySelect = document.getElementById('category');
    const yearSelect = document.getElementById('year');
    const searchInput = document.getElementById('news-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (!(categorySelect && yearSelect && searchInput && searchBtn)) return;
    
    function filterNews() {
        const category = categorySelect.value;
        const year = yearSelect.value;
        const searchText = searchInput.value.toLowerCase();
        
        const newsItems = document.querySelectorAll('.news-item');
        
        newsItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const itemTitle = item.querySelector('.news-title').textContent.toLowerCase();
            const itemContent = item.querySelector('.news-excerpt').textContent.toLowerCase();
            const itemDate = item.querySelector('.news-date').textContent;
            const itemYear = itemDate.split('/')[2];
            
            let showItem = true;
            
            if (category !== 'all' && itemCategory !== category) {
                showItem = false;
            }
            
            if (year !== 'all' && itemYear !== year) {
                showItem = false;
            }
            
            if (searchText && !itemTitle.includes(searchText) && !itemContent.includes(searchText)) {
                showItem = false;
            }
            
            item.style.display = showItem ? 'block' : 'none';
        });
        
        updatePagination();
    }
    
    categorySelect.addEventListener('change', filterNews);
    yearSelect.addEventListener('change', filterNews);
    searchBtn.addEventListener('click', filterNews);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterNews();
        }
    });
}

// Initialize Pagination
function initPagination(newsData) {
    const pageNumbers = document.getElementById('page-numbers');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const newsGrid = document.getElementById('news-grid');
    
    if (!(pageNumbers && prevPageBtn && nextPageBtn && newsGrid)) return;
    
    const itemsPerPage = 6;
    let currentPage = 1;
    
    function updatePagination() {
        const visibleItems = Array.from(newsGrid.querySelectorAll('.news-item')).filter(item => item.style.display !== 'none');
        const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
        
        // Update page numbers
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.className = 'page-number' + (i === currentPage ? ' active' : '');
            pageNumber.textContent = i;
            
            pageNumber.addEventListener('click', () => {
                currentPage = i;
                showPage();
            });
            
            pageNumbers.appendChild(pageNumber);
        }
        
        // Update pagination buttons
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Show current page
        visibleItems.forEach((item, index) => {
            const showOnThisPage = Math.ceil((index + 1) / itemsPerPage) === currentPage;
            item.style.display = showOnThisPage ? 'block' : 'none';
        });
    }
    
    function showPage() {
        updatePagination();
    }
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            showPage();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const visibleItems = Array.from(newsGrid.querySelectorAll('.news-item')).filter(item => item.style.display !== 'none');
        const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            showPage();
        }
    });
    
    // Initialize pagination
    updatePagination();
}

// Form Validation
function initFormValidation() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        
        // Name validation
        const nameInput = document.getElementById('name');
        const nameError = document.getElementById('name-error');
        
        if (nameInput && nameError) {
            if (!nameInput.value.trim()) {
                isValid = false;
                nameError.textContent = 'Vui lòng nhập họ và tên';
                nameError.style.display = 'block';
            } else {
                nameError.style.display = 'none';
            }
        }
        
        // Email validation
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        
        if (emailInput && emailError) {
            if (!emailInput.value.trim()) {
                isValid = false;
                emailError.textContent = 'Vui lòng nhập email';
                emailError.style.display = 'block';
            } else if (!emailPattern.test(emailInput.value)) {
                isValid = false;
                emailError.textContent = 'Email không hợp lệ';
                emailError.style.display = 'block';
            } else {
                emailError.style.display = 'none';
            }
        }
        
        // Phone validation
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const phonePattern = /^[0-9]{10,11}$/;
        
        if (phoneInput && phoneError) {
            if (!phoneInput.value.trim()) {
                isValid = false;
                phoneError.textContent = 'Vui lòng nhập số điện thoại';
                phoneError.style.display = 'block';
            } else if (!phonePattern.test(phoneInput.value.replace(/\s/g, ''))) {
                isValid = false;
                phoneError.textContent = 'Số điện thoại không hợp lệ';
                phoneError.style.display = 'block';
            } else {
                phoneError.style.display = 'none';
            }
        }
        
        // Subject validation
        const subjectInput = document.getElementById('subject');
        const subjectError = document.getElementById('subject-error');
        
        if (subjectInput && subjectError) {
            if (!subjectInput.value) {
                isValid = false;
                subjectError.textContent = 'Vui lòng chọn chủ đề';
                subjectError.style.display = 'block';
            } else {
                subjectError.style.display = 'none';
            }
        }
        
        // Message validation
        const messageInput = document.getElementById('message');
        const messageError = document.getElementById('message-error');
        
        if (messageInput && messageError) {
            if (!messageInput.value.trim()) {
                isValid = false;
                messageError.textContent = 'Vui lòng nhập nội dung';
                messageError.style.display = 'block';
            } else if (messageInput.value.trim().length < 10) {
                isValid = false;
                messageError.textContent = 'Nội dung quá ngắn, vui lòng nhập ít nhất 10 ký tự';
                messageError.style.display = 'block';
            } else {
                messageError.style.display = 'none';
            }
        }
        
        // Agreement validation
        const agreementInput = document.getElementById('agreement');
        const agreementError = document.getElementById('agreement-error');
        
        if (agreementInput && agreementError) {
            if (!agreementInput.checked) {
                isValid = false;
                agreementError.textContent = 'Vui lòng đồng ý với điều khoản';
                agreementError.style.display = 'block';
            } else {
                agreementError.style.display = 'none';
            }
        }
        
        // If form is valid, submit
        if (isValid) {
            // Here you would typically send the data to your server
            // For demo purposes, we'll just show an alert
            alert('Cảm ơn bạn đã gửi thông tin liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
            contactForm.reset();
        }
    });
}

// Newsletter Form
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSubscribe = document.getElementById('newsletter-subscribe');
    
    function handleNewsletterSubmit(event) {
        event.preventDefault();
        const emailInput = event.target.querySelector('input[type="email"]');
        
        if (emailInput && emailInput.value.trim()) {
            // Here you would typically send the data to your server
            // For demo purposes, we'll just show an alert
            alert('Cảm ơn bạn đã đăng ký nhận bản tin!');
            event.target.reset();
        } else {
            alert('Vui lòng nhập địa chỉ email hợp lệ');
        }
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    if (newsletterSubscribe) {
        newsletterSubscribe.addEventListener('submit', handleNewsletterSubmit);
    }
}

// FAQ Accordion
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        if (header) {
            header.addEventListener('click', () => {
                item.classList.toggle('active');
                
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            });
        }
    });
}

// Load News Detail Page
function loadNewsDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    if (!newsId) return;
    
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const newsItem = data.news.find(item => item.id == newsId);
            
            if (newsItem) {
                const newsDetail = document.getElementById('news-detail');
                if (newsDetail) {
                    newsDetail.innerHTML = `
                        <div class="news-detail-header">
                            <h2>${newsItem.title}</h2>
                            <div class="news-meta">
                                <span class="news-date"><i class="far fa-calendar-alt"></i> ${newsItem.date}</span>
                                <span class="news-author"><i class="far fa-user"></i> ${newsItem.author}</span>
                                <span class="news-category"><i class="far fa-folder"></i> ${newsItem.category}</span>
                            </div>
                        </div>
                        <div class="news-detail-image">
                            <img src="${newsItem.image}" alt="${newsItem.title}">
                        </div>
                        <div class="news-detail-content">
                            ${newsItem.content.replace(/\n/g, '<br>')}
                        </div>
                    `;
                }
            } else {
                const newsDetail = document.getElementById('news-detail');
                if (newsDetail) {
                    newsDetail.innerHTML = '<div class="error-message">Không tìm thấy bài viết!</div>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading news data:', error);
            const newsDetail = document.getElementById('news-detail');
            if (newsDetail) {
                newsDetail.innerHTML = '<div class="error-message">Có lỗi xảy ra khi tải dữ liệu!</div>';
            }
        });
}

// Execute loadNewsDetail on news detail page
if (window.location.pathname.includes('news-detail.html')) {
    document.addEventListener('DOMContentLoaded', loadNewsDetail);
}
