// ================== ELEMENTS ==================
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

// ================== ANIMATION BUTTONS ==================
signUpButton?.addEventListener("click", () => {
  container.classList.add("active");
});

signInButton?.addEventListener("click", () => {
  container.classList.remove("active");
});

// ================== URL PARAM HANDLING ==================
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const emailFromUrl = params.get("email");

if (mode === "signup") {
  container.classList.add("active");
}
if (mode === "signin") {
  container.classList.remove("active");
}

// Prefill sign-in email from URL
if (emailFromUrl) {
  const signInEmailInput = document.getElementById("signinEmail");
  if (signInEmailInput) {
    signInEmailInput.value = emailFromUrl;
  }
}

// ================== USER STORAGE ==================
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("envoraUsers") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("envoraUsers", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem("envoraCurrentUser", JSON.stringify(user));
  localStorage.setItem("isSignedIn", "true");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// ================== SIGN UP ==================
document.querySelector(".sign-up form button")?.addEventListener("click", (e) => {
  e.preventDefault();

  const fullname = document.getElementById("fullname")?.value.trim();
  const username = document.getElementById("username")?.value.trim();
  const emailRaw = document.getElementById("email")?.value;
  const email = normalizeEmail(emailRaw);
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  if (!fullname || !username || !email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }

  const users = getUsers();

  if (users.find(u => normalizeEmail(u.email) === email)) {
    alert("An account with this email already exists!");
    return;
  }

  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    alert("This username is already taken!");
    return;
  }

  const newUser = {
    fullname,
    username,
    email,
    password,
    joinDate: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  alert("Account created successfully! Please sign in.");

  container.classList.remove("active");

  const signInEmailInput = document.getElementById("signinEmail");
  if (signInEmailInput) {
    signInEmailInput.value = email;
  }
});

// ================== SIGN IN ==================
document.querySelector(".sign-in form button")?.addEventListener("click", (e) => {
  e.preventDefault();

  const email = normalizeEmail(document.getElementById("signinEmail")?.value);
  const password = document.getElementById("signinPassword")?.value;

  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  const users = getUsers();
  const user = users.find(
    u => normalizeEmail(u.email) === email && u.password === password
  );

  if (!user) {
    alert("Invalid email or password!");
    return;
  }

  setCurrentUser(user);
  window.location.href = "workspace.html";
});

// ================== SOCIAL BUTTONS (DEMO ONLY) ==================
document.querySelectorAll(".social-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const provider = btn.getAttribute("data-provider") || "provider";
    alert(`"${provider}" login is not connected yet. Please use Email + Password.`);
  });
});
