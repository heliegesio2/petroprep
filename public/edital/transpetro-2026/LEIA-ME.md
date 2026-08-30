# PDFs do concurso Transpetro 2026

Coloque os PDFs oficiais nesta pasta. A seção "Edital" da landing
(`components/edital-section.tsx`) mostra o botão de download quando o arquivo existe;
enquanto não estiver aqui, o card mostra "Em breve".

| Arquivo esperado               | Card                            |
| ------------------------------ | ------------------------------- |
| `edital.pdf`                   | Edital de abertura              |
| `conteudo-programatico.pdf`    | Conteúdo programático completo  |
| `cronograma.pdf`               | Cronograma e datas              |

Para outro concurso, crie `public/edital/<slug-do-concurso>/` com os mesmos nomes de
arquivo (o slug está em `lib/concursos.ts`).

Edital oficial da Transpetro 2026: Cesgranrio — provas em 29/11/2026, inscrições até
14/09/2026.
