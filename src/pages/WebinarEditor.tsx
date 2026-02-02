import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WebinarConfig } from '@/types/webinar';
import { createDefaultWebinar } from '@/lib/webinarStorage';
import { useWebinar, useSaveWebinar, useUpdateWebinar } from '@/hooks/useWebinars';
import { WebinarForm } from '@/components/admin/WebinarForm';
import { WebinarPreview } from '@/components/admin/WebinarPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { generateEmbedCode } from '@/lib/generateEmbedCode';
import { ROUTES } from '@/lib/routes';
import { supabase } from '@/integrations/supabase/client';
import { ChatbotConfigRef } from '@/components/admin/ChatbotConfigPanel';

export default function WebinarEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  
  const { data: existingWebinar, isLoading } = useWebinar(isEditing ? id : undefined);
  const saveWebinarMutation = useSaveWebinar();
  const updateWebinarMutation = useUpdateWebinar();
  
  const [config, setConfig] = useState<Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>>(createDefaultWebinar());
  const [showPreview, setShowPreview] = useState(true);
  
  // Ref to get chatbot config from the panel
  const chatbotConfigRef = useRef<ChatbotConfigRef>(null);

  useEffect(() => {
    if (isEditing && existingWebinar) {
      const { id: _, createdAt, updatedAt, ...rest } = existingWebinar;
      setConfig(rest);
    }
  }, [isEditing, existingWebinar]);

  const handleSave = async () => {
    if (!config.webinarName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a webinar name',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing) {
        const result = await updateWebinarMutation.mutateAsync({ id, config });
        if (result) {
          // Generate and copy code to clipboard
          const fullConfig = { ...config, id, createdAt: existingWebinar?.createdAt || '', updatedAt: new Date().toISOString() } as WebinarConfig;
          const code = generateEmbedCode(fullConfig);
          await navigator.clipboard.writeText(code);
          
          toast({
            title: 'Saved & Copied!',
            description: 'Changes saved and code copied to clipboard',
          });
          
          // Navigate to code page
          navigate(`/webinar/${id}/code`);
        } else {
          throw new Error('Failed to update');
        }
      } else {
        // Creating new webinar - also save chatbot config
        const newWebinar = await saveWebinarMutation.mutateAsync(config);
        if (newWebinar) {
          // Save chatbot config if any was configured
          if (chatbotConfigRef.current) {
            const chatbotConfig = chatbotConfigRef.current.getConfig();
            const chatbotFaqs = chatbotConfigRef.current.getFaqs();
            
            // Save chatbot config
            if (Object.keys(chatbotConfig).length > 0) {
              const { error: configError } = await supabase
                .from('webinar_chatbot_config')
                .insert({
                  webinar_id: newWebinar.id,
                  ...chatbotConfig,
                });
              
              if (configError) {
                console.error('Error saving chatbot config:', configError);
              }
            }
            
            // Save FAQs
            if (chatbotFaqs.length > 0) {
              const faqsToInsert = chatbotFaqs.map((faq, index) => ({
                webinar_id: newWebinar.id,
                question: faq.question,
                answer: faq.answer,
                category: faq.category || 'general',
                sort_order: index,
              }));
              
              const { error: faqsError } = await supabase
                .from('webinar_chatbot_faqs')
                .insert(faqsToInsert);
              
              if (faqsError) {
                console.error('Error saving chatbot FAQs:', faqsError);
              }
            }
          }
          
          // Generate and copy code to clipboard
          const code = generateEmbedCode(newWebinar);
          await navigator.clipboard.writeText(code);
          
          toast({
            title: 'Created & Copied!',
            description: 'Webinar created and code copied to clipboard',
          });
          navigate(`/webinar/${newWebinar.id}/code`);
          return;
        } else {
          throw new Error('Failed to save');
        }
      }
    } catch (error) {
      toast({
        title: 'Error saving',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const isSaving = saveWebinarMutation.isPending || updateWebinarMutation.isPending;

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.HOME)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">
                {isEditing ? 'Edit Webinar' : 'Create Webinar'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {config.webinarName || 'Configure your webinar settings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:flex"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="glow-button">
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Webinar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WebinarForm 
              config={config} 
              onChange={setConfig} 
              webinarId={isEditing ? id : undefined}
              chatbotConfigRef={chatbotConfigRef}
            />
          </motion.div>
          
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="mb-4">
                <h3 className="font-display font-semibold text-lg mb-1">Live Preview</h3>
                <p className="text-sm text-muted-foreground">See how your webinar will look</p>
              </div>
              <WebinarPreview config={config} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
