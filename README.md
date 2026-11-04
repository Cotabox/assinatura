# Gerador de Assinatura

## Índice

- [Sobre](#Sobre)
- [Como a assinatura é gerada](#Como-a-assinatura-é-gerada)
- [Formulário: máscaras e validações](#Formulário-máscaras-e-validações)
- [Imagens da assinatura](#Imagens-da-assinatura)
- [Executando localmente](#Executando-localmente)
- [Publicação](#Publicação)

<br/>

---

<br/>

## Sobre

**Atenção:** o projeto é estático (HTML, CSS e JavaScript). Não precisa de build nem de Node para rodar.

Este projeto gera a **assinatura de e-mail padrão da Cotabox**. A pessoa preenche nome, sobrenome, cargo, telefone e e-mail, confere a prévia e copia ou baixa o HTML para colocar no cliente de e-mail (Outlook, Gmail, etc.).

O funcionamento baseia-se em dois pilares principais:

1. **Template:** o HTML da assinatura, descrito em [Como a assinatura é gerada](#Como-a-assinatura-é-gerada).
2. **Página:** o formulário, a prévia e os botões, com as regras descritas em [Formulário: máscaras e validações](#Formulário-máscaras-e-validações).

O projeto é baseado no Email-Signature-Generator, de Chance Smith (licença MIT, veja o arquivo `LICENSE`). O visual da página segue o design system atual da Cotabox, com as fontes Inter, Bricolage Grotesque e JetBrains Mono em `assets/fonts`.

<br/>

---

<br/>

## Como a assinatura é gerada

O template editável está em `code.html`, e a página carrega a cópia que fica em `dist/code.html`. Os dois arquivos devem ser sempre idênticos.

O template usa tabelas, estilos inline e a fonte Arial, porque os clientes de e-mail não carregam CSS externo, fontes próprias nem SVG.

As variáveis do template são `${first}`, `${last}`, `${title}`, `${phone}` e `${email}`. Elas são avaliadas no navegador (template literal) e os valores vêm de `assets/js/variables.js`.

As linhas com `id="title"`, `id="phone"` e `id="email"` são opcionais: se o campo correspondente estiver vazio, a linha é removida da assinatura.

Depois de editar o `code.html`, copie o arquivo para a pasta `dist`:

> ```bash
> cp code.html dist/code.html
> ```

**Observação:** o `gulp` do projeto original (`npm run build`) não é mais necessário, porque o template já usa estilos inline.

<br/>

---

<br/>

## Formulário: máscaras e validações

A lógica fica em `assets/js/form-validation.js`.

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| Nome | Sim | Não pode ficar vazio. |
| Sobrenome | Sim | Não pode ficar vazio. |
| Cargo | Não | Texto livre. |
| Telefone | Não | Máscara automática: `(11) 91234-5678` para celular e `(11) 3333-4444` para fixo. Exige 10 ou 11 dígitos, DDD entre 11 e 99 e, no celular, o 9 logo depois do DDD. |
| E-mail | Não | Termina sempre em `@cotabox.com.br`. A pessoa digita só o usuário, que aceita letras, números, ponto, hífen e sublinhado, sem começar nem terminar com separador e sem separadores repetidos. |

No campo de e-mail, ao digitar `@` o que vier depois é ignorado, e ao colar um e-mail de outro domínio só o usuário é mantido.

Os erros aparecem abaixo de cada campo e o botão **Gerar Assinatura** só gera quando todos os campos estão válidos. Telefone e e-mail vazios não aparecem na assinatura.

<br/>

---

<br/>

## Imagens da assinatura

A logo usada na assinatura é `assets/images/logo-cotabox.png` (368 x 72 px), publicada em:

`https://storage.googleapis.com/bkt-sandbox-email-assets/assinatura-logo-cotabox.png`

Os clientes de e-mail só carregam imagens por uma URL pública em HTTPS, por isso o template aponta para esse endereço e não para o arquivo local.

**Atenção:** a URL fica gravada em cada assinatura já enviada, e as imagens são servidas com cache de 1 ano. **Nunca** sobrescreva o arquivo publicado. Para trocar a logo, publique o arquivo com um **nome novo** e atualize a URL em `code.html` e `dist/code.html`.

<br/>

---

<br/>

## Executando localmente

1. Clone este repositório:

   > ```bash
   > git clone https://github.com/Cotabox/assinatura.git
   > cd assinatura
   > ```

2. Sirva a pasta com qualquer servidor estático. Por exemplo:

   > ```bash
   > npx http-server . -p 8099 -c-1
   > ```

3. Abra `http://localhost:8099/index.html` no navegador.
   - **Dica:** use `http://localhost:8099/index.html?test=1` para ver uma assinatura de exemplo sem preencher o formulário.
   - **Nota:** o jQuery é carregado de uma CDN, então é preciso estar conectado à internet.

4. Preencha o formulário e clique em **Gerar Assinatura**.

5. Use **Copiar HTML** ou **Baixar HTML**. O botão de copiar usa a área de transferência do navegador, com um método alternativo quando ela não está disponível.

<br/>

---

<br/>

## Publicação

Por ser estático, basta servir a raiz do repositório por HTTPS. O endereço previsto é `https://assinatura.cotabox.com.br`, o mesmo do campo `homepage` do `package.json`.

**Atenção:** antes de divulgar o link, confirme que o registro de DNS do domínio existe e aponta para a hospedagem escolhida.
