"use strict";

export function mainFunction() {
  let mainCssElement = {
    rel: "stylesheet",
    href: "css-js/mainCss.css",
  };

  const linkElement = document.createElement("link");

  Object.keys(mainCssElement).forEach((key) => {
    linkElement.setAttribute(key, mainCssElement[key]);
  });

  document.head.appendChild(linkElement);

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
    loadPreferences();
    addCheckboxListeners();
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
    bodyElement.style.overflow = "auto";

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
}
