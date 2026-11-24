// Menu mobile : ouverture / fermeture accessible
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const status = contactForm.querySelector('.form-status');
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours...';
      status.textContent = '';
      status.className = 'form-status';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Impossible d'envoyer le message.");
        }

        contactForm.reset();
        status.textContent = 'Votre message a bien été envoyé.';
        status.classList.add('is-success');
      } catch (error) {
        status.textContent = error.message || "Une erreur est survenue lors de l'envoi.";
        status.classList.add('is-error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer le message';
      }
    });
  }

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-header nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#"]')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const linkBySectionId = new Map(
    sectionLinks.map((link) => [link.getAttribute('href').slice(1), link])
  );

  const setActiveLink = (sectionId) => {
    const activeLink = linkBySectionId.get(sectionId) || linkBySectionId.get('accueil');
    if (!activeLink) return;

    sectionLinks.forEach((link) => {
      if (link === activeLink) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visibleSection = entries.find((entry) => entry.isIntersecting);
    if (visibleSection) setActiveLink(visibleSection.target.id);
  }, {
    rootMargin: '-25% 0px -65% 0px',
    threshold: 0
  });

  sections.forEach((section) => observer.observe(section));

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const dots = carousel.querySelector('.carousel-dots');
    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    const showSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });
      [...dots.children].forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
        dot.setAttribute('aria-current', dotIndex === currentIndex ? 'true' : 'false');
      });
    };

    slides.forEach((_, slideIndex) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Afficher l'image ${slideIndex + 1}`);
      dot.addEventListener('click', () => showSlide(slideIndex));
      dots.append(dot);
    });

    carousel.querySelector('.carousel-previous').addEventListener('click', () => {
      showSlide(currentIndex - 1);
    });
    carousel.querySelector('.carousel-next').addEventListener('click', () => {
      showSlide(currentIndex + 1);
    });
    showSlide(currentIndex);
  });
});
