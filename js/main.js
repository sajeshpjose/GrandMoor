// ============================================
// GRANDMOOR WEBSITE - MAIN JAVASCRIPT
// ============================================

// Load Header Component
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    fetch('/header.html')
      .then(response => {
        if (!response.ok) throw new Error('Header not found');
        return response.text();
      })
      .then(html => {
        headerContainer.innerHTML = html;
        // Initialize menu toggle after header is loaded
        initializeMenuToggle();
      })
      .catch(error => console.error('Error loading header:', error));
  }
}

// Load Footer Component
function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    fetch('/footer.html')
      .then(response => {
        if (!response.ok) throw new Error('Footer not found');
        return response.text();
      })
      .then(html => {
        footerContainer.innerHTML = html;
      })
      .catch(error => console.error('Error loading footer:', error));
  }
}

// Initialize Menu Toggle
function initializeMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer components
  loadHeader();
  loadFooter();

  // Form handling (for Netlify Forms)
  const contactForm = document.querySelector('form[name="contact"]');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Netlify will handle form submission
      // This is just for reference - Netlify processes the form automatically
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Add active class to current page in navigation
  const currentLocation = location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '700';
    }
  });
});

// Utility: Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Handle responsive behavior
window.addEventListener('resize', debounce(function() {
  // Optionally close mobile menu on resize to desktop
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (window.innerWidth > 768 && menuToggle && mobileMenu) {
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
  }
}, 250));
