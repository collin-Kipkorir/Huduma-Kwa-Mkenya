const isAllServicesPage = window.location.pathname.includes("all-services.html");

// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyA8CK2-Pf1ctYva62cf2lMEhrnLwqIh9Tw",
  authDomain: "huduma-mkononi-799c6.firebaseapp.com",
  databaseURL: "https://huduma-mkononi-799c6-default-rtdb.firebaseio.com",
  projectId: "huduma-mkononi-799c6",
  storageBucket: "huduma-mkononi-799c6.appspot.com",
  messagingSenderId: "873002821373",
  appId: "1:873002821373:web:70e6348ef676429fddc094"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-header nav');
menuToggle?.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
  menuToggle.setAttribute('aria-expanded', !isExpanded);
  nav.classList.toggle('active');
});
document.querySelectorAll('.main-header nav ul li a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
    }
  });
});

// Typing Effect
const typingTextElement = document.getElementById('typing-text');
const textToType = "Online Cyber & Experience";
let charIndex = 0;
function type() {
  if (charIndex < textToType.length) {
    typingTextElement.textContent += textToType.charAt(charIndex++);
    setTimeout(type, 100);
  } else {
    setTimeout(() => {
      typingTextElement.textContent = "";
      charIndex = 0;
      type();
    }, 3000);
  }
}
if (typingTextElement) setTimeout(type, 500);

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question?.addEventListener('click', () => {
    const active = document.querySelector('.faq-item.active');
    if (active && active !== item) {
      active.classList.remove('active');
      active.querySelector('.toggle-icon').textContent = '+';
    }
    item.classList.toggle('active');
    const icon = question.querySelector('.toggle-icon');
    if (icon) icon.textContent = item.classList.contains('active') ? '×' : '+';
  });
});

// Contact Form
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (name && email && message) {
    alert(`Thank you for your message, ${name}!`);
    contactForm.reset();
  } else {
    alert('Please fill in all fields.');
  }
});

// Create Service Card
function createServiceCard(service) {
  const iconHtml = service.iconType === "img"
    ? `<img src="${service.icon}" alt="Icon" class="service-icon">`
    : `<span class="icon">${service.icon}</span>`;
  return `
    <div class="service-card">
      <div class="service-card-icon-area">${iconHtml}</div>
      <div class="service-card-content">
        <h4>${service.title}</h4>
        <a href="#" class="action-link request-assistance" data-service-title="${service.title}">
          ${service.linkText} <span class="arrow">→</span>
        </a>
      </div>
    </div>
  `;
}

// Render Services
function renderCategoryServices(category, services) {
  const container = document.getElementById("allServicesContainer");
  const title = document.getElementById("category-title");

  if (!services[category]) {
    title.textContent = "Category not found.";
    container.innerHTML = "";
    return;
  }

  title.textContent = `Explore Our ${category}`;
  container.innerHTML = services[category].map(createServiceCard).join("");
}

// Fetch Services from Firebase
db.ref("services").once("value")
  .then(snapshot => {
    const services = snapshot.val();
    const params = new URLSearchParams(window.location.search);
    const categoryParam = decodeURIComponent(params.get("category") || "").trim();

    if (categoryParam) {
      renderCategoryServices(categoryParam, services);
    } else {
      document.getElementById("category-title").textContent = "No category selected.";
    }
  })
  .catch(error => {
    console.error("Error loading services:", error);
    document.getElementById("category-title").textContent = "Failed to load services.";
  });

// Handle Modal Trigger
document.addEventListener("click", function (e) {
  const target = e.target.closest(".request-assistance");
  if (target) {
    e.preventDefault();
    openRequestModal(target.dataset.serviceTitle);
  }
});

// Open Modal
function openRequestModal(serviceTitle) {
  document.getElementById("modalServiceTitle").textContent = serviceTitle;
  document.getElementById("selectedService").value = serviceTitle;
  const modal = new bootstrap.Modal(document.getElementById("requestModal"));
  modal.show();
}

// Handle Modal Form Submit
const requestForm = document.getElementById('requestForm');
requestForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const emailAddress = document.getElementById('emailAddress').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const issue = document.getElementById('issueDesc').value.trim();
  const service = document.getElementById('selectedService').value;

  if (firstName && lastName && emailAddress && phone && issue) {
    const submitBtn = requestForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...`;

    firebase.database().ref("clientRequests").push({
      firstName, lastName, emailAddress, phone, issue, service,
      status: "Pending",
      timestamp: new Date().toISOString()
    }).then(() => {
      bootstrap.Modal.getInstance(document.getElementById("requestModal")).hide();

      // Show confirmation modal
      document.getElementById("confirmationName").textContent = firstName;
      document.getElementById("confirmationService").textContent = service;
      new bootstrap.Modal(document.getElementById("confirmationModal")).show();

      requestForm.reset();
      requestForm.classList.remove("was-validated");
    }).catch(err => {
      alert("There was an error submitting your request.");
      console.error(err);
    }).finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    });
  } else {
    requestForm.classList.add("was-validated");
  }
});


// Bootstrap Form Validation Script
(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();
