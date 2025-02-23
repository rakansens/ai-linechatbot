import { ArtifactContentProps, ArtifactDefinition } from '@/components/artifact';
import { useEffect, useState } from 'react';
import { LineSetupGuide } from '@/components/line-setup-guide';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, ExternalLink } from 'lucide-react';

// LINE設定の状態
type SetupState = 'initial' | 'config_input';

// 設定ガイドのメッセージ
const setupGuideMessages = {
  initial: {
    title: 'LINE連携設定',
    message: `はじめまして！LINE AIAGENTです。
LINEと連携して、メッセージの送受信ができるようにしましょう。

以下の2つの情報が必要です：

1. チャネルアクセストークン
   - LINE Developersコンソールの「Messaging API設定」タブで発行できます
   - メッセージを送信するために必要です

2. Webhook URL
   - メッセージを受信するためのエンドポイントです
   - 通常はhttpsで始まるURLを設定します

準備ができましたら「設定入力へ」を選択してください。`,
    buttonText: '設定入力へ',
    link: 'https://developers.line.biz/console/'
  }
};

interface LineConfig {
  accessToken: string;
  webhooks: string;
}

interface NaturalLanguageInput {
  text: string;
  processing: boolean;
}

// 自然言語からLINE設定情報を抽出する関数
function extractLineConfig(text: string): Partial<LineConfig> {
  const config: Partial<LineConfig> = {};
  
  // アクセストークン
  const tokenMatch = text.match(/アクセストークン[はが]?\s*[「『]?([a-zA-Z0-9-_]+)[』」]?/);
  if (tokenMatch) {
    config.accessToken = tokenMatch[1];
  }

  // Webhook URL
  const webhookMatch = text.match(/Webhook(?:\s*URL)?[はが]?\s*[「『]?(https?:\/\/[^\s」』]+)[』」]?/);
  if (webhookMatch) {
    config.webhooks = webhookMatch[1];
  }

  return config;
}

function LineContent({
  content,
  onSaveContent,
  isCurrentVersion,
}: ArtifactContentProps) {
  const [setupState, setSetupState] = useState<SetupState>('initial');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<NaturalLanguageInput>({
    text: '',
    processing: false
  });
  const [config, setConfig] = useState<LineConfig>(() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        accessToken: '',
        webhooks: '',
      };
    }
  });

  useEffect(() => {
    if (!isCurrentVersion) {
      try {
        setConfig(JSON.parse(content));
      } catch {
        // Invalid JSON, keep current state
      }
    }
  }, [content, isCurrentVersion]);

  const handleChange = (field: keyof LineConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onSaveContent(JSON.stringify(newConfig, null, 2), true);
  };

  const handleNaturalLanguageSubmit = () => {
    setNaturalLanguageInput(prev => ({ ...prev, processing: true }));
    try {
      const extractedConfig = extractLineConfig(naturalLanguageInput.text);
      const newConfig = { ...config };
      
      // 抽出された設定を現在の設定にマージ
      Object.entries(extractedConfig).forEach(([key, value]) => {
        if (value) {
          newConfig[key as keyof LineConfig] = value;
        }
      });

      setConfig(newConfig);
      onSaveContent(JSON.stringify(newConfig, null, 2), true);
    } finally {
      setNaturalLanguageInput(prev => ({ ...prev, processing: false }));
    }
  };

  const handleSetupStateChange = (newState: SetupState) => {
    setSetupState(newState);
  };

  const renderSetupGuide = () => {
    if (setupState === 'config_input') {
      return null;
    }

    const guide = setupGuideMessages[setupState];
    return (
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{guide.title}</h2>
        <div className="whitespace-pre-wrap mb-4">{guide.message}</div>
        <div className="flex items-center justify-between">
          <a
            href={guide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            LINE Developersコンソールを開く
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
          <Button
            onClick={() => handleSetupStateChange('config_input')}
          >
            {guide.buttonText}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderSetupGuide()}
      {setupState === 'config_input' && (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="mr-2" />
              設定入力
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">アクセストークン</h3>
                <Textarea
                  placeholder="チャネルアクセストークンを入力してください"
                  value={config.accessToken}
                  onChange={(e) => handleChange('accessToken', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Webhook URL</h3>
                <Textarea
                  placeholder="Webhook URLを入力してください（例: https://example.com/webhook）"
                  value={config.webhooks}
                  onChange={(e) => handleChange('webhooks', e.target.value)}
                  rows={2}
                />
              </div>
              <Button 
                onClick={() => onSaveContent(JSON.stringify(config, null, 2), false)}
                disabled={!config.accessToken || !config.webhooks}
              >
                設定を保存
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export const lineArtifact: ArtifactDefinition = {
  kind: 'line',
  name: 'LINE Configuration',
  description: 'Configure LINE messaging settings',
  icon: 'MessageSquare',
  content: LineContent,
};
