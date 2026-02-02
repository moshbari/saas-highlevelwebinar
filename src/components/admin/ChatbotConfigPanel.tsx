import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useChatbotConfig, ChatbotConfig, ChatbotFaq, defaultChatbotConfig } from '@/hooks/useChatbotConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Brain, 
  MessageCircleQuestion, 
  Settings2, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TestChatPanel } from './TestChatPanel';

// Local FAQ type for new webinars (no ID yet)
interface LocalFaq {
  tempId: string;
  question: string;
  answer: string;
  category: string;
}

export interface ChatbotConfigRef {
  getConfig: () => Partial<ChatbotConfig>;
  getFaqs: () => Array<{ question: string; answer: string; category: string }>;
}

interface ChatbotConfigPanelProps {
  webinarId: string | undefined;
}

export const ChatbotConfigPanel = forwardRef<ChatbotConfigRef, ChatbotConfigPanelProps>(
  ({ webinarId }, ref) => {
  const { 
    config, 
    faqs, 
    isLoading, 
    saveConfig, 
    isSaving, 
    addFaq, 
    updateFaq, 
    deleteFaq,
    hasConfig,
  } = useChatbotConfig(webinarId);

  const [localConfig, setLocalConfig] = useState<Partial<ChatbotConfig>>(defaultChatbotConfig);
  const [localFaqs, setLocalFaqs] = useState<LocalFaq[]>([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // Expose methods to parent for saving new webinars
  useImperativeHandle(ref, () => ({
    getConfig: () => localConfig,
    getFaqs: () => localFaqs.map(f => ({ question: f.question, answer: f.answer, category: f.category })),
  }));

  useEffect(() => {
    if (config && webinarId) {
      setLocalConfig(config);
    }
  }, [config, webinarId]);

  const updateLocalConfig = <K extends keyof ChatbotConfig>(key: K, value: ChatbotConfig[K]) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = () => {
    if (webinarId) {
      saveConfig(localConfig);
    }
  };

  // For new webinars - add FAQ locally
  const handleAddLocalFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setLocalFaqs(prev => [...prev, { 
      tempId: `temp-${Date.now()}`, 
      ...newFaq 
    }]);
    setNewFaq({ question: '', answer: '', category: 'general' });
  };

  // For existing webinars - add FAQ to DB
  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    if (webinarId) {
      addFaq(newFaq);
    } else {
      handleAddLocalFaq();
    }
    setNewFaq({ question: '', answer: '', category: 'general' });
  };

  const handleDeleteLocalFaq = (tempId: string) => {
    setLocalFaqs(prev => prev.filter(f => f.tempId !== tempId));
  };

  // Determine which FAQs to show
  const displayFaqs = webinarId ? faqs : localFaqs;
  const isNewWebinar = !webinarId;

  if (isLoading && webinarId) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Chatbot Configuration
          </CardTitle>
          {webinarId && (
            <Button onClick={handleSaveConfig} disabled={isSaving} size="sm">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Config
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Configure how the AI chatbot responds to viewers during your webinar
          {isNewWebinar && (
            <span className="text-primary ml-1">(will be saved with the webinar)</span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration Tabs */}
          <div>
            <Tabs defaultValue="identity" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="identity" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  Identity
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="faqs" className="text-xs">
                  <MessageCircleQuestion className="w-3 h-3 mr-1" />
                  FAQs
                </TabsTrigger>
                <TabsTrigger value="behavior" className="text-xs">
                  <Settings2 className="w-3 h-3 mr-1" />
                  Behavior
                </TabsTrigger>
              </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chatbot_bot_name">Bot Name</Label>
                <Input
                  id="chatbot_bot_name"
                  value={localConfig.bot_name || ''}
                  onChange={(e) => updateLocalConfig('bot_name', e.target.value)}
                  placeholder="AI Assistant"
                  className="input-field"
                />
                <p className="text-xs text-muted-foreground">Name displayed in chat messages</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chatbot_bot_avatar">Avatar Text</Label>
                <Input
                  id="chatbot_bot_avatar"
                  value={localConfig.bot_avatar || ''}
                  onChange={(e) => updateLocalConfig('bot_avatar', e.target.value.slice(0, 2))}
                  placeholder="AI"
                  className="input-field w-24"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">1-2 characters for avatar</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_style">Response Style</Label>
              <Select
                value={localConfig.response_style || 'professional'}
                onValueChange={(v) => updateLocalConfig('response_style', v)}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic & Energetic</SelectItem>
                  <SelectItem value="expert">Expert & Authoritative</SelectItem>
                  <SelectItem value="supportive">Supportive & Empathetic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt">Custom System Prompt (Optional)</Label>
              <Textarea
                id="system_prompt"
                value={localConfig.system_prompt || ''}
                onChange={(e) => updateLocalConfig('system_prompt', e.target.value)}
                placeholder="Add custom instructions for the AI personality..."
                className="input-field min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Override default behavior with custom instructions
              </p>
            </div>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webinar_description">Webinar Description</Label>
              <Textarea
                id="webinar_description"
                value={localConfig.webinar_description || ''}
                onChange={(e) => updateLocalConfig('webinar_description', e.target.value)}
                placeholder="Describe what this webinar is about, what topics it covers, who the presenter is..."
                className="input-field min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {(localConfig.webinar_description?.length || 0).toLocaleString()} / 10,000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webinar_transcript">Webinar Transcript (Optional)</Label>
              <Textarea
                id="webinar_transcript"
                value={localConfig.webinar_transcript || ''}
                onChange={(e) => updateLocalConfig('webinar_transcript', e.target.value)}
                placeholder="Paste your webinar transcript here to give the AI detailed knowledge..."
                className="input-field min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                {(localConfig.webinar_transcript?.length || 0).toLocaleString()} / 10,000 characters
                <span className="ml-2 text-amber-500">
                  (Truncated to ~4,000 chars in AI context)
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_context">Additional Context</Label>
              <Textarea
                id="additional_context"
                value={localConfig.additional_context || ''}
                onChange={(e) => updateLocalConfig('additional_context', e.target.value)}
                placeholder="Any additional context: company info, product details, special offers..."
                className="input-field min-h-[100px]"
              />
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-secondary/30">
              <h4 className="font-medium mb-3">Add New FAQ</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    value={newFaq.question}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="What question might viewers ask?"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer</Label>
                  <Textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="The answer the AI should give..."
                    className="input-field min-h-[80px]"
                  />
                </div>
                <div className="flex gap-3">
                  <Select
                    value={newFaq.category}
                    onValueChange={(v) => setNewFaq(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger className="input-field w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddFaq} disabled={!newFaq.question.trim() || !newFaq.answer.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </div>
            </div>

            {displayFaqs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircleQuestion className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No FAQs added yet</p>
                <p className="text-xs">Add frequently asked questions to improve AI responses</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {displayFaqs.map((faq) => {
                  const faqId = 'id' in faq ? faq.id : (faq as LocalFaq).tempId;
                  return (
                    <AccordionItem key={faqId} value={faqId} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                          <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                          <span className="line-clamp-1">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {editingFaqId === faqId ? (
                          <div className="space-y-3 py-2">
                            <Input
                              defaultValue={faq.question}
                              onBlur={(e) => {
                                if (webinarId && 'id' in faq) {
                                  updateFaq({ id: faq.id, question: e.target.value });
                                }
                              }}
                              className="input-field"
                            />
                            <Textarea
                              defaultValue={faq.answer}
                              onBlur={(e) => {
                                if (webinarId && 'id' in faq) {
                                  updateFaq({ id: faq.id, answer: e.target.value });
                                }
                              }}
                              className="input-field min-h-[80px]"
                            />
                            <Button size="sm" variant="secondary" onClick={() => setEditingFaqId(null)}>
                              Done
                            </Button>
                          </div>
                        ) : (
                          <div className="py-2">
                            <p className="text-sm text-muted-foreground mb-3">{faq.answer}</p>
                            <div className="flex gap-2">
                              {webinarId && (
                                <Button size="sm" variant="ghost" onClick={() => setEditingFaqId(faqId)}>
                                  Edit
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (webinarId && 'id' in faq) {
                                    deleteFaq(faq.id);
                                  } else {
                                    handleDeleteLocalFaq((faq as LocalFaq).tempId);
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_response_length">Max Response Length</Label>
              <Input
                id="max_response_length"
                type="number"
                value={localConfig.max_response_length || 500}
                onChange={(e) => updateLocalConfig('max_response_length', parseInt(e.target.value) || 500)}
                className="input-field w-32"
                min={100}
                max={2000}
              />
              <p className="text-xs text-muted-foreground">Characters (100-2000)</p>
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Handle Price Questions</Label>
                  <p className="text-xs text-muted-foreground">
                    Redirect pricing questions to keep watching
                  </p>
                </div>
                <Switch
                  checked={localConfig.handle_price_questions ?? true}
                  onCheckedChange={(v) => updateLocalConfig('handle_price_questions', v)}
                />
              </div>
              
              {localConfig.handle_price_questions && (
                <div className="space-y-2">
                  <Label htmlFor="price_redirect_message">Price Redirect Message</Label>
                  <Textarea
                    id="price_redirect_message"
                    value={localConfig.price_redirect_message || ''}
                    onChange={(e) => updateLocalConfig('price_redirect_message', e.target.value)}
                    placeholder="Great question about pricing! Keep watching..."
                    className="input-field min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Redirect Off-Topic Questions</Label>
                  <p className="text-xs text-muted-foreground">
                    Gently redirect unrelated questions
                  </p>
                </div>
                <Switch
                  checked={localConfig.redirect_off_topic ?? true}
                  onCheckedChange={(v) => updateLocalConfig('redirect_off_topic', v)}
                />
              </div>
              
              {localConfig.redirect_off_topic && (
                <div className="space-y-2">
                  <Label htmlFor="off_topic_message">Off-Topic Message</Label>
                  <Textarea
                    id="off_topic_message"
                    value={localConfig.off_topic_message || ''}
                    onChange={(e) => updateLocalConfig('off_topic_message', e.target.value)}
                    placeholder="Let's stay focused on the webinar content..."
                    className="input-field min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Encourage Engagement</Label>
                  <p className="text-xs text-muted-foreground">
                    Add engagement prompts to responses
                  </p>
                </div>
                <Switch
                  checked={localConfig.encourage_engagement ?? true}
                  onCheckedChange={(v) => updateLocalConfig('encourage_engagement', v)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
          </div>

          {/* Right: Test Chat (only for existing webinars with ID) */}
          <div>
            {webinarId ? (
              <TestChatPanel webinarId={webinarId} botName={localConfig.bot_name} botAvatar={localConfig.bot_avatar} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 rounded-lg border border-dashed border-border bg-secondary/20">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground font-medium">Test Chat Available After Saving</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save the webinar to test AI responses
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChatbotConfigPanel.displayName = 'ChatbotConfigPanel';
