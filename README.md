# Help Soluções — identidade V2 em homologação

Site estático, sem dependências de build. Identidade V2 com leão, ondas neon e novo conteúdo institucional, em homologação para aprovação comercial pela Help.

## Prévia local

`python -m http.server 8000` e abra `http://localhost:8000`.

## Deploy na Vercel

Importar `denistein2/help`, Framework **Other**, raiz `./`, sem Build Command e sem Output Directory. O branch `main` foi usado para atualização do site. Não exige domínio próprio.

## WhatsApp e e-mail

- Botão flutuante e links para WhatsApp **+55 51 98148-3515** (wa.me/5551981483515).
- E-mail comercial: **helpsolucoesemsuporte@gmail.com**.
- **Contingência de formulário:** após validar no navegador, o formulário abre uma mensagem pré-preenchida para o WhatsApp da Help (**+55 51 98148-3515**). O visitante precisa confirmar o envio no WhatsApp; abrir o link não prova entrega.
- Não há backend próprio de captura, POST ao FormSubmit nem envio automático de e-mail neste fluxo. O endereço comercial também possui link direto de e-mail.
- **Não envie dados sensíveis, credenciais ou dados pessoais reais nos testes.** Os dados do formulário só são transmitidos quando o visitante confirma o envio no WhatsApp.
- Para o lançamento comercial definitivo, a Help precisa aprovar o fluxo de entrada e a política de privacidade, e decidir se deseja um backend de e-mail independente.

## Pendências para uso comercial definitivo

- Revisar e aprovar a política de privacidade, incluindo tratamento e retenção de dados.
- Validar os dados pré-preenchidos no WhatsApp e confirmar o envio de teste; avaliar implementação futura de envio por e-mail com provedor próprio.
- Aprovar marca, identidade visual e escopo de serviços com Marcus.
- `robots.txt` e `noindex` restringem a descoberta/indexação da prévia, mas **não protegem o acesso** ao endereço publicado.
