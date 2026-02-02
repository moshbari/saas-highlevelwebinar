import { WebinarConfig, TIMEZONES } from '@/types/webinar';
import { VideoMode, VideoSequenceItem } from '@/types/clip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Video, 
  Clock, 
  Users, 
  MessageSquare, 
  UserPlus, 
  Palette,
  Info,
  Megaphone,
  BarChart3,
  Film,
  Layers,
} from 'lucide-react';
import { RegistrationFormSettings } from './RegistrationFormSettings';
import { RegistrationFormPreview } from './RegistrationFormPreview';
import { VideoSequenceBuilder } from './VideoSequenceBuilder';
import { ChatbotConfigPanel } from './ChatbotConfigPanel';
interface WebinarFormProps {
  config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>;
  onChange: (config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  webinarId?: string; // Optional webinar ID for existing webinars
}

export function WebinarForm({ config, onChange, webinarId }: WebinarFormProps) {
  const updateField = <K extends keyof typeof config>(field: K, value: typeof config[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Info className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="webinarName">Webinar Name</Label>
              <Input
                id="webinarName"
                value={config.webinarName}
                onChange={(e) => updateField('webinarName', e.target.value)}
                placeholder="e.g., Ultimate Online Mastery"
                className="input-field"
              />
              <p className="text-xs text-muted-foreground">Internal name for your reference</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerTitle">Header Title</Label>
              <Input
                id="headerTitle"
                value={config.headerTitle}
                onChange={(e) => updateField('headerTitle', e.target.value)}
                placeholder="e.g., Exclusive Training Session"
                className="input-field"
              />
              <p className="text-xs text-muted-foreground">Displayed in the webinar header</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoText">Logo Text</Label>
            <Input
              id="logoText"
              value={config.logoText}
              onChange={(e) => updateField('logoText', e.target.value.slice(0, 2))}
              placeholder="e.g., M"
              className="input-field w-24"
              maxLength={2}
            />
            <p className="text-xs text-muted-foreground">1-2 characters shown in the logo circle</p>
          </div>
        </CardContent>
      </Card>

      {/* Video Settings */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Video className="w-5 h-5 text-primary" />
            Video Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Mode Toggle */}
          <div className="space-y-3">
            <Label>Video Mode</Label>
            <RadioGroup
              value={config.videoMode}
              onValueChange={(v) => updateField('videoMode', v as VideoMode)}
              className="grid grid-cols-2 gap-3"
            >
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${config.videoMode === 'single' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <RadioGroupItem value="single" id="single" />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Video className="w-4 h-4" />
                    Single Video
                  </div>
                  <p className="text-xs text-muted-foreground">One video file</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${config.videoMode === 'multi' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <RadioGroupItem value="multi" id="multi" />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Layers className="w-4 h-4" />
                    Multi-Clip Sequence
                  </div>
                  <p className="text-xs text-muted-foreground">Multiple clips</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {config.videoMode === 'single' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={config.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://example.com/webinar.mp4"
                  className="input-field"
                />
                <p className="text-xs text-muted-foreground">Direct MP4 link to your webinar video</p>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="durationHours" className="text-xs text-muted-foreground">Hours</Label>
                    <Input
                      id="durationHours"
                      type="number"
                      value={Math.floor((config.durationSeconds || 0) / 3600)}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        const currentMinutes = Math.floor(((config.durationSeconds || 0) % 3600) / 60);
                        const currentSeconds = (config.durationSeconds || 0) % 60;
                        updateField('durationSeconds', hours * 3600 + currentMinutes * 60 + currentSeconds);
                      }}
                      className="input-field"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="durationMinutes" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      value={Math.floor(((config.durationSeconds || 0) % 3600) / 60)}
                      onChange={(e) => {
                        const minutes = Math.min(59, parseInt(e.target.value) || 0);
                        const currentHours = Math.floor((config.durationSeconds || 0) / 3600);
                        const currentSeconds = (config.durationSeconds || 0) % 60;
                        updateField('durationSeconds', currentHours * 3600 + minutes * 60 + currentSeconds);
                      }}
                      className="input-field"
                      min={0}
                      max={59}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="durationSecs" className="text-xs text-muted-foreground">Seconds</Label>
                    <Input
                      id="durationSecs"
                      type="number"
                      value={(config.durationSeconds || 0) % 60}
                      onChange={(e) => {
                        const seconds = Math.min(59, parseInt(e.target.value) || 0);
                        const currentHours = Math.floor((config.durationSeconds || 0) / 3600);
                        const currentMinutes = Math.floor(((config.durationSeconds || 0) % 3600) / 60);
                        updateField('durationSeconds', currentHours * 3600 + currentMinutes * 60 + seconds);
                      }}
                      className="input-field"
                      min={0}
                      max={59}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <VideoSequenceBuilder
              sequence={config.videoSequence}
              onChange={(seq) => updateField('videoSequence', seq)}
            />
          )}
        </CardContent>
      </Card>
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="durationHours" className="text-xs text-muted-foreground">Hours</Label>
                <Input
                  id="durationHours"
                  type="number"
                  value={Math.floor((config.durationSeconds || 0) / 3600)}
                  onChange={(e) => {
                    const hours = parseInt(e.target.value) || 0;
                    const currentMinutes = Math.floor(((config.durationSeconds || 0) % 3600) / 60);
                    const currentSeconds = (config.durationSeconds || 0) % 60;
                    updateField('durationSeconds', hours * 3600 + currentMinutes * 60 + currentSeconds);
                  }}
                  className="input-field"
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="durationMinutes" className="text-xs text-muted-foreground">Minutes</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={Math.floor(((config.durationSeconds || 0) % 3600) / 60)}
                  onChange={(e) => {
                    const minutes = Math.min(59, parseInt(e.target.value) || 0);
                    const currentHours = Math.floor((config.durationSeconds || 0) / 3600);
                    const currentSeconds = (config.durationSeconds || 0) % 60;
                    updateField('durationSeconds', currentHours * 3600 + minutes * 60 + currentSeconds);
                  }}
                  className="input-field"
                  min={0}
                  max={59}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="durationSecs" className="text-xs text-muted-foreground">Seconds</Label>
                <Input
                  id="durationSecs"
                  type="number"
                  value={(config.durationSeconds || 0) % 60}
                  onChange={(e) => {
                    const seconds = Math.min(59, parseInt(e.target.value) || 0);
                    const currentHours = Math.floor((config.durationSeconds || 0) / 3600);
                    const currentMinutes = Math.floor(((config.durationSeconds || 0) % 3600) / 60);
                    updateField('durationSeconds', currentHours * 3600 + currentMinutes * 60 + seconds);
                  }}
                  className="input-field"
                  min={0}
                  max={59}
                />
              </div>
            </div>
          </div>
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startHour">Start Hour</Label>
              <Select
                value={config.startHour.toString()}
                onValueChange={(v) => updateField('startHour', parseInt(v))}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startMinute">Start Minute</Label>
              <Select
                value={config.startMinute.toString()}
                onValueChange={(v) => updateField('startMinute', parseInt(v))}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      :{i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={config.timezone}
                onValueChange={(v) => updateField('timezone', v)}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewer Count */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Users className="w-5 h-5 text-primary" />
            Viewer Count (Social Proof)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minViewers">Minimum Viewers</Label>
              <Input
                id="minViewers"
                type="number"
                value={config.minViewers}
                onChange={(e) => updateField('minViewers', parseInt(e.target.value) || 100)}
                className="input-field"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxViewers">Maximum Viewers</Label>
              <Input
                id="maxViewers"
                type="number"
                value={config.maxViewers}
                onChange={(e) => updateField('maxViewers', parseInt(e.target.value) || 200)}
                className="input-field"
                min={1}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Viewer count will fluctuate randomly between these values</p>
        </CardContent>
      </Card>

      {/* Chatbot Settings */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <MessageSquare className="w-5 h-5 text-primary" />
            Chatbot Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                value={config.botName}
                onChange={(e) => updateField('botName', e.target.value)}
                placeholder="e.g., Support Team"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="botAvatar">Bot Avatar Text</Label>
              <Input
                id="botAvatar"
                value={config.botAvatar}
                onChange={(e) => updateField('botAvatar', e.target.value.slice(0, 2))}
                placeholder="e.g., AI"
                className="input-field w-24"
                maxLength={2}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure AI chatbot behavior, knowledge base, and FAQs in the "AI Chatbot Configuration" section below.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="typingDelayMin">Typing Delay Min (seconds)</Label>
              <Input
                id="typingDelayMin"
                type="number"
                value={config.typingDelayMin}
                onChange={(e) => updateField('typingDelayMin', parseInt(e.target.value) || 2)}
                className="input-field"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typingDelayMax">Typing Delay Max (seconds)</Label>
              <Input
                id="typingDelayMax"
                type="number"
                value={config.typingDelayMax}
                onChange={(e) => updateField('typingDelayMax', parseInt(e.target.value) || 5)}
                className="input-field"
                min={1}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="errorMessage">Error Message</Label>
            <Textarea
              id="errorMessage"
              value={config.errorMessage}
              onChange={(e) => updateField('errorMessage', e.target.value)}
              placeholder="Message shown when AI fails to respond"
              className="input-field min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* CTA Settings */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Megaphone className="w-5 h-5 text-primary" />
            Call to Action (CTA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableCta">Enable CTA</Label>
              <p className="text-xs text-muted-foreground">Show a call-to-action during the webinar</p>
            </div>
            <Switch
              id="enableCta"
              checked={config.enableCta}
              onCheckedChange={(v) => updateField('enableCta', v)}
            />
          </div>
          
          {config.enableCta && (
            <>
              <div className="space-y-2">
                <Label>Show After</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="ctaShowAfterHours" className="text-xs text-muted-foreground">Hours</Label>
                    <Input
                      id="ctaShowAfterHours"
                      type="number"
                      value={Math.floor((config.ctaShowAfterSeconds || 0) / 3600)}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        const currentMinutes = Math.floor(((config.ctaShowAfterSeconds || 0) % 3600) / 60);
                        const currentSeconds = (config.ctaShowAfterSeconds || 0) % 60;
                        updateField('ctaShowAfterSeconds', hours * 3600 + currentMinutes * 60 + currentSeconds);
                      }}
                      className="input-field"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ctaShowAfterMins" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="ctaShowAfterMins"
                      type="number"
                      value={Math.floor(((config.ctaShowAfterSeconds || 0) % 3600) / 60)}
                      onChange={(e) => {
                        const minutes = Math.min(59, parseInt(e.target.value) || 0);
                        const currentHours = Math.floor((config.ctaShowAfterSeconds || 0) / 3600);
                        const currentSeconds = (config.ctaShowAfterSeconds || 0) % 60;
                        updateField('ctaShowAfterSeconds', currentHours * 3600 + minutes * 60 + currentSeconds);
                      }}
                      className="input-field"
                      min={0}
                      max={59}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ctaShowAfterSecs" className="text-xs text-muted-foreground">Seconds</Label>
                    <Input
                      id="ctaShowAfterSecs"
                      type="number"
                      value={(config.ctaShowAfterSeconds || 0) % 60}
                      onChange={(e) => {
                        const seconds = Math.min(59, parseInt(e.target.value) || 0);
                        const currentHours = Math.floor((config.ctaShowAfterSeconds || 0) / 3600);
                        const currentMinutes = Math.floor(((config.ctaShowAfterSeconds || 0) % 3600) / 60);
                        updateField('ctaShowAfterSeconds', currentHours * 3600 + currentMinutes * 60 + seconds);
                      }}
                      className="input-field"
                      min={0}
                      max={59}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Time into webinar before CTA appears</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaStyle">CTA Style</Label>
                <Select
                  value={config.ctaStyle}
                  onValueChange={(v) => updateField('ctaStyle', v as 'banner' | 'floating')}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Bottom Banner</SelectItem>
                    <SelectItem value="floating">Floating Side Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaHeadline">Headline</Label>
                <Input
                  id="ctaHeadline"
                  value={config.ctaHeadline}
                  onChange={(e) => updateField('ctaHeadline', e.target.value)}
                  placeholder="e.g., Ready to Transform Your Life?"
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaSubheadline">Subheadline</Label>
                <Input
                  id="ctaSubheadline"
                  value={config.ctaSubheadline}
                  onChange={(e) => updateField('ctaSubheadline', e.target.value)}
                  placeholder="e.g., Join thousands of successful students"
                  className="input-field"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaButtonText">Button Text</Label>
                  <Input
                    id="ctaButtonText"
                    value={config.ctaButtonText}
                    onChange={(e) => updateField('ctaButtonText', e.target.value)}
                    placeholder="e.g., Get Instant Access →"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaButtonUrl">Button URL</Label>
                  <Input
                    id="ctaButtonUrl"
                    type="url"
                    value={config.ctaButtonUrl}
                    onChange={(e) => updateField('ctaButtonUrl', e.target.value)}
                    placeholder="https://your-checkout.com/offer"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaButtonColor">Button Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="ctaButtonColor"
                    value={config.ctaButtonColor}
                    onChange={(e) => updateField('ctaButtonColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={config.ctaButtonColor}
                    onChange={(e) => updateField('ctaButtonColor', e.target.value)}
                    className="input-field flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <Label htmlFor="ctaShowUrgency">Show Urgency Text</Label>
                  <p className="text-xs text-muted-foreground">Display scarcity message</p>
                </div>
                <Switch
                  id="ctaShowUrgency"
                  checked={config.ctaShowUrgency}
                  onCheckedChange={(v) => updateField('ctaShowUrgency', v)}
                />
              </div>
              {config.ctaShowUrgency && (
                <div className="space-y-2">
                  <Label htmlFor="ctaUrgencyText">Urgency Text</Label>
                  <Input
                    id="ctaUrgencyText"
                    value={config.ctaUrgencyText}
                    onChange={(e) => updateField('ctaUrgencyText', e.target.value)}
                    placeholder="e.g., ⚡ Only 7 spots left at this price!"
                    className="input-field"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Lead Capture Settings */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <UserPlus className="w-5 h-5 text-primary" />
            Lead Capture Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableLeadCapture">Enable Lead Capture</Label>
              <p className="text-xs text-muted-foreground">Require info before chatting</p>
            </div>
            <Switch
              id="enableLeadCapture"
              checked={config.enableLeadCapture}
              onCheckedChange={(v) => updateField('enableLeadCapture', v)}
            />
          </div>
          
          {config.enableLeadCapture && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <Label htmlFor="requireName">Require Name</Label>
                  <Switch
                    id="requireName"
                    checked={config.requireName}
                    onCheckedChange={(v) => updateField('requireName', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <Label htmlFor="requireEmail">Require Email</Label>
                  <Switch
                    id="requireEmail"
                    checked={config.requireEmail}
                    onCheckedChange={(v) => updateField('requireEmail', v)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={config.welcomeMessage}
                  onChange={(e) => updateField('welcomeMessage', e.target.value)}
                  placeholder="Hi {name}! 👋 Ask me anything..."
                  className="input-field min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">Use {'{name}'} to insert the user's name</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadWebhookUrl">Lead Webhook URL (optional)</Label>
                <Input
                  id="leadWebhookUrl"
                  type="url"
                  value={config.leadWebhookUrl}
                  onChange={(e) => updateField('leadWebhookUrl', e.target.value)}
                  placeholder="https://your-crm.com/webhook/leads"
                  className="input-field"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tracking Settings */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <BarChart3 className="w-5 h-5 text-primary" />
            Event Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableTracking">Enable Tracking</Label>
              <p className="text-xs text-muted-foreground">Track user events via webhook & database</p>
            </div>
            <Switch
              id="enableTracking"
              checked={config.enableTracking}
              onCheckedChange={(v) => updateField('enableTracking', v)}
            />
          </div>
          
          {config.enableTracking && (
            <div className="space-y-2">
              <Label htmlFor="trackingWebhookUrl">Tracking Webhook URL</Label>
              <Input
                id="trackingWebhookUrl"
                type="url"
                value={config.trackingWebhookUrl}
                onChange={(e) => updateField('trackingWebhookUrl', e.target.value)}
                placeholder="https://moshbari.cloud/webhook/webinar-tracking"
                className="input-field"
              />
              <p className="text-xs text-muted-foreground">
                Events tracked: join, progress (25/50/75/100%), cta_click, chat_message, leave
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Palette className="w-5 h-5 text-primary" />
            Colors & Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={config.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="backgroundColor"
                  value={config.backgroundColor}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={config.backgroundColor}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatBackground">Chat Background</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="chatBackground"
                  value={config.chatBackground}
                  onChange={(e) => updateField('chatBackground', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={config.chatBackground}
                  onChange={(e) => updateField('chatBackground', e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <RegistrationFormSettings config={config} onChange={onChange} webinarId={webinarId} />
      
      {/* Registration Form Preview */}
      {config.enableRegistrationForm && (
        <RegistrationFormPreview config={config} />
      )}

      {/* AI Chatbot Configuration */}
      <ChatbotConfigPanel webinarId={webinarId} />
    </div>
  );
}
