import { WebinarConfig, TIMEZONES } from '@/types/webinar';

const getBorderRadius = (radius: string) => {
  switch (radius) {
    case 'none': return '0px';
    case 'slight': return '6px';
    case 'rounded': return '12px';
    case 'pill': return '9999px';
    default: return '12px';
  }
};

export const generateRegistrationFormCode = (config: WebinarConfig): string => {
  const isDark = config.regFormTheme === 'dark';
  const borderRadius = getBorderRadius(config.regFormBorderRadius);
  
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register - ${config.webinarName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: ${config.regFormBackground};
      color: ${config.regFormTextColor};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    h1, h2 { font-family: 'Space Grotesk', system-ui, sans-serif; }
    
    .reg-container {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      border-radius: ${borderRadius};
      background: ${config.regFormBackground};
      text-align: center;
    }
    
    .reg-headline {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    
    .reg-subheadline {
      opacity: 0.8;
      margin-bottom: 1rem;
    }
    
    .reg-datetime {
      display: inline-block;
      background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    
    .reg-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-group {
      text-align: left;
    }
    
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.375rem;
    }
    
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: ${inputBg};
      border: 1px solid ${inputBorder};
      border-radius: ${borderRadius};
      color: ${config.regFormTextColor};
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-input:focus {
      border-color: ${config.regFormButtonColor};
      box-shadow: 0 0 0 3px ${config.regFormButtonColor}33;
    }
    
    .form-input::placeholder {
      opacity: 0.5;
    }
    
    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: ${config.regFormButtonColor};
      color: white;
      border: none;
      border-radius: ${borderRadius};
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px ${config.regFormButtonColor}40;
    }
    
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    
    .privacy-note {
      font-size: 0.75rem;
      opacity: 0.6;
      margin-top: 0.5rem;
    }
    
    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: none;
    }
    
    .error-message.show {
      display: block;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 0.5rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="reg-container">
    <h1 class="reg-headline">${config.regFormHeadline}</h1>
    ${config.regFormSubheadline ? `<p class="reg-subheadline">${config.regFormSubheadline}</p>` : ''}
    ${config.regFormShowDatetime ? '<div class="reg-datetime" id="sessionDateTime">📅 Loading next session...</div>' : ''}
    
    <form class="reg-form" id="registrationForm">
      <div class="form-group">
        <label class="form-label">${config.regFormNameLabel}</label>
        <input 
          type="text" 
          class="form-input" 
          id="nameInput"
          name="name"
          placeholder="${config.regFormNamePlaceholder}"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">${config.regFormEmailLabel}</label>
        <input 
          type="email" 
          class="form-input" 
          id="emailInput"
          name="email"
          placeholder="${config.regFormEmailPlaceholder}"
          required
        />
      </div>
      
      <button type="submit" class="submit-btn" id="submitBtn">
        ${config.regFormButtonText}
      </button>
      
      <div class="error-message" id="errorMessage"></div>
      
      ${config.regFormShowPrivacy ? `<p class="privacy-note">🔒 ${config.regFormPrivacyText}</p>` : ''}
    </form>
  </div>
  
  <script>
    const CONFIG = {
      webinarId: '${config.id}',
      webinarName: '${config.webinarName.replace(/'/g, "\\'")}',
      startHour: ${config.startHour},
      startMinute: ${config.startMinute},
      timezone: '${config.timezone}',
      ghlWebhookUrl: '${config.regFormGhlWebhookUrl}',
      thankYouUrl: '${config.regFormThankYouUrl}'
    };
    
    // Calculate next session
    function getNextSession() {
      const now = new Date();
      const session = new Date(now);
      session.setHours(CONFIG.startHour, CONFIG.startMinute, 0, 0);
      
      if (session <= now) {
        session.setDate(session.getDate() + 1);
      }
      
      return session;
    }
    
    // Display next session datetime
    ${config.regFormShowDatetime ? `
    const sessionEl = document.getElementById('sessionDateTime');
    if (sessionEl) {
      const next = getNextSession();
      const dateStr = next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const timeStr = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      sessionEl.textContent = '📅 Next Session: ' + dateStr + ' at ' + timeStr;
    }
    ` : ''}
    
    // Form submission
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorEl = document.getElementById('errorMessage');
    const originalBtnText = submitBtn.textContent;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('nameInput').value.trim();
      const email = document.getElementById('emailInput').value.trim();
      
      // Validation
      if (!name || !email) {
        showError('Please fill in all fields');
        return;
      }
      
      if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
      }
      
      // Set loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span>Registering...';
      errorEl.classList.remove('show');
      
      // Prepare data
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        name: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        webinar_id: CONFIG.webinarId,
        webinar_name: CONFIG.webinarName,
        registered_at: new Date().toISOString(),
        source: 'registration_form'
      };
      
      try {
        // Send to GHL webhook
        if (CONFIG.ghlWebhookUrl) {
          await fetch(CONFIG.ghlWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'no-cors'
          });
        }
        
        // Redirect to thank you page
        if (CONFIG.thankYouUrl) {
          const redirectUrl = new URL(CONFIG.thankYouUrl);
          redirectUrl.searchParams.set('name', encodeURIComponent(name));
          redirectUrl.searchParams.set('email', encodeURIComponent(email));
          window.location.href = redirectUrl.toString();
        } else {
          // Show success state
          submitBtn.textContent = '✓ Registered!';
          submitBtn.style.background = '#22c55e';
        }
      } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
    
    function showError(message) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    
    function isValidEmail(email) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    }
  </script>
</body>
</html>`;
};
