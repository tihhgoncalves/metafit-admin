<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Usuário · MetaFit Admin</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="/assets/css/style.css?v=0.1.3" rel="stylesheet">
</head>
<body class="app-page">
  <aside class="sidebar"><a class="brand" href="/users">MetaFit</a><nav class="sidebar-nav"><a class="active" href="/users"><i class="bi bi-people"></i> Usuários</a></nav><div class="sidebar-bottom"></div></aside>
  <main class="main-content">
    <header class="page-header">
      <div><a class="text-decoration-none small text-muted" href="/users"><i class="bi bi-arrow-left me-1"></i>Usuários</a><h1 id="page-title" class="mt-2">Novo usuário</h1><p id="page-description" class="text-muted mb-0">Cadastre uma pessoa para acessar a plataforma.</p></div>
    </header>
    <div id="page-alert" class="alert alert-danger d-none" role="alert"></div>
    <form id="user-page-form" novalidate>
      <div class="row g-4">
        <section class="col-12"><div class="content-card">
          <h5 class="mb-4">Informações pessoais</h5>
          <div class="row g-3">
            <div class="col-md-7"><label class="form-label" for="user-nome">Nome completo</label><input class="form-control" id="user-nome" required></div>
            <div class="col-md-5"><label class="form-label" for="user-nome-preferido">Nome preferido</label><input class="form-control" id="user-nome-preferido"></div>
            <div class="col-md-7"><label class="form-label" for="user-email">E-mail</label><input class="form-control" type="email" id="user-email" required></div>
            <div class="col-md-5"><label class="form-label" for="user-whatsapp">WhatsApp</label><input class="form-control" id="user-whatsapp" required placeholder="(00) 00000-0000"><small id="whatsapp-edit-note" class="form-text d-none">A alteração do WhatsApp seguirá um protocolo específico.</small></div>
            <div class="col-md-6"><label class="form-label" for="user-data-nascimento">Data de nascimento</label><input class="form-control" type="date" id="user-data-nascimento"></div>
            <div class="col-md-6"><label class="form-label" for="user-sexo">Sexo</label><select class="form-select" id="user-sexo"><option value="nao_informado">Não informado</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option><option value="outro">Outro</option></select></div>
          </div>
        </div></section>
        <section id="account-details" class="col-12 d-none"><div class="content-card"><h5 class="mb-4">Detalhes do registro</h5><div class="row g-3 small">
          <div class="col-md-3"><span class="text-muted d-block">Situação</span><strong id="detail-situacao">—</strong></div><div class="col-md-3"><span class="text-muted d-block">Última mensagem no WhatsApp</span><strong id="detail-whatsapp">—</strong></div><div class="col-md-3"><span class="text-muted d-block">Último login</span><strong id="detail-login">—</strong></div><div class="col-md-3"><span class="text-muted d-block">Criado em</span><strong id="detail-created">—</strong></div>
          <div class="col-md-3"><span class="text-muted d-block">Cadastro inicial</span><strong id="detail-onboarding">—</strong></div><div class="col-md-3"><span class="text-muted d-block">Assinatura</span><strong id="detail-billing">—</strong></div><div class="col-md-3"><span class="text-muted d-block">Canal WhatsApp</span><strong id="detail-channel">—</strong></div>
        </div></div></section>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-4"><a class="btn btn-light" href="/users">Cancelar</a><button id="user-submit" class="btn btn-primary" type="submit">Cadastrar usuário</button></div>
    </form>
  </main>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script><script src="/assets/js/config.js?v=0.1.1"></script><script src="/assets/js/api.js?v=0.1.1"></script><script src="/assets/js/user-page.js"></script>
</body>
</html>
