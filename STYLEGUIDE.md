# Filmbase – Styleguide

Definerer fargepalett, typografi og komponenter for Filmbase. Verdiene er også definert som CSS-variabler øverst i `style.css` (`:root`).

## Fargepalett

| Navn | Variabel | Hex | Bruk |
|------|----------|-----|------|
| Oransje | `--orange` | `#f6821f` | Aksentfarge: knapper, ikoner, aktive lenker |
| Oransje mørk | `--orange-dark` | `#e1700f` | Hover på oransje knapper |
| Bein | `--bone` | `#faf8f4` | Sidebakgrunn |
| Bein 2 | `--bone-2` | `#f3f0ea` | Vekslende seksjoner, chips, input-bakgrunn |
| Hvit | `--white` | `#ffffff` | Kort, header, innholdsflater |
| Blekk | `--ink` | `#1d1d1f` | Brødtekst og overskrifter |
| Dempet | `--muted` | `#6b6b70` | Sekundærtekst, metadata |
| Linje | `--line` | `#e7e3da` | Kanter og skillelinjer |

**Kontrast / WCAG:** `--ink` på `--white`/`--bone` gir høy kontrast (AA/AAA for brødtekst). `--muted` på hvit brukes kun til sekundærtekst. Oransje brukes som aksent, ikke som liten tekst på lys bakgrunn, for å holde kontrastkravene.

## Typografi

- **Font:** [Poppins](https://fonts.google.com/specimen/Poppins) (400, 500, 600, 700), med `"Segoe UI", Arial, sans-serif` som reserve.
- Valgt for god lesbarhet med åpne bokstavformer og tydelig x-høyde.

| Element | Størrelse | Vekt |
|---------|-----------|------|
| Hero H1 | 52px (36px mobil) | 600 |
| Detalj H1 | 40px (32px mobil) | 600 |
| Seksjonstittel H2 | 28px | 600 |
| Korttittel H4 | 16px | 600 |
| Brødtekst | 15–16px | 400 |
| Metadata / labels | 13–14px | 400 |

## Avstand og layout

- Maks innholdsbredde: `1100px`, sentrert.
- Seksjonsluft: `64px` vertikalt (desktop), `48px` (mobil).
- Kort: `250px` bredde, `12px` hjørneradius, `1px` kant i `--line`.
- Knapper/input: `8px` hjørneradius.
- Brytepunkter: `900px` (detaljside), `720px` (header/footer/grid), `420px` (kort i full bredde).

## Komponenter

- **Knapper:** Primær = oransje fyll (`.sign-in-bttn`, `.search-bttn`, `.subscribe-bttn`). Sekundær = hvit med kant (`.more-bttn`).
- **Kort (`.movie-card`):** plakat + tittel + år/vurdering + «Mer info». Løftes ved hover.
- **Chips (`.genre-chip`):** avrundede sjanger-merker på detaljsiden.
- **Statusmeldinger:** `.loading` (laster) og `.feil` (feil / ingen treff), sentrert dempet tekst.
