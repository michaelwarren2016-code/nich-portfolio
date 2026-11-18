const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const siteHeader = document.querySelector('.site-header');

// Header state is tied to the Products scroll threshold, not to whether the
// hero happens to intersect an observer during a smooth anchor transition.
const productsSection = document.querySelector('#products');
const headerHeight = () => siteHeader?.getBoundingClientRect().height || 72;
let headerTicking = false;
function updateHeaderAtProducts() {
  if (!productsSection || !siteHeader) return;
  const triggerY = productsSection.getBoundingClientRect().top + window.scrollY - headerHeight() - 8;
  siteHeader.classList.toggle('has-scrolled', window.scrollY >= triggerY);
  headerTicking = false;
}
function requestHeaderUpdate() {
  if (headerTicking) return;
  headerTicking = true;
  window.requestAnimationFrame(updateHeaderAtProducts);
}
window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
window.addEventListener('resize', requestHeaderUpdate);
window.addEventListener('hashchange', requestHeaderUpdate);
navLinks.forEach(link => link.addEventListener('click', requestHeaderUpdate));
updateHeaderAtProducts();

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}
