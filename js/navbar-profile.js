/**
 * Navbar Profile Dropdown Handler
 * Manages the profile icon dropdown for logged-in users across all pages
 */

// Initialize profile dropdown on page load
function initializeProfileDropdown() {
  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('navbarLogoutBtn');

  if (!profileIcon || !profileDropdown) {
    console.warn('Profile dropdown elements not found');
    return;
  }

  // Toggle dropdown when profile icon is clicked
  profileIcon.addEventListener('click', function(e) {
    if (api && api.isLoggedIn && api.isLoggedIn()) {
      e.preventDefault();
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (confirm('Are you sure you want to logout?')) {
        api.logout();
        
        // Show notification if available
        if (typeof showNotification === 'function') {
          showNotification('Logged out successfully', 'You have been logged out.', 'success');
        }
        
        // Update UI
        profileDropdown.classList.remove('show');
        updateNavbarAccountLink();
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    });
  }
}

// Get user initials from name
function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Update navbar account link based on login status
function updateNavbarAccountLink() {
  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  
  if (!profileIcon) {
    console.warn('Profile icon not found');
    return;
  }
  
  if (api && api.isLoggedIn && api.isLoggedIn()) {
    const user = api.getCurrentUser();
    if (user) {
      // Update profile icon with user initials
      const userInitials = getInitials(user.username);
      profileIcon.innerHTML = userInitials;
      profileIcon.className = 'navbar-user-avatar';
      profileIcon.title = `Logged in as ${user.username}`;
      profileIcon.style.cursor = 'pointer';
      profileIcon.href = '#'; // Prevent navigation when logged in
      
      // Update dropdown header with user info
      if (dropdownUserName) dropdownUserName.textContent = user.username || 'User';
      if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || '';
      
      // Show dropdown functionality
      if (profileDropdown) {
        profileDropdown.style.display = 'block';
      }
      
      console.log('Navbar updated for logged-in user:', user.username);
    }
  } else {
    // Not logged in - show regular icon
    profileIcon.href = 'account.html';
    profileIcon.innerHTML = '<i class="fa-solid fa-user" style="color: #ffffff;"></i>';
    profileIcon.className = 'icon-link';
    profileIcon.title = 'Login or Sign Up';
    profileIcon.style.cursor = 'pointer';
    
    // Hide dropdown
    if (profileDropdown) {
      profileDropdown.style.display = 'none';
      profileDropdown.classList.remove('show');
    }
    
    console.log('Navbar updated for guest user');
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure api client is initialized
    setTimeout(() => {
      updateNavbarAccountLink();
      initializeProfileDropdown();
    }, 100);
  });
} else {
  // DOM already loaded
  setTimeout(() => {
    updateNavbarAccountLink();
    initializeProfileDropdown();
  }, 100);
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.initializeProfileDropdown = initializeProfileDropdown;
  window.updateNavbarAccountLink = updateNavbarAccountLink;
  window.getInitials = getInitials;
}
