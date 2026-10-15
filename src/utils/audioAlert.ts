// Audio Chime & Lao Spoken Voice Alert for Incoming Orders
// ສຽງເຕືອນພະນັກງານ: ສຽງກະດິ່ງຄົວ + ສຽງເວົ້າພາສາລາວ "ອໍເດີເຂົ້າແລ້ວ!"

// 1. Play high-quality kitchen POS order chime using Web Audio API
export const playKitchenOrderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // 3-tone bright restaurant order bell (D5 -> A5 -> D6)
    const tones = [
      { freq: 587.33, start: 0.0, duration: 0.22, gain: 0.28 },
      { freq: 880.0, start: 0.12, duration: 0.25, gain: 0.32 },
      { freq: 1174.66, start: 0.25, duration: 0.45, gain: 0.35 }
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.start);
      
      gain.gain.setValueAtTime(t.gain, ctx.currentTime + t.start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t.start + t.duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + t.start);
      osc.stop(ctx.currentTime + t.start + t.duration);
    });
  } catch (err) {
    console.warn('Web Audio API chime error:', err);
  }
};

// 2. Play Lao Spoken Voice Announcement ("ອໍເດີເຂົ້າແລ້ວ! ໂຕະ...")
export const playLaoOrderVoiceAlert = (tableCode?: string) => {
  // Always trigger the kitchen chime first
  playKitchenOrderChime();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    // Cancel any previous speech to avoid overlapping
    window.speechSynthesis.cancel();

    const tableLabel = tableCode ? `ໂຕະ ${tableCode}` : '';
    const laoMessage = `ອໍເດີເຂົ້າແລ້ວ! ${tableLabel}`;
    const thaiMessageFallback = `ออเดอร์เข้าแล้ว! ${tableCode ? `โต๊ะ ${tableCode}` : ''}`;

    const utterance = new SpeechSynthesisUtterance(laoMessage);
    const voices = window.speechSynthesis.getVoices();

    // 1. Prefer native Lao voice if installed
    const laoVoice = voices.find(v => 
      v.lang.toLowerCase().includes('lo') || 
      v.name.toLowerCase().includes('lao')
    );

    // 2. Otherwise use Thai voice (standard in mobile phones & PCs, perfectly pronounces Lao vowels & tone)
    const thaiVoice = voices.find(v => 
      v.lang.toLowerCase().includes('th') || 
      v.name.toLowerCase().includes('thai')
    );

    if (laoVoice) {
      utterance.voice = laoVoice;
      utterance.lang = laoVoice.lang;
      utterance.text = laoMessage;
    } else if (thaiVoice) {
      utterance.voice = thaiVoice;
      utterance.lang = thaiVoice.lang;
      utterance.text = thaiMessageFallback;
    } else {
      // Default fallback
      utterance.lang = 'lo-LA';
      utterance.text = laoMessage;
    }

    utterance.rate = 0.95; // Natural clear pace
    utterance.pitch = 1.05; // Friendly alert tone
    utterance.volume = 1.0; // Clear audible volume

    // Delay speech slightly so the order chime plays first
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis speak failed:', e);
      }
    }, 380);
  } catch (err) {
    console.warn('Speech synthesis alert error:', err);
  }
};
