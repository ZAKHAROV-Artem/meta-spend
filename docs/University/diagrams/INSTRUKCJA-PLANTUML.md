# Diagramy PlantUML dla CryptoTrack

Pliki `.puml` są źródłem diagramów do dokumentu uczelnianego.
Wygenerowane PNG/SVG nie są przechowywane w repozytorium. Renderuj je tylko wtedy, gdy chcesz wkleić diagram do DOCX.

## Pliki

| Plik | Rozdział dokumentu |
|---|---|
| `diagram-przypadkow-uzycia.puml` | 6. Diagram przypadków użycia |
| `diagram-czynnosci-rejestracja-uzytkownika.puml` | 8.1. Rejestracja użytkownika |
| `diagram-czynnosci-parowanie-rozszerzenia.puml` | 8.2. Parowanie rozszerzenia |
| `diagram-czynnosci-synchronizacja.puml` | 8.3. Synchronizacja transakcji |
| `diagram-czynnosci-automatyczna-kategoryzacja-ai.puml` | 8.4. Automatyczna kategoryzacja AI |
| `diagram-erd.puml` | 9 / 16. ERD i model bazy danych |
| `diagram-klas.puml` | 10. Diagram klas |
| `diagram-sekwencji-synchronizacja.puml` | 11. Diagram sekwencji |
| `diagram-stanow-transakcji.puml` | 12. Diagram stanów |
| `diagram-komponentow-i-wdrozenia.puml` | 13. Diagram komponentów i wdrożenia |

## Renderowanie

### Opcja 1: Online

Otwórz:

```text
https://www.plantuml.com/plantuml/uml/
```

Wklej zawartość pliku `.puml` i wyeksportuj PNG/SVG.

### Opcja 2: rozszerzenie VS Code / Cursor

Zainstaluj rozszerzenie PlantUML, otwórz plik `.puml`, a potem wyeksportuj PNG/SVG.

### Opcja 3: CLI

Jeżeli PlantUML jest zainstalowany:

```bash
plantuml -tpng *.puml
plantuml -tsvg *.puml
```

Do dokumentu DOCX wyrenderuj PNG/SVG lokalnie lub online, wklej do Word/LibreOffice i zostaw w projekcie tylko źródłowe pliki `.puml`.

