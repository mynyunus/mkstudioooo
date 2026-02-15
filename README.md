# Studio MK Static Landing Page

Production-ready static landing page for **Studio MK** (HTML/CSS/vanilla JS).

## Deploy to Cloudflare Pages

1. Push this folder to a Git repository.
2. In Cloudflare Dashboard, go to **Pages** and create a new project from that repository.
3. Use these settings:
   - Framework preset: `None`
   - Build command: `none` (leave empty)
   - Build output directory: `/`
4. Deploy. Ensure `index.html` is at the repository root.

## Notes

- This project is fully static and has no backend build step.
- If you use a custom domain, configure it in Cloudflare Pages project settings.
- Cloudflare cache can be purged after updates if changes are not immediately visible.
