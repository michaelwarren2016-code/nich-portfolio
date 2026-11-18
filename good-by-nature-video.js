/* Good by Nature background: muted autoplay, restart only after the seek reaches frame zero. */
(() => {
  const video = document.querySelector('.good-by-nature-section .good-by-nature-video');
  if (!video) return;
  video.loop = false;
  video.muted = true;
  video.playsInline = true;

  const start = () => video.play().catch(() => {});
  video.addEventListener('ended', () => {
    video.pause();
    const resumeFromStart = () => {
      video.removeEventListener('seeked', resumeFromStart);
      start();
    };
    video.addEventListener('seeked', resumeFromStart, { once: true });
    video.currentTime = 0;
  });
  video.addEventListener('error', () => {
    if (video.networkState !== HTMLMediaElement.NETWORK_NO_SOURCE) {
      video.load();
      start();
    }
  });
  if (video.readyState >= 2) start();
  else video.addEventListener('canplay', start, { once: true });
})();