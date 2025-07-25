let swiperSlideContainers =
  document.querySelectorAll(".swiper-slide").length - 1;

console.log(swiperSlideContainers);

per = new Swiper(".swiper", {
  // Optional parameters
  direction: "horizontal",
  loop: true,

  spaceBetween: 20,
  // If we need pagination
  pagination: {
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints: {
    1920: { slidesPerView: 5 }, // desktop veliki ekran
    1024: { slidesPerView: 4 }, // laptop/tablet horizontalno
    768: { slidesPerView: 2 }, // tablet
    480: { slidesPerView: 1 }, // mobilni
  },
});
