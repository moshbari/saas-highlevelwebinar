import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  Key, 
  Loader2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Trash2,
  Sparkles,
  Bot,
  Mic
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ApiKeys() {
  const navigate = useNavigate();
  const {
    status,
    isLoading,
    saveKey,
    isSaving,
    removeKey,
    isRemoving,
    setProvider,
    isSettingProvider,
    testKey,
    isTestingKey,
  } = useApiKeys();

  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [whisperKey, setWhisperKey] = useState('');
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);

  const handleSaveKey = (keyType: 'openai' | 'anthropic' | 'whisper', apiKey: string) => {
    if (!apiKey.trim()) return;
    saveKey({ keyType, apiKey: apiKey.trim() });
    // Clear the input after saving
    if (keyType === 'openai') setOpenaiKey('');
    if (keyType === 'anthropic') setAnthropicKey('');
    if (keyType === 'whisper') setWhisperKey('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/laboratory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">API Keys</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">AI-Powered Chatbot</p>
                <p className="text-sm text-muted-foreground">
                  Add your own API keys to power the AI chatbot in your webinars. 
                  If no keys are configured, we'll use our built-in AI (Lovable AI) at no extra cost.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferred Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Preferred AI Provider
              {isSettingProvider && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>
              Choose which AI provider to use for chatbot responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={status?.preferred_provider || 'openai'}
              onValueChange={(value) => setProvider(value as 'openai' | 'anthropic')}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="openai"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  isSettingProvider ? 'opacity-60 pointer-events-none' : ''
                } ${
                  status?.preferred_provider === 'openai' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="openai" id="openai" disabled={isSettingProvider} />
                <div className="flex-1">
                  <p className="font-medium">OpenAI</p>
                  <p className="text-sm text-muted-foreground">GPT-4o-mini</p>
                </div>
                {status?.openai_configured && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" /> Ready
                  </Badge>
                )}
              </Label>
              <Label
                htmlFor="anthropic"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  isSettingProvider ? 'opacity-60 pointer-events-none' : ''
                } ${
                  status?.preferred_provider === 'anthropic' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="anthropic" id="anthropic" disabled={isSettingProvider} />
                <div className="flex-1">
                  <p className="font-medium">Anthropic</p>
                  <p className="text-sm text-muted-foreground">Claude 3 Haiku</p>
                </div>
                {status?.anthropic_configured && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" /> Ready
                  </Badge>
                )}
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* OpenAI Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  OpenAI API Key
                  {status?.openai_configured ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <X className="h-3 w-3 mr-1" /> Not configured
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Used for GPT-4o-mini chat responses
                  {status?.openai_configured_at && (
                    <span className="block text-xs mt-1">
                      Added {format(new Date(status.openai_configured_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </CardDescription>
              </div>
              {status?.openai_configured && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testKey('openai')}
                    disabled={isTestingKey === 'openai'}
                  >
                    {isTestingKey === 'openai' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Test Key'
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove OpenAI Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your OpenAI API key. The chatbot will fall back to using Lovable AI.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removeKey('openai')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showOpenai ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowOpenai(!showOpenai)}
                >
                  {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={() => handleSaveKey('openai', openaiKey)}
                disabled={!openaiKey.trim() || isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                platform.openai.com/api-keys
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Anthropic Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Anthropic API Key
                  {status?.anthropic_configured ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <X className="h-3 w-3 mr-1" /> Not configured
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Used for Claude 3 Haiku chat responses
                  {status?.anthropic_configured_at && (
                    <span className="block text-xs mt-1">
                      Added {format(new Date(status.anthropic_configured_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </CardDescription>
              </div>
              {status?.anthropic_configured && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testKey('anthropic')}
                    disabled={isTestingKey === 'anthropic'}
                  >
                    {isTestingKey === 'anthropic' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Test Key'
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Anthropic Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your Anthropic API key. The chatbot will fall back to using Lovable AI.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removeKey('anthropic')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showAnthropic ? 'text' : 'password'}
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                >
                  {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={() => handleSaveKey('anthropic', anthropicKey)}
                disabled={!anthropicKey.trim() || isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Get your API key from{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                console.anthropic.com/settings/keys
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Whisper Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Whisper API Key (Voice Dictation)
                  {status?.whisper_configured ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <X className="h-3 w-3 mr-1" /> Not configured
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Optional: Used for voice-to-text in notes (uses OpenAI Whisper)
                  {status?.whisper_configured_at && (
                    <span className="block text-xs mt-1">
                      Added {format(new Date(status.whisper_configured_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </CardDescription>
              </div>
              {status?.whisper_configured && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Whisper Key?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove your Whisper API key. Voice dictation will be disabled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => removeKey('whisper')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showWhisper ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={whisperKey}
                  onChange={(e) => setWhisperKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowWhisper(!showWhisper)}
                >
                  {showWhisper ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={() => handleSaveKey('whisper', whisperKey)}
                disabled={!whisperKey.trim() || isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uses the same OpenAI API key format. Get it from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                platform.openai.com/api-keys
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
