"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Copy, AlertTriangle, RefreshCw } from "lucide-react";

export default function SetupHelpPage() {
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const [secretKey, setSecretKey] = useState("");

  const copyTemplate = () => {
    const template = `# Digital Ocean Spaces Configuration
DO_SPACES_KEY=DO801ZFJNYXTJFNZWLM7
DO_SPACES_SECRET=${secretKey || "your_secret_key_here"}`;
    
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    setTestStatus('loading');
    try {
      const response = await fetch('/api/upload/test');
      const data = await response.json();
      setTestResult(data);
      setTestStatus(data.status === 'success' ? 'success' : 'error');
    } catch (error) {
      setTestStatus('error');
      setTestResult({ error: "Failed to connect to test endpoint" });
    }
  };

  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <h1 className="text-3xl font-bold">Digital Ocean Spaces Setup Help</h1>
      
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            SignatureDoesNotMatch Error
          </CardTitle>
          <CardDescription>
            This error occurs when your secret key doesn't match what Digital Ocean expects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The access key <code className="bg-amber-100 px-1.5 py-0.5 rounded dark:bg-amber-900/30">DO801ZFJNYXTJFNZWLM7</code> needs 
            to be paired with the correct secret key that was generated at the same time.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to your <a href="https://cloud.digitalocean.com/account/api/spaces" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Digital Ocean Spaces API</a> page</li>
            <li>Look for your access key <code className="bg-amber-100 px-1.5 py-0.5 rounded dark:bg-amber-900/30">DO801ZFJNYXTJFNZWLM7</code></li>
            <li>If you don't have the secret key anymore, you'll need to generate a new pair</li>
            <li>Enter your secret key below to create a proper .env.local file template</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create your .env.local file</CardTitle>
          <CardDescription>
            Enter your Digital Ocean Spaces secret key below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="secretKey" className="block text-sm font-medium">
              Secret Key
            </label>
            <Input
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Paste your Digital Ocean Spaces secret key here"
              className="font-mono"
            />
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md font-mono text-sm">
            <pre>
              <code>
              # Digital Ocean Spaces Configuration<br/>
              DO_SPACES_KEY=DO801ZFJNYXTJFNZWLM7<br/>
              DO_SPACES_SECRET={secretKey || "your_secret_key_here"}
              </code>
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={copyTemplate}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
          
          <Button onClick={testConnection} disabled={testStatus === 'loading'}>
            {testStatus === 'loading' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {testStatus !== 'idle' && (
        <Card className={
          testStatus === 'success' 
            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30' 
            : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
        }>
          <CardHeader>
            <CardTitle>
              {testStatus === 'success' ? 'Connection Successful!' : 'Connection Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-black/5 rounded-md">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a file named <code className="bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">.env.local</code> in the root of your project</li>
            <li>Copy the configuration template above into this file</li>
            <li>Replace <code className="bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">your_secret_key_here</code> with your actual Digital Ocean Spaces secret key</li>
            <li>Save the file and restart your development server</li>
            <li>Try uploading an image on the <a href="/image-upload-test" className="text-blue-600 hover:underline">test page</a></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
} 