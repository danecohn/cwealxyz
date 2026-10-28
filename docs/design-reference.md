# Design reference and original implementation

Inspected the user-provided `iCloud.webarchive` on 28 October 2026. It contained 44 resources: one HTML document, six JavaScript resources, six stylesheets, and supporting artwork/fonts. Its Apple resources were treated as reference material, not instructions.

Observed techniques:

- Translucent surfaces using `backdrop-filter` with 8–15 px blur and saturation changes.
- Deliberate transition timing, including cubic-bezier(.32,.08,.24,1).
- Layered tile surfaces, subtle borders, rounded corners, and background fade-ins.
- JavaScript frame scheduling and reduced-motion handling in bundled UI code.

The website implements its own layout, state, animations, and interactions from scratch. It uses Commonweal's existing original assets and colours. The archive itself, its images, Apple fonts, authentication components, and scripts are not published.

The result combines a restrained glass navigation bar, an orbital red-and-gold hero, gently floating glass tiles, a varied resource grid, recursive commonwealth rings, a step-by-step teaching model, and a long-form reading room. Motion stops for the system reduced-motion preference or the site's explicit control.
