# Phone Story Updates

## Changes Made

### Battery Field
- Changed from number input (defaulting to 100) to text input
- Users can now type custom values like "Replaced Battery", "80%", "New", etc.
- No more auto-reset to 100 when clearing the field

### Image Upload (Optional)
- Added "Show Image/Icon" checkbox for each phone
- When enabled, users can upload a custom phone image
- If no image uploaded, brand logo displays instead
- When disabled, no image or icon shows in preview
- Brand logos display with white filter for visibility on dark backgrounds
- Image size adapts to layout mode (grid/compact/standard)

### Display Logic
- Images/icons only show when "Show Image/Icon" is checked
- Uploaded images display in full color
- Brand logos display with white filter and slight transparency
- Image heights adjust based on layout and phone count

### SEO Improvements
- Added custom metadata for `/services` page with proper title, description, and keywords
- Updated `/services/phone-story` to use the service banner image (`banner.png`) for Open Graph and Twitter cards
- Banner image now displays when sharing links on social media and search results
- Added structured data (breadcrumbs, CollectionPage, SoftwareApplication schemas)
- Each service page now has unique SEO instead of inheriting homepage metadata
