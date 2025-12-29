// Robot animation
lottie.loadAnimation({
  container: document.getElementById("robot-bg"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "assets/robot-bg.json"
});

// Scroll fade animation
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".fade").forEach(el => observer.observe(el));
