let swiperSlideContainers =
  document.querySelectorAll(".swiper-slide").length - 1;

console.log(swiperSlideContainers);

per = new Swiper(".swiper", {
  // Optional parameters
  direction: "horizontal",
  loop: true,

  spaceBetween: 10,
  // If we need pagination
  pagination: {
    clickable: true,
  },
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
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
