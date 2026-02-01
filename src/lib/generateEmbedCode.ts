import { WebinarConfig } from '@/types/webinar';

export const generateEmbedCode = (config: WebinarConfig): string => {
  const ctaBannerHtml = config.enableCta ? `
  <!-- CTA Banner -->
  <div class="cta-banner hidden" id="ctaBanner">
    <div class="cta-content">
      <div class="cta-text">
        <h3 class="cta-headline">🔥 ${config.ctaHeadline}</h3>
        <p class="cta-subheadline">${config.ctaSubheadline}</p>
      </div>
      <!-- Mobile-only headline (shown above button on mobile) -->
      <h3 class="cta-mobile-headline">🔥 ${config.ctaHeadline}</h3>
      <div class="cta-action">
        <a href="${config.ctaButtonUrl}" target="_blank" class="cta-button" onclick="trackCtaClick()"><span class="cta-button-text-full">${config.ctaButtonText}</span><span class="cta-button-text-short">Secure Your Spot Now →</span></a>
        ${config.ctaShowUrgency ? `<span class="cta-urgency">${config.ctaUrgencyText}</span>` : ''}
      </div>
    </div>
  </div>` : '';

  const ctaFloatingHtml = config.enableCta ? `
  <!-- CTA Floating -->
  <div class="cta-floating hidden" id="ctaFloating">
    <div class="cta-floating-badge">🎯 SPECIAL OFFER</div>
    <h3 class="cta-floating-headline">${config.ctaHeadline}</h3>
    <p class="cta-floating-subheadline">${config.ctaSubheadline}</p>
    <!-- Mobile-only headline (shown above button on mobile) -->
    <h3 class="cta-mobile-headline">🔥 ${config.ctaHeadline}</h3>
    <a href="${config.ctaButtonUrl}" target="_blank" class="cta-button" onclick="trackCtaClick()"><span class="cta-button-text-full">${config.ctaButtonText}</span><span class="cta-button-text-short">Secure Your Spot Now →</span></a>
    ${config.ctaShowUrgency ? `<span class="cta-urgency">${config.ctaUrgencyText}</span>` : ''}
  </div>` : '';

  const ctaStyles = config.enableCta ? `
    /* CTA Banner Styles */
    .cta-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 380px;
      background: linear-gradient(90deg, rgba(20,20,30,0.98) 0%, rgba(30,30,45,0.98) 100%);
      border-top: 1px solid var(--border);
      padding: 1rem 2rem;
      z-index: 150;
      animation: slideUp 0.5s ease;
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    .cta-banner.hidden { display: none; }
    
    .cta-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      gap: 2rem;
    }
    
    .cta-text { flex: 1; }
    
    .cta-headline {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    
    .cta-subheadline {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .cta-action {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .cta-button {
      background: ${config.ctaButtonColor};
      color: white;
      padding: 0.875rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(229,57,53,0.4);
    }
    
    .cta-urgency {
      color: #fbbf24;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    /* Mobile headline - hidden on desktop */
    .cta-mobile-headline {
      display: none;
    }
    
    /* Button text - show full on desktop, short on mobile */
    .cta-button-text-full {
      display: inline;
    }
    .cta-button-text-short {
      display: none;
    }
    
    /* CTA Floating Styles */
    .cta-floating {
      position: fixed;
      right: 400px;
      bottom: 1rem;
      background: linear-gradient(180deg, rgba(30,30,45,0.98) 0%, rgba(20,20,30,0.98) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      width: 280px;
      z-index: 150;
      animation: slideUp 0.5s ease;
    }
    
    .cta-floating.hidden { display: none; }
    
    .cta-floating-badge {
      background: var(--primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-block;
      margin-bottom: 1rem;
    }
    
    .cta-floating-headline {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .cta-floating-subheadline {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      line-height: 1.5;
    }
    
    .cta-floating .cta-button {
      display: block;
      text-align: center;
      width: 100%;
      margin-bottom: 0.75rem;
    }
    
    .cta-floating .cta-urgency {
      display: block;
      text-align: center;
      font-size: 0.8rem;
    }
    
    @media (max-width: 768px) {
      /* Mobile CTA - In-flow design between video and chat */
      .cta-banner {
        position: relative;
        width: 100%;
        background: #111111;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 16px;
        z-index: 1;
        text-align: center;
        /* Remove fixed positioning */
        bottom: auto;
        left: auto;
        right: auto;
        box-shadow: none;
      }
      
      .cta-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
        align-items: stretch;
      }
      
      .cta-text {
        display: none;
      }
      
      .cta-headline {
        display: none;
      }
      
      .cta-subheadline {
        display: none;
      }
      
      /* Mobile headline - show above button */
      .cta-mobile-headline {
        display: block;
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      
      /* Button text visibility on mobile */
      .cta-button-text-full {
        display: none;
      }
      .cta-button-text-short {
        display: inline;
      }
      
      .cta-action {
        flex-direction: column;
        width: 100%;
        gap: 8px;
        align-items: center;
      }
      
      .cta-button {
        display: block;
        width: 100%;
        height: 48px;
        padding: 0 24px;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.3px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        border-radius: 10px;
        text-align: center;
        line-height: 48px;
        animation: mobile-cta-pulse 3s ease-in-out infinite;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .cta-button:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 25px rgba(220, 38, 38, 0.5);
      }
      
      .cta-button:active {
        transform: scale(0.98);
        box-shadow: 0 2px 10px rgba(220, 38, 38, 0.3);
      }
      
      @keyframes mobile-cta-pulse {
        0%, 100% {
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        }
        50% {
          box-shadow: 0 4px 25px rgba(220, 38, 38, 0.6);
        }
      }
      
      .cta-urgency {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #fbbf24;
        text-align: center;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
      }
      
      .cta-floating {
        position: relative;
        width: 100%;
        border-radius: 0;
        background: #111111;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 16px;
        text-align: center;
        /* Remove fixed positioning */
        bottom: auto;
        left: auto;
        right: auto;
        box-shadow: none;
      }
      
      .cta-floating .cta-mobile-headline {
        display: block;
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      
      .cta-floating .cta-button {
        height: 48px;
        line-height: 48px;
        padding: 0 24px;
        animation: mobile-cta-pulse 3s ease-in-out infinite;
      }
      
      .cta-floating-badge {
        display: none;
      }
      
      .cta-floating-headline {
        display: none;
      }
      
      .cta-floating-subheadline {
        display: none;
      }
      
      .cta-floating .cta-urgency {
        font-size: 12px;
        margin-top: 8px;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
      }
    }
  ` : '';

  const ctaScript = config.enableCta ? `
    // CTA Logic
    let ctaShown = false;
    
    function checkCta() {
      if (ctaShown) return;
      
      const { state, elapsed } = getWebinarState();
      if (state !== 'live') return;
      
      const elapsedSeconds = elapsed || 0;
      if (elapsedSeconds >= ${config.ctaShowAfterSeconds}) {
        showCta();
        ctaShown = true;
      }
    }
    
    function showCta() {
      const style = '${config.ctaStyle}';
      if (style === 'banner') {
        document.getElementById('ctaBanner').classList.remove('hidden');
      } else {
        document.getElementById('ctaFloating').classList.remove('hidden');
      }
    }
    
    async function trackCtaClick() {
      const { elapsed } = getWebinarState();
      const minutesWatched = Math.floor((elapsed || 0) / 60);
      
      try {
        await fetch(CONFIG.supabaseUrl + '/functions/v1/save-cta-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webinar_id: CONFIG.webinarId,
            lead_id: leadId,
            button_text: CONFIG.ctaButtonText,
            button_url: CONFIG.ctaButtonUrl,
            minutes_watched: minutesWatched
          })
        });
      } catch (error) {
        console.error('Failed to track CTA:', error);
      }
    }
    
    // Check CTA every second during live state
    setInterval(checkCta, 1000);
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.headerTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    
    :root {
      --primary: ${config.primaryColor};
      --bg: ${config.backgroundColor};
      --chat-bg: ${config.chatBackground};
      --text: #ffffff;
      --text-muted: #9ca3af;
      --border: rgba(255,255,255,0.1);
    }
    
    html, body {
      height: 100%;
      height: -webkit-fill-available;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      overflow: hidden;
      min-height: 100vh;
      min-height: 100dvh;
    }
    
    h1, h2, h3 { font-family: 'Space Grotesk', system-ui, sans-serif; }
    
    .webinar-container {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
    }
    
    @media (max-width: 768px) {
      .webinar-container {
        flex-direction: column;
      }
    }
    
    .video-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      min-width: 0;
      position: relative;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    
    @media (max-width: 768px) {
      .header {
        display: none;
      }
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }
    
    .header-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .live-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(90deg, var(--primary) 0%, #c62828 100%);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .live-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    
    .viewer-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .video-wrapper {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #000;
    }
    
    .video-wrapper video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
    
    .sound-controls {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0,0,0,0.8);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      z-index: 100;
    }
    
    .mute-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .mute-btn:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .mute-btn svg {
      width: 24px;
      height: 24px;
    }
    
    .volume-slider {
      width: 80px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      cursor: pointer;
    }
    
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
    }
    
    .volume-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
    
    .unmute-notice {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      padding: 1rem 2rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
      text-align: center;
      z-index: 99;
    }
    
    .unmute-notice svg {
      width: 32px;
      height: 32px;
    }
    
    .unmute-notice:hover {
      background: rgba(0,0,0,0.9);
    }
    
    /* Loading Overlay */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      z-index: 200;
    }
    
    .loading-overlay.hidden { display: none; }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.15);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-text {
      font-size: 1rem;
      color: var(--text-muted);
      animation: pulse-text 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse-text {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
      transform: translate(-50%, -50%) scale(1.05);
    }
    
    .chat-section {
      width: 380px;
      min-width: 380px;
      max-width: 380px;
      flex-shrink: 0;
      background: var(--chat-bg);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border);
    }
    
    @media (max-width: 768px) {
      .webinar-container {
        flex-direction: column;
      }
      
      .video-section {
        height: 40vh;
        height: 40dvh;
        flex: none;
      }
      
      /* Mobile CTA wrapper - sits between video and chat in document flow */
      .cta-mobile-wrapper {
        flex: none;
      }
      
      /* Hide desktop floating CTA on mobile */
      .cta-desktop-floating {
        display: none;
      }
      
      .chat-section {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        flex: 1;
        min-height: 0;
        border-left: none;
        border-top: 1px solid var(--border);
        position: relative;
        z-index: 50;
      }
    }
    
    /* Desktop: show floating CTA */
    @media (min-width: 769px) {
      .cta-mobile-wrapper {
        display: none;
      }
    }
    
    .chat-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .message {
      display: flex;
      gap: 0.75rem;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .message.bot .message-avatar {
      background: var(--primary);
    }
    
    .message.user .message-avatar {
      background: #374151;
    }
    
    .message-content {
      max-width: 75%;
      padding: 0.75rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    .message.bot .message-content {
      background: rgba(255,255,255,0.05);
      border-bottom-left-radius: 4px;
    }
    
    .message.user .message-content {
      background: var(--primary);
      border-bottom-right-radius: 4px;
    }
    
    .typing-indicator {
      display: flex;
      gap: 0.75rem;
      padding: 0 1rem;
    }
    
    .typing-dots {
      display: flex;
      gap: 4px;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
    }
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: var(--text-muted);
      border-radius: 50%;
      animation: bounce 1.4s ease-in-out infinite;
    }
    
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    
    .chat-input-area {
      padding: 1rem;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
      border-top: 1px solid var(--border);
    }
    
    .chat-input-wrapper {
      display: flex;
      gap: 0.5rem;
    }
    
    .chat-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      color: var(--text);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .chat-input:focus {
      border-color: var(--primary);
    }
    
    .chat-input::placeholder {
      color: var(--text-muted);
    }
    
    .send-btn {
      background: var(--primary);
      border: none;
      border-radius: 12px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .send-btn:hover {
      transform: scale(1.05);
    }
    
    .send-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    
    /* Overlays */
    .overlay {
      position: fixed;
      inset: 0;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      text-align: center;
      padding: 2rem;
    }
    
    .overlay.hidden { display: none; }
    
    .countdown-title {
      font-size: 1.5rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }
    
    .countdown-timer {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .countdown-value {
      font-size: 4rem;
      font-weight: 700;
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(180deg, #fff 0%, #999 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .countdown-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .overlay-message {
      color: var(--text-muted);
      max-width: 400px;
      line-height: 1.6;
    }
    
    .ended-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    
    .ended-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    /* Inline Lead Capture Form (inside chat) */
    .lead-capture-inline {
      padding: 1rem;
      background: rgba(0,0,0,0.3);
      border-top: 1px solid var(--border);
    }
    
    .lead-capture-inline.hidden { display: none; }
    
    .lead-capture-title {
      font-size: 0.95rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.75rem;
      color: var(--text);
    }
    
    .lead-capture-title span { margin-right: 0.25rem; }
    
    .lead-form-inline {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .lead-form-row {
      display: flex;
      gap: 0.5rem;
    }
    
    .form-input-inline {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.625rem 0.75rem;
      color: var(--text);
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
      min-width: 0;
    }
    
    .form-input-inline:focus {
      border-color: var(--primary);
    }
    
    .form-input-inline::placeholder {
      color: var(--text-muted);
    }
    
    .submit-btn-inline {
      background: var(--primary);
      border: none;
      border-radius: 8px;
      padding: 0.625rem 1rem;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      transition: all 0.2s;
      white-space: nowrap;
    }
    
    .submit-btn-inline:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(229,57,53,0.3);
    }
    
    .submit-btn-inline svg {
      width: 16px;
      height: 16px;
    }
    
    .privacy-note-inline {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.7rem;
      margin-top: 0.375rem;
    }
    
    @media (max-width: 768px) {
      .lead-form-row {
        flex-direction: column;
      }
      
      .submit-btn-inline {
        width: 100%;
        padding: 0.75rem;
      }
    }
    ${ctaStyles}
  </style>
</head>
<body>

  <!-- Countdown Overlay -->
  <div class="overlay" id="countdownOverlay">
    <h2 class="countdown-title">Webinar Starting In...</h2>
    <div class="countdown-timer">
      <div class="countdown-unit">
        <span class="countdown-value" id="hours">00</span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-value" id="minutes">00</span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-value" id="seconds">00</span>
        <span class="countdown-label">Seconds</span>
      </div>
    </div>
    <p class="overlay-message">Please stay on this page. The session will begin automatically.</p>
  </div>

  <!-- Next Session Countdown Overlay (replaces "ended" message) -->
  <div class="overlay hidden" id="endedOverlay">
    <h2 class="countdown-title">Next Session Starting In...</h2>
    <div class="countdown-timer">
      <div class="countdown-unit">
        <span class="countdown-value" id="nextHours">00</span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-value" id="nextMinutes">00</span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-value" id="nextSeconds">00</span>
        <span class="countdown-label">Seconds</span>
      </div>
    </div>
    <p class="overlay-message">Please stay on this page. The session will begin automatically.</p>
  </div>

  <!-- Main Webinar Room -->
  <div class="webinar-container" id="webinarRoom" style="display: none;">
    <div class="video-section">
      <div class="header">
        <div class="logo-section">
          <div class="logo-circle">${config.logoText}</div>
          <span class="header-title">${config.headerTitle}</span>
        </div>
        <div class="live-badge">
          <span class="live-dot"></span>
          LIVE
        </div>
        <div class="viewer-count">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span id="viewerCount">${config.minViewers}</span> watching
        </div>
      </div>
      <div class="video-wrapper">
        <video id="webinarVideo" playsinline>
          <source src="${config.videoUrl}" type="video/mp4">
        </video>
        <div class="sound-controls" id="soundControls" style="display:none;">
          <button class="mute-btn" id="muteBtn" onclick="toggleMute()">
            <svg id="volumeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg id="mutedIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          </button>
          <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100" oninput="setVolume(this.value)">
        </div>
        <div class="unmute-notice" id="unmuteNotice" onclick="initialUnmute()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
          <span>Click to unmute</span>
        </div>
        <div class="loading-overlay" id="loadingOverlay">
          <div class="loading-spinner"></div>
          <span class="loading-text">Joining live session...</span>
        </div>
      </div>
    </div>
    
    <!-- CTA Bar - positioned between video and chat for proper mobile flow -->
    ${config.ctaStyle === 'banner' ? ctaBannerHtml : ''}
    ${config.ctaStyle === 'floating' ? `<div class="cta-mobile-wrapper">${ctaFloatingHtml.replace('id="ctaFloating"', 'id="ctaMobileFloating"')}</div>` : ''}
    
    <div class="chat-section">
      <div class="chat-header">💬 Live Chat</div>
      <div class="chat-messages" id="chatMessages"></div>
      
      <!-- Inline Lead Capture (shown when lead capture is enabled and user hasn't submitted) -->
      <div class="lead-capture-inline" id="leadCaptureInline">
        <div class="lead-capture-title"><span>💬</span>Enter your info to chat</div>
        <form class="lead-form-inline" id="leadForm">
          <div class="lead-form-row">
            <input type="text" class="form-input-inline" id="leadName" placeholder="Your Name" ${config.requireName ? 'required' : ''}>
            <input type="email" class="form-input-inline" id="leadEmail" placeholder="Your Email" ${config.requireEmail ? 'required' : ''}>
          </div>
          <button type="submit" class="submit-btn-inline">
            Start Chatting
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>
        <p class="privacy-note-inline">🔒 Your info is safe with us</p>
      </div>
      
      <!-- Chat Input (shown after lead capture or if disabled) -->
      <div class="chat-input-area" id="chatInputArea" style="display:none;">
        <div class="chat-input-wrapper">
          <input type="text" class="chat-input" id="chatInput" placeholder="Type a message...">
          <button class="send-btn" onclick="sendMessage()">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Desktop-only floating CTA (mobile version is in-flow above) -->
  <div class="cta-desktop-floating">${config.ctaStyle === 'floating' ? ctaFloatingHtml : ''}</div>

  <script>
    const CONFIG = {
      webinarId: "${config.id}",
      webinarName: "${config.webinarName}",
      videoUrl: "${config.videoUrl}",
      durationSeconds: ${config.durationSeconds},
      startHour: ${config.startHour},
      startMinute: ${config.startMinute},
      timezone: "${config.timezone}",
      minViewers: ${config.minViewers},
      maxViewers: ${config.maxViewers},
      botName: "${config.botName}",
      botAvatar: "${config.botAvatar}",
      webhookUrl: "${config.webhookUrl}",
      typingDelayMin: ${config.typingDelayMin},
      typingDelayMax: ${config.typingDelayMax},
      errorMessage: "${config.errorMessage.replace(/"/g, '\\"')}",
      enableLeadCapture: ${config.enableLeadCapture},
      welcomeMessage: "${config.welcomeMessage.replace(/"/g, '\\"')}",
      leadWebhookUrl: "${config.leadWebhookUrl}",
      enableCta: ${config.enableCta},
      ctaShowAfterSeconds: ${config.ctaShowAfterSeconds},
      ctaButtonText: "${config.ctaButtonText.replace(/"/g, '\\"')}",
      ctaButtonUrl: "${config.ctaButtonUrl}",
      enableTracking: ${config.enableTracking ?? true},
      trackingWebhookUrl: "${config.trackingWebhookUrl || 'https://moshbari.cloud/webhook/webinar-tracking'}",
      supabaseUrl: "https://xidtgjtbhskltygixljs.supabase.co"
    };

    let userData = null;
    let leadId = null;
    let isTyping = false;
    let replyPollIntervalId = null;
    let lastSeenReplyAt = null;

    // Check for stored lead data and toggle inline form visibility
    function initLeadCapture() {
      const storedLead = localStorage.getItem('webinar_lead_' + CONFIG.webinarId);
      if (storedLead) {
        const parsed = JSON.parse(storedLead);
        userData = parsed.userData;
        leadId = parsed.leadId;
        showChatInput();
        startReplyPolling();
        // Load existing chat history on refresh
        loadChatHistory();
      } else if (!CONFIG.enableLeadCapture) {
        showChatInput();
        startReplyPolling();
      } else {
        showLeadForm();
      }
    }
    
    // Load chat history from database on page refresh
    async function loadChatHistory() {
      const email = userData?.email;
      if (!email) return;
      
      try {
        const response = await fetch(CONFIG.supabaseUrl + '/rest/v1/chat_messages?webinar_id=eq.' + CONFIG.webinarId + '&user_email=eq.' + encodeURIComponent(email) + '&order=sent_at.asc&limit=50', {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZHRnanRiaHNrbHR5Z2l4bGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NzUxNDcsImV4cCI6MjA4MzQ1MTE0N30.4JWUO-4B7EBxSnI0jYx_Xswn7Vb7vnl8ahUMAbgBlx0',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZHRnanRiaHNrbHR5Z2l4bGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NzUxNDcsImV4cCI6MjA4MzQ1MTE0N30.4JWUO-4B7EBxSnI0jYx_Xswn7Vb7vnl8ahUMAbgBlx0'
          }
        });
        
        const messages = await response.json();
        if (Array.isArray(messages) && messages.length > 0) {
          // Track seen reply IDs to avoid duplicates when polling
          for (const msg of messages) {
            // Add user message
            if (msg.user_message) {
              addMessage(msg.user_message, 'user', userData?.name);
            }
            // Add AI/human response
            if (msg.ai_response) {
              addMessage(msg.ai_response, 'bot');
              // Mark as seen to prevent duplicate from polling
              if (msg.id && msg.response_type === 'human') {
                seenReplyIds.add(msg.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
    
    function showLeadForm() {
      document.getElementById('leadCaptureInline').style.display = 'block';
      document.getElementById('chatInputArea').style.display = 'none';
    }
    
    function showChatInput() {
      document.getElementById('leadCaptureInline').style.display = 'none';
      document.getElementById('chatInputArea').style.display = 'block';
    }
    
    initLeadCapture();

    // Save lead to database
    async function saveLeadToDb(name, email) {
      try {
        const response = await fetch(CONFIG.supabaseUrl + '/functions/v1/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webinar_id: CONFIG.webinarId,
            name,
            email,
            user_agent: navigator.userAgent
          })
        });
        const data = await response.json();
        return data.lead_id || null;
      } catch (error) {
        console.error('Failed to save lead:', error);
        return null;
      }
    }

    // Save chat message to database
    async function saveChatToDb(userMessage, aiResponse) {
      try {
        await fetch(CONFIG.supabaseUrl + '/functions/v1/save-chat-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webinar_id: CONFIG.webinarId,
            lead_id: leadId,
            user_name: userData?.name || 'Guest',
            user_email: userData?.email || '',
            user_message: userMessage,
            ai_response: aiResponse
          })
        });
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }

    // Poll for human replies (sent from the admin Live Chat)
    const seenReplyIds = new Set();
    
    function startReplyPolling() {
      if (replyPollIntervalId) return;

      replyPollIntervalId = setInterval(async () => {
        const email = userData?.email;
        if (!email) return;

        try {
          const res = await fetch(CONFIG.supabaseUrl + '/functions/v1/check-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: email,
              webinarId: CONFIG.webinarId,
              lastSeenAt: lastSeenReplyAt,
            }),
          });

          const data = await res.json();
          if (data?.hasReply && data?.replies?.length) {
            // Update timestamp to skip these on next poll
            if (data.replyAt) lastSeenReplyAt = data.replyAt;
            
            // Add only new messages (dedupe by id)
            for (const r of data.replies) {
              if (!seenReplyIds.has(r.id)) {
                seenReplyIds.add(r.id);
                addMessage(r.text, 'bot');
              }
            }
          }
        } catch (e) {
          // fail silently
        }
      }, 3000);
    }

    // Lead form submission
    document.getElementById('leadForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('leadName').value.trim();
      const email = document.getElementById('leadEmail').value.trim();
      
      userData = { name, email };
      
      // Save to database
      leadId = await saveLeadToDb(name, email);
      
      localStorage.setItem('webinar_lead_' + CONFIG.webinarId, JSON.stringify({ userData, leadId }));
      
      // Show chat input, hide lead form
      showChatInput();
      startReplyPolling();
      
      // Send to webhook if configured
      if (CONFIG.leadWebhookUrl) {
        fetch(CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'lead_capture',
            name,
            email,
            webinarName: CONFIG.webinarName,
            timestamp: new Date().toISOString(),
            source: 'webinar-chat'
          })
        }).catch(() => {});
      }
      
      // Show welcome message
      const welcome = CONFIG.welcomeMessage.replace('{name}', name);
      addMessage(welcome, 'bot');
    });

    // Calculate webinar state
    function getWebinarState() {
      const now = new Date();
      const options = { timeZone: CONFIG.timezone };
      const localTime = new Date(now.toLocaleString('en-US', options));

      // Today's scheduled start time in the configured timezone
      const todayStart = new Date(localTime);
      todayStart.setHours(CONFIG.startHour, CONFIG.startMinute, 0, 0);

      const todayEnd = new Date(todayStart.getTime() + CONFIG.durationSeconds * 1000);

      // If we're before today's start time, we might still be inside yesterday's session
      // (e.g. webinar starts at 23:00 and lasts 3 hours → continues past midnight)
      if (localTime < todayStart) {
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const yesterdayEnd = new Date(yesterdayStart.getTime() + CONFIG.durationSeconds * 1000);

        if (localTime >= yesterdayStart && localTime < yesterdayEnd) {
          const elapsed = (localTime - yesterdayStart) / 1000;
          return { state: 'live', startTime: yesterdayStart, endTime: yesterdayEnd, elapsed };
        }

        return { state: 'countdown', startTime: todayStart, endTime: todayEnd };
      }

      if (localTime >= todayStart && localTime < todayEnd) {
        const elapsed = (localTime - todayStart) / 1000;
        return { state: 'live', startTime: todayStart, endTime: todayEnd, elapsed };
      }

      return { state: 'ended', startTime: todayStart, endTime: todayEnd };
    }

    let countdownIntervalId = null;

    function updateCountdown() {
      const { state, startTime } = getWebinarState();
      
      if (state !== 'countdown') {
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
        }
        document.getElementById('countdownOverlay').classList.add('hidden');
        if (state === 'live') {
          startWebinar();
        } else {
          showEnded(startTime);
        }
        return;
      }
      
      const now = new Date();
      const options = { timeZone: CONFIG.timezone };
      const localTime = new Date(now.toLocaleString('en-US', options));
      const diff = startTime - localTime;
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      document.getElementById('hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    function startWebinar() {
      document.getElementById('countdownOverlay').classList.add('hidden');
      document.getElementById('webinarRoom').style.display = 'flex';
      
      const video = document.getElementById('webinarVideo');
      const loadingOverlay = document.getElementById('loadingOverlay');
      
      function seekToLivePosition() {
        const { state, elapsed } = getWebinarState();
        if (state !== 'live') return;
        
        const targetTime = elapsed || 0;
        // Only seek if we're more than 2 seconds off to avoid constant seeking
        if (Math.abs(video.currentTime - targetTime) > 2) {
          video.currentTime = targetTime;
        }
        // Hide loading overlay once synced
        loadingOverlay.classList.add('hidden');
      }
      
      // Wait for video metadata to load before seeking
      if (video.readyState >= 1) {
        seekToLivePosition();
      } else {
        video.addEventListener('loadedmetadata', seekToLivePosition, { once: true });
      }
      
      video.muted = true;
      video.play().catch(() => {});
      
      updateViewerCount();
      setInterval(updateViewerCount, 30000);
      
      // Re-sync video when user returns to tab (browser pauses video when tab is hidden)
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          const { state, elapsed } = getWebinarState();
          if (state === 'live' && video) {
            const targetTime = elapsed || 0;
            // Always re-sync when returning to tab
            video.currentTime = targetTime;
            // Resume playback if paused
            if (video.paused) {
              video.play().catch(() => {});
            }
          }
        }
      });
      
      // Check for ended state
      setInterval(() => {
        const { state, startTime } = getWebinarState();
        if (state === 'ended') {
          showEnded(startTime);
        }
      }, 1000);
    }

    function showEnded(startTime) {
      document.getElementById('webinarRoom').style.display = 'none';
      document.getElementById('endedOverlay').classList.remove('hidden');
      
      // Calculate next session time (tomorrow at the same time)
      const nextStart = new Date(startTime);
      nextStart.setDate(nextStart.getDate() + 1);
      
      // Start countdown to next session
      function updateNextCountdown() {
        const now = new Date();
        const options = { timeZone: CONFIG.timezone };
        const localTime = new Date(now.toLocaleString('en-US', options));
        const diff = nextStart - localTime;
        
        if (diff <= 0) {
          // Next session started, reload page
          location.reload();
          return;
        }
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        document.getElementById('nextHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('nextMinutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('nextSeconds').textContent = String(seconds).padStart(2, '0');
      }
      
      updateNextCountdown();
      setInterval(updateNextCountdown, 1000);
    }

    function updateViewerCount() {
      const count = Math.floor(Math.random() * (CONFIG.maxViewers - CONFIG.minViewers + 1)) + CONFIG.minViewers;
      document.getElementById('viewerCount').textContent = count;
    }

    function initialUnmute() {
      const video = document.getElementById('webinarVideo');
      video.muted = false;
      document.getElementById('unmuteNotice').style.display = 'none';
      document.getElementById('soundControls').style.display = 'flex';
      updateVolumeIcon();
    }
    
    function toggleMute() {
      const video = document.getElementById('webinarVideo');
      video.muted = !video.muted;
      updateVolumeIcon();
    }
    
    function setVolume(value) {
      const video = document.getElementById('webinarVideo');
      video.volume = value / 100;
      if (value == 0) {
        video.muted = true;
      } else if (video.muted) {
        video.muted = false;
      }
      updateVolumeIcon();
    }
    
    function updateVolumeIcon() {
      const video = document.getElementById('webinarVideo');
      const volumeIcon = document.getElementById('volumeIcon');
      const mutedIcon = document.getElementById('mutedIcon');
      const slider = document.getElementById('volumeSlider');
      
      if (video.muted || video.volume === 0) {
        volumeIcon.style.display = 'none';
        mutedIcon.style.display = 'block';
        slider.value = 0;
      } else {
        volumeIcon.style.display = 'block';
        mutedIcon.style.display = 'none';
        slider.value = video.volume * 100;
      }
    }

    function addMessage(content, sender, userName) {
      const container = document.getElementById('chatMessages');
      const div = document.createElement('div');
      div.className = 'message ' + sender;
      
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = sender === 'bot' ? CONFIG.botAvatar : (userName ? userName[0].toUpperCase() : 'U');
      
      const msg = document.createElement('div');
      msg.className = 'message-content';
      msg.textContent = content;
      
      div.appendChild(avatar);
      div.appendChild(msg);
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
      if (isTyping) return;
      isTyping = true;
      
      const container = document.getElementById('chatMessages');
      const div = document.createElement('div');
      div.className = 'typing-indicator';
      div.id = 'typingIndicator';
      
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.style.background = 'var(--primary)';
      avatar.textContent = CONFIG.botAvatar;
      
      const dots = document.createElement('div');
      dots.className = 'typing-dots';
      dots.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      
      div.appendChild(avatar);
      div.appendChild(dots);
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function hideTyping() {
      isTyping = false;
      const indicator = document.getElementById('typingIndicator');
      if (indicator) indicator.remove();
    }

    async function sendMessage() {
      const input = document.getElementById('chatInput');
      const message = input.value.trim();
      if (!message) return;
      
      input.value = '';
      addMessage(message, 'user', userData?.name);
      
      // Show typing indicator
      const delay = (Math.random() * (CONFIG.typingDelayMax - CONFIG.typingDelayMin) + CONFIG.typingDelayMin) * 1000;
      showTyping();
      
      let aiResponse = CONFIG.errorMessage;
      
      try {
        const response = await fetch(CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'chat_message',
            message,
            userName: userData?.name || 'Guest',
            userEmail: userData?.email || '',
            timestamp: new Date().toISOString()
          })
        });
        
        const data = await response.json();
        
        // Handle different response formats from N8N/webhooks
        if (typeof data === 'string') {
          aiResponse = data;
        } else if (data.output?.[0]?.content?.[0]?.text) {
          // N8N OpenAI node format
          aiResponse = data.output[0].content[0].text;
        } else if (data.output) {
          aiResponse = data.output;
        } else if (data.reply) {
          aiResponse = data.reply;
        } else if (data.response) {
          aiResponse = data.response;
        } else if (data.message) {
          aiResponse = data.message;
        } else if (data.text) {
          aiResponse = data.text;
        } else if (data.content) {
          aiResponse = data.content;
        } else {
          aiResponse = CONFIG.errorMessage;
        }
      } catch (error) {
        console.error('Webhook error:', error);
      }
      
      // Save to database
      saveChatToDb(message, aiResponse);
      
      setTimeout(() => {
        hideTyping();
        addMessage(aiResponse, 'bot');
      }, delay);
    }

    // Enter key to send
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    // Disable right-click on video
    document.getElementById('webinarVideo').addEventListener('contextmenu', e => e.preventDefault());

    ${ctaScript}

    // ============ TRACKING SYSTEM ============
    const trackingState = {
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      sentMilestones: new Set(),
      lastProgressCheck: 0,
      hasJoined: false,
      hasLeft: false
    };

    function getDeviceType() {
      const ua = navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
      if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
      return 'desktop';
    }

    function buildTrackingPayload(eventType, extra = {}) {
      const { elapsed } = getWebinarState();
      const watchMinutes = ((elapsed || 0) / 60).toFixed(2);
      const watchPercent = CONFIG.durationSeconds > 0 ? Math.round(((elapsed || 0) / CONFIG.durationSeconds) * 100) : 0;

      // Build payload matching exact database columns (no extra fields)
      const payload = {
        webinar_id: CONFIG.webinarId || '',
        webinar_name: CONFIG.webinarName || '',
        user_name: userData?.name || 'Anonymous',
        user_email: userData?.email || 'unknown@unknown.com',
        event_type: eventType,
        watch_percent: watchPercent,
        watch_minutes: parseFloat(watchMinutes),
        session_id: trackingState.sessionId,
        device_type: getDeviceType()
      };
      
      // Only add optional fields if they have values
      if (extra.cta_url) payload.cta_url = extra.cta_url;
      if (extra.chat_message) payload.chat_message = extra.chat_message;
      
      return payload;
    }

    async function sendTrackingEvent(eventType, extra = {}, useBeacon = false) {
      if (!CONFIG.enableTracking) return;

      const payload = buildTrackingPayload(eventType, extra);

      // Save to Supabase via edge function (captures IP address server-side)
      try {
        if (useBeacon && navigator.sendBeacon) {
          navigator.sendBeacon(CONFIG.supabaseUrl + '/functions/v1/track-event', JSON.stringify(payload));
        } else {
          fetch(CONFIG.supabaseUrl + '/functions/v1/track-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }).catch(() => {});
        }
      } catch (e) {}

      // Send to webhook
      if (CONFIG.trackingWebhookUrl) {
        if (useBeacon && navigator.sendBeacon) {
          navigator.sendBeacon(CONFIG.trackingWebhookUrl, JSON.stringify(payload));
        } else {
          fetch(CONFIG.trackingWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        }
      }
    }

    function trackJoinOnce() {
      if (trackingState.hasJoined) return;
      trackingState.hasJoined = true;
      sendTrackingEvent('join');
    }

    function trackLeaveOnce() {
      if (trackingState.hasLeft) return;
      trackingState.hasLeft = true;
      sendTrackingEvent('leave', {}, true);
    }

    function checkProgressMilestones() {
      const { state, elapsed } = getWebinarState();
      if (state !== 'live' || CONFIG.durationSeconds <= 0) return;

      const percent = Math.round((elapsed / CONFIG.durationSeconds) * 100);
      const milestones = [25, 50, 75, 100];

      for (const milestone of milestones) {
        if (percent >= milestone && !trackingState.sentMilestones.has(milestone)) {
          trackingState.sentMilestones.add(milestone);
          sendTrackingEvent('progress_' + milestone);
        }
      }
    }

    // Track join event on webinar start
    const originalStartWebinar = startWebinar;
    startWebinar = function() {
      originalStartWebinar.apply(this, arguments);
      trackJoinOnce();
      // Start progress checking every 5 seconds
      setInterval(checkProgressMilestones, 5000);
    };

    // Track CTA click
    const originalTrackCtaClick = typeof trackCtaClick === 'function' ? trackCtaClick : null;
    window.trackCtaClick = function() {
      sendTrackingEvent('cta_click', { cta_url: CONFIG.ctaButtonUrl });
      if (originalTrackCtaClick) originalTrackCtaClick();
    };

    // Track chat messages
    const originalSendMessage = sendMessage;
    sendMessage = async function() {
      const input = document.getElementById('chatInput');
      const message = input.value.trim();
      if (message) {
        sendTrackingEvent('chat_message', { chat_message: message });
      }
      return originalSendMessage.apply(this, arguments);
    };

    // Track leave event
    window.addEventListener('beforeunload', function() {
      trackLeaveOnce();
    });

    window.addEventListener('pagehide', function() {
      trackLeaveOnce();
    });

    // Initialize
    trackJoinOnce();
    const { state } = getWebinarState();
    if (state === 'countdown') {
      updateCountdown();
      countdownIntervalId = setInterval(updateCountdown, 1000);
    } else if (state === 'live') {
      document.getElementById('countdownOverlay').classList.add('hidden');
      startWebinar();
    } else {
      const { startTime } = getWebinarState();
      document.getElementById('countdownOverlay').classList.add('hidden');
      showEnded(startTime);
    }
  </script>
</body>
</html>`;
};
