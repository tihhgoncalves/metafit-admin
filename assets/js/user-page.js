$(function () {
  if (!MetaFitApi.protect()) return;
  const userId = new URLSearchParams(window.location.search).get('id') ?? window.location.pathname.match(/^\/users\/([a-f\d]{24})\/?$/i)?.[1] ?? null;
  const isEditing = Boolean(userId);
  $('#logout-button').on('click', () => { MetaFitApi.request({ method: 'POST', path: '/auth/logout' }).always(() => { MetaFitApi.clearSession(); window.location.replace('/login'); }); });
  $('.form-select').css({ appearance: 'auto', '-webkit-appearance': 'menulist' });
  const formatDate = (value, withTime = false) => value ? new Intl.DateTimeFormat('pt-BR', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }).format(new Date(value)) : 'Não informado';
  const setText = (selector, value) => $(selector).text(value || 'Não informado');
  const statusLabel = (value) => ({ visitante: 'Novo usuário', triagem: 'Em triagem', aguardando_ativacao: 'Aguardando ativação (pagamento)', ativo: 'Ativo' })[value] ?? 'Não informado';
  const relativeDate = (value) => { const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); const days = Math.floor(minutes / 1440); const hours = Math.floor((minutes % 1440) / 60); const remainingMinutes = minutes % 60; if (days) return `há ${days} ${days === 1 ? 'dia' : 'dias'}${hours ? ` e ${hours} ${hours === 1 ? 'hora' : 'horas'}` : ''}`; if (hours) return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}${remainingMinutes ? ` e ${remainingMinutes} min` : ''}`; return minutes < 1 ? 'agora mesmo' : `há ${minutes} min`; };
  const setRelativeDate = (selector, value) => { const element = $(selector); if (!value) return element.text('Não informado').removeAttr('title'); return element.text(relativeDate(value)).attr('title', formatDate(value, true)); };

  const formatMoney = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);
  const escapeHtml = (value) => $('<div>').text(value).html();
  const conversationDirectionLabel = (direction) => direction === 'received' ? 'Recebida' : 'Enviada';
  const conversationTypeLabel = (type) => ({ text: 'Texto', audio: 'Áudio', image: 'Imagem', video: 'Vídeo', document: 'Documento', sticker: 'Figurinha', interactive: 'Interativa', contacts: 'Contato', template: 'Template' })[type] ?? (type || 'Não informado');
  const conversationStatusLabel = (status) => ({ aceita: 'Aceita', enviada: 'Enviada', entregue: 'Entregue', lida: 'Lida', falhou: 'Falhou' })[status] ?? 'Sem status';
  const conversationMessageText = (message) => {
    if (message.type === 'image') {
      const text = message.content?.text?.trim();
      if (!text || text === '[Imagem recebida]' || text === '[Imagem enviada]') return '[IMAGEM]';
      return text.startsWith('[IMAGEM]') ? text : `[IMAGEM]\n${text}`;
    }
    if (message.content?.text) return message.content.text;
    if (message.content?.template?.name) return `Template: ${message.content.template.name}`;
    if (message.type) return `[${message.type === 'image' ? 'Imagem' : message.type}]`;
    return 'Mensagem sem conteúdo de texto.';
  };
  const renderConversation = (messages) => messages.length ? messages.map((message) => {
    const received = message.direction === 'received';
    const error = message.error?.message ? `<div class="conversation-message-error">Falha: ${escapeHtml(message.error.message)}</div>` : '';
    return `<article class="conversation-message ${received ? 'conversation-message-received' : 'conversation-message-sent'}"><div class="conversation-message-meta"><strong>${conversationDirectionLabel(message.direction)}</strong><span>${escapeHtml(conversationTypeLabel(message.type))} · ${escapeHtml(formatDate(message.status_at || message.created_at, true))} · ${conversationStatusLabel(message.status)}</span></div><div class="conversation-message-text">${escapeHtml(conversationMessageText(message)).replace(/\n/g, '<br>')}</div>${error}</article>`;
  }).join('') : '<p class="text-muted mb-0">Nenhuma mensagem de WhatsApp foi registrada para este usuário.</p>';
  const paymentMethodLabel = (value) => ({ pix: 'PIX', dinheiro: 'Dinheiro', transferencia: 'Transferência', cartao: 'Cartão', bonificacao: 'Bonificação', outro: 'Outro' })[value] ?? 'Não informado';
  const auditDetails = (note) => { const details = note.details; if (!details) return ''; const items = []; if (details.valorCentavos !== undefined) items.push(`Valor: ${formatMoney(details.valorCentavos)}`); if (details.diasCredito !== undefined) items.push(`Crédito: ${details.diasCredito} dias`); if (details.formaPagamento) items.push(`Forma: ${paymentMethodLabel(details.formaPagamento)}`); if (details.pagaEm) items.push(`Pago em: ${formatDate(details.pagaEm, true)}`); if (details.novoStatus) items.push(`Novo status: ${details.novoStatus}`); const summary = items.length ? `<div class="small text-muted mt-1">${items.map(escapeHtml).join(' · ')}</div>` : ''; const observation = details.observacao ? `<div class="small mt-2">${escapeHtml(details.observacao)}</div>` : ''; return summary + observation; };
  const detailLabels = { instrucoesIa: 'Preferências e instruções de atendimento', respostas: 'Respostas da triagem' };
  const renderAccountEventDetails = (details) => Object.entries(details ?? {}).map(([key, value]) => `<div class="mb-3"><div class="small text-muted mb-1">${escapeHtml(detailLabels[key] ?? key)}</div><div class="border rounded p-3 bg-light">${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}</div></div>`).join('') || '<p class="text-muted mb-0">Não há detalhes adicionais para este evento.</p>';
  const eventCategoryLabel = (category) => ({ peso: 'Peso', altura: 'Altura', agua: 'Água', alimentacao: 'Alimentação', dose: 'Medicamento' })[category] ?? category;
  const eventSourceLabel = (source) => ({ app: 'App', whatsapp: 'WhatsApp', triagem: 'Triagem', ia: 'IA', api: 'API' })[source] ?? source;
  const eventDataSummary = (event) => {
    if (event.description) return event.description;
    const data = event.data ?? {};
    if (event.category === 'agua') return data.total_ml !== undefined ? `${data.total_ml} ml` : 'Quantidade não informada';
    if (event.category === 'alimentacao') {
      const nutrients = [`${data.calorias ?? 0} kcal`, data.proteinas !== undefined ? `${data.proteinas} g proteínas` : null].filter(Boolean);
      return nutrients.join(' · ') || 'Nutrientes não informados';
    }
    if (data.value !== undefined) return String(data.value);
    return Object.keys(data).length ? JSON.stringify(data) : 'Sem detalhes';
  };
  const eventDataLabels = { calorias: 'Calorias', proteinas: 'Proteínas', carboidratos: 'Carboidratos', gorduras: 'Gorduras', fibras: 'Fibras', acucares: 'Açúcares', agua_ml: 'Água', total_ml: 'Água', value: 'Valor', itens: 'Itens' };
  const formatEventValue = (key, value) => {
    if (key === 'itens') return Array.isArray(value) ? value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n') : JSON.stringify(value);
    if (['proteinas', 'carboidratos', 'gorduras', 'fibras', 'acucares'].includes(key)) return `${value} g`;
    if (['agua_ml', 'total_ml'].includes(key)) return `${value} ml`;
    if (key === 'calorias') return `${value} kcal`;
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };
  const renderUserEventDetails = (event) => {
    const fields = [
      ['Data e hora', formatDate(event.date_time, true)],
      ['Tipo', eventCategoryLabel(event.category)],
      ['Origem', eventSourceLabel(event.source)],
      ...(event.description ? [['Descrição', event.description]] : []),
      ...Object.entries(event.data ?? {}).map(([key, value]) => [eventDataLabels[key] ?? key, formatEventValue(key, value)])
    ];
    return fields.map(([label, value]) => `<div class="mb-3"><div class="small text-muted mb-1">${escapeHtml(label)}</div><div class="border rounded p-3 bg-light" style="white-space:pre-wrap">${escapeHtml(value)}</div></div>`).join('');
  };
  let userEvents = [];
  const loadUserEvents = () => MetaFitApi.request({ path: `/users/${userId}/events?limite=100` }).done(({ events, total }) => {
    const records = events ?? []; userEvents = records;
    $('#user-events-section').removeClass('d-none');
    $('#user-events-summary').text(`${total} ${total === 1 ? 'registro' : 'registros'} exibidos`);
    $('#user-events-list').html(records.length ? records.map((event, index) => `<tr><td class="text-nowrap">${escapeHtml(formatDate(event.date_time, true))}</td><td>${escapeHtml(eventCategoryLabel(event.category))}</td><td>${escapeHtml(eventDataSummary(event))}</td><td>${escapeHtml(eventSourceLabel(event.source))}</td><td class="text-end"><button type="button" class="btn btn-sm btn-outline-secondary view-user-event-details" data-event-index="${index}" title="Ver detalhes" aria-label="Ver detalhes"><i class="bi bi-info-circle"></i></button></td></tr>`).join('') : '<tr><td colspan="5" class="text-muted">Nenhum registro encontrado para este usuário.</td></tr>');
  }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none'));
  let accountHistory = [];
  const invoiceStatus = (status) => ({ pendente: '<span class="badge rounded-pill text-bg-warning">Pendente</span>', paga: '<span class="badge rounded-pill text-bg-success">Paga</span>', cancelada: '<span class="badge rounded-pill text-bg-secondary">Cancelada</span>' })[status] ?? status;
  const loadInvoices = () => MetaFitApi.request({ path: `/invoices/users/${userId}/invoices` }).done(({ invoices }) => { $('#invoices-section').removeClass('d-none'); $('#invoices-summary').text(`${invoices.length} ${invoices.length === 1 ? 'fatura' : 'faturas'}`); $('#invoices-list').html(invoices.length ? invoices.map((invoice) => `<tr><td>${formatDate(invoice.issued_at)}</td><td>${formatMoney(invoice.amount_cents)}</td><td>${invoice.credit_days} dias</td><td>${invoiceStatus(invoice.status)}</td><td>${invoice.paid_at ? formatDate(invoice.paid_at, true) : '—'}</td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-secondary view-invoice-history" data-invoice-id="${invoice.id}" title="Ver histórico" aria-label="Ver histórico"><i class="bi bi-clock-history"></i></button>${invoice.status === 'pendente' && invoice.pix?.copy_paste_code ? `<button class="btn btn-sm btn-outline-secondary ms-1 view-invoice-pix" data-invoice-id="${invoice.id}" title="Ver PIX" aria-label="Ver PIX"><i class="bi bi-qr-code"></i></button>` : ''}${['pendente', 'cancelada'].includes(invoice.status) ? `<button class="btn btn-sm btn-primary ms-1 mark-invoice-paid" data-invoice-id="${invoice.id}" title="Confirmar pagamento" aria-label="Confirmar pagamento"><i class="bi bi-check-lg"></i></button>` : ''}${invoice.status === 'paga' ? `<button class="btn btn-sm btn-outline-danger ms-1 reverse-invoice-payment" data-invoice-id="${invoice.id}" title="Estornar pagamento" aria-label="Estornar pagamento"><i class="bi bi-arrow-counterclockwise"></i></button>` : ''}</td></tr>`).join('') : '<tr><td colspan="6" class="text-muted">Nenhuma fatura registrada.</td></tr>'); });

  const accessDuration = (expiresAt) => { if (!expiresAt) return '<span class="badge text-bg-secondary">Sem crédito</span>'; const days = Math.ceil(Math.abs(new Date(expiresAt) - new Date()) / 86400000); return new Date(expiresAt) > new Date() ? `<span class="badge text-bg-success">Ativo por mais ${days} ${days === 1 ? 'dia' : 'dias'}</span>` : `<span class="badge text-bg-danger">Expirado há ${days} ${days === 1 ? 'dia' : 'dias'}</span>`; };
  $('#account-history-section').insertAfter('#invoices-section');
  $('#account-history-list').css({ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' });
  const renderAccountHistory = () => { $('#account-history-section').removeClass('d-none'); $('#account-history-list').html(accountHistory.length ? accountHistory.map((event, index) => `<div class="border-bottom py-3 d-flex align-items-center justify-content-between gap-3"><div><div class="fw-medium">${escapeHtml(event.description)}</div><small class="text-muted d-block">${formatDate(event.created_at, true)}</small><small class="text-muted">Responsável: ${escapeHtml(event.responsible || 'Não informado')}</small></div>${event.details ? `<button type="button" class="btn btn-sm btn-outline-secondary view-account-history-details" data-event-index="${index}" title="Ver detalhes" aria-label="Ver detalhes"><i class="bi bi-info-circle"></i></button>` : ''}</div>`).join('') : '<p class="text-muted mb-0">Nenhum evento de conta registrado.</p>'); };
  const loadAccountHistory = () => MetaFitApi.request({ path: `/users/${userId}/account-history?limit=100` }).done(({ history }) => { accountHistory = history ?? []; renderAccountHistory(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none'));
  const loadUserDetails = () => MetaFitApi.request({ path: `/users/${userId}` }).done(({ user }) => {
    $('#user-nome').val(user.nome || ''); $('#user-nome-preferido').val(user.nome_preferido || ''); $('#user-instrucoes-ia').val(user.instrucoes_ia || ''); $('#user-email').val(user.email || ''); $('#user-whatsapp').val(user.whatsapp || ''); $('#user-data-nascimento').val(user.data_nascimento || ''); $('#user-sexo').val(user.sexo || 'nao_informado');
    $('#account-details').removeClass('d-none');
    setText('#detail-situacao', statusLabel(user.situacao)); setRelativeDate('#detail-whatsapp', user.ultima_mensagem_whatsapp_em); setRelativeDate('#detail-login', user.ultimo_login); setRelativeDate('#detail-created', user.created_at);
    setText('#detail-channel', user.canais?.some((channel) => channel.canal === 'whatsapp' && channel.ativo) ? 'Vinculado' : 'Não vinculado'); $('#detail-access-duration').html(accessDuration(user.expira_em));
    $('#whatsapp-conversation-title').text(`Conversa recente${user.nome ? ` · ${user.nome}` : ''}`);
  }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none'));
  const refreshBillingData = () => { loadInvoices(); loadUserDetails(); loadAccountHistory(); };

  if (isEditing) {
    $('#page-title').text('Detalhes do usuário');
    $('#page-description').text('Consulte as informações e atualize os dados permitidos.');
    $('#user-whatsapp').prop('readonly', true); $('#whatsapp-edit-note').removeClass('d-none');
    $('#user-submit').text('Salvar alterações');
    $('#view-conversation').removeClass('d-none');
    loadInvoices();
    loadUserDetails();
    loadUserEvents();
    loadAccountHistory();
  }

  const scrollConversationToBottom = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    const modalBody = document.querySelector('#whatsapp-conversation-modal .modal-body');
    if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
  }));
  const loadConversation = () => {
    const buttons = $('#view-conversation, #refresh-conversation').prop('disabled', true);
    const list = $('#whatsapp-conversation-list').html('<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando mensagens...</div>');
    MetaFitApi.request({ path: `/users/${userId}/whatsapp-conversation?limit=100` }).done(({ messages, total }) => {
      $('#whatsapp-conversation-description').text(`${total} ${total === 1 ? 'mensagem exibida' : 'mensagens exibidas'} — as mais recentes, em ordem cronológica.`);
      list.html(renderConversation(messages ?? []));
      scrollConversationToBottom();
    }).fail((error) => list.html(`<p class="text-danger mb-0">${escapeHtml(MetaFitApi.messageFrom(error))}</p>`)).always(() => buttons.prop('disabled', false));
  };
  $('#view-conversation').on('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('whatsapp-conversation-modal')).show();
    loadConversation();
  });
  $('#refresh-conversation').on('click', loadConversation);
  $('#whatsapp-conversation-modal').on('shown.bs.modal', scrollConversationToBottom);

  $('#account-history-list').on('click', '.view-account-history-details', function () { const event = accountHistory[$(this).data('event-index')]; if (!event) return; $('#account-history-details-content').html(renderAccountEventDetails(event.details)); bootstrap.Modal.getOrCreateInstance(document.getElementById('account-history-details-modal')).show(); });
  $('#user-events-list').on('click', '.view-user-event-details', function () { const event = userEvents[$(this).data('event-index')]; if (!event) return; $('#user-event-details-title').text(`Detalhes · ${eventCategoryLabel(event.category)}`); $('#user-event-details-content').html(renderUserEventDetails(event)); bootstrap.Modal.getOrCreateInstance(document.getElementById('user-event-details-modal')).show(); });

  const manualInvoiceRow = $('#create-invoice').closest('.row');
  manualInvoiceRow.hide(); manualInvoiceRow.prev('h6').hide(); manualInvoiceRow.prev('h6').prev('hr').hide();
  $('#invoices-list').closest('table').after('<div id="invoices-summary" class="small text-muted mt-3"></div>');
  $('#invoices-section .content-card > .d-flex').first().html('<h5 class="mb-0">Faturas</h5><button id="open-manual-invoice" type="button" class="btn btn-sm btn-primary"><i class="bi bi-plus-lg me-1"></i>Nova fatura</button>');
  $('#open-manual-invoice').on('click', () => bootstrap.Modal.getOrCreateInstance(document.getElementById('manual-invoice-modal')).show());
  $('#manual-invoice-form').on('submit', function (event) { event.preventDefault(); const amount = Number($('#manual-invoice-amount').val()); const creditDays = Number($('#manual-invoice-credit-days').val()); if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(creditDays) || creditDays < 0) return; const status = $('#manual-invoice-status').val(); const button = $('#manual-invoice-submit').prop('disabled', true); MetaFitApi.request({ method: 'POST', path: `/invoices/users/${userId}/invoices`, data: { amount_cents: Math.round(amount * 100), credit_days: creditDays, payment_method: $('#manual-invoice-payment-method').val(), ...(status === 'paga' ? { paid_at: new Date().toISOString() } : {}) } }).done(() => { bootstrap.Modal.getInstance(document.getElementById('manual-invoice-modal')).hide(); refreshBillingData(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false)); });
  let confirmationInvoiceId = null;
  $('#invoices-list').on('click', 'button', (event) => event.preventDefault());
  $('#invoices-list').on('click', '.view-invoice-history', function () { const invoiceId = $(this).data('invoice-id'); MetaFitApi.request({ path: `/invoices/users/${userId}/invoices` }).done(({ invoices }) => { const invoice = invoices.find((item) => item.id === invoiceId); if (!invoice) return; const notes = invoice.notes?.length ? invoice.notes.map((note) => `<div class="border-bottom py-3"><div class="fw-medium">${escapeHtml(note.text)}</div>${auditDetails(note)}<small class="text-muted d-block mt-1">${formatDate(note.created_at, true)} · Responsável: ${escapeHtml(note.responsible || 'Não informado')}</small></div>`).join('') : '<p class="text-muted mb-0">Nenhum registro adicional nesta fatura.</p>'; $('#invoice-history-list').html(notes); bootstrap.Modal.getOrCreateInstance(document.getElementById('invoice-history-modal')).show(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')); });
  $('#invoices-list').on('click', '.view-invoice-pix', function () { const invoiceId = $(this).data('invoice-id'); MetaFitApi.request({ path: `/invoices/users/${userId}/invoices` }).done(({ invoices }) => { const invoice = invoices.find((item) => item.id === invoiceId); if (!invoice?.pix?.copy_paste_code) return; $('#pix-copy-paste-code').val(invoice.pix.copy_paste_code); $('#copy-pix-code').text('Copiar'); bootstrap.Modal.getOrCreateInstance(document.getElementById('pix-modal')).show(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')); });
  $('#copy-pix-code').on('click', async function () { await navigator.clipboard.writeText($('#pix-copy-paste-code').val()); $(this).text('Copiado'); });
  let reversalInvoiceId = null;
  $('#invoices-list').on('click', '.reverse-invoice-payment', function () { reversalInvoiceId = $(this).data('invoice-id'); $('#reverse-invoice-status').val('pendente'); $('#reverse-payment-reason').val(''); bootstrap.Modal.getOrCreateInstance(document.getElementById('reverse-payment-modal')).show(); });
  $('#reverse-payment-form').on('submit', function (event) { event.preventDefault(); const reason = $('#reverse-payment-reason').val().trim(); if (!reversalInvoiceId || !reason) { $('#reverse-payment-reason').trigger('focus'); return; } const button = $('#reverse-payment-submit').prop('disabled', true); MetaFitApi.request({ method: 'PATCH', path: `/invoices/${reversalInvoiceId}`, data: { status: $('#reverse-invoice-status').val(), note: `Estorno: ${reason}` } }).done(() => { bootstrap.Modal.getInstance(document.getElementById('reverse-payment-modal')).hide(); refreshBillingData(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false)); });
  $('#invoices-list').on('click', '.mark-invoice-paid', function () { const button = $(this).prop('disabled', true); MetaFitApi.request({ path: `/invoices/users/${userId}/invoices` }).done(({ invoices }) => { const invoice = invoices.find((item) => item.id === button.data('invoice-id')); if (!invoice) return; confirmationInvoiceId = invoice.id; $('#confirm-invoice-amount').val((invoice.amount_cents / 100).toFixed(2)); $('#confirm-credit-days').val(invoice.credit_days); $('#confirm-paid-at').val(new Date().toISOString().slice(0, 16)); $('#confirm-payment-method').val('pix'); $('#confirm-payment-note').val(''); bootstrap.Modal.getOrCreateInstance(document.getElementById('confirm-payment-modal')).show(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false)); });
  $('#confirm-payment-form').on('submit', function (event) { event.preventDefault(); if (!confirmationInvoiceId) return; const button = $('#confirm-payment-submit').prop('disabled', true); MetaFitApi.request({ method: 'PATCH', path: `/invoices/${confirmationInvoiceId}`, data: { status: 'paga', amount_cents: Math.round(Number($('#confirm-invoice-amount').val()) * 100), credit_days: Number($('#confirm-credit-days').val()), paid_at: new Date($('#confirm-paid-at').val()).toISOString(), payment_method: $('#confirm-payment-method').val(), ...( $('#confirm-payment-note').val().trim() ? { note: $('#confirm-payment-note').val().trim() } : {}) } }).done(() => { bootstrap.Modal.getInstance(document.getElementById('confirm-payment-modal')).hide(); refreshBillingData(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false)); });

  $('#user-page-form').on('submit', function (event) {
    event.preventDefault(); const form = this; const button = $('#user-submit'); const alert = $('#page-alert');
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const data = { nome: $('#user-nome').val(), nome_preferido: $('#user-nome-preferido').val() || null, instrucoes_ia: $('#user-instrucoes-ia').val().trim() || null, email: $('#user-email').val(), data_nascimento: $('#user-data-nascimento').val() || null, sexo: $('#user-sexo').val() };
    if (!isEditing) data.whatsapp = $('#user-whatsapp').val();
    alert.addClass('d-none'); button.prop('disabled', true).text(isEditing ? 'Salvando...' : 'Cadastrando...');
    MetaFitApi.request({ method: isEditing ? 'PATCH' : 'POST', path: isEditing ? `/users/${userId}` : '/users/admin', data }).done((result) => window.location.assign(isEditing ? '/users' : `/users/${result.id}`)).fail((error) => alert.text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => button.prop('disabled', false).text(isEditing ? 'Salvar alterações' : 'Cadastrar usuário'));
  });
});
