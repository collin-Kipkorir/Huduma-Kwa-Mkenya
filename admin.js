// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8CK2-Pf1ctYva62cf2lMEhrnLwqIh9Tw",
  authDomain: "huduma-mkononi-799c6.firebaseapp.com",
  databaseURL: "https://huduma-mkononi-799c6-default-rtdb.firebaseio.com/",
  projectId: "huduma-mkononi-799c6",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Redirect to login.html if not logged in
if (!localStorage.getItem("admin_logged_in")) {
  window.location.href = "login.html";
}
showSection("clients");

const logoutBtn = document.createElement("button");
logoutBtn.textContent = "Logout";
logoutBtn.className =
  "btn btn-outline-danger position-fixed top-0 end-0 m-3 z-3";
logoutBtn.onclick = () => {
  localStorage.removeItem("admin_logged_in");
  location.href = "login.html";
};
document.body.appendChild(logoutBtn);

// Utility for SHA-256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 🟩 Load your actual admin dashboard script below this line

// (The rest of the dashboard script remains unchanged below)

// Load categories and services
const categorySelect = document.getElementById("category");
const serviceList = document.getElementById("serviceList");
const form = document.getElementById("serviceForm");
const title = document.getElementById("title");
const icon = document.getElementById("icon");
const iconType = document.getElementById("iconType");
const linkText = document.getElementById("linkText");
const linkUrl = document.getElementById("linkUrl");
const serviceIndex = document.getElementById("serviceIndex");
const resetBtn = document.getElementById("resetBtn");
const iconPreview = document.getElementById("iconPreview");

let servicesData = {};
let selectedCategory = "";
let isPreviewMode = false;

function loadCategories() {
  db.ref("services")
    .once("value")
    .then((snapshot) => {
      servicesData = snapshot.val() || {};
      categorySelect.innerHTML = Object.keys(servicesData)
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
      selectedCategory = categorySelect.value;
      renderServiceList();
    });
}

function renderServiceList() {
  const list = servicesData[selectedCategory] || [];
  serviceList.innerHTML = list
    .map((service, index) => {
      if (isPreviewMode) {
        const iconEl =
          service.iconType === "img"
            ? `<img src="${service.icon}" style="width: 32px; height: 32px;">`
            : `<span style="font-size: 1.5rem;">${service.icon}</span>`;
        return `
        <li class="list-group-item d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div>${iconEl}</div>
            <div>
              <strong>${service.title}</strong><br>
              <small class="text-muted">${service.linkText}</small>
            </div>
          </div>
        </li>
      `;
      } else {
        return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${service.title}</span>
          <div>
            <button class="btn btn-sm btn-warning me-2" onclick="editService(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteService(${index})">Delete</button>
          </div>
        </li>
      `;
      }
    })
    .join("");
}

function togglePreviewMode() {
  isPreviewMode = document.getElementById("previewToggle").checked;
  renderServiceList();
}

categorySelect.addEventListener("change", () => {
  selectedCategory = categorySelect.value;
  renderServiceList();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newService = {
    title: title.value.trim(),
    icon: icon.value.trim(),
    iconType: iconType.value,
    linkText: linkText.value.trim(),
    linkUrl: linkUrl.value.trim(),
  };

  const index = serviceIndex.value;
  const list = servicesData[selectedCategory] || [];

  if (index === "") {
    list.push(newService);
  } else {
    list[parseInt(index)] = newService;
  }

  db.ref(`services/${selectedCategory}`)
    .set(list)
    .then(() => {
      resetForm();
      loadCategories();
    });
});

resetBtn.addEventListener("click", resetForm);

icon.addEventListener("input", updateIconPreview);
iconType.addEventListener("change", updateIconPreview);

function updateIconPreview() {
  const type = iconType.value;
  const value = icon.value.trim();
  if (type === "img" && value) {
    iconPreview.src = value;
    iconPreview.style.display = "inline-block";
  } else {
    iconPreview.src = "";
    iconPreview.style.display = "none";
  }
}

function editService(index) {
  const service = servicesData[selectedCategory][index];
  title.value = service.title;
  icon.value = service.icon;
  iconType.value = service.iconType || "img";
  linkText.value = service.linkText;
  linkUrl.value = service.linkUrl;
  serviceIndex.value = index;
  document.getElementById("formTitle").textContent = "Edit Service";
  updateIconPreview();
}

function deleteService(index) {
  if (!confirm("Delete this service?")) return;
  servicesData[selectedCategory].splice(index, 1);
  db.ref(`services/${selectedCategory}`)
    .set(servicesData[selectedCategory])
    .then(loadCategories);
}

function resetForm() {
  form.reset();
  iconPreview.src = "";
  iconPreview.style.display = "none";
  serviceIndex.value = "";
  document.getElementById("formTitle").textContent = "Add New Service";
}

function showAddCategoryModal() {
  const modal = new bootstrap.Modal(
    document.getElementById("addCategoryModal")
  );
  document.getElementById("newCategoryName").value = "";
  modal.show();
}

function addCategory(e) {
  e.preventDefault();
  const name = document.getElementById("newCategoryName").value.trim();
  if (!name || servicesData[name]) {
    alert("Category name is invalid or already exists.");
    return;
  }
  servicesData[name] = [];
  db.ref(`services/${name}`)
    .set([])
    .then(() => {
      loadCategories();
      bootstrap.Modal.getInstance(
        document.getElementById("addCategoryModal")
      ).hide();
    });
}

function deleteCategory() {
  if (!confirm(`Delete entire category "${selectedCategory}"?`)) return;
  db.ref(`services/${selectedCategory}`)
    .remove()
    .then(() => loadCategories());
}

window.editService = editService;
window.deleteService = deleteService;
window.showAddCategoryModal = showAddCategoryModal;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.togglePreviewMode = togglePreviewMode;

loadCategories();
let allClientRequests = {};
document.getElementById("searchInput").addEventListener("input", () => {
  renderClientRequests(allClientRequests);
});
document.getElementById("statusFilter").addEventListener("change", () => {
  renderClientRequests(allClientRequests);
});

function loadClientRequests() {
  const tbody = document.getElementById("clientRequests");
  tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Loading...</td></tr>`;

  db.ref("clientRequests").once("value").then((snapshot) => {
    allClientRequests = snapshot.val() || {};
    renderClientRequests(allClientRequests); // 🔁 Delegate display logic
  }).catch((err) => {
    console.error("Error fetching client requests:", err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-danger text-center">Error loading requests.</td></tr>`;
  });
}

// 🟢 Load client requests
function loadClientRequests() {
  
  const tbody = document.getElementById("clientRequests");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading...</td></tr>`;

  db.ref("clientRequests")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No requests found.</td></tr>`;
        return;
      }

      let index = 1;
      tbody.innerHTML = ""; // Clear previous rows
      Object.entries(data).forEach(([key, req]) => {
        const fullName = `${req.firstName || ""} ${req.lastName || ""}`.trim();
        const email = req.emailAddress || "";
        const phone = req.phone || "";
        const service = req.service || "";
        const issue = req.issue || "";
        const status = req.status || "Pending";
        const timestamp = req.timestamp
          ? new Date(req.timestamp).toLocaleString()
          : "N/A";

        const statusDropdown = `
        <select class="form-select form-select-sm" onchange="updateRequestStatus('${key}', this.value)">
          ${["Pending", "Processing", "Completed", "Rejected"]
            .map(
              (option) =>
                `<option value="${option}" ${
                  option === status ? "selected" : ""
                }>${option}</option>`
            )
            .join("")}
        </select>`;

        const row = `
  <tr>
    <td class="text-center">${index++}</td>
    <td>${fullName}</td>
    <td>${email}</td>
    <td>${phone}</td>
    <td>${service}</td>
    <td>${issue}</td> <!-- ✅ Inserted here -->
    <td>${statusDropdown}</td>
    <td>${timestamp}</td>
    <td><button class="btn btn-sm btn-danger" onclick="deleteClientRequest('${key}')">🗑️</button></td>
  </tr>`;

        tbody.insertAdjacentHTML("beforeend", row);
      });
    })
    .catch((err) => {
      console.error("Error fetching client requests:", err);
      document.getElementById(
        "clientRequests"
      ).innerHTML = `<tr><td colspan="8" class="text-danger text-center">Error loading requests.</td></tr>`;
    });
     db.ref("clientRequests").once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No requests found.</td></tr>`;
      return;
    }
    allRequests = Object.entries(data);
    currentPage = 1;
    paginateRequests();
  }).catch(err => {
    console.error("Error fetching client requests:", err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-danger text-center">Error loading requests.</td></tr>`;
  });
}
function renderClientRequests(data) {
  const tbody = document.getElementById("clientRequests");
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  tbody.innerHTML = "";

  const filtered = Object.entries(data).filter(([_, req]) => {
    const haystack = `${req.firstName} ${req.lastName} ${req.emailAddress} ${req.phone} ${req.service} ${req.issue}`.toLowerCase();
    const matchSearch = haystack.includes(searchQuery);
    const matchStatus = !statusFilter || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No matching requests found.</td></tr>`;
    return;
  }

  let index = 1;
  filtered.forEach(([key, req]) => {
    const fullName = `${req.firstName || ""} ${req.lastName || ""}`.trim();
    const email = req.emailAddress || "";
    const phone = req.phone || "";
    const service = req.service || "";
    const issue = req.issue || "";
    const status = req.status || "Pending";
    const timestamp = req.timestamp
      ? new Date(req.timestamp).toLocaleString()
      : "N/A";

    const statusDropdown = `
      <select class="form-select form-select-sm" onchange="updateRequestStatus('${key}', this.value)">
        ${["Pending", "Processing", "Completed", "Rejected"].map(
          (option) => `<option value="${option}" ${option === status ? "selected" : ""}>${option}</option>`
        ).join("")}
      </select>`;

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="text-center">${index++}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${service}</td>
        <td>${issue}</td>
        <td>${statusDropdown}</td>
        <td>${timestamp}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteClientRequest('${key}')">🗑️</button></td>
      </tr>`);
  });
}
let allRequests = [];
let currentPage = 1;
const itemsPerPage = 5;

function paginateRequests() {
  const tbody = document.getElementById("clientRequests");
  const paginationInfo = document.getElementById("paginationInfo");
  const paginationControls = document.getElementById("paginationControls");

  const totalItems = allRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  tbody.innerHTML = "";
  allRequests.slice(start, end).forEach(([key, req], index) => {
    const fullName = `${req.firstName || ""} ${req.lastName || ""}`.trim();
    const email = req.emailAddress || "";
    const phone = req.phone || "";
    const service = req.service || "";
    const issue = req.issue || "";
    const status = req.status || "Pending";
    const timestamp = req.timestamp ? new Date(req.timestamp).toLocaleString() : "N/A";

    const statusDropdown = `
      <select class="form-select form-select-sm" onchange="updateRequestStatus('${key}', this.value)">
        ${["Pending", "Processing", "Completed", "Rejected"].map(opt =>
          `<option value="${opt}" ${opt === status ? "selected" : ""}>${opt}</option>`
        ).join('')}
      </select>`;

    const row = `
      <tr>
        <td class="text-center">${start + index + 1}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${service}</td>
        <td>${issue}</td>
        <td>${statusDropdown}</td>
        <td>${timestamp}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteClientRequest('${key}')">🗑️</button></td>
      </tr>`;

    tbody.insertAdjacentHTML('beforeend', row);
  });

  paginationInfo.textContent = `Showing ${start + 1} to ${Math.min(end, totalItems)} of ${totalItems} requests`;

  // Render page numbers
  paginationControls.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    paginationControls.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="goToPage(${i})">${i}</button>
      </li>`;
  }
}

function goToPage(page) {
  currentPage = page;
  paginateRequests();
}

// 🔁 Update status
function updateRequestStatus(key, newStatus) {
  db.ref(`clientRequests/${key}`)
    .update({ status: newStatus })
    .then(() => console.log("Status updated for", key))
    .catch((err) => alert("Failed to update status: " + err.message));
}

// ❌ Delete request
function deleteClientRequest(key) {
  if (confirm("Delete this request permanently?")) {
    db.ref(`clientRequests/${key}`)
      .remove()
      .then(() => loadClientRequests())
      .catch((err) => alert("Failed to delete request: " + err.message));
  }
}

// 🔄 Show section logic
function showSection(id) {
  const sections = ["dashboard", "clients", "reports"];
  sections.forEach((sec) => {
    document.getElementById(sec).style.display = sec === id ? "block" : "none";
  });

  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });

  if (id === "clients") loadClientRequests();
}

// Trigger initial dashboard load
window.showSection = showSection;
window.updateRequestStatus = updateRequestStatus;
window.deleteClientRequest = deleteClientRequest;
window.loadClientRequests = loadClientRequests;
// Load initial categories and client requests
loadCategories();
loadClientRequests();
// Add event listeners for sidebar links
document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute("href").substring(1);
    showSection(sectionId);
  });
});