"use strict";

// Main function
const bodyElement = document.querySelector("body");
const openMenuBtn = document.querySelector(".open-menu");
const closeMenuBtn = document.querySelector(".close-menu");
const fixedNavigation = document.querySelector(".fixed-nav");
let headerMainContainer = document.querySelector(".header-main-container");
let returnBtn = document.querySelector(".return-btn");
let headerTextContainer = document.querySelector(".header-text-container");
let searchBarElement = document.querySelector(".header-input");
let lastScrollTop = window.scrollY;
let scrollListenerAdded = false;
let isFixed = false;
let isClicked = false;

const cookiesModalMainContainer = document.querySelector(".cookies-modal");
const cookiesModalDetails = document.querySelector(".modal-details");
const moreBtnInfoModal = document.querySelector(".more-info-btn");
const acceptAllBtn = document.querySelector(".accept-all");
const rejectAllBtn = document.querySelector(".reject-all");
const saveBtn = document.querySelector(".save-btn");
const selectedCount = document.querySelector(".selected-count");
const availableCount = document.querySelector(".available-count");

// Dobijamo sve checkboxove iz tabele i liste
const getAllCheckboxes = () => {
  return document.querySelectorAll(
    '.cookie-table input[type="checkbox"], .cookie-list input[type="checkbox"]'
  );
};

// Inicijalizacija preferenci
let cookiePreferences = {
  currency: false,
  language: false,
};

// Provera da li elementi postoje
function checkRequiredElements() {
  const requiredElements = {
    bodyElement,
    cookiesModalMainContainer,
    cookiesModalDetails,
    moreBtnInfoModal,
    acceptAllBtn,
    rejectAllBtn,
    saveBtn,
    selectedCount,
    availableCount,
  };

  for (const [name, element] of Object.entries(requiredElements)) {
    if (!element) {
      console.error(`Element ${name} nije pronađen`);
      return false;
    }
  }

  const checkboxes = getAllCheckboxes();
  if (checkboxes.length === 0) {
    console.error("Nisu pronađeni checkboxovi");
    return false;
  }

  return true;
}

// Prikaz modala nakon učitavanja stranice
window.addEventListener("load", () => {
  // Proveri da li su potrebni elementi prisutni
  if (!checkRequiredElements()) {
    console.error("Nedostaju potrebni elementi za cookie manager");
    return;
  }

  // Proveri da li je korisnik već prihvatio kolačiće
  const cookiesAccepted = localStorage.getItem("cookiesAccepted");

  if (!cookiesAccepted) {
    setTimeout(() => {
      cookiesModalMainContainer.classList.add("show-cookies-modal");
      bodyElement.style.overflow = "hidden";
    }, 1500);
  }

  // Učitaj prethodne preference
  loadPreferences();

  // Dodaj event listenere za checkboxove
  addCheckboxListeners();

  // Inicijalno ažuriranje broja
  updateSelectedCount();
});

// Event listeneri za checkboxove
function addCheckboxListeners() {
  const checkboxes = getAllCheckboxes();
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      // Sinhronizuj oba input-a sa istim ID-jem
      synchronizeCheckboxes(e.target);
      updateSelectedCount();
    });
  });
}

// Funkcija za sinhronizaciju checkboxova sa istim ID-jem
function synchronizeCheckboxes(changedCheckbox) {
  const checkboxId = changedCheckbox.id;
  const allCheckboxesWithSameId = document.querySelectorAll(`#${checkboxId}`);

  allCheckboxesWithSameId.forEach((checkbox) => {
    if (checkbox !== changedCheckbox) {
      checkbox.checked = changedCheckbox.checked;
    }
  });
}

// Dugme "Više informacija"
if (moreBtnInfoModal) {
  moreBtnInfoModal.addEventListener("click", function (e) {
    e.preventDefault();
    cookiesModalDetails.classList.toggle("show-modal-details");

    // Promeni tekst dugmeta
    if (cookiesModalDetails.classList.contains("show-modal-details")) {
      this.textContent = "Manje informacija";
    } else {
      this.textContent = "Više informacija";
    }
  });
}

// Dugme "Prihvatam sve"
if (acceptAllBtn) {
  acceptAllBtn.addEventListener("click", function () {
    setAllCheckboxes(true);
    updatePreferencesFromCheckboxes();
    updateSelectedCount();
    savePreferences();
    closeModal();
  });
}

// Dugme "Ne prihvatam"
if (rejectAllBtn) {
  rejectAllBtn.addEventListener("click", function () {
    setAllCheckboxes(false);
    updatePreferencesFromCheckboxes();
    updateSelectedCount();
    savePreferences();
    closeModal();
  });
}

// Dugme "Sačuvaj"
if (saveBtn) {
  saveBtn.addEventListener("click", function () {
    updatePreferencesFromCheckboxes();
    savePreferences();
    closeModal();
  });
}

// Funkcija za postavljanje svih checkboxova
function setAllCheckboxes(checked) {
  const checkboxes = getAllCheckboxes();
  checkboxes.forEach((checkbox) => {
    checkbox.checked = checked;
  });
}

// Funkcija za ažuriranje preferenci iz checkboxova
function updatePreferencesFromCheckboxes() {
  // Uzimamo samo jedinstvene checkbox-ove po ID-u
  const uniqueCheckboxes = getUniqueCheckboxes();

  uniqueCheckboxes.forEach((checkbox) => {
    if (checkbox.id === "currency-selector") {
      cookiePreferences.currency = checkbox.checked;
    } else if (checkbox.id === "language-selector") {
      cookiePreferences.language = checkbox.checked;
    }
  });
}

// Funkcija za dobijanje jedinstvenih checkboxova (bez duplikata po ID-u)
function getUniqueCheckboxes() {
  const checkboxes = getAllCheckboxes();
  const uniqueMap = new Map();

  checkboxes.forEach((checkbox) => {
    if (checkbox.id && !uniqueMap.has(checkbox.id)) {
      uniqueMap.set(checkbox.id, checkbox);
    }
  });

  return Array.from(uniqueMap.values());
}

// Funkcija za ažuriranje broja prihvaćenih kolačića
function updateSelectedCount() {
  if (!selectedCount || !availableCount) return;

  const uniqueCheckboxes = getUniqueCheckboxes();
  const selected = uniqueCheckboxes.filter(
    (checkbox) => checkbox.checked
  ).length;

  selectedCount.textContent = selected;
  availableCount.textContent = uniqueCheckboxes.length;
}

// Funkcija za čuvanje preferenci u localStorage
function savePreferences() {
  try {
    // Proveri da li localStorage radi
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage nije dostupan, koriste se samo kolačiće");
      setCookies();
      return;
    }

    // Sačuvaj preference u localStorage
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(cookiePreferences)
    );
    localStorage.setItem("cookiesAccepted", "true");

    // Postavi stvarne kolačiće
    setCookies();
  } catch (e) {
    console.error("Greška pri čuvanju u localStorage:", e);
    // Fallback: Koristi samo kolačiće ako localStorage ne radi
    setCookies();
  }
}

// Funkcija za proveru dostupnosti localStorage
function isLocalStorageAvailable() {
  try {
    const testKey = "__localStorage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Funkcija za učitavanje prethodnih preferenci
function loadPreferences() {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage nije dostupan");
      return;
    }

    const savedPreferences = localStorage.getItem("cookiePreferences");
    if (savedPreferences) {
      cookiePreferences = JSON.parse(savedPreferences);

      // Ažuriraj sve checkbox-ove sa istim ID-jem
      const currencyCheckboxes =
        document.querySelectorAll("#currency-selector");
      const languageCheckboxes =
        document.querySelectorAll("#language-selector");

      currencyCheckboxes.forEach((checkbox) => {
        checkbox.checked = cookiePreferences.currency;
      });

      languageCheckboxes.forEach((checkbox) => {
        checkbox.checked = cookiePreferences.language;
      });

      updateSelectedCount();
    }
  } catch (e) {
    console.error("Greška pri učitavanju iz localStorage:", e);
  }
}

// Funkcija za postavljanje kolačića u browseru
function setCookies() {
  const expires = new Date();
  expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dana
  const expiresString = expires.toUTCString();

  // Postavi ili obriši cookie za valutu
  if (cookiePreferences.currency) {
    document.cookie = `currency_selection=true; expires=${expiresString}; path=/; SameSite=Lax`;
  } else {
    document.cookie =
      "currency_selection=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }

  // Postavi ili obriši cookie za jezik
  if (cookiePreferences.language) {
    document.cookie = `language_selection=true; expires=${expiresString}; path=/; SameSite=Lax`;
  } else {
    document.cookie =
      "language_selection=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }
}

// Funkcija za zatvaranje modala
function closeModal() {
  if (cookiesModalMainContainer) {
    cookiesModalMainContainer.classList.remove("show-cookies-modal");
  }
  if (bodyElement) {
    bodyElement.style.overflow = "auto";
  }
}

// Funkcija za restart (opciono - za debugging)
function resetCookiePreferences() {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem("cookiePreferences");
    localStorage.removeItem("cookiesAccepted");
  }

  // Obriši sve relevantne kolačiće
  document.cookie =
    "currency_selection=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie =
    "language_selection=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  // Resetuj preferences objekat
  cookiePreferences = {
    currency: false,
    language: false,
  };

  // Resetuj sve checkboxove
  setAllCheckboxes(false);
  updateSelectedCount();

  console.log("Cookie preferences resetovane");
}
// Inicijalizacija brojača kada se učita stranica
document.addEventListener("DOMContentLoaded", () => {
  if (checkRequiredElements()) {
    updateSelectedCount();
  }
});

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

let navigationMainLinksItems = document.querySelectorAll(
  ".navigation-main-link .navigation-main-link-item"
);

let navigationContainerLinks = document.querySelectorAll(
  ".navigation-container a"
);
let navigationMainLinks = document.querySelectorAll(".navigation-main-link");

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

openMenuBtn.addEventListener("click", function (e) {
  fixedNavigation.classList.add("show-menu");
  bodyElement.style.overflow = "hidden";
  navigationMainLinksItems.forEach((link) => {
    link.removeAttribute("href");
  });

  navigationMainLinks.forEach((link, i) => {
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

closeMenuBtn.addEventListener("click", function (e) {
  fixedNavigation.classList.remove("show-menu");
  bodyElement.style.overflow = "unset";

  // ISPRAVKA: Obriši sve timeout-ove koji možda još uvek čekaju
  menuTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  menuTimeouts = []; // Resetuj niz

  navigationMainLinks.forEach((link, i) => {
    link.classList.remove("show-navigation-main-link");
  });

  // DODATO: Resetuj strelicu kada se zatvori meni
  let returnArrow = document.querySelector(".fa-arrow-left");
  if (returnArrow) {
    returnArrow.style.opacity = "0";
  }
});

let returnArrow = document.querySelector(".fa-arrow-left");

document.addEventListener("click", function (e) {
  const clickedInside = e.target.closest(".navigation-main-link");

  if (clickedInside) {
    returnArrow.style.opacity = "1";
  } else {
    returnArrow.style.opacity = "0";
  }
});

// Main function ends

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
  startAutoPlay();
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
    bodyElement.style.overflow = "hidden";

    // Traži elemente u modal-u
    const titleContainer = modal.querySelector(".modal-main-title-container");
    const imgContainer = modal.querySelector(".modal-img-container");

    // Dodaj event listenere za dugmad u modalu
    addQuantityListeners(modal);

    let closeModal = document.querySelector(".close-menu-fast-view");

    // Zatvaranje klikom na X dugme
    closeModal.addEventListener("click", function (e) {
      modal.classList.remove("show-modal");
      bodyElement.style.overflow = "unset";
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
