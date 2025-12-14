const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

// handle button clicks (animation)
signUpButton.addEventListener("click", () => {
  container.classList.add("active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("active");
});

// ✅ read URL parameter on page load
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "signup") {
  container.classList.add("active");
}

// User management functions
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('envoraUsers') || '[]');
  } catch(e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('envoraUsers', JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('envoraCurrentUser') || 'null');
  } catch(e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('envoraCurrentUser', JSON.stringify(user));
  localStorage.setItem('isSignedIn', 'true');
}

// Handle sign up button click
document.querySelector('.sign-up form button')?.addEventListener('click', function(e) {
  e.preventDefault();
  const fullname = document.getElementById('fullname')?.value;
  const username = document.getElementById('username')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  
  if (!fullname || !username || !email || !password) {
    alert('Please fill in all fields!');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }
  
  const users = getUsers();
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    alert('An account with this email already exists!');
    return;
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    alert('This username is already taken!');
    return;
  }
  
  // Create new user
  const newUser = {
    fullname: fullname,
    username: username,
    email: email,
    password: password,
    joinDate: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  
  alert('Account created successfully!');
  window.location.href = 'workspace.html';
});

// Handle sign in button click
document.querySelector('.sign-in form button')?.addEventListener('click', function(e) {
  e.preventDefault();
  const email = document.querySelector('.sign-in form input[type="email"]').value;
  const password = document.querySelector('.sign-in form input[type="password"]').value;
  
  if (!email || !password) {
    alert('Please enter both email and password!');
    return;
  }
  
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    alert('Invalid email or password! Please sign up first.');
    return;
  }
  
  setCurrentUser(user);
  window.location.href = 'workspace.html';
});
