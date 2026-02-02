# Express Banners Static Website

This is a 100% static, mobile-first website for Express Banners. It runs on GitHub Pages with no backend.

## File Structure

```
/
  index.html
  /assets
    /img
      logo.png
      logo-mark.png
      hero.jpg
      portfolio-01.jpg
      portfolio-02.jpg
      portfolio-03.jpg
      portfolio-04.jpg
      portfolio-05.jpg
      portfolio-06.jpg
      portfolio-07.jpg
      portfolio-08.jpg
      portfolio-09.jpg
      og-image.jpg
    /video
      hero.mp4
  /css
    styles.css
  /js
    app.js
  /data
    settings.json
    portfolio.json
  README.md
```

## Replace Images (Exact Filenames)

Replace the files in `assets/img` with your real images (keep filenames exactly the same):

- `logo.png` (full logo)
- `logo-mark.png` (icon)
- `hero.jpg` (hero image)
- `portfolio-01.jpg` → `portfolio-09.jpg` (portfolio tiles)
- `og-image.jpg` (social preview image)

> Important: The site expects these exact filenames. Do not rename them.

## Update Business Details

Edit `data/settings.json`:

- `businessName` and `tagline`
- `whatsappNumber` (international format without the `+`)
- `whatsappDefaultMessage`
- `addressLine` and `hours`
- `social` links
- `orderLinks.artworkUploadUrl` (Google Drive / Google Form link)
- `seo.title` and `seo.description`

## Update Portfolio Items

1. Add your images to `assets/img` using the same naming pattern: `portfolio-01.jpg`, etc.
2. Edit `data/portfolio.json` to update titles, categories, and alt text.

## GitHub Pages Deployment

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select **main branch** and **/ (root)**.
5. Save and wait for the published URL.

## QA Checklist

- Test the mobile menu.
- Test the WhatsApp buttons.
- Confirm the portfolio lightbox opens and closes with ESC.
- Confirm the order summary builds the WhatsApp message.

## Connecting NCB Payment Gateway (Future)

A placeholder payment hook exists in `js/app.js`:

- Function: `initPayment(orderData)`
- Data shape passed:

```js
{
  service,
  options,
  quantity,
  notes,
  timestamp
}
```

To enable real payments, a backend/API integration is required. GitHub Pages is static, so you will need either:

- A serverless function (Netlify / Cloudflare), OR
- A secure redirect-based payment flow provided by NCB.

Once NCB credentials and endpoints are ready, the `initPayment` function can be updated without changing the HTML.
