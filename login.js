// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8CK2-Pf1ctYva62cf2lMEhrnLwqIh9Tw",
  authDomain: "huduma-mkononi-799c6.firebaseapp.com",
  databaseURL: "https://huduma-mkononi-799c6-default-rtdb.firebaseio.com/",
  projectId: "huduma-mkononi-799c6"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// SHA-256 hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Show/hide password toggle
document.getElementById('togglePassword').addEventListener('click', () => {
  const input = document.getElementById('adminPassword');
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  document.getElementById('togglePassword').textContent = isPassword ? 'Hide' : 'Show';
});

// Show error alert
function showAlert(message) {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
  setTimeout(() => alertBox.classList.add("d-none"), 5000);
}

// Handle login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  if (!username || !password) {
    showAlert("Please enter both username and password.");
    return;
  }

  const hashedPassword = await sha256(password);

  // Attempt to match against Firebase DB
  db.ref(`admins/${username}`).once('value').then(snapshot => {
    const admin = snapshot.val();
    if (admin && admin.password === hashedPassword) {
      localStorage.setItem("admin_logged_in", "true");
      window.location.href = "admin.html";
    } else {
      const failLog = {
        time: new Date().toISOString(),
        username: username,
        ip: null
      };
      db.ref("login_attempts").push(failLog);
      showAlert("Invalid credentials. Login attempt logged.");
    }
  }).catch(error => {
    console.error("Login error:", error);
    showAlert("Something went wrong. Please try again.");
  });
});
