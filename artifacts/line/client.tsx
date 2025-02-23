import { ArtifactContentProps, ArtifactDefinition } from '@/components/artifact';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface LineConfig {
  channelId: string;
  channelSecret: string;
  accessToken: string;
  webhooks: Array<{
    endpoint: string;
    events: Array<string>;
  }>;
  richMenus: Array<{
    name: string;
    selected: boolean;
  }>;
  templates: Array<{
    name: string;
    content: string;
  }>;
}

function LineContent({
  content,
  onSaveContent,
  isCurrentVersion,
}: ArtifactContentProps) {
  const [config, setConfig] = useState<LineConfig>(() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        channelId: '',
        channelSecret: '',
        accessToken: '',
        webhooks: [],
        richMenus: [],
        templates: [],
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label>Channel ID</Label>
            <Input
              value={config.channelId}
              onChange={(e) => handleChange('channelId', e.target.value)}
              placeholder="Enter your LINE Channel ID"
            />
          </div>
          
          <div>
            <Label>Channel Secret</Label>
            <Input
              type="password"
              value={config.channelSecret}
              onChange={(e) => handleChange('channelSecret', e.target.value)}
              placeholder="Enter your LINE Channel Secret"
            />
          </div>
          
          <div>
            <Label>Access Token</Label>
            <Input
              type="password"
              value={config.accessToken}
              onChange={(e) => handleChange('accessToken', e.target.value)}
              placeholder="Enter your LINE Channel Access Token"
            />
          </div>
        </div>
      </Card>
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
