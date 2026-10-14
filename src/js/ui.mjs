export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  };
}

export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

async function loadTemplate(path) {
  const response = await fetch(path);
  return await response.text();
}

export async function loadHeaderFooter() {
  const header = await loadTemplate("/partials/header.html");
  const footer = await loadTemplate("/partials/footer.html");
  renderWithTemplate(header, document.querySelector("#header"), null, setNavigation);
  renderWithTemplate(footer, document.querySelector("#footer"));
  setDates();
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

export function setDates() {
    const year = document.getElementById("currentYear");
    const currentYear = new Date().getFullYear();
    year.innerHTML = currentYear;
    document.getElementById("lastModified").innerHTML = document.lastModified;
}

export function openModal(dialogTemplate) {
  let dialog = document.createElement("dialog");
  dialog.id = "modalDialog";
  dialog.className = "modal-dialog";
  document.body.appendChild(dialog);

  dialog.innerHTML = dialogTemplate;

  const closeBtn = dialog.querySelector("#modalClose");
  const dismissBtn = dialog.querySelector("#modalDismiss");
  const close = () => dialog.close();

  closeBtn.addEventListener("click", close);
  dismissBtn.addEventListener("click", close);

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  }, { once: true });

  dialog.showModal();
}