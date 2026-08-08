$(function () {
  if (!MetaFitApi.protect()) return;
  const userId = new URLSearchParams(window.location.search).get('id') ?? window.location.pathname.match(/^\/users\/([a-f\d]{24})\/?$/i)?.[1] ?? null;
  const isEditing = Boolean(userId);
  const formatDate = (value, withTime = false) => value ? new Intl.DateTimeFormat('pt-BR', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }).format(new Date(value)) : 'Não informado';
  const setText = (selector, value) => $(selector).text(value || 'Não informado');

  if (isEditing) {
    $('#page-title').text('Detalhes do usuário');
    $('#page-description').text('Consulte as informações e atualize os dados permitidos.');
    $('#user-whatsapp').prop('readonly', true); $('#whatsapp-edit-note').removeClass('d-none');
    $('#user-submit').text('Salvar alterações');
    MetaFitApi.request({ path: `/users/${userId}` }).done(({ user }) => {
      $('#user-nome').val(user.nome || ''); $('#user-nome-preferido').val(user.nome_preferido || ''); $('#user-email').val(user.email || ''); $('#user-whatsapp').val(user.whatsapp || ''); $('#user-data-nascimento').val(user.data_nascimento || ''); $('#user-sexo').val(user.sexo || 'nao_informado');
      $('#account-details').removeClass('d-none');
      setText('#detail-situacao', user.situacao); setText('#detail-whatsapp', formatDate(user.ultima_mensagem_whatsapp_em, true)); setText('#detail-login', formatDate(user.ultimo_login, true)); setText('#detail-created', formatDate(user.created_at, true));
      setText('#detail-onboarding', user.triagem_concluida ? 'Concluído' : 'Pendente'); setText('#detail-billing', user.cobranca?.situacao); setText('#detail-channel', user.canais?.some((channel) => channel.canal === 'whatsapp' && channel.ativo) ? 'Vinculado' : 'Não vinculado');
    }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none'));
  }

  $('#user-page-form').on('submit', function (event) {
    event.preventDefault(); const form = this; const button = $('#user-submit'); const alert = $('#page-alert');
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const data = { nome: $('#user-nome').val(), nome_preferido: $('#user-nome-preferido').val() || null, email: $('#user-email').val(), data_nascimento: $('#user-data-nascimento').val() || null, sexo: $('#user-sexo').val() };
    if (!isEditing) data.whatsapp = $('#user-whatsapp').val();
    alert.addClass('d-none'); button.prop('disabled', true).text(isEditing ? 'Salvando...' : 'Cadastrando...');
    MetaFitApi.request({ method: isEditing ? 'PATCH' : 'POST', path: isEditing ? `/users/${userId}` : '/users/admin', data }).done((result) => window.location.assign(isEditing ? '/users' : `/users/${result.id}`)).fail((error) => alert.text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false).text(isEditing ? 'Salvar alterações' : 'Cadastrar usuário'));
  });
});
