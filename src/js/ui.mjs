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

export function openRecipeModal(recipeDetails) {
  let dialog = document.createElement("dialog");
  dialog.id = "recipe-detail-dialog";
  dialog.className = "recipe-modal";
  document.body.appendChild(dialog);

  dialog.innerHTML = `
    <div class="modal-inner">
      <div class="modal-header">
        <div>
          <span>${(recipeDetails.category)}</span>
          <h2 class="modal-title">${recipeDetails.title}</h2>
        </div>
        <button type="button" class="modal-close-btn" id="modal-close-action">✕</button>
      </div>      
      <div class="modal-body">
        <div>
          <img src="${recipeDetails.image}" alt="${recipeDetails.title}">
        </div>
        <p>${recipeDetails.country}</p>
        <h3>Ingredients</h3>
        <ul>${recipeDetails.ingredients.map(item => `<li>${item.measure} ${item.ingredient}</li>`).join("")}</ul>
        <h3>Recipe's Instructions</h3>
        <ol>${recipeDetails.instructions}</ol>       
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="modal-dismiss-btn">Close Recipe</button>
      </div>
    </div>
  `;

  const closeBtn = dialog.querySelector("#modal-close-action");
  const dismissBtn = dialog.querySelector("#modal-dismiss-btn");
  const close = () => dialog.close();

  closeBtn.addEventListener("click", close);
  dismissBtn.addEventListener("click", close);

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  dialog.showModal();
}