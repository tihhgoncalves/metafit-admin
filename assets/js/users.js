$(function () {
  if (!MetaFitApi.protect()) return;
  const currentUser = MetaFitApi.currentUser();
  $('#user-name').text(currentUser.nome); $('#user-initials').text(currentUser.nome.split(/\s+/).slice(0, 2).map((name) => name[0]).join('').toUpperCase());
  $('.sidebar-bottom').html('<div class="dropdown"><button id="account-menu-toggle" class="btn account-menu-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu da conta"><i class="bi bi-person"></i></button><ul class="dropdown-menu dropdown-menu-end account-menu"><li><button class="dropdown-item" type="button"><i class="bi bi-person me-2"></i>Minha Conta</button></li><li><hr class="dropdown-divider"></li><li><button id="logout-button" class="dropdown-item account-logout" type="button"><i class="bi bi-box-arrow-right me-2"></i>Sair</button></li></ul></div>');
  const dateFormatter = (cell) => { const value = cell.getValue(); return value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'; };
  const lastWhatsAppMessageFormatter = (cell) => { const value = cell.getValue(); return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Sem mensagens'; };
  const badge = (cell, type) => `<span class="badge badge-${type}-${cell.getValue()}">${cell.getValue().replace('_', ' ')}</span>`;
  const table = new Tabulator('#users-table', { layout: 'fitColumns', placeholder: 'Nenhum usuário encontrado.', columns: [
    { title: 'USUÁRIO', field: 'nome', minWidth: 240, formatter: (cell) => `<div class="table-person"><span class="table-avatar">${cell.getValue().slice(0, 1)}</span><div><strong>${cell.getValue()}</strong><small>${cell.getData().email || 'Sem e-mail'}</small></div></div>` },
    { title: 'WHATSAPP', field: 'whatsapp', minWidth: 150, formatter: (cell) => cell.getValue() || '—' },
    { title: 'ÚLTIMA MENSAGEM', field: 'ultima_mensagem_whatsapp_em', width: 175, formatter: lastWhatsAppMessageFormatter },
    { title: 'PERFIL', field: 'tipo', width: 125, formatter: (cell) => badge(cell, 'role') },
    { title: 'SITUAÇÃO', field: 'situacao', width: 180, formatter: (cell) => badge(cell, 'status') },
    { title: 'CADASTRADO EM', field: 'created_at', width: 155, formatter: dateFormatter }
  ] });
  function loadUsers() { $('#users-count').text('Carregando...'); MetaFitApi.request({ path: '/users' }).done((result) => { table.replaceData(result.users); $('#users-count').text(`${result.total} ${result.total === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}`); }).fail((error) => { $('#users-count').text(''); if (error.status === 401 || error.status === 403) { MetaFitApi.clearSession(); window.location.replace('/login'); } }); }
  const typeFilter = $('<select id="users-type-filter" class="form-select form-select-sm"><option value="">Todos os perfis</option><option value="admin">Somente administradores</option><option value="usuario">Somente usuários</option></select>');
  typeFilter.insertAfter($('.table-toolbar .search-box'));
  let searchTerm = '';
  let selectedType = '';
  const applyFilters = () => table.setFilter((data) => {
    const searchable = `${data.nome || ''} ${data.email || ''} ${data.whatsapp || ''}`.toLowerCase();
    return (!searchTerm || searchable.includes(searchTerm)) && (!selectedType || data.tipo === selectedType);
  });
  loadUsers();
  $('#users-search').on('input', function () { searchTerm = $(this).val().trim().toLowerCase(); applyFilters(); });
  typeFilter.on('change', function () { selectedType = $(this).val(); applyFilters(); });
  $('.fluid-select').select2({ dropdownParent: $('#user-modal'), minimumResultsForSearch: Infinity, width: '100%' });
  $('#user-modal').on('hidden.bs.modal', () => { $('#user-form')[0].reset(); $('#user-form').removeClass('was-validated'); $('#user-alert').addClass('d-none'); $('#user-tipo').val('usuario').trigger('change'); });
  $('#user-form').on('submit', function (event) { event.preventDefault(); const form = this; const button = $('#user-submit'); const alert = $('#user-alert'); if (!form.checkValidity()) { form.classList.add('was-validated'); return; } button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando'); alert.addClass('d-none'); MetaFitApi.request({ method: 'POST', path: '/users/admin', data: { nome: $('#user-nome').val(), email: $('#user-email').val(), whatsapp: $('#user-whatsapp').val(), senha: $('#user-senha').val(), tipo: $('#user-tipo').val() } }).done(() => { bootstrap.Modal.getInstance(document.getElementById('user-modal')).hide(); loadUsers(); }).fail((error) => alert.text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false).text('Cadastrar usuário')); });
  $('#logout-button').on('click', () => { MetaFitApi.request({ method: 'POST', path: '/auth/logout' }).always(() => { MetaFitApi.clearSession(); window.location.replace('/login'); }); });
});
