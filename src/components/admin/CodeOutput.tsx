import { useState } from 'react';
import { WebinarConfig } from '@/types/webinar';
import { generateEmbedCode } from '@/lib/generateEmbedCode';
import { generateRegistrationFormCode } from '@/lib/generateRegistrationFormCode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, ExternalLink, Code, Download, ClipboardList } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CodeOutputProps {
  webinar: WebinarConfig;
}

export function CodeOutput({ webinar }: CodeOutputProps) {
  const [copiedWebinar, setCopiedWebinar] = useState(false);
  const [copiedRegForm, setCopiedRegForm] = useState(false);
  
  const webinarCode = generateEmbedCode(webinar);
  const regFormCode = webinar.enableRegistrationForm ? generateRegistrationFormCode(webinar) : '';

  const handleCopyWebinar = async () => {
    try {
      await navigator.clipboard.writeText(webinarCode);
      setCopiedWebinar(true);
      toast({
        title: 'Copied!',
        description: 'Webinar embed code copied to clipboard',
      });
      setTimeout(() => setCopiedWebinar(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleCopyRegForm = async () => {
    try {
      await navigator.clipboard.writeText(regFormCode);
      setCopiedRegForm(true);
      toast({
        title: 'Copied!',
        description: 'Registration form code copied to clipboard',
      });
      setTimeout(() => setCopiedRegForm(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (code: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'HTML file saved to your downloads',
    });
  };

  const webinarFilename = `${webinar.webinarName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'webinar'}.html`;
  const regFormFilename = `${webinar.webinarName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'webinar'}-registration.html`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="webinar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="webinar" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Webinar Page
          </TabsTrigger>
          <TabsTrigger 
            value="registration" 
            className="flex items-center gap-2"
            disabled={!webinar.enableRegistrationForm}
          >
            <ClipboardList className="w-4 h-4" />
            Registration Form
            {!webinar.enableRegistrationForm && (
              <span className="text-xs opacity-60">(Disabled)</span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="webinar" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Code className="w-5 h-5 text-primary" />
                Webinar Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleCopyWebinar} className="glow-button">
                  {copiedWebinar ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button variant="secondary" onClick={() => handleDownload(webinarCode, webinarFilename)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>
                <Button variant="secondary" onClick={() => handlePreview(webinarCode)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview in New Tab
                </Button>
              </div>

              <div className="relative">
                <pre className="bg-secondary/50 rounded-xl p-4 overflow-x-auto text-sm text-muted-foreground max-h-[400px] overflow-y-auto">
                  <code>{webinarCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registration" className="mt-6">
          {webinar.enableRegistrationForm ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Registration Form Embed Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleCopyRegForm} className="glow-button">
                    {copiedRegForm ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={() => handleDownload(regFormCode, regFormFilename)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </Button>
                  <Button variant="secondary" onClick={() => handlePreview(regFormCode)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview in New Tab
                  </Button>
                </div>

                <div className="relative">
                  <pre className="bg-secondary/50 rounded-xl p-4 overflow-x-auto text-sm text-muted-foreground max-h-[400px] overflow-y-auto">
                    <code>{regFormCode}</code>
                  </pre>
                </div>
                
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-medium text-foreground mb-2">📋 Registration Form Features</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sends lead data to your GHL webhook</li>
                    <li>• Redirects to thank you page with name/email params</li>
                    <li>• Shows next webinar session date/time</li>
                    <li>• Fully responsive and self-contained</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Registration Form Disabled</h3>
                <p className="text-muted-foreground text-sm">
                  Enable the Registration Form in webinar settings to generate embed code.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">How to Embed in GoHighLevel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-3">
            <li>Copy the embed code above using the "Copy Code" button</li>
            <li>Go to your GoHighLevel funnel/website builder</li>
            <li>Add a new "Custom HTML/CSS" or "Code" element</li>
            <li>Paste the entire code into the element</li>
            <li>Save and publish your page</li>
          </ol>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="font-medium text-foreground mb-2">💡 Pro Tip</p>
            <p>For best results, use the embed code in a full-width section or dedicated page for an immersive webinar experience.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
