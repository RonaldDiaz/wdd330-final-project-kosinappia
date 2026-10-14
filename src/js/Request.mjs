import { FAQ_DATA } from "./data/data.mjs";
import { renderWithTemplate, openModal } from "./ui.mjs";

export default class Request {
  constructor(elements) {
    Object.assign(this, elements);
  }

  init() {
    this.setupRequestForm();
    this.renderFaqCards();
  }

  setupRequestForm() {
    this.timestamp.value = new Date().toISOString();
    
    this.ingredientRequestForm.addEventListener("submit", () => {
      this.timestamp.value = new Date().toISOString();
    });
  }

  renderFaqCards() {
    this.faqContainer.innerHTML = "";

    FAQ_DATA.forEach((faq) => {
      const card = document.createElement("article");
      card.className = "faq-card";

      renderWithTemplate(faqCardTemplate(faq), card);

      const openBtn = card.querySelector(".faq-card-action");
      openBtn?.addEventListener("click", () => {
        this.openFaqDialog(faq);
      });

      this.faqContainer.appendChild(card);
    });
  }

  openFaqDialog(faq) {
    openModal(faqDialogTemplate(faq));    
  }
}

function faqCardTemplate(faq) {
  return `
    <h3 class="faq-card-title">${faq.title}</h3>
    <p class="faq-card-snippet">${faq.snippet}</p>
    <button type="button" class="btn btn-secondary faq-card-action" data-faq-id="${faq.id}">
      Read Technical Breakdown
    </button>
  `;
}

function faqDialogTemplate(faq) {
  return `
      <div class="modal-inner">
      <button type="button" class="modal-close-btn" id="modalClose" aria-label="Close dialog">✕</button>
        <div class="modal-header">
          <h2 class="modal-title">${faq.modalTitle}</h2>
        </div>
        <div class="modal-body">
          ${faq.contentHtml}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="modalDismiss">
            Got It, Thanks
          </button>
        </div>
      </div>
    `;
}