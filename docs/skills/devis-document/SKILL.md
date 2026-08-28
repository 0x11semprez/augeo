---
name: devis-document
description: Use when changing what the generated devis looks like or contains - adding/moving a field on the PDF, editing devis_template.xlsx cell mappings, debugging "the value I typed doesn't show up on the devis", or touching generator.go, model.go or the form payload in frontend/app/page.tsx.
---

# Working on the devis document

The devis is not rendered by code. It is `devis-api/template/devis_template.xlsx`
with values written into specific cells by `devis-api/internal/devis/generator.go`,
then exported to PDF by headless LibreOffice (`convert.go`). Everything that
looks like a layout bug is really a cell, a merge, a row height or a print area.

**Never guess a cell reference. Dump the file and look.** The verification loop
below takes under a minute and is the only reliable feedback.

## The one trap that breaks every cell reference

`GenerateXLSX` starts with `f.InsertRows(SheetName, 1, 1)` (generator.go) to make
room for the mentions banner. **Every row in the template shifts down by one.**

- Template row N → generated row **N+1**.
- Every cell constant in `generator.go` is in *generated* coordinates.
- Every cell you read out of the *template* xml is in *template* coordinates.

Mixing the two is the usual cause of "I wrote the value and nothing appears":
the value lands one row off, often in a 9pt spacer row where it is invisible.

Two more silent-drop mechanisms:

- **Print area.** Reset to `$A$1:$I$36` right after the insert. Anything outside
  is written to the xlsx and dropped from the PDF export.
- **Merged cells.** Writing to a cell that is *inside* a merge but is not its
  top-left displays nothing. Check `<mergeCells>` before choosing a cell.
- **Sheets.** `keepOnlySheet` deletes `Devis NTR 2026(vierge)` and `FORFAITS 2026`
  so the PDF is one page. Only `Devis NTR 2026(calculs auto.)` survives.

## Verification loop

```bash
cd devis-api
go build -o /tmp/devis-api . && go test ./...
/tmp/devis-api -addr :8099 \
  -template ./template/devis_template.xlsx \
  -operateurs ./data/operateurs.xlsx -workdir /tmp/devis-work &

# xlsx, to inspect cells / styles / merges
curl -s -X POST "localhost:8099/api/devis?format=xlsx" \
  -H 'Content-Type: application/json' \
  --data-binary @exemple_devis.json -o /tmp/out.xlsx

# pdf, to inspect what actually prints
curl -s -X POST "localhost:8099/api/devis" \
  -H 'Content-Type: application/json' \
  --data-binary @exemple_devis.json -o /tmp/out.pdf
```

Then, in order of usefulness:

```bash
python3 docs/skills/devis-document/dump_xlsx.py /tmp/out.xlsx 26   # rows >= 26
pdftotext -layout /tmp/out.pdf - | tail -30                        # did it print?
pdftoppm -png -r 110 /tmp/out.pdf /tmp/page                        # then look at it
```

`dump_xlsx.py` resolves shared strings and prints, per row, the height, every
non-empty cell, its reference and its style index - plus the sheet dimension and
the full merge list. Run it on `template/devis_template.xlsx` too when you need
template coordinates.

Always finish by *looking at the rendered page*, not only at `pdftotext`. Text
that is present in the PDF can still be a 9pt line squeezed under a box where
nobody will ever read it - which is exactly how the initials field went
unnoticed while being technically correct.

## Adding a field to the devis, end to end

Five links, and the chain fails silently at any of them. `main.go` decodes
without `DisallowUnknownFields()`, so a key with no matching struct tag is
dropped with no error at all.

1. `frontend/app/page.tsx` - add to the `FormData` type and its initial state.
2. `frontend/app/page.tsx` - render the input, `updateField("myField", ...)`.
   The body is built with `{...data}`, so the state key *is* the JSON key. No
   renaming anywhere; do not add one.
3. `devis-api/internal/devis/model.go` - add the field with a `json:"myField"`
   tag matching that key exactly.
4. `devis-api/internal/devis/generator.go` - write it to a cell, in *generated*
   coordinates, inside the print area, on the top-left cell of any merge.
5. `devis-api/internal/devis/generator_test.go` - assert the cell value with
   `GetCellValue`. Tests reopen the generated file, no LibreOffice needed.

Dates and times are formatted **on the frontend** (`formatDate`, `formatTime`)
and inserted as plain strings. Keep it that way: the backend does no date
parsing. `validate` in `main.go` only requires `nom`, `prenom` and a non-empty
`prestations` map.

Known gap: `civilite` is declared in `model.go` and sent by the form, but no
writer in `generator.go` ever puts it on the document.

## Styling a cell

The template is the source of truth for fonts, fills and borders. Do not build a
style from scratch - clone the neighbour you want to match, so a restyle of the
template carries over:

```go
styleID, _ := f.GetCellStyle(SheetName, "C31")
style, _ := f.GetStyle(styleID)
styleCopy := *style   // MANDATORY
```

**`GetStyle` returns a style shared by many cells.** Mutating it without copying
the struct - and the `Font` / `Alignment` pointers inside it - restyles unrelated
cells, typically the long prestation labels. Existing helpers already do this
correctly: `setBoldCell`, `setLargeBoldCell`, `setPrestationAlignment`,
`styleInitialesBox`.

Borders on a merged range live on its *segments*: the left cell carries
left+top+bottom, the right cell carries right+top+bottom. Cloning one segment
gives you an open box; close all four sides explicitly.

Rows with `customHeight="1"` do not auto-grow. If a cloned style enlarges the
font, raise the row height yourself (`SetRowHeight`) or the text is clipped.
The adaptive-height helpers used for Nom / Prénom / Opérateur show the pattern,
and `generator_test.go` guards it.

## Bottom-of-document map (generated coordinates)

| row | content |
|---|---|
| 26 | `A26:F26` "Total de la commande", `G26:H26` total (18pt bold, `#,##0.00 "€"`) |
| 27, 28 | legal mentions, merged `A:H` |
| 29 | 6.75pt spacer |
| 30 | signature block: `A30` "Signature", `C30:H30` "Cachet de l'entreprise" |
| 31 | `A31` **"Devis établi par : XX"** (boxed), `C31:H31` "N° DOSSIER CLIENT HOMMAGE Agence" |
| 32 | 9.75pt spacer |
| 33 | red "MERCI de compléter…" banner |
| 34 | 9pt spacer |
| 35, 36 | OGF legal footer, two lines |

`A31` is the only genuinely free, unmerged cell below the signature block. The
rest of the bottom is spacers too thin to hold text unless you raise them.

## When the fix is a deploy, not a patch

The backend runs on a VPS and is *not* redeployed by pushing to `main` alone -
`.github/workflows/sync-subrepos.yml` only mirrors `devis-api/**` to
`augeo-backend`. Before debugging a missing field, confirm which build the user
is actually hitting: generate the same devis locally with `exemple_devis.json`.
If the value appears locally and not in their PDF, the code is right and the
deployed binary is stale.

## PDF delivery in the frontend

`POST /api/devis` returns **raw PDF bytes** (`Content-Disposition: attachment`),
not JSON with a URL. Errors are JSON; success is binary - `generateDevis` splits
on `response.ok` and must keep doing so.

The response is downloaded via an object URL and an `<a download>` click, and
that is the *only* thing that should happen. Do not add a `window.open` preview
tab back: previewing and downloading at once popped two windows per generation,
which is what the download-only path replaced. The blob is wrapped in a `File`
so "Save As" keeps `devis_<NOM>_<Prenom>.pdf` instead of a random blob id.
