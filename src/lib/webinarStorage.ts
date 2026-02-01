import { supabase } from '@/integrations/supabase/client';
import { WebinarConfig, DEFAULT_WEBINAR_CONFIG } from '@/types/webinar';
import { VideoSequenceItem } from '@/types/clip';

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Convert database row to WebinarConfig
export const rowToConfig = (row: any): WebinarConfig => ({
  id: row.id,
  webinarName: row.webinar_name,
  headerTitle: row.header_title,
  logoText: row.logo_text,
  videoUrl: row.video_url,
  durationSeconds: row.duration_minutes * 60,
  videoMode: row.video_mode ?? 'single',
  videoSequence: (row.video_sequence as VideoSequenceItem[]) ?? [],
  startHour: row.start_hour ?? 12,
  startMinute: row.start_minute ?? 0,
  timezone: row.timezone,
  minViewers: row.min_viewers,
  maxViewers: row.max_viewers,
  botName: row.bot_name,
  botAvatar: row.bot_avatar,
  webhookUrl: row.webhook_url,
  typingDelayMin: row.typing_delay_min,
  typingDelayMax: row.typing_delay_max,
  errorMessage: row.error_message,
  enableLeadCapture: row.enable_lead_capture,
  requireName: row.require_name,
  requireEmail: row.require_email,
  welcomeMessage: row.welcome_message,
  leadWebhookUrl: row.lead_webhook_url,
  enableCta: row.enable_cta,
  ctaShowAfterSeconds: row.cta_show_after_minutes * 60,
  ctaHeadline: row.cta_headline,
  ctaSubheadline: row.cta_subheadline,
  ctaButtonText: row.cta_button_text,
  ctaButtonUrl: row.cta_button_url,
  ctaButtonColor: row.cta_button_color,
  ctaStyle: row.cta_style,
  ctaShowUrgency: row.cta_show_urgency,
  ctaUrgencyText: row.cta_urgency_text,
  enableTracking: row.enable_tracking ?? true,
  trackingWebhookUrl: row.tracking_webhook_url ?? 'https://moshbari.cloud/webhook/webinar-tracking',
  primaryColor: row.primary_color,
  backgroundColor: row.background_color,
  chatBackground: row.chat_background,
  // Registration Form fields
  enableRegistrationForm: row.enable_registration_form ?? false,
  regFormHeadline: row.reg_form_headline ?? 'Register for the Free Training',
  regFormSubheadline: row.reg_form_subheadline ?? 'Save your spot now!',
  regFormNameLabel: row.reg_form_name_label ?? 'Your Name',
  regFormNamePlaceholder: row.reg_form_name_placeholder ?? 'Enter your name',
  regFormEmailLabel: row.reg_form_email_label ?? 'Your Email',
  regFormEmailPlaceholder: row.reg_form_email_placeholder ?? 'Enter your email',
  regFormButtonText: row.reg_form_button_text ?? 'Reserve My Seat →',
  regFormButtonColor: row.reg_form_button_color ?? '#e53935',
  regFormGhlWebhookUrl: row.reg_form_ghl_webhook_url ?? '',
  regFormThankYouUrl: row.reg_form_thank_you_url ?? '',
  regFormShowDatetime: row.reg_form_show_datetime ?? true,
  regFormBackground: row.reg_form_background ?? '#0a0a0f',
  regFormTextColor: row.reg_form_text_color ?? '#ffffff',
  regFormBorderRadius: row.reg_form_border_radius ?? 'rounded',
  regFormShowPrivacy: row.reg_form_show_privacy ?? true,
  regFormPrivacyText: row.reg_form_privacy_text ?? 'We respect your privacy. Unsubscribe anytime.',
  regFormTheme: row.reg_form_theme ?? 'dark',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Convert WebinarConfig to database insert/update format
const configToRow = (config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>) => ({
  webinar_name: config.webinarName,
  header_title: config.headerTitle,
  logo_text: config.logoText,
  video_url: config.videoUrl,
  duration_minutes: Math.ceil(config.durationSeconds / 60),
  video_mode: config.videoMode,
  video_sequence: config.videoSequence,
  start_hour: config.startHour,
  start_minute: config.startMinute,
  timezone: config.timezone,
  min_viewers: config.minViewers,
  max_viewers: config.maxViewers,
  bot_name: config.botName,
  bot_avatar: config.botAvatar,
  webhook_url: config.webhookUrl,
  typing_delay_min: config.typingDelayMin,
  typing_delay_max: config.typingDelayMax,
  error_message: config.errorMessage,
  enable_lead_capture: config.enableLeadCapture,
  require_name: config.requireName,
  require_email: config.requireEmail,
  welcome_message: config.welcomeMessage,
  lead_webhook_url: config.leadWebhookUrl,
  enable_cta: config.enableCta,
  cta_show_after_minutes: Math.ceil(config.ctaShowAfterSeconds / 60),
  cta_headline: config.ctaHeadline,
  cta_subheadline: config.ctaSubheadline,
  cta_button_text: config.ctaButtonText,
  cta_button_url: config.ctaButtonUrl,
  cta_button_color: config.ctaButtonColor,
  cta_style: config.ctaStyle,
  cta_show_urgency: config.ctaShowUrgency,
  cta_urgency_text: config.ctaUrgencyText,
  enable_tracking: config.enableTracking,
  tracking_webhook_url: config.trackingWebhookUrl,
  primary_color: config.primaryColor,
  background_color: config.backgroundColor,
  chat_background: config.chatBackground,
  // Registration Form fields
  enable_registration_form: config.enableRegistrationForm,
  reg_form_headline: config.regFormHeadline,
  reg_form_subheadline: config.regFormSubheadline,
  reg_form_name_label: config.regFormNameLabel,
  reg_form_name_placeholder: config.regFormNamePlaceholder,
  reg_form_email_label: config.regFormEmailLabel,
  reg_form_email_placeholder: config.regFormEmailPlaceholder,
  reg_form_button_text: config.regFormButtonText,
  reg_form_button_color: config.regFormButtonColor,
  reg_form_ghl_webhook_url: config.regFormGhlWebhookUrl,
  reg_form_thank_you_url: config.regFormThankYouUrl,
  reg_form_show_datetime: config.regFormShowDatetime,
  reg_form_background: config.regFormBackground,
  reg_form_text_color: config.regFormTextColor,
  reg_form_border_radius: config.regFormBorderRadius,
  reg_form_show_privacy: config.regFormShowPrivacy,
  reg_form_privacy_text: config.regFormPrivacyText,
  reg_form_theme: config.regFormTheme,
});

export const getWebinars = async (): Promise<WebinarConfig[]> => {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching webinars:', error);
    return [];
  }
  
  return data.map(rowToConfig);
};

export const getWebinar = async (id: string): Promise<WebinarConfig | null> => {
  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching webinar:', error);
    return null;
  }
  
  return data ? rowToConfig(data) : null;
};

export const saveWebinar = async (config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebinarConfig | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('webinars')
    .insert({ ...configToRow(config), user_id: userId } as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving webinar:', error);
    return null;
  }
  
  return rowToConfig(data);
};

export const updateWebinar = async (id: string, config: Partial<WebinarConfig>): Promise<WebinarConfig | null> => {
  const { id: _, createdAt, updatedAt, ...rest } = config as any;
  
  const updateData: any = {};
  if (rest.webinarName !== undefined) updateData.webinar_name = rest.webinarName;
  if (rest.headerTitle !== undefined) updateData.header_title = rest.headerTitle;
  if (rest.logoText !== undefined) updateData.logo_text = rest.logoText;
  if (rest.videoUrl !== undefined) updateData.video_url = rest.videoUrl;
  if (rest.durationSeconds !== undefined) updateData.duration_minutes = Math.ceil(rest.durationSeconds / 60);
  if (rest.videoMode !== undefined) updateData.video_mode = rest.videoMode;
  if (rest.videoSequence !== undefined) updateData.video_sequence = rest.videoSequence;
  if (rest.startHour !== undefined) updateData.start_hour = rest.startHour;
  if (rest.startMinute !== undefined) updateData.start_minute = rest.startMinute;
  if (rest.timezone !== undefined) updateData.timezone = rest.timezone;
  if (rest.minViewers !== undefined) updateData.min_viewers = rest.minViewers;
  if (rest.maxViewers !== undefined) updateData.max_viewers = rest.maxViewers;
  if (rest.botName !== undefined) updateData.bot_name = rest.botName;
  if (rest.botAvatar !== undefined) updateData.bot_avatar = rest.botAvatar;
  if (rest.webhookUrl !== undefined) updateData.webhook_url = rest.webhookUrl;
  if (rest.typingDelayMin !== undefined) updateData.typing_delay_min = rest.typingDelayMin;
  if (rest.typingDelayMax !== undefined) updateData.typing_delay_max = rest.typingDelayMax;
  if (rest.errorMessage !== undefined) updateData.error_message = rest.errorMessage;
  if (rest.enableLeadCapture !== undefined) updateData.enable_lead_capture = rest.enableLeadCapture;
  if (rest.requireName !== undefined) updateData.require_name = rest.requireName;
  if (rest.requireEmail !== undefined) updateData.require_email = rest.requireEmail;
  if (rest.welcomeMessage !== undefined) updateData.welcome_message = rest.welcomeMessage;
  if (rest.leadWebhookUrl !== undefined) updateData.lead_webhook_url = rest.leadWebhookUrl;
  if (rest.enableCta !== undefined) updateData.enable_cta = rest.enableCta;
  if (rest.ctaShowAfterSeconds !== undefined) updateData.cta_show_after_minutes = Math.ceil(rest.ctaShowAfterSeconds / 60);
  if (rest.ctaHeadline !== undefined) updateData.cta_headline = rest.ctaHeadline;
  if (rest.ctaSubheadline !== undefined) updateData.cta_subheadline = rest.ctaSubheadline;
  if (rest.ctaButtonText !== undefined) updateData.cta_button_text = rest.ctaButtonText;
  if (rest.ctaButtonUrl !== undefined) updateData.cta_button_url = rest.ctaButtonUrl;
  if (rest.ctaButtonColor !== undefined) updateData.cta_button_color = rest.ctaButtonColor;
  if (rest.ctaStyle !== undefined) updateData.cta_style = rest.ctaStyle;
  if (rest.ctaShowUrgency !== undefined) updateData.cta_show_urgency = rest.ctaShowUrgency;
  if (rest.ctaUrgencyText !== undefined) updateData.cta_urgency_text = rest.ctaUrgencyText;
  if (rest.enableTracking !== undefined) updateData.enable_tracking = rest.enableTracking;
  if (rest.trackingWebhookUrl !== undefined) updateData.tracking_webhook_url = rest.trackingWebhookUrl;
  if (rest.primaryColor !== undefined) updateData.primary_color = rest.primaryColor;
  if (rest.backgroundColor !== undefined) updateData.background_color = rest.backgroundColor;
  if (rest.chatBackground !== undefined) updateData.chat_background = rest.chatBackground;
  // Registration Form fields
  if (rest.enableRegistrationForm !== undefined) updateData.enable_registration_form = rest.enableRegistrationForm;
  if (rest.regFormHeadline !== undefined) updateData.reg_form_headline = rest.regFormHeadline;
  if (rest.regFormSubheadline !== undefined) updateData.reg_form_subheadline = rest.regFormSubheadline;
  if (rest.regFormNameLabel !== undefined) updateData.reg_form_name_label = rest.regFormNameLabel;
  if (rest.regFormNamePlaceholder !== undefined) updateData.reg_form_name_placeholder = rest.regFormNamePlaceholder;
  if (rest.regFormEmailLabel !== undefined) updateData.reg_form_email_label = rest.regFormEmailLabel;
  if (rest.regFormEmailPlaceholder !== undefined) updateData.reg_form_email_placeholder = rest.regFormEmailPlaceholder;
  if (rest.regFormButtonText !== undefined) updateData.reg_form_button_text = rest.regFormButtonText;
  if (rest.regFormButtonColor !== undefined) updateData.reg_form_button_color = rest.regFormButtonColor;
  if (rest.regFormGhlWebhookUrl !== undefined) updateData.reg_form_ghl_webhook_url = rest.regFormGhlWebhookUrl;
  if (rest.regFormThankYouUrl !== undefined) updateData.reg_form_thank_you_url = rest.regFormThankYouUrl;
  if (rest.regFormShowDatetime !== undefined) updateData.reg_form_show_datetime = rest.regFormShowDatetime;
  if (rest.regFormBackground !== undefined) updateData.reg_form_background = rest.regFormBackground;
  if (rest.regFormTextColor !== undefined) updateData.reg_form_text_color = rest.regFormTextColor;
  if (rest.regFormBorderRadius !== undefined) updateData.reg_form_border_radius = rest.regFormBorderRadius;
  if (rest.regFormShowPrivacy !== undefined) updateData.reg_form_show_privacy = rest.regFormShowPrivacy;
  if (rest.regFormPrivacyText !== undefined) updateData.reg_form_privacy_text = rest.regFormPrivacyText;
  if (rest.regFormTheme !== undefined) updateData.reg_form_theme = rest.regFormTheme;

  const { data, error } = await supabase
    .from('webinars')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating webinar:', error);
    return null;
  }
  
  return rowToConfig(data);
};

export const deleteWebinar = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('webinars')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting webinar:', error);
    return false;
  }
  
  return true;
};

export const createDefaultWebinar = (): Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'> => {
  return { ...DEFAULT_WEBINAR_CONFIG };
};
