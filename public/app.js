// public/app.js - WORKING VERSION WITH DEBUGGING
console.log("🕷️ Spider-Man app.js loaded!");

// API Configuration
const API_BASE_URL = "http://localhost:3000/api/v1/auth";
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded");

  initializeCarousel();
  initializeTabs();
  setupFormHandlers();

  console.log("✅ All JavaScript functions initialized");
});

// Carousel functionality
function initializeCarousel() {
  console.log("🎠 Initializing carousel...");

  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (!slides.length) {
    console.log("❌ No carousel slides found");
    return;
  }

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    indicators.forEach((indicator) => indicator.classList.remove("active"));
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
    currentSlide = index;
  }

  function nextSlide() {
    let nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  function startSlideshow() {
    slideInterval = setInterval(nextSlide, 3000);
  }

  function stopSlideshow() {
    clearInterval(slideInterval);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      stopSlideshow();
      nextSlide();
      startSlideshow();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      stopSlideshow();
      prevSlide();
      startSlideshow();
    });
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", function () {
      stopSlideshow();
      showSlide(index);
      startSlideshow();
    });
  });

  startSlideshow();
  console.log("✅ Carousel initialized");
}

// Tab functionality
function initializeTabs() {
  console.log("📑 Initializing tabs...");

  const loginTab = document.getElementById("login-tab");
  const registerTab = document.getElementById("register-tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const switchToRegister = document.getElementById("switch-to-register");
  const switchToLogin = document.getElementById("switch-to-login");

  if (!loginTab || !registerTab || !loginForm || !registerForm) {
    console.log("❌ Tab elements not found");
    return;
  }

  function showLogin() {
    console.log("Showing login form");
    loginTab.classList.add("tab-active");
    loginTab.classList.remove("text-gray-400");
    registerTab.classList.remove("tab-active");
    registerTab.classList.add("text-gray-400");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  }

  function showRegister() {
    console.log("Showing register form");
    registerTab.classList.add("tab-active");
    registerTab.classList.remove("text-gray-400");
    loginTab.classList.remove("tab-active");
    loginTab.classList.add("text-gray-400");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }

  loginTab.addEventListener("click", showLogin);
  registerTab.addEventListener("click", showRegister);

  if (switchToRegister) {
    switchToRegister.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Switch to register clicked");
      showRegister();
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Switch to login clicked");
      showLogin();
    });
  }

  console.log("✅ Tabs initialized");
}

// Form handling
function setupFormHandlers() {
  console.log("📝 Setting up form handlers...");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
// Login form handler - UPDATED VERSION
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🔍 LOGIN FORM SUBMITTED');
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        console.log('📦 Login data:', { email, password });
        
        if (!email || !password) {
            showMessage(loginForm, 'Please fill in all fields', true);
            return;
        }
        
        try {
            setLoading(loginForm.querySelector('button[type="submit"]'), true);
            
            console.log('🌐 Making login API call to:', API_BASE_URL + '/login');
            const response = await fetch(API_BASE_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log('📡 Login response status:', response.status);
            const data = await response.json();
            console.log('📨 Login response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            showMessage(loginForm, data.message || 'Login successful! ✅');
            
            // Store user data
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // FIXED: Redirect to correct dashboard URL
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'http://localhost:3000/admin-dashboard.html';
                } else {
                    window.location.href = 'http://localhost:3000/dashboard.html';
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            showMessage(loginForm, error.message, true);
        } finally {
            setLoading(loginForm.querySelector('button[type="submit"]'), false);
        }
    });
}

  // Register form handler - SIMPLIFIED AND WORKING
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("🔍 REGISTER FORM SUBMITTED");

      const username = document.getElementById("register-username").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-confirm").value;
      const role = document.getElementById("register-role").value;
      const terms = document.getElementById("terms").checked;

      console.log("📦 Register data:", {
        username,
        email,
        password: password ? "***" : "MISSING",
        confirmPassword: confirmPassword ? "***" : "MISSING",
        role,
        terms,
      });

      // Validation
      if (!username || !email || !password || !confirmPassword || !role) {
        showMessage(registerForm, "Please fill in all fields", true);
        return;
      }

      if (password !== confirmPassword) {
        showMessage(registerForm, "Passwords do not match!", true);
        return;
      }

      if (!terms) {
        showMessage(
          registerForm,
          "Please accept the terms and conditions",
          true
        );
        return;
      }

      try {
        setLoading(registerForm.querySelector('button[type="submit"]'), true);

        console.log(
          "🌐 Making register API call to:",
          API_BASE_URL + "/register"
        );

        const response = await fetch(API_BASE_URL + "/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            role,
          }),
        });

        console.log("📡 Register response status:", response.status);
        const data = await response.json();
        console.log("📨 Register response data:", data);

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        showMessage(
          registerForm,
          data.message || "Registration successful! ✅ You can now login."
        );

        // Switch to login form after success
        setTimeout(() => {
          document.getElementById("login-tab").click();
        }, 2000);
      } catch (error) {
        console.error("❌ Registration error:", error);
        showMessage(registerForm, error.message, true);
      } finally {
        setLoading(registerForm.querySelector('button[type="submit"]'), false);
      }
    });
  }

  console.log("✅ Form handlers set up");
}

// Utility functions
function setLoading(button, isLoading) {
  if (!button) return;

  const originalText = button.textContent;

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
  } else {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function showMessage(form, message, isError) {
  // Remove existing messages
  const existingMessage = form.querySelector(".form-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageEl = document.createElement("div");
  messageEl.className = `form-message mt-3 p-3 rounded-lg text-center ${
    isError
      ? "bg-red-900/50 border border-red-600 text-red-200"
      : "bg-green-900/50 border border-green-600 text-green-200"
  }`;
  messageEl.textContent = message;

  // Add to form
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn && submitBtn.parentNode) {
    submitBtn.parentNode.insertBefore(messageEl, submitBtn.nextSibling);
  }

  // Auto-remove success messages
  if (!isError) {
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }
}
