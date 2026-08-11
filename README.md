# MetaFit Admin

Painel interno em PHP, jQuery e Bootstrap. As páginas são somente a camada de interface: todos os dados são consultados pela API MetaFit via Ajax.

## Execução local

1. Copie `.env.example` para `.env` e ajuste `METAFIT_API_URL` com a URL da API.
2. Sirva a pasta com PHP: `php -S localhost:8080`.
3. Acesse `http://localhost:8080`.

Para permitir o navegador, configure `CORS_ORIGIN` da API com a origem do painel, por exemplo `http://localhost:8080`.

## Estilos

Os fontes SCSS ficam em `assets/scss/` e o CSS compilado em `assets/css/style.css`.

## Deploy

O workflow do GitHub Actions em `.github/workflows/deploy.yml` é executado a cada push para `main` (ou manualmente). Ele compila os estilos e publica o painel em `/public_html/admin/` via FTP, usando os secrets `FTP_HOST`, `FTP_USER` e `FTP_PASSWORD`.

Após o primeiro deploy, crie o arquivo `.env` em `/public_html/admin/` com `NODE_ENV=production` e `METAFIT_API_URL` apontando para a API do ambiente. Esse arquivo não é publicado nem versionado.
