export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  };
}

async function loadTemplate(path) {
  const response = await fetch(path);
  return await response.text();
}

export async function loadHeaderFooter() {
  const header = await loadTemplate('/partials/header.html');
  const footer = await loadTemplate('/partials/footer.html');
  renderWithTemplate(header, document.querySelector('#header'), null, setNavigation);
  renderWithTemplate(footer, document.querySelector('#footer'));
}

function setNavigation() {
  const navButton = document.querySelector("#menuBtn");
  const navBar = document.querySelector("#mainNav");

  navButton.addEventListener("click", () => {
    navButton.classList.toggle("open");
    navBar.classList.toggle("open");
    const isOpen = navButton.classList.contains("open");
    navButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  })

  navWayfinding();
}

function navWayfinding() {
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute("href");
    const li = link.closest("li");
    li.classList.remove("current");
    if (currentPath === linkPath) {
      li.classList.add("current");
    }
  });
}