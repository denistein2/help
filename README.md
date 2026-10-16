# Help Soluções — identidade V2 em homologação

Site estático, sem dependências de build. Identidade V2 com leão, ondas neon e novo conteúdo institucional, em homologação para aprovação comercial pela Help.

## Prévia local

`python -m http.server 8000` e abra `http://localhost:8000`.

## Deploy na Vercel

Importar `denistein2/help`, Framework **Other**, raiz `./`, sem Build Command e sem Output Directory. O branch `main` foi usado para atualização do site. Não exige domínio próprio.

## WhatsApp e e-mail

- Botão flutuante e links para WhatsApp **+55 51 98148-3515** (wa.me/5551981483515).
- E-mail comercial: **helpsuporteatendimento@gmail.com**.
- O formulário faz POST para o **FormSubmit.co** e encaminha os dados para esse e-mail.
- **Primeira ativação obrigatória:** faça um envio de teste com dados fictícios, confira o e-mail de confirmação do FormSubmit na caixa de entrada (e spam) e clique no link de ativação; só então faça outro teste e confirme o recebimento. A equipe deste projeto não tem acesso à caixa de entrada e não verificou a entrega.
- O formulário usa validação no cliente, campo honeypot `_honey` e reCAPTCHA padrão do FormSubmit. `obrigado.html` é a página de retorno após fluxo de envio.
- **Não envie dados sensíveis, credenciais ou informações de clientes reais nos testes.** Dados submetidos são enviados a um serviço externo. O FormSubmit informa retenção de 30 dias para envios arquivados, conforme sua documentação.
- Se a Help decidir não utilizar esse fornecedor, altere o endpoint e revise a política antes de receber leads. Não há senha nem token de e-mail no repositório.

## Pendências para uso comercial definitivo

- Revisar e aprovar a política de privacidade, incluindo tratamento e retenção de dados.
- Confirmar serviço e destino de contatos e testar envio real após ativação do FormSubmit.
- Aprovar marca, identidade visual e escopo de serviços com Marcus.
- `robots.txt` e `noindex` restringem a descoberta/indexação da prévia, mas **não protegem o acesso** ao endereço publicado.
