import { WebinarConfig } from '@/types/webinar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ClipboardList, ChevronDown, Settings2, Link, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormSettingsProps {
  config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>;
  onChange: (config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  webinarId?: string; // Optional webinar ID for generating hosted URL
}

export function RegistrationFormSettings({ config, onChange, webinarId }: RegistrationFormSettingsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const updateField = <K extends keyof typeof config>(field: K, value: typeof config[K]) => {
    onChange({ ...config, [field]: value });
  };

  // Generate the hosted registration URL
  const hostedUrl = webinarId 
    ? `${window.location.origin}/register/${webinarId}`
    : null;

  const copyHostedUrl = async () => {
    if (!hostedUrl) return;
    
    try {
      await navigator.clipboard.writeText(hostedUrl);
      setCopied(true);
      toast({
        title: "URL Copied!",
        description: "Registration page URL copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <ClipboardList className="w-5 h-5 text-primary" />
          Registration Form
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableRegistrationForm">Enable Registration Form</Label>
            <p className="text-xs text-muted-foreground">Generate embeddable registration form</p>
          </div>
          <Switch
            id="enableRegistrationForm"
            checked={config.enableRegistrationForm}
            onCheckedChange={(v) => updateField('enableRegistrationForm', v)}
          />
        </div>
        
        {config.enableRegistrationForm && (
          <>
            {/* Form Content */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="regFormHeadline">Form Headline</Label>
                <Input
                  id="regFormHeadline"
                  value={config.regFormHeadline}
                  onChange={(e) => updateField('regFormHeadline', e.target.value)}
                  placeholder="Register for the Free Training"
                  className="input-field"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regFormSubheadline">Form Subheadline (optional)</Label>
                <Input
                  id="regFormSubheadline"
                  value={config.regFormSubheadline}
                  onChange={(e) => updateField('regFormSubheadline', e.target.value)}
                  placeholder="Save your spot now!"
                  className="input-field"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regFormNameLabel">Name Field Label</Label>
                  <Input
                    id="regFormNameLabel"
                    value={config.regFormNameLabel}
                    onChange={(e) => updateField('regFormNameLabel', e.target.value)}
                    placeholder="Your Name"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regFormNamePlaceholder">Name Placeholder</Label>
                  <Input
                    id="regFormNamePlaceholder"
                    value={config.regFormNamePlaceholder}
                    onChange={(e) => updateField('regFormNamePlaceholder', e.target.value)}
                    placeholder="Enter your name"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regFormEmailLabel">Email Field Label</Label>
                  <Input
                    id="regFormEmailLabel"
                    value={config.regFormEmailLabel}
                    onChange={(e) => updateField('regFormEmailLabel', e.target.value)}
                    placeholder="Your Email"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regFormEmailPlaceholder">Email Placeholder</Label>
                  <Input
                    id="regFormEmailPlaceholder"
                    value={config.regFormEmailPlaceholder}
                    onChange={(e) => updateField('regFormEmailPlaceholder', e.target.value)}
                    placeholder="Enter your email"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regFormButtonText">Button Text</Label>
                  <Input
                    id="regFormButtonText"
                    value={config.regFormButtonText}
                    onChange={(e) => updateField('regFormButtonText', e.target.value)}
                    placeholder="Reserve My Seat →"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regFormButtonColor">Button Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="regFormButtonColor"
                      value={config.regFormButtonColor}
                      onChange={(e) => updateField('regFormButtonColor', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={config.regFormButtonColor}
                      onChange={(e) => updateField('regFormButtonColor', e.target.value)}
                      className="input-field flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regFormGhlWebhookUrl">GHL Webhook URL</Label>
                <Input
                  id="regFormGhlWebhookUrl"
                  type="url"
                  value={config.regFormGhlWebhookUrl}
                  onChange={(e) => updateField('regFormGhlWebhookUrl', e.target.value)}
                  placeholder="https://services.leadconnectorhq.com/hooks/..."
                  className="input-field"
                />
                <p className="text-xs text-muted-foreground">GoHighLevel webhook to receive registrations</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regFormThankYouUrl">Thank You Page URL</Label>
                <Input
                  id="regFormThankYouUrl"
                  type="url"
                  value={config.regFormThankYouUrl}
                  onChange={(e) => updateField('regFormThankYouUrl', e.target.value)}
                  placeholder="https://yoursite.com/thank-you"
                  className="input-field"
                />
                <p className="text-xs text-muted-foreground">Redirect URL after successful registration</p>
              </div>
              
              {/* Hosted Registration Page URL */}
              {hostedUrl && (
                <div className="p-4 rounded-lg border border-border/50 bg-secondary/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Hosted Registration Page</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link directly – no embedding needed
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={hostedUrl}
                      readOnly
                      className="input-field flex-1 text-sm font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyHostedUrl}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <Label htmlFor="regFormShowDatetime">Show Webinar DateTime</Label>
                  <p className="text-xs text-muted-foreground">Display next session date/time on form</p>
                </div>
                <Switch
                  id="regFormShowDatetime"
                  checked={config.regFormShowDatetime}
                  onCheckedChange={(v) => updateField('regFormShowDatetime', v)}
                />
              </div>
              
              {/* Advanced Settings */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-2">
                  <Settings2 className="w-4 h-4" />
                  Advanced Styling
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="regFormTheme">Form Theme</Label>
                    <Select
                      value={config.regFormTheme}
                      onValueChange={(v) => updateField('regFormTheme', v as 'dark' | 'light')}
                    >
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark Theme</SelectItem>
                        <SelectItem value="light">Light Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="regFormBackground">Form Background</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="regFormBackground"
                          value={config.regFormBackground}
                          onChange={(e) => updateField('regFormBackground', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={config.regFormBackground}
                          onChange={(e) => updateField('regFormBackground', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regFormTextColor">Text Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="regFormTextColor"
                          value={config.regFormTextColor}
                          onChange={(e) => updateField('regFormTextColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={config.regFormTextColor}
                          onChange={(e) => updateField('regFormTextColor', e.target.value)}
                          className="input-field flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regFormBorderRadius">Border Radius</Label>
                    <Select
                      value={config.regFormBorderRadius}
                      onValueChange={(v) => updateField('regFormBorderRadius', v as 'none' | 'slight' | 'rounded' | 'pill')}
                    >
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (0px)</SelectItem>
                        <SelectItem value="slight">Slight (6px)</SelectItem>
                        <SelectItem value="rounded">Rounded (12px)</SelectItem>
                        <SelectItem value="pill">Pill (9999px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <Label htmlFor="regFormShowPrivacy">Show Privacy Note</Label>
                      <p className="text-xs text-muted-foreground">Display privacy message below button</p>
                    </div>
                    <Switch
                      id="regFormShowPrivacy"
                      checked={config.regFormShowPrivacy}
                      onCheckedChange={(v) => updateField('regFormShowPrivacy', v)}
                    />
                  </div>
                  
                  {config.regFormShowPrivacy && (
                    <div className="space-y-2">
                      <Label htmlFor="regFormPrivacyText">Privacy Note Text</Label>
                      <Input
                        id="regFormPrivacyText"
                        value={config.regFormPrivacyText}
                        onChange={(e) => updateField('regFormPrivacyText', e.target.value)}
                        placeholder="We respect your privacy. Unsubscribe anytime."
                        className="input-field"
                      />
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
