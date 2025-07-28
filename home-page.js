document.querySelectorAll(".swiper").forEach((swiperEl) => {
  const slides = swiperEl.querySelectorAll(".swiper-slide").length;

  const enableLoop = slides > 5;

  new Swiper(swiperEl, {
    direction: "horizontal",
    loop: enableLoop,
    spaceBetween: 10,

    navigation: {
      nextEl: swiperEl.querySelector(".swiper-button-next"),
      prevEl: swiperEl.querySelector(".swiper-button-prev"),
    },

    breakpoints: {
      1920: { slidesPerView: 5 },
      1024: { slidesPerView: 4 },
      768: { slidesPerView: 2 },
      480: { slidesPerView: 1 },
    },
  });
});
document.querySelectorAll(".slider").forEach((slider, index) => {
  // Pronađi sve elemente unutar trenutnog slidera
  const slides = slider.querySelectorAll(".slide");
  const dotContainer = slider.nextElementSibling; // Pretpostavka da je dots container odmah posle slidera
  let maxSlide = slides.length;
  let curSlide = 0;

  // Kreiranje tačkica
  const createDots = function () {
    dotContainer.innerHTML = ""; // Očisti postojeće tačkice

    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  // Dodaj klon prvog slajda na kraj za beskonačni efekat
  const firstSlideClone = slides[0].cloneNode(true);
  firstSlideClone.classList.add("clone");
  slider.appendChild(firstSlideClone);

  // Sada imamo sve slide-ove uključujući klon
  const allSlides = slider.querySelectorAll(".slide");

  const activateDot = function (slide) {
    dotContainer.querySelectorAll(".dots__dot").forEach((dot) => {
      dot.classList.remove("dots__dot--active");
    });

    // Normalizuj slide index za dots (klon treba da aktivira prvi dot)
    const dotIndex = slide >= maxSlide ? 0 : slide;
    const activeDot = dotContainer.querySelector(
      `.dots__dot[data-slide="${dotIndex}"]`
    );
    if (activeDot) {
      activeDot.classList.add("dots__dot--active");
    }
  };

  const goToSlide = function (slide, skipTransition = false) {
    allSlides.forEach((slideEl, i) => {
      if (skipTransition) {
        slideEl.style.transition = "none";
      } else {
        slideEl.style.transition = "transform 1s ease-out";
      }
      slideEl.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
  };

  // Next slide
  const nextSlide = function () {
    curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);

    // Kad dođemo do klona (poslednji slide + 1), resetuj na prvi bez animacije
    if (curSlide === maxSlide) {
      setTimeout(() => {
        curSlide = 0;
        goToSlide(curSlide, true); // bez tranzicije
      }, 1000); // čekaj da se završi animacija (1s)
    }
  };

  // Prev slide
  const prevSlide = function () {
    if (curSlide === 0) {
      // Idi na klon bez animacije
      curSlide = maxSlide;
      goToSlide(curSlide, true);

      // Zatim animiraj na poslednji pravi slide
      setTimeout(() => {
        curSlide = maxSlide - 1;
        goToSlide(curSlide);
        activateDot(curSlide);
      }, 10);
    } else {
      curSlide--;
      goToSlide(curSlide);
      activateDot(curSlide);
    }
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  // Event listeneri

  dotContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("dots__dot")) {
      const { slide } = e.target.dataset;
      curSlide = parseInt(slide);
      goToSlide(curSlide);
      activateDot(curSlide);
    }
  });

  // Auto play (opcionalno)
  let playSlider;
  const startAutoPlay = () => {
    playSlider = setInterval(nextSlide, 8000);
  };

  // Inicijalizacija
  init();

  // Otkomentiraj za auto play
  startAutoPlay();
});
