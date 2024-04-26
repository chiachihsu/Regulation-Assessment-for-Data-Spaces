document.addEventListener('DOMContentLoaded', function() {
    const navbarContainer = document.querySelector('.navbarContainer');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { // 若滾動超過50像素\
            navbarContainer.classList.add('scrolled');
        } else {
            navbarContainer.classList.remove('scrolled');
        }
    });

    const navLinksA = document.querySelectorAll('.navbar-links a');
    navLinksA.forEach(link => {
        link.addEventListener('click', function() {
            navLinksA.forEach(node => node.classList.remove('active'));

            this.classList.add('active');
        });
    });

    const navbarToggle = document.getElementById('navbarToggle');
    const navbarLinks = document.querySelector('.navbar-links');

    navbarToggle.addEventListener('click', function() {
        navbarLinks.classList.toggle('open');
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 1000 && navbarLinks.classList.contains('open')) {
            navbarLinks.classList.remove('open');
        }
    });
});
5