# Express Banners Static Site

Premium, mobile-first static website for Express Banners. Built for GitHub Pages with relative URLs and Cloudinary-first media.

## Cloudinary URLs

Update media in `data/settings.json` and `data/portfolio.json`.

- **Logo / hero / og**: edit `images.logo`, `images.homeHero`, and `images.og` in `data/settings.json`.
- **Order hero video**: edit `orderHero.videoMp4` and `orderHero.poster` in `data/settings.json`.
- **Service media**: edit `servicesMedia` entries (Signs, Banners, Embroidery, Graphic Designing, Screen Printing).
- **Portfolio items**: update each `src` in `data/portfolio.json` with a Cloudinary image URL.

All URLs must stay `https://res.cloudinary.com/YOUR_CLOUD_NAME/...` or your Cloudinary domain.

## Add New Portfolio Items

1. Open `data/portfolio.json`.
2. Add a new object with:
   - `id` (unique number)
   - `title`
   - `category` (must match existing filters)
   - `src` (Cloudinary URL)
   - `alt`
   - `featured` (true/false)
   - `blurb` (one-line outcome)
3. Save the file. The portfolio grid, featured section, and work wall update automatically.

## GitHub Pages Deployment

1. Push to `main`.
2. Go to **Settings → Pages**.
3. Set **Source** to **Deploy from a branch**.
4. Select **Branch: main**, **/ (root)**.
5. Save. The site will publish under `https://<user>.github.io/expressbanners/`.

## Contact Form (FormSubmit)

The contact form posts to FormSubmit using the endpoint in `data/settings.json` (`contact.formEndpoint`).
FormSubmit may send a confirmation email the first time you receive submissions—complete the confirmation to enable delivery.

## Payment Placeholder (NCB)

Card payments are intentionally disabled. The placeholder is wired in `js/app.js` inside `initPayment()` and the button is set via `orderLinks.paymentEnabled` in `data/settings.json`.
