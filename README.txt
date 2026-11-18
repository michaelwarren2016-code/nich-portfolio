NICH — Good by Nature video patch (Scroll-scrubbed playback)

Base: NICH_D72_30_Product_Copy_Spacing (latest available workspace snapshot)

Install:
1. Replace the existing <section id="ethics">...</section> in index.html with section.html.
2. Add a Marcellus font link in <head> (the site's existing Marcellus font file may be used instead):
   <link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet">
3. Add <link rel="stylesheet" href="good-by-nature.css"> after styles.css.
4. Copy ../shared-assets/good-by-nature.mov to assets/video/good-by-nature.mov (create the directory if needed).
5. Add <script src="good-by-nature-video.js"></script> after the site's existing script tags, before </body>.
6. Serve the site over localhost or HTTPS, then scroll through Ethics. The loop variant plays continuously; the scrub variant follows scrolling in both directions.

The section CSS is scoped to #ethics / .good-by-nature-section. No other site sections or 3D files are part of this patch.

Video note: the supplied .mov is included unchanged. Browser support depends on its encoded video codec. If the target browser cannot play it, transcode to H.264 MP4 and change the source URL and MIME type to video/mp4. For reliable scrubbing, use a web-optimized MP4 (fast-start) with frequent keyframes.
