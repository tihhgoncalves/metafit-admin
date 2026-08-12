const metaFitApiScriptUrl = document.currentScript?.src;

window.MetaFitApi = (() => {
  const tokenKey = 'metafit_admin_token';
  const userKey = 'metafit_admin_user';
  const request = ({ method = 'GET', path, data, authenticated = true }) => {
    const operation = $.ajax({ url: `${window.METAFIT_CONFIG.apiUrl}${path}`, method, contentType: 'application/json', dataType: 'json', data: data ? JSON.stringify(data) : undefined, headers: authenticated && localStorage.getItem(tokenKey) ? { Authorization: `Bearer ${localStorage.getItem(tokenKey)}` } : {} });
    if (authenticated) operation.fail((error) => { if (error.status === 401 || error.status === 403) { clearSession(); window.location.replace('/login'); } });
    return operation;
  };
  const messageFrom = (error) => error.responseJSON?.message || 'Não foi possível concluir a operação. Tente novamente.';
  const saveSession = ({ token, user }) => { localStorage.setItem(tokenKey, token); localStorage.setItem(userKey, JSON.stringify(user)); };
  const clearSession = () => { localStorage.removeItem(tokenKey); localStorage.removeItem(userKey); };
  const currentUser = () => { try { return JSON.parse(localStorage.getItem(userKey)); } catch { return null; } };
  const protect = () => { const user = currentUser(); if (!localStorage.getItem(tokenKey) || !user || user.tipo !== 'admin') { clearSession(); window.location.replace('/login'); return false; } return true; };
  return { request, messageFrom, saveSession, clearSession, currentUser, protect };
})();

$(function () {
  $('<style>body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Ubuntu,Cantarell,"Noto Sans",sans-serif,"Helvetica Neue","Liberation Sans",Arial,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}.system-footer{position:fixed;right:24px;bottom:18px;z-index:10;color:#717171;font:10px "DM Mono",monospace;letter-spacing:.01em}.system-footer a{color:inherit;text-decoration:none}.system-footer a:hover{color:#e7236d}.app-page .system-footer{right:32px}.auth-page .system-footer{right:auto;left:calc((100% - 33.333%) / 2);transform:translateX(-50%)}@media(max-width:900px){.auth-page .system-footer{left:50%}}</style>').appendTo('head');
  const footer = $('<footer class="system-footer">© Todos os direitos reservados a <a href="https://rocketprodutora.com.br" target="_blank" rel="noopener">Rocket Produtora Digital</a> · <span class="system-version"></span></footer>').appendTo('body');

  if (footer.hasClass('server-footer')) return;

  $.getJSON(new URL('../../package.json', metaFitApiScriptUrl))
    .done((manifest) => footer.find('.system-version').text(`v${manifest.version}`))
    .fail(() => footer.find('.system-version').text('v—'));
});
