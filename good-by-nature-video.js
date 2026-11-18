/* Load the ethics background only near view; keep a manual mobile fallback. */
(() => {
  const section = document.querySelector('.good-by-nature-section');
  const video = section?.querySelector('.good-by-nature-video');
  const sources = video ? [...video.querySelectorAll('source[data-src]')] : [];
  const playButton = section?.querySelector('.good-by-nature-play');
  if (!section || !video || !sources.length || !playButton) return;

  video.loop = false;
  video.muted = true;
  video.playsInline = true;
  let loaded = false;
  let visible = false;

  const showPlayButton = () => { playButton.hidden = false; };
  const start = () => {
    if (!visible || !loaded) return;
    video.play().then(() => { playButton.hidden = true; }).catch(showPlayButton);
  };
  const loadVideo = () => {
    if (loaded) return;
    loaded = true;
    sources.forEach((source) => { source.src = source.dataset.src; });
    video.load();
    video.addEventListener('canplay', start, { once: true });
  };

  playButton.addEventListener('click', () => {
    if (!loaded) loadVideo();
    visible = true;
    start();
  });
  video.addEventListener('playing', () => { playButton.hidden = true; });
  video.addEventListener('error', showPlayButton);
  video.addEventListener('ended', () => {
    video.pause();
    const resumeFromStart = () => {
      video.removeEventListener('seeked', resumeFromStart);
      start();
    };
    video.addEventListener('seeked', resumeFromStart, { once: true });
    video.currentTime = 0;
  });

  const preloadObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    loadVideo();
  }, { rootMargin: '300px 0px', threshold: 0.01 });
  preloadObserver.observe(section);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      loadVideo();
      start();
    } else {
      video.pause();
    }
  }, { threshold: 0.01 });
  visibilityObserver.observe(section);
})();
