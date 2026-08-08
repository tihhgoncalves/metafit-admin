$(function () {
  if (MetaFitApi.currentUser()?.tipo === 'admin') window.location.replace('/users');
  $('.password-toggle').on('click', function () { const field = $('#senha'); const visible = field.attr('type') === 'text'; field.attr('type', visible ? 'password' : 'text'); $(this).find('i').toggleClass('bi-eye bi-eye-slash'); });
  $('#login-form').on('submit', function (event) {
    event.preventDefault(); const form = this; const button = $('#login-submit'); const alert = $('#login-alert');
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    alert.addClass('d-none'); button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Entrando');
    MetaFitApi.request({ method: 'POST', path: '/auth/login', authenticated: false, data: { email: $('#email').val(), senha: $('#senha').val() } })
      .done((result) => { if (result.user.tipo !== 'admin') { alert.text('Esta conta não possui acesso administrativo.').removeClass('d-none'); return; } MetaFitApi.saveSession(result); window.location.replace('/users'); })
      .fail((error) => alert.text(MetaFitApi.messageFrom(error)).removeClass('d-none'))
      .always(() => button.prop('disabled', false).html('Entrar <i class="bi bi-arrow-right ms-2"></i>'));
  });
});
