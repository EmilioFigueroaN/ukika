'use strict';

const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const closeMenu = () => {
  nav.classList.remove('open');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

menuBtn.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('.faq-q').forEach(button => {
  const item = button.closest('.faq-item');
  button.setAttribute('aria-expanded', String(item.classList.contains('open')));
  button.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
}

const form = document.getElementById('contactForm');
const submitButton = document.getElementById('contactSubmit');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitButton.disabled) return;

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.consent = form.elements.consent.checked;
  status.textContent = '';
  status.className = 'form-status';
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando consulta…';
  form.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'No se pudo enviar la consulta. Inténtalo nuevamente.');
    }

    status.textContent = 'Tu consulta fue recibida correctamente. Nos pondremos en contacto contigo.';
    status.className = 'form-status is-success';
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Ocurrió un error. Puedes escribir directamente a info@ukika.cl.';
    status.className = 'form-status is-error';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar consulta';
    form.removeAttribute('aria-busy');
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
