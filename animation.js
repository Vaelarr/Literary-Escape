var cards = document.querySelectorAll('.product-box');

[...cards].forEach((card) => {
    card.addEventListener('mouseover', function () {
        card.classList.add('is-hover');
    })
    card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hover');
    })
})

document.addEventListener('DOMContentLoaded', function () {
    const showMoreBtn = document.querySelector('[data-bs-target="#showMoreProducts"]');
    const showMoreText = showMoreBtn.querySelector('.show-more');
    const showLessText = showMoreBtn.querySelector('.show-less');

    document.getElementById('showMoreProducts').addEventListener('shown.bs.collapse', function () {
        showMoreText.classList.add('d-none');
        showLessText.classList.remove('d-none');
    });

    document.getElementById('showMoreProducts').addEventListener('hidden.bs.collapse', function () {
        showMoreText.classList.remove('d-none');
        showLessText.classList.add('d-none');
    });
});