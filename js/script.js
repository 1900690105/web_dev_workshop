/*
  script.js — interaction and behavior live here.
  Concepts demonstrated: variables, functions, DOM selection, events, conditionals,
  arrays, loops, form validation, classList, template strings, and Date.
*/

// 1. Select elements from the HTML by their IDs or CSS selectors.
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const contactForm = document.querySelector("#contactForm");
const formFeedback = document.querySelector("#formFeedback");
const toast = document.querySelector("#toast");

// 2. Small reusable function: display a temporary notification.
let toastTimer;

function showToast(message) {
  toast.textContent = message;             // Update the message text.
  toast.classList.add("show");             // Add a CSS class to make it visible.

  // Clear the previous timer so repeated clicks don't hide the newest message early.
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// 3. Mobile navigation: click event toggles a CSS class.
// aria-expanded helps assistive technology understand the menu state.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

// Close the mobile menu after someone selects a navigation link.
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});

// 4. Project links: event delegation could also be used, but here each link
// receives its own listener so beginners can see the connection clearly.
document.querySelectorAll(".project-link").forEach((link) => {
  link.addEventListener("click", () => {
    const projectName = link.dataset.project; // Read the data-project HTML attribute.
    showToast(`Let's talk about: ${projectName}`);
    // The anchor still scrolls to Contact; this toast is only a demo interaction.
  });
});

// 5. Update the copyright year automatically rather than hard-coding it forever.
document.querySelector("#currentYear").textContent = new Date().getFullYear();

// 6. Form validation: the page checks values in the browser only.
// No message is transmitted because this project has no backend/API.
const validationRules = {
  name(value) {
    if (value.trim().length < 2) {
      return "Please enter at least 2 characters.";
    }
    return "";
  },
  email(value) {
    // This simple regular expression catches common mistakes; it is not a
    // complete email verification system. HTML type="email" adds browser checks.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) {
      return "Enter a valid email address.";
    }
    return "";
  },
  subject(value) {
    if (!value) {
      return "Please choose a topic.";
    }
    return "";
  },
  message(value) {
    if (value.trim().length < 10) {
      return "Please write at least 10 characters.";
    }
    return "";
  }
};

// Map each field name to its visible error-message element.
const errorElements = {
  name: document.querySelector("#nameError"),
  email: document.querySelector("#emailError"),
  subject: document.querySelector("#subjectError"),
  message: document.querySelector("#messageError")
};

// Reusable validator: read a field, run its rule, and update the UI.
function validateField(field) {
  const rule = validationRules[field.name];

  // Ignore fields that don't have a custom rule.
  if (!rule) return true;

  const errorMessage = rule(field.value);
  errorElements[field.name].textContent = errorMessage;

  // A CSS class shows the invalid field visually as well as textually.
  field.classList.toggle("invalid", Boolean(errorMessage));
  field.setAttribute("aria-invalid", String(Boolean(errorMessage)));

  return errorMessage === "";
}

// Validate a field when the visitor leaves it (blur event).
Object.keys(validationRules).forEach((fieldName) => {
  const field = contactForm.elements[fieldName];
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    // Clear an old error as soon as the visitor starts fixing it.
    if (field.classList.contains("invalid")) {
      validateField(field);
    }
  });
});

// Submit event: stop the browser's default navigation, validate all fields,
// and display a clear result. A production site would send valid data to a server.
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fieldNames = Object.keys(validationRules);
  const results = fieldNames.map((fieldName) => {
    return validateField(contactForm.elements[fieldName]);
  });

  const isFormValid = results.every(Boolean);

  if (!isFormValid) {
    formFeedback.textContent = "Please fix the highlighted fields and try again.";
    formFeedback.style.color = "#c43c55";

    // Focus the first invalid field to help keyboard and screen-reader users.
    const firstInvalidField = contactForm.querySelector(".invalid");
    if (firstInvalidField) firstInvalidField.focus();

    return; // Stop here when any field is invalid.
  }

  // Demo success: no email is sent or stored.
  formFeedback.textContent =
    "Looks good! This demo does not send messages yet — connect a backend to receive submissions.";
  formFeedback.style.color = "#087e5d";
  showToast("Form validation successful");
});

// 7. Small progressive enhancement: highlight the current nav section as
// the visitor scrolls. IntersectionObserver is a browser API for visibility.
const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const currentId = entry.target.id;
        navLinks.querySelectorAll("a").forEach((link) => {
          if (link.getAttribute("href") === `#${currentId}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-30% 0px -60% 0px",
      threshold: 0
    }
  );

  pageSections.forEach((section) => sectionObserver.observe(section));
}
