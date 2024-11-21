function updateNavAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userIcon = document.querySelector('a[href="account.html"]');

    if (currentUser && userIcon) {
        userIcon.href = '#';
        userIcon.title = 'Logout';
        userIcon.innerHTML = '<i class="fas fa-sign-out-alt" style="color: #ffffff;"></i>';
        userIcon.addEventListener('click', logout);
    } else if (userIcon) {
        userIcon.href = 'account.html';
        userIcon.title = 'Account';
        userIcon.innerHTML = '<i class="fas fa-user" style="color: #ffffff;"></i>';
        userIcon.removeEventListener('click', logout);
    }
}

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cart');
    updateNavAuth();
    updateCartCount();
    updateFavoritesCount();
    window.location.href = 'index.html';
}