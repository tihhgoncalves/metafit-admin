$(function () {
  if (!MetaFitApi.protect()) return;
  $('.sidebar').append('<button type="button" class="mobile-nav-toggle" aria-label="Abrir menu"><i class="bi bi-list"></i></button>');
  $('.mobile-nav-toggle').on('click', function (event) { event.stopPropagation(); $('.sidebar').toggleClass('nav-open'); });
  $('.sidebar-nav-menu').on('click', function (event) { event.stopPropagation(); $(this).closest('.sidebar-nav-dropdown').toggleClass('is-open'); });
  $(document).on('click', () => { $('.sidebar-nav-dropdown').removeClass('is-open'); $('.sidebar').removeClass('nav-open'); });
  let dashboard = null;
  const formatMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((value ?? 0) / 100);
  const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
  const formatRelativeDate = (value) => { if (!value) return '—'; const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return 'agora'; const units = [[86400, 'dia'], [3600, 'hora'], [60, 'minuto']]; const [size, label] = units.find(([unit]) => seconds >= unit) ?? [1, 'segundo']; const amount = Math.floor(seconds / size); return `há ${amount} ${label}${amount === 1 ? '' : 's'}`; };
  const escapeHtml = (value) => $('<div>').text(value ?? '').html();
  const situationLabel = (value) => ({ ativo: 'Ativo', visitante: 'Visitante', triagem: 'Em triagem', aguardando_ativacao: 'Aguardando ativação' })[value] ?? value;
  const render = () => {
    const metrics = dashboard.metrics;
    $('#dashboard-metrics').html(`<article class="dashboard-metric metric-active"><span><i class="bi bi-heart-pulse"></i> Usuários ativos</span><strong>${metrics.active_users}</strong><small>${metrics.users_by_situation.triagem ?? 0} em triagem</small></article><article class="dashboard-metric metric-online"><span><i class="bi bi-broadcast-pin"></i> Online agora</span><strong>${metrics.online_users}</strong><small>Mensagens nas últimas 3 horas</small></article><article class="dashboard-metric metric-revenue"><span><i class="bi bi-cash-coin"></i> Faturado este mês</span><strong>${formatMoney(metrics.revenue_current_month_cents)}</strong><small>${metrics.revenue_change_percent === null ? 'Sem comparação anterior' : `${metrics.revenue_change_percent >= 0 ? '+' : ''}${metrics.revenue_change_percent}% vs. mês anterior`}</small></article>`);
    const maxRevenue = Math.max(...dashboard.monthly_revenue.map((item) => item.total_cents), 1);
    $('#revenue-chart').html(dashboard.monthly_revenue.map((item) => { const label = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${item.month}-01T12:00:00`)).replace('.', ''); return `<div class="revenue-bar"><span title="${formatMoney(item.total_cents)}" style="height:${Math.max(5, Math.round((item.total_cents / maxRevenue) * 100))}%"></span><small>${label}</small></div>`; }).join(''));
    $('#revenue-comparison').text(`Anterior: ${formatMoney(metrics.revenue_previous_month_cents)}`);
    $('#operations-summary').html(`<a href="/atendimentos"><strong>${metrics.today_follow_ups}</strong><span>ações previstas para hoje</span></a><a href="/atendimentos"><strong class="text-danger">${metrics.overdue_follow_ups}</strong><span>ações em atraso</span></a>`);
    renderRecentUsers();
  };
  const renderRecentUsers = () => { const situation = $('#recent-users-filter').val(); const users = dashboard.recent_users.filter((user) => !situation || user.situation === situation); $('#recent-users-list').html(users.length ? users.map((user) => `<a href="/users/${user.id}" class="dashboard-recent-user"><span class="dashboard-user-avatar">${escapeHtml((user.preferred_name || user.name || '?').slice(0, 1))}</span><span><strong>${escapeHtml(user.preferred_name || user.name)}</strong><small>${escapeHtml(user.email || user.whatsapp || 'Sem contato')}</small></span><span class="dashboard-user-meta"><em>${escapeHtml(situationLabel(user.situation))}</em><small title="${formatDate(user.last_whatsapp_message_at)}">${formatRelativeDate(user.last_whatsapp_message_at)}</small></span></a>`).join('') : '<p class="text-muted mb-0">Nenhum contato encontrado para este filtro.</p>'); };
  const loadDashboard = () => { $('#dashboard-refresh').prop('disabled', true); MetaFitApi.request({ path: '/dashboard' }).done((result) => { dashboard = result; render(); }).fail((error) => $('#page-alert').text(MetaFitApi.messageFrom(error)).removeClass('d-none')).always(() => $('#dashboard-refresh').prop('disabled', false)); };
  $('#dashboard-refresh').on('click', loadDashboard); $('#recent-users-filter').on('change', renderRecentUsers); $('#logout-button').on('click', () => MetaFitApi.request({ method: 'POST', path: '/auth/logout' }).always(() => { MetaFitApi.clearSession(); location.assign('/login'); }));
  loadDashboard();
});
