# Gdzie wkleić zrzuty ekranu — CryptoTrack (Artem Zakharov)

Dokument główny: `CryptoTrack_Artem_Zakharov.docx` (wygenerowany z HTML).

Każde pole `[WSTAW SCREENSHOT]` w DOCX odpowiada poniższej instrukcji.

## Diagramy UML (PlantUML — zalecane)

Użyj plików `.puml` z `docs/University/diagrams/`, ponieważ są czytelniejsze niż draw.io i łatwo je wygenerować ponownie.

| Rozdział | Plik PlantUML |
|----------|----------------|
| §6 Diagram przypadków użycia | `diagram-przypadkow-uzycia.puml` |
| §8.1 Diagram czynności: rejestracja użytkownika | `diagram-czynnosci-rejestracja-uzytkownika.puml` |
| §8.2 Diagram czynności: parowanie rozszerzenia | `diagram-czynnosci-parowanie-rozszerzenia.puml` |
| §8.3 Diagram czynności: synchronizacja transakcji | `diagram-czynnosci-synchronizacja.puml` |
| §8.4 Diagram czynności: automatyczna kategoryzacja AI | `diagram-czynnosci-automatyczna-kategoryzacja-ai.puml` |
| §9 / §16 Diagram ERD | `diagram-erd.puml` |
| §10 Diagram klas | `diagram-klas.puml` |
| §11 Diagram sekwencji | `diagram-sekwencji-synchronizacja.puml` |
| §12 Diagram stanów | `diagram-stanow-transakcji.puml` |
| §13 Diagram wdrożenia | `diagram-komponentow-i-wdrozenia.puml` |

Renderowanie: otwórz `https://www.plantuml.com/plantuml/uml/`, wklej zawartość `.puml`, eksportuj PNG/SVG i wklej do DOCX.

Szczegóły: `diagrams/INSTRUKCJA-PLANTUML.md`.

---

## Screenshoty z działającej aplikacji

Uruchom przed zrzutami:
```bash
pnpm dev   # web + api
# rozszerzenie: pnpm --filter @crypto-tracker/extension dev → załaduj chrome-mv3-dev
```

| ID w dokumencie | Co sfotografować | URL / miejsce |
|-----------------|------------------|---------------|
| §21.1 | Formularz logowania + rejestracji | `http://localhost:3000/auth/login` |
| §21.2 | Dashboard — karty podsumowania, ostatnie transakcje | `/dashboard` |
| §21.3a | Settings — **Extension pairing**, widoczny 6-cyfrowy kod | `/settings` |
| §21.3b | Popup rozszerzenia Chrome — pole kodu, **Connect** | Ikona rozszerzenia w pasku Chrome |
| §21.4a | MetaMask Card — lista transakcji | `https://card.metamask.io` (zalogowany) |
| §21.4b | Popup — **Sync now** + komunikat sukcesu | Po sync |
| §21.5 | Tabela transakcji, filtry dat, badge kategorii | `/transactions` |
| §21.6 | Manager kategorii — drzewo, kolory, dodaj/edytuj | `/categories` |
| §21.7 | Categorize spendings — merchanty, auto-categorize | `/categories/categorize` |
| §21.8 | Analytics — wykresy, date range, period comparison | `/analytics` |
| §21.9 | Edycja jednej transakcji — wybór kategorii/subkategorii | `/transactions` → klik w wiersz / sheet |
| §20 | Terminal — zielone testy Jest | `pnpm --filter @crypto-tracker/api test` |

### Wskazówki jakości
- Rozdzielczość min. 1280px szerokości okna przeglądarki.
- Tryb jasny lub ciemny — **konsekwentnie** w całym dokumencie.
- Ukryj dane wrażliwe (e-mail, pełne kwoty) jeśli wymaga prowadzący.
