# Grandmoor Website

A professional, responsive website for Grandmoor Warehousing & Logistics, built with modern HTML, CSS, and JavaScript.

## 📋 Project Structure

```
grandmoor-website/
├── index.html              # Home page
├── offerings.html          # Services/Offerings page
├── contact.html            # Contact page with form
├── css/
│   └── styles.css          # Main stylesheet (responsive, mobile-first)
├── js/
│   └── main.js             # JavaScript for interactivity
├── images/                 # Image assets (hero, products, etc.)
├── netlify.toml            # Netlify configuration
└── README.md               # This file
```

## 🎨 Design Features

### Mobile-First Responsive Design
- **Mobile optimized** - Starts with mobile layout, progressively enhances for larger screens
- **Breakpoints**: Optimized for phones (320px+), tablets (768px+), and desktops (1200px+)
- **Flexible Grid System** - CSS Grid layouts that adapt to screen size
- **Touch-friendly** - Proper button sizes and spacing for mobile interaction

### Color System
- **Primary**: Deep Blue (#1e3a8a) - Main brand color
- **Secondary**: Orange (#f97316) - Accent/CTA color
- **Neutral**: Gray scale for text and backgrounds
- **Semantic colors**: Success, danger, info states

### Typography
- **System Font Stack** - Fast-loading, native fonts across all platforms
- **Hierarchical**: Clear h1-h3 headings with proper sizing ratios
- **Accessible**: Min 16px base font size for readability
- **Optimized line heights** - 1.6 for body text ensures readability

### Accessibility
- **WCAG 2.1 AA compliant** - Proper contrast ratios, semantic HTML
- **Keyboard navigation** - All interactive elements are keyboard accessible
- **Reduced motion support** - Respects `prefers-reduced-motion` media query
- **Form validation** - Clear labels and error handling
- **Alt text support** - Ready for image alt descriptions

## 🚀 Deployment to Netlify

### Prerequisites
- A GitHub/GitLab/Bitbucket account
- Git installed locally
- Netlify account (free tier available at netlify.com)

### Step-by-Step Deployment

1. **Initialize Git Repository**
   ```bash
   cd /path/to/grandmoor-website
   git init
   git add .
   git commit -m "Initial commit: Grandmoor website"
   ```

2. **Push to GitHub** (or your preferred Git provider)
   ```bash
   git remote add origin https://github.com/yourusername/grandmoor-website.git
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up/log in
   - Click "New site from Git"
   - Connect your GitHub account and select the repository
   - Netlify will auto-detect the `netlify.toml` configuration
   - Click "Deploy site"

4. **Configure Domain** (after initial deployment)
   - Go to Site Settings → Domain Management
   - Add your custom domain (e.g., www.grandmoor.ca)
   - Update DNS records as provided by Netlify

### Continuous Deployment
After deployment, any push to the `main` branch will automatically trigger a new build and deploy. No manual intervention needed!

## 📝 Content Placeholders

The following placeholders need to be updated before launch:

### In `contact.html`:
- `[STREET ADDRESS]` - Facility street address
- `[POSTAL CODE]` - Postal code
- `[PHONE NUMBER]` - Contact phone
- `[DAYS]` - Business days (e.g., "Monday to Friday")
- `[HOURS]` - Business hours (e.g., "8:00 AM - 5:00 PM")

### Optional Enhancements:
- Replace form placeholder email with actual email addresses
- Add Google Maps embed (replace placeholder in contact.html)
- Add company logo in header if needed
- Upload images to `/images` folder

## 📧 Form Submission

The contact form uses **Netlify Forms** for submissions:
- No backend required
- Submissions are automatically sent to your email
- Configure form notifications in Netlify dashboard:
  - Site Settings → Forms → Form notifications
  - Add email address to receive inquiries

### How it Works
1. User submits form on `/contact.html`
2. Netlify captures the submission
3. You receive email notification with form data
4. Responses also visible in Netlify dashboard

## 🎯 Best Practices Implemented

### Performance
✅ Minified CSS (use build tools for production)
✅ Lazy loading ready for images
✅ Optimized font stack (system fonts)
✅ Efficient CSS selectors and structure
✅ Cache headers configured for static assets

### SEO
✅ Semantic HTML structure
✅ Meta descriptions on all pages
✅ Proper heading hierarchy (h1 → h2 → h3)
✅ Mobile-friendly responsive design
✅ Fast load times
✅ Open Graph ready for social sharing

### Security
✅ Content Security Policy headers
✅ X-Frame-Options to prevent clickjacking
✅ XSS protection headers
✅ Honeypot field on contact form (spam protection)
✅ No inline scripts (all in separate js/main.js)

### User Experience
✅ Mobile menu with smooth transitions
✅ Smooth scroll behavior
✅ Touch-friendly buttons and links
✅ Clear visual hierarchy
✅ Consistent spacing and sizing
✅ Accessible forms with proper labels
✅ Visual feedback on interactions (hover states)

## 🖼️ Adding Images

1. Optimize images before uploading:
   - JPG: For photos (compress with tools like TinyJPG)
   - PNG: For graphics/logos with transparency
   - WebP: For modern browsers (fallback to JPG)

2. Place images in `/images` folder

3. Reference in HTML:
   ```html
   <img src="images/hero-banner.jpg" alt="Grandmoor facility exterior">
   ```

## 🔧 Customization Guide

### Changing Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
  --primary: #1e3a8a;      /* Change brand color here */
  --secondary: #f97316;    /* Change accent color here */
  /* ... other colors ... */
}
```

### Modifying Typography
```css
:root {
  --font-size-base: 1rem;  /* Base font size */
  --font-size-2xl: 1.5rem; /* Heading sizes */
}
```

### Adjusting Spacing
```css
:root {
  --spacing-md: 1rem;      /* Base spacing */
  --spacing-lg: 1.5rem;    /* Larger spacing */
}
```

## 📱 Testing Checklist

Before going live:

### Desktop Testing
- [ ] All pages load correctly
- [ ] Navigation works on all pages
- [ ] Forms submit properly
- [ ] Links are not broken
- [ ] Images display correctly
- [ ] Text is readable and well-spaced

### Mobile Testing
- [ ] Mobile menu opens/closes smoothly
- [ ] Touch targets are large enough (48px minimum)
- [ ] Text is readable without horizontal scroll
- [ ] Forms are usable on small screens
- [ ] Images scale properly
- [ ] No overlapping elements

### Cross-Browser Testing
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- Use [Google PageSpeed Insights](https://pagespeed.web.dev)
- Target scores: 90+ for Performance, Accessibility, Best Practices, SEO

### Accessibility Testing
- Use [WAVE](https://wave.webaim.org) or [Axe DevTools](https://www.deque.com/axe/devtools/)
- Test keyboard navigation (Tab through all interactive elements)
- Test with screen reader (NVDA, JAWS, or VoiceOver)

## 📞 Support & Next Steps

### Future Enhancements
1. **Analytics** - Add Google Analytics via Netlify
2. **Blog** - Add a resources/blog section
3. **Case Studies** - Add testimonials and case studies section
4. **Live Chat** - Integrate Intercom or similar
5. **CMS** - Integrate Netlify CMS for easy content management
6. **API Integration** - Connect to booking or quote system

### Maintenance
- Review analytics monthly
- Check for broken links quarterly
- Update content as services evolve
- Monitor form submissions for inquiries
- Keep dependencies updated

## 📄 License

© 2026 Grandmoor Inc. All rights reserved.

---

**Ready to deploy?** Follow the deployment steps above to get your Grandmoor website live! 🚀
