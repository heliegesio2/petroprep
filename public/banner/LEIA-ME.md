# Fotos dos slides do carrossel

Coloque aqui a foto de cada concurso, nomeada pelo slug (ver `lib/concursos.ts`),
e aponte no objeto do concurso:

```ts
imagem: "/banner/transpetro-2026.jpg",
```

O slide em destaque (com contagem regressiva) mostra a imagem à direita; os
demais slides ainda não usam foto.

## Direitos de uso

Use **apenas** imagens que você pode usar comercialmente:

- suas próprias fotos;
- bancos com licença livre para uso comercial (Unsplash, Pexels);
- imagens que você licenciou.

**Não** use fotos de portais de notícia (G1, GZH, UOL, agências) sem licença: são
protegidas por direito autoral e o site cobra assinatura.

## Imagem por categoria

Cada concurso tem uma `categoria` em `lib/concursos.ts`. Se o concurso não tem
`imagem` própria, o slide usa a foto da categoria (`IMAGEM_POR_CATEGORIA`):

| Categoria      | Arquivo                    |
| -------------- | -------------------------- |
| petroleo       | `transpetro-2026.jpg`      |
| policia        | `cat-policia.jpg`          |
| bombeiros      | `cat-bombeiros.jpg`        |
| saude          | `cat-saude.jpg`            |
| juridico       | `cat-juridico.jpg`         |
| fiscal         | `cat-fiscal.jpg`           |
| educacao       | `cat-educacao.jpg`         |
| administracao  | `cat-administracao.jpg`    |

Para dar foto exclusiva a um concurso, salve `<slug>.jpg` aqui e ponha
`imagem: "/banner/<slug>.jpg"` no objeto dele.

## O que já está aqui

Todas as fotos são do Unsplash (Unsplash License: uso comercial livre, sem
atribuição obrigatória). Troque por fotos oficiais/licenciadas quando tiver.
`transpetro-2026.jpg` é uma refinaria ao entardecer (Red Shuheart).
