why augeo ? </br>
OGF's Maison Funéraire du Mont Valérien (Nanterre) receives about 2,000 deceased a year. Every one of them needs a quote (devis): family info, stay dates, services rendered, total price. </br>
Before augeo, that quote was typed by hand into a document, priced by hand, printed, scanned, printed again for billing, filed, and finally attached to a hand-written email to the funeral operator. Seven steps, all manual, all repeated ~2,000 times a year see [business-impact.md](docs/business-impact.md) for what that actually cost. </br>
</br>
augeo is not a CRM. </br>
augeo is an internal quote generator for OGF, exposed through a web form: fill in the deceased's info, tick the services rendered, and a priced, correctly named PDF comes out — attached, ready to send, with the email already addressed and worded. </br>
augeo is augeo. </br>
</br>
architecture: </br>

- frontend: Next.js form, hosted on Vercel </br>
- backend: Go API on a VPS, fills an Excel template and shells out to headless LibreOffice to produce the PDF </br>
- one env var on Vercel points the frontend at the backend, so environments swap without touching code </br>

See [architecture.md](docs/architecture.md) for the full picture and why it's split this way.

## Quickstart

Prerequisites: Go 1.22+, Node 20+ with pnpm, LibreOffice (`libreoffice-calc`) installed locally for PDF conversion.

**1. Backend.**

```bash
cd devis-api
go run . -addr :8080 -template ./template/devis_template.xlsx -operateurs ./data/operateurs.xlsx
```

**2. Frontend.**

```bash
cd frontend
pnpm install
echo "NEXT_PUBLIC_DEVIS_API_URL=http://localhost:8080" > .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), fill in a deceased's info, tick a few services, generate a devis.

## Docs

- [architecture.md](docs/architecture.md) multi-repo setup, why Vercel + a VPS, how the two halves talk to each other
- [business-impact.md](docs/business-impact.md) the manual process it replaces, and what the friction was actually costing
- [ci.md](docs/ci.md) what runs on every push, and how changes reach the two deploy-facing repos
- [skills/devis-document](docs/skills/devis-document/SKILL.md) how the devis PDF is actually built: cell map, the row-offset trap, and the loop to verify a change

we love create
