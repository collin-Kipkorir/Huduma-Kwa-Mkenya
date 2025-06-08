// ✅ Detect if we're on all-services.html
const isAllServicesPage = window.location.pathname.includes("all-services.html");

// ✅ Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-header nav');

menuToggle?.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
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

// ✅ Typing Effect
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

// ✅ FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const active = document.querySelector('.faq-item.active');
    if (active && active !== item) {
      active.classList.remove('active');
      active.querySelector('.toggle-icon').textContent = '+';
    }
    item.classList.toggle('active');
    question.querySelector('.toggle-icon').textContent = item.classList.contains('active') ? '×' : '+';
  });
});

// ✅ Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (name && email && message) {
      alert(`Thank you for your message, ${name}! We will get back to you soon.`);
      contactForm.reset();
    } else {
      alert('Please fill in all fields.');
    }
  });
}

// ✅ "Why Choose Us" Tabs
document.querySelectorAll('.why-choose-us-tabs .tab-item').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.why-choose-us-tabs .tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// ✅ Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyA8CK2-Pf1ctYva62cf2lMEhrnLwqIh9Tw",
  authDomain: "huduma-mkononi-799c6.firebaseapp.com",
  databaseURL: "https://huduma-mkononi-799c6-default-rtdb.firebaseio.com",
  projectId: "huduma-mkononi-799c6",
  storageBucket: "huduma-mkononi-799c6.appspot.com",
  messagingSenderId: "873002821373",
  appId: "1:873002821373:web:70e6348ef676429fddc094",
  measurementId: "G-VL45PYLT6G"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ✅ Service Card Creator
function createServiceCard(service) {
  const iconHtml = service.iconType === "img"
    ? `<img src="${service.icon}" alt="Icon" class="service-icon">`
    : `<span class="icon">${service.icon}</span>`;

  return `
    <div class="service-card">
      <div class="service-card-icon-area">${iconHtml}</div>
      <div class="service-card-content">
        <h4>${service.title}</h4>
        <a href="all-services.html?category=${encodeURIComponent(service.category)}" class="action-link">
          ${service.linkText} <span class="arrow">→</span>
        </a>
      </div>
    </div>
  `;
}

// ✅ Service Renderer
function renderServices(services) {
  const container = document.getElementById("serviceContainer") || document.getElementById("allServicesContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const categoryParam = decodeURIComponent(params.get("category") || "");
  const showAll = isAllServicesPage;

  if (showAll && categoryParam && document.getElementById("category-title")) {
    document.getElementById("category-title").innerText = `Explore Our ${categoryParam}`;
  }

  container.innerHTML = "";

  for (const category in services) {
    if (showAll && categoryParam && category !== categoryParam) continue;

    const data = services[category].map(service => ({ ...service, category }));
    const visibleData = showAll ? data : data.slice(0, 3);
    const cardsHtml = visibleData.map(createServiceCard).join("");
    const wrapperClass = showAll ? "all-services-grid" : "service-grid";

    container.innerHTML += `
      <div class="service-category mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fw-bold">${category}</h3>
          ${!showAll ? `<a href="all-services.html?category=${encodeURIComponent(category)}" class="btn btn-outline-dark">View All Services</a>` : ""}
        </div>
        <div class="${wrapperClass}">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
}

// ✅ Load and Render Services from Firebase
db.ref("services").once("value")
  .then(snapshot => renderServices(snapshot.val()))
  .catch(err => console.error("Error loading services:", err));
