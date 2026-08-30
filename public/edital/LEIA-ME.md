# Pasta de documentos do edital

Coloque aqui os PDFs oficiais. A seção "Edital" da landing page
(`components/edital-section.tsx`) procura por estes nomes de arquivo e mostra
o botão de download automaticamente quando o arquivo existe:

| Arquivo                        | Aparece como                      |
| ------------------------------ | --------------------------------- |
| `edital-petrobras-2027.pdf`    | Edital de abertura                |
| `conteudo-programatico.pdf`    | Conteúdo programático completo    |
| `cronograma.pdf`               | Cronograma e datas                |

Enquanto o arquivo não estiver aqui, o card mostra "Em breve".

Para adicionar outro documento, edite a lista `documentos` em
`components/edital-section.tsx`.

> Até agosto/2026 a Petrobras não publicou edital para 2027. Referência atual:
> concurso Transpetro 2026 (Cesgranrio) — provas em 29/11/2026.
