import { mainFunction } from "./mainFunction.js";

mainFunction();

const bodyElement = document.querySelector("body");

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
  let leftBtn = slider.querySelector(".buttons .slider-left");
  let rightBtn = slider.querySelector(".buttons .slider-right");
  let maxSlide = slides.length;
  let curSlide = 0;
  let timeForTransition = 8000;

  // Klon prvog slajda
  const firstSlideClone = slides[0].cloneNode(true);
  firstSlideClone.classList.add("clone");
  slider.appendChild(firstSlideClone);

  const allSlides = slider.querySelectorAll(".slide");

  const goToSlide = function (slide, skipTransition = false) {
    allSlides.forEach((slideEl, i) => {
      slideEl.style.transition = skipTransition
        ? "none"
        : "transform 1s ease-out";
      slideEl.style.transform = `translateX(${120 * (i - slide)}%)`;
    });
  };

  const activateDot = function (slide) {
    dotContainer.querySelectorAll(".dots__dot").forEach((dot) => {
      dot.classList.remove("dots__dot--active");
    });
    const dotIndex = slide >= maxSlide ? 0 : slide;
    const activeDot = dotContainer.querySelector(
      `.dots__dot[data-slide="${dotIndex}"]`
    );
    if (activeDot) activeDot.classList.add("dots__dot--active");
  };

  // Navigacija
  const prevSlide = () => {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
      timeForTransition = 8000;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
    restartAutoPlay();
  };

  const nextSlideClick = () => {
    curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);
    timeForTransition = 8000;

    if (curSlide === maxSlide) {
      setTimeout(() => {
        curSlide = 0;
        goToSlide(curSlide, true);
        activateDot(curSlide);
      }, 1000);
    }
    restartAutoPlay();
  };

  if (leftBtn) leftBtn.addEventListener("click", prevSlide);
  if (rightBtn) rightBtn.addEventListener("click", nextSlideClick);

  // Kreiranje tačkica
  const createDots = function () {
    dotContainer.innerHTML = "";
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  // Sledeći slajd autoplay
  const nextSlide = function () {
    curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);

    if (curSlide === maxSlide) {
      setTimeout(() => {
        curSlide = 0;
        goToSlide(curSlide, true);
        activateDot(curSlide);
      }, 1000);
    }
  };

  // Inicijalizacija
  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  // Klik na tačkice
  if (dotContainer) {
    dotContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("dots__dot")) {
        const { slide } = e.target.dataset;
        curSlide = parseInt(slide);
        goToSlide(curSlide);
        activateDot(curSlide);
        restartAutoPlay();
      }
    });
  }

  // AUTOPLAY sa setTimeout
  let autoplayTimeout;
  const startAutoPlay = () => {
    clearTimeout(autoplayTimeout);
    autoplayTimeout = setTimeout(() => {
      nextSlide();
      startAutoPlay();
    }, timeForTransition);
  };
  const restartAutoPlay = () => startAutoPlay();

  // DRAG / SWIPE podrška
  let startX = 0;
  let isDragging = false;

  const dragStart = (x) => {
    startX = x;
    isDragging = true;
  };

  const dragEnd = (x) => {
    if (!isDragging) return;
    const diff = x - startX;
    if (Math.abs(diff) > 50) {
      // prag za pomeranje
      if (diff < 0) {
        nextSlideClick();
      } else {
        prevSlide();
      }
    }
    isDragging = false;
  };

  // Mouse events
  slider.addEventListener("mousedown", (e) => dragStart(e.clientX));
  slider.addEventListener("mouseup", (e) => dragEnd(e.clientX));
  slider.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // Touch events
  slider.addEventListener("touchstart", (e) => dragStart(e.touches[0].clientX));
  slider.addEventListener("touchend", (e) =>
    dragEnd(e.changedTouches[0].clientX)
  );

  // Start
  init();
  startAutoPlay();
});

// Ostatak koda za slike
let slidersImgContainer = document.querySelectorAll(".slider .slide");
let imageTimeouts = [];

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
        const timeoutId = setTimeout(function () {
          img.classList.add("show-slide-img");
        }, 150 * i);
        imageTimeouts.push(timeoutId);
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

  // ISPRAVKA: setTimeout umesto setInterval
  setTimeout(function () {
    slidersImgContainer[1].style.opacity = "1";
  }, 1100);
});

// Funkcija za promjenu količine
function changeQuantity(input, delta) {
  let currentValue = parseInt(input.value);
  if (isNaN(currentValue)) {
    currentValue = 0;
  }
  let newValue = currentValue + delta;
  if (newValue < 1) {
    newValue = 1;
  }
  input.value = newValue;
}

// Funkcija za dodavanje event listenera za količinu
function addQuantityListeners(container) {
  const addButtons = container.querySelectorAll(".add-button");
  const minusButtons = container.querySelectorAll(".minus-button");
  const quantityInputs = container.querySelectorAll(".added-quantity");

  // Funkcija za promjenu količine pri kliku na gumb za dodavanje
  addButtons.forEach(function (addButton) {
    addButton.addEventListener("click", function () {
      let parent = this.parentElement;
      let input = parent.querySelector(".added-quantity");
      changeQuantity(input, 1);
    });
  });

  // Funkcija za promjenu količine pri kliku na gumb za oduzimanje
  minusButtons.forEach(function (minusButton) {
    minusButton.addEventListener("click", function () {
      let parent = this.parentElement;
      let input = parent.querySelector(".added-quantity");
      changeQuantity(input, -1);
    });
  });

  // Funkcija za promjenu količine pri ručnom unosu
  quantityInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      let currentValue = parseInt(this.value);
      if (isNaN(currentValue) || currentValue < 1) {
        this.value = 1; // Postavljamo minimalnu vrijednost na 1 ako je unos neispravan
      }
    });
    input.addEventListener("blur", function () {
      // Nakon što korisnik završi s unosom, ažuriramo vrijednost
      changeQuantity(this, 0);
    });
  });
}

// Inicijalizacija event listenera za početnu stranicu
addQuantityListeners(document);

// Product modal functionality
const productContainers = document.querySelectorAll(".product-container");

productContainers.forEach((productContainer, i) => {
  productContainer.addEventListener("click", function (e) {
    let target = e.target.closest(".fast-view-container");
    if (target === null) return;
    const mainContainer = document.querySelector(".main");
    let productTitle = this.querySelector(".product-title");

    let productItems = {
      productImg: this.querySelector(".product-pic"),
      productTitle: productTitle,
      productCode: this.querySelector(".product-code"),
      smallProductTitle: productTitle.textContent.split("-")[0].trim(),
      selectContainer: this.querySelector(".select-container"),
      bradnImg: this.querySelector(".brend-img"),
      descriptionList: this.querySelector(".description-list"),
      moreInfoBtn: this.querySelector(".more-info"),
      iconsContainer: this.querySelector(".icons-container"),
      formContainer: this.querySelector(".add-to-cart-form"),
    };

    let modalOwerlay = `
    <div class="modal-container">
      <div class="modal-owerlay">
      <i class="fa-solid fa-xmark close-menu close-menu-fast-view"></i>
        <div class="modal-img-container">
        ${productItems.productImg.outerHTML}
        </div>
        <div class="modal-product-description">
         
          <div class="modal-main-title-container">
            <div class="modal-main-title">
              ${productItems.productTitle.outerHTML}
                ${productItems.productCode.outerHTML}
            </div>
            ${productItems.bradnImg.outerHTML}
          </div>
          <div class="modal-description">
            <h3>${productItems.smallProductTitle}</h3>
            ${productItems.descriptionList.outerHTML}
          </div>
          <div class="modal-cart">
            ${productItems.formContainer.outerHTML}
          </div>
          <div class="modal-more-info">
          ${productItems.moreInfoBtn.outerHTML}
          </div>
          ${productItems.iconsContainer.outerHTML}
        </div>
      </div>
    </div>
    `;

    mainContainer.insertAdjacentHTML("afterbegin", modalOwerlay);
    let modal = document.querySelector(".modal-container");
    modal.classList.add("show-modal");
    if (modal.classList.contains("show-modal"))
      bodyElement.style.overflow = "hidden";
    else {
      bodyElement.style.overflow = "auto";
    }

    // Traži elemente u modal-u
    const titleContainer = modal.querySelector(".modal-main-title-container");
    const imgContainer = modal.querySelector(".modal-img-container");

    // Dodaj event listenere za dugmad u modalu
    addQuantityListeners(modal);

    let closeModal = document.querySelector(".close-menu-fast-view");

    // Zatvaranje klikom na X dugme
    closeModal.addEventListener("click", function (e) {
      modal.classList.remove("show-modal");
      bodyElement.style.overflow = "auto";
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    });

    // Zatvaranje klikom van modala
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("show-modal");
        bodyElement.style.overflow = "auto";
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        }, 300);
      }
    });

    let width = window.innerWidth;

    if (width <= 1024) {
      imgContainer.appendChild(titleContainer);
    }
  });
});
