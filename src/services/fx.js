import confetti from 'canvas-confetti';

/**
 * Hiệu ứng pháo hoa trái tim và ánh kim lãng mạn
 */
export function fireHeartConfetti() {
  const count = 40;
  const defaults = {
    origin: { y: 0.75 },
    disableForReducedMotion: true
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.3, {
    spread: 35,
    startVelocity: 45,
    colors: ['#f43f5e', '#fb7185', '#fda4af']
  });

  fire(0.25, {
    spread: 65,
    colors: ['#ec4899', '#f43f5e', '#ffffff']
  });

  fire(0.35, {
    spread: 100,
    decay: 0.92,
    scalar: 0.9,
    colors: ['#fda4af', '#e11d48', '#fef08a']
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.1,
    colors: ['#ffe4e6', '#ffedd5']
  });
}

/**
 * Hiệu ứng chùm sao vàng lấp lánh khi gửi Locket thành công
 */
export function fireSparkleCelebration() {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#fbbf24', '#f59e0b', '#fef08a', '#f43f5e'],
    ticks: 200,
    gravity: 0.9,
    scalar: 0.85
  });
}
