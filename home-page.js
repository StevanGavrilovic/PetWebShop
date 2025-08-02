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

  const firstSlideClone = slides[0].cloneNode(true);
  firstSlideClone.classList.add("clone");
  slider.appendChild(firstSlideClone);

  // Sada imamo sve slide-ove uključujući klon
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
        setInterval(function () {
          img.classList.add("show-slide-img");
        }, 150 * i);
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
  slidersImgContainer[1].style.opacity = "0";

  setInterval(function () {
    slidersImgContainer[1].style.opacity = "1";
  }, 1100);
});

// Main function
const openMenuBtn = document.querySelector(".open-menu");
const closeMenuBtn = document.querySelector(".close-menu");
const fixedNavigation = document.querySelector(".fixed-nav");
let headerMainContainer = document.querySelector(".main-header-container");
let returnBtn = document.querySelector(".return-btn");
let headerTextContainer = document.querySelector(".header-text-container");
let searchBarElement = document.querySelector(".header-input");
let lastScrollTop = window.scrollY;
let scrollListenerAdded = false;
let isFixed = false;
let isClicked = false;

// Kreiranje placeholder elementa da sprečimo "skok" sadržaja
let placeholder = document.createElement("div");
placeholder.style.display = "none";
placeholder.classList.add("header-placeholder");

let activeHeight = function () {
  if (scrollListenerAdded) return;
  scrollListenerAdded = true;

  document.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (isClicked) return;

    if (currentScroll < lastScrollTop) {
      searchBarElement.classList.add("active-heigth");
    } else {
      searchBarElement.classList.remove("active-heigth");
    }
    lastScrollTop = currentScroll;
  });
};

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

const options = {
  root: null,
  rootMargin: "50px",
  threshold: 0,
};

const observer = new IntersectionObserver(headerTextElementCallback, options);
observer.observe(headerTextContainer);

returnBtn.addEventListener("click", function (e) {
  e.preventDefault();
  isClicked = true;

  headerMainContainer.scrollIntoView({ behavior: "smooth" });
  searchBarElement.classList.remove("active-heigth");
});
let navigationMainLinks = document.querySelectorAll(
  ".navigation-main-link .navigation-main-link-item"
);

let navigationContainerLinks = document.querySelectorAll(
  ".navigation-container a"
);

const listener = function (e) {
  e.preventDefault();
  setTimeout(() => {
    console.log("links allowed!");
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

openMenuBtn.addEventListener("click", function (e) {
  fixedNavigation.classList.add("show-menu");
  navigationMainLinks.forEach((link) => {
    link.removeAttribute("href");
  });

  addListeners();
});

closeMenuBtn.addEventListener("click", function (e) {
  fixedNavigation.classList.remove("show-menu");
});
