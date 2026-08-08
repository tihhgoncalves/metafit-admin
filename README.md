# MetaFit Admin

Painel interno em PHP, jQuery e Bootstrap. As páginas são somente a camada de interface: todos os dados são consultados pela API MetaFit via Ajax.

## Execução local

1. Ajuste `assets/js/config.js` com a URL da API.
2. Sirva a pasta com PHP: `php -S localhost:8080`.
3. Acesse `http://localhost:8080`.

Para permitir o navegador, configure `CORS_ORIGIN` da API com a origem do painel, por exemplo `http://localhost:8080`.

## Estilos

Os fontes SCSS ficam em `assets/scss/` e o CSS compilado em `assets/css/style.css`.
