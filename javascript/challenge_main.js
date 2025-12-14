 const cards = document.querySelectorAll('.card');
  cards.forEach((card,i) => setTimeout(() => card.classList.add('animate'), i*150));

  const mainSlides = document.getElementById('mainSlides');
  const swiper = new Swiper('.swiper', {
    slidesPerView: 3,
    spaceBetween: 24,
    centeredSlides: true,
    loop: true,
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      0: { slidesPerView:1 },
      600: { slidesPerView:2 },
      900: { slidesPerView:3 }
    }
  });

  function updateBackground() {
    const activeSlide = document.querySelector('.swiper-slide-active');
    if(!activeSlide) return;
    const bg = getComputedStyle(activeSlide).backgroundImage;
    mainSlides.style.backgroundImage = bg;
  }

  updateBackground();

  swiper.on('slideChangeTransitionStart', updateBackground);
  swiper.on('slideNextTransitionStart', updateBackground);
  swiper.on('slidePrevTransitionStart', updateBackground);