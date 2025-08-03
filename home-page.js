document.querySelectorAll(".swiper").forEach((swiperEl) => {
  const slides = swiperEl.querySelectorAll(".swiper-slide").length;
  const enableLoop = slides >= 6;

  // Dodaj klasu ako ima manje od 4 slajda
  const wrapper = swiperEl.querySelector(".swiper-wrapper");
  if (slides < 4) {
    wrapper.classList.add("centered-wrapper");
  }

  // Inicijalizuj Swiper
  new Swiper(swiperEl, {
    direction: "horizontal",
    loop: enableLoop,
    spaceBetween: 15,

    navigation: {
      nextEl: swiperEl.querySelector(".swiper-button-next"),
      prevEl: swiperEl.querySelector(".swiper-button-prev"),
    },

    breakpoints: {
      1920: { slidesPerView: 6, spaceBetween: 20 },
      1440: { slidesPerView: 5, spaceBetween: 10 },
      1024: { slidesPerView: 4 },
      768: { slidesPerView: 3 },
      525: { slidesPerView: 3 },
      505: { slidesPerView: 2 },
      480: { slidesPerView: 2 },
      360: { slidesPerView: 2 },
    },
  });
});

document.querySelectorAll(".slider").forEach((slider, index) => {
  const slides = slider.querySelectorAll(".slide");
  const dotContainer = slider.nextElementSibling;
  let maxSlide = slides.length;
  let curSlide = 0;

  const createDots = function () {
    dotContainer.innerHTML = "";

    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const firstSlideClone = slides[0].cloneNode(true);
  firstSlideClone.classList.add("clone");
  slider.appendChild(firstSlideClone);

  const allSlides = slider.querySelectorAll(".slide");

  const activateDot = function (slide) {
    dotContainer.querySelectorAll(".dots__dot").forEach((dot) => {
      dot.classList.remove("dots__dot--active");
    });

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
      slideEl.style.transform = `translateX(${120 * (i - slide)}%)`;
    });
  };

  // Next slide
  const nextSlide = function () {
    curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);

    if (curSlide === maxSlide) {
      setTimeout(() => {
        curSlide = 0;
        goToSlide(curSlide, true);
      }, 1000);
    }
  };

  // Prev slide

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  dotContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("dots__dot")) {
      const { slide } = e.target.dataset;
      curSlide = parseInt(slide);
      goToSlide(curSlide);
      activateDot(curSlide);
    }
  });

  let playSlider;
  const startAutoPlay = () => {
    playSlider = setInterval(nextSlide, 8000);
  };

  // Inicijalizacija
  init();

  // Otkomentiraj za auto play
  // startAutoPlay();
});

let slidersImgContainer = document.querySelectorAll(".slider .slide");
let imageTimeouts = []; // DODATO: Niz za čuvanje timeout ID-jeva

const slidersImgContainerCallback = (entries) => {
  entries.forEach((entry, index) => {
    let target = entry.target;
    let sliderImgs = target.querySelectorAll(".section-img-dog");
    if (target.classList.contains("clone"))
      sliderImgs.forEach((img) => {
        img.classList.add("show-slide-img");
      });
    if (entry.isIntersecting) {
      sliderImgs.forEach((img, i) => {
        // ISPRAVKA: setTimeout umesto setInterval
        const timeoutId = setTimeout(function () {
          img.classList.add("show-slide-img");
        }, 150 * i);
        imageTimeouts.push(timeoutId); // Sačuvaj timeout ID
      });
    }
  });
};

const optionsSlider = {
  root: null,
  rootMargin: "0px",
  threshold: 0.9,
};

const observerSlider = new IntersectionObserver(
  slidersImgContainerCallback,
  optionsSlider
);

window.addEventListener("load", () => {
  setTimeout(() => {
    slidersImgContainer.forEach((slider) => {
      observerSlider.observe(slider);
    });
  }, 500);
  if (slidersImgContainer[1]) {
    slidersImgContainer[1].style.opacity = "0";

    // ISPRAVKA: setTimeout umesto setInterval
    setTimeout(function () {
      slidersImgContainer[1].style.opacity = "1";
    }, 1100);
  }
});

// Main function
const openMenuBtn = document.querySelector(".open-menu");
const closeMenuBtn = document.querySelector(".close-menu");
const fixedNavigation = document.querySelector(".fixed-nav");
let headerMainContainer = document.querySelector("header");
let returnBtn = document.querySelector(".return-btn");
let headerTextContainer = document.querySelector(".header-text-container");
let searchBarElement = document.querySelector(".header-input");
let lastScrollTop = 0; // Inicijalizuj sa 0 umesto window.scrollY
let scrollListenerAdded = false;
let isFixed = false;
let isClicked = false;
// Ukloni ticking varijablu jer je zamenjena throttling-om

// Kreiranje placeholder elementa da sprečimo "skok" sadržaja
let placeholder = document.createElement("div");
placeholder.style.display = "none";
placeholder.classList.add("header-placeholder");

// POBOLJŠANA SCROLL FUNKCIJA ZA MOBILNE UREĐAJE
let activeHeight = function () {
  if (scrollListenerAdded) return;
  scrollListenerAdded = true;

  let previousScrollTop = 0;

  const handleScroll = () => {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > previousScrollTop && currentScrollTop > 100) {
      // Scrolling down
      searchBarElement?.classList.remove("active-heigth");
    } else if (currentScrollTop < previousScrollTop) {
      // Scrolling up
      searchBarElement?.classList.add("active-heigth");
    }

    previousScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  };

  // Samo jedan event listener
  window.addEventListener("scroll", handleScroll, { passive: true });
};

// POBOLJŠAN INTERSECTION OBSERVER
const headerTextElementCallback = (entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting && !isFixed) {
      // Dodaj placeholder pre nego što element postane fixed
      const rect = searchBarElement.getBoundingClientRect();
      placeholder.style.height = rect.height + "px";
      placeholder.style.display = "block";
      searchBarElement.parentNode.insertBefore(placeholder, searchBarElement);

      // Dodaj fixed klasu sa malim delay-om za smooth prelazak
      requestAnimationFrame(() => {
        searchBarElement.classList.add("header-input-active");
        isFixed = true;
      });
      returnBtn.classList.add("btn-show");

      // Pokreni scroll listener
      setTimeout(() => {
        activeHeight();
      }, 100);
    } else if (entry.isIntersecting && isFixed) {
      // Reset flag-a kada se vrati na vrh
      isClicked = false;

      // Ukloni fixed poziciju i placeholder
      returnBtn.classList.remove("btn-show");
      searchBarElement.classList.remove("header-input-active");
      searchBarElement.classList.remove("active-heigth");
      placeholder.style.display = "none";
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      isFixed = false;
    }
  });
};

// Povećaj root margin za bolje ponašanje na mobilnim uređajima
const options = {
  root: null,
  rootMargin: "10px 0px -10px 0px", // Poboljšano za mobilne
  threshold: [0, 0.1, 0.5, 1], // Više threshold vrednosti
};

const observer = new IntersectionObserver(headerTextElementCallback, options);

// Proveri da li element postoji pre observing-a
if (headerTextContainer) {
  observer.observe(headerTextContainer);
}

// POBOLJŠAN RETURN BUTTON
if (returnBtn) {
  returnBtn.addEventListener("click", function (e) {
    e.preventDefault();
    isClicked = true;

    // Za mobilne uređaje koristi različite opcije
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Za mobilne - koristi window.scrollTo
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } else {
      // Za desktop - koristi scrollIntoView
      headerMainContainer.scrollIntoView({ behavior: "smooth" });
    }

    searchBarElement.classList.remove("active-heigth");

    // Reset isClicked nakon scroll-a
    setTimeout(() => {
      isClicked = false;
    }, 1000);
  });
}

let navigationMainLinksItems = document.querySelectorAll(
  ".navigation-main-link .navigation-main-link-item"
);

let navigationContainerLinks = document.querySelectorAll(
  ".navigation-container a"
);
let navigationMainLink = document.querySelectorAll(".navigation-main-link");

const listener = function (e) {
  e.preventDefault();
  setTimeout(() => {
    allowLinks();
  }, 600);
};

function addListeners() {
  navigationContainerLinks.forEach((link) => {
    link.addEventListener("click", listener);
  });
}

function allowLinks() {
  navigationContainerLinks.forEach(function (item) {
    item.removeEventListener("click", listener);
  });
}

addListeners();

// DODATO: Niz za čuvanje timeout ID-jeva za meni animacije
let menuTimeouts = [];

if (openMenuBtn) {
  openMenuBtn.addEventListener("click", function (e) {
    if (fixedNavigation) {
      fixedNavigation.classList.add("show-menu");
    }

    navigationMainLinksItems.forEach((link) => {
      link.removeAttribute("href");
    });

    navigationMainLink.forEach((link, i) => {
      const timeoutId = setTimeout(
        function () {
          link.classList.add("show-navigation-main-link");
        },
        1000 + 150 * i
      ); // 1000ms + staggered delay
      menuTimeouts.push(timeoutId);
    });

    addListeners();
  });
}

if (closeMenuBtn) {
  closeMenuBtn.addEventListener("click", function (e) {
    if (fixedNavigation) {
      fixedNavigation.classList.remove("show-menu");
    }

    // ISPRAVKA: Obriši sve timeout-ove koji možda još uvek čekaju
    menuTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    menuTimeouts = []; // Resetuj niz

    navigationMainLink.forEach((link, i) => {
      link.classList.remove("show-navigation-main-link");
    });

    // DODATO: Resetuj strelicu kada se zatvori meni
    let returnArrow = document.querySelector(".fa-arrow-left");
    if (returnArrow) {
      returnArrow.style.opacity = "0";
    }
    linkOpen = false;
  });
}

let returnArrow = document.querySelector(".fa-arrow-left");
let linkOpen = false;

if (fixedNavigation) {
  fixedNavigation.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("navigation-main-link-item") ||
      e.target.classList.contains("navigation-list")
    ) {
      // ISPRAVKA: Samo prikaži strelicu, ne toggle-uj
      if (returnArrow) {
        returnArrow.style.opacity = "1";
      }
      linkOpen = true;
    } else if (e.target.classList.contains("fa-arrow-left")) {
      // DODATO: Ako se klikne na strelicu, sakrij je
      if (returnArrow) {
        returnArrow.style.opacity = "0";
      }
      linkOpen = false;
    }
  });
}
