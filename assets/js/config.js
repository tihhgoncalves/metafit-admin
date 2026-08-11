(() => {
  const request = new XMLHttpRequest();
  request.open('GET', new URL('../../config/config.php', document.currentScript.src), false);
  request.send();

  if (request.status !== 200) throw new Error('Não foi possível carregar a configuração do ambiente.');
  window.METAFIT_CONFIG = JSON.parse(request.responseText);
})();
