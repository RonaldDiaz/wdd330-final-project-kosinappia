class NotificationManager {
  constructor() {
    this.container = this.createnotificationContainer();
    this.template = document.createElement("template");
    this.template.innerHTML = notificationTemplate;
  }

  createnotificationContainer() {
    let container = document.createElement("div");
    container.id = "notificationContainer";
    document.body.appendChild(container);
    return container;
  }

  show(message, type = "info", duration = 5000) {
    const clone = this.template.content.cloneNode(true);
    const [notificationItem, notificationMessage, closeButton] =
      clone.querySelectorAll("div, p, button");
    const colors = notificationColor(type);

    notificationMessage.textContent = message;
    notificationItem.style.backgroundColor = colors[0];
    notificationItem.style.color = colors[1];

    this.container.appendChild(clone);

    setTimeout(() => {
      notificationItem.classList.add("show");
    }, 20);

    const autoCloseTimer = setTimeout(() => {
      this.dismiss(notificationItem);
    }, duration);

    closeButton.addEventListener("click", () => {
      clearTimeout(autoCloseTimer);
      this.dismiss(notificationItem);
    });
  }

  dismiss(notificationItem) {
    notificationItem.classList.remove("show");
    setTimeout(() => {
      notificationItem.remove();
    }, 400);
  }
}

const notificationTemplate = `<div class="notification-item">
    <p class="notification-message"></p>
    <button type="button" class="close-notification" aria-label="Close notification">&times;</button>
  </div>`;

function notificationColor(type) {
  switch (type) {
    case "success":
      return ["#5a7a51", "#fff"];
    case "error":
      return ["#b8532f", "#fff"];
    case "warning":
      return ["#e67e22", "#fff"];
    default:
      return ["#303030", "#fff"];
  }
}

export const notificationManager = new NotificationManager();
