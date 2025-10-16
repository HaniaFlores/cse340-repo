document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#updateForm");
  if (!form) return;

  const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
  if (!submitBtn) return;

  const enable = () => submitBtn.removeAttribute("disabled");
  form.addEventListener("input", enable);
  form.addEventListener("change", enable);
});