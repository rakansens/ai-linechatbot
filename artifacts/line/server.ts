import { DocumentHandler, createDocumentHandler } from '@/lib/artifacts/server';
import { ArtifactKind } from '@/components/artifact';
import { CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from '@/lib/artifacts/server';
import { DataStreamWriter } from 'ai';

interface LineConfig {
  channelId: string;
  channelSecret: string;
  accessToken: string;
  webhooks: string;
  richMenus: string;
  templates: string;
}

// LINE設定のバリデーション
function validateLineConfig(config: LineConfig): string[] {
  const errors: string[] = [];

  if (!config.channelId.match(/^\d+$/)) {
    errors.push('チャネルIDは数字のみで入力してください');
  }

  if (!config.channelSecret.match(/^[a-zA-Z0-9]+$/)) {
    errors.push('チャネルシークレットは英数字のみで入力してください');
  }

  if (!config.accessToken.match(/^[a-zA-Z0-9-_]+$/)) {
    errors.push('アクセストークンは英数字、ハイフン、アンダースコアのみで入力してください');
  }

  if (config.webhooks && !config.webhooks.match(/^https?:\/\/.+/)) {
    errors.push('Webhook URLは http:// または https:// で始まる必要があります');
  }

  return errors;
}

// 自然言語からLINE設定を抽出
function extractLineConfig(text: string): Partial<LineConfig> {
  const config: Partial<LineConfig> = {};
  
  const channelIdMatch = text.match(/チャ[ネン]ルID[はが]?\s*[「『]?([0-9]+)[』」]?/);
  if (channelIdMatch) {
    config.channelId = channelIdMatch[1];
  }

  const secretMatch = text.match(/シークレット[はが]?\s*[「『]?([a-zA-Z0-9]+)[』」]?/);
  if (secretMatch) {
    config.channelSecret = secretMatch[1];
  }

  const tokenMatch = text.match(/アクセストークン[はが]?\s*[「『]?([a-zA-Z0-9-_]+)[』」]?/);
  if (tokenMatch) {
    config.accessToken = tokenMatch[1];
  }

  const webhookMatch = text.match(/Webhook(?:\s*URL)?[はが]?\s*[「『]?(https?:\/\/[^\s」』]+)[』」]?/);
  if (webhookMatch) {
    config.webhooks = webhookMatch[1];
  }

  return config;
}

async function writeToStream(stream: DataStreamWriter, content: string) {
  await stream.write(`a:${content}\n`);
}

export const lineDocumentHandler: DocumentHandler<'line'> = createDocumentHandler({
  kind: 'line',
  onCreateDocument: async ({
    id,
    title,
    dataStream,
  }: CreateDocumentCallbackProps) => {
    const initialContent = JSON.stringify({
      channelId: '',
      channelSecret: '',
      accessToken: '',
      webhooks: '',
      richMenus: '',
      templates: '',
    }, null, 2);

    writeToStream(dataStream, initialContent);
    return initialContent;
  },
  onUpdateDocument: async ({
    document,
    description,
    dataStream,
  }: UpdateDocumentCallbackProps) => {
    // 既存の設定を取得
    const currentConfig: LineConfig = JSON.parse(document.content || JSON.stringify({
      channelId: '',
      channelSecret: '',
      accessToken: '',
      webhooks: '',
      richMenus: '',
      templates: '',
    }));
    
    // 自然言語から設定を抽出
    if (description) {
      const extractedConfig = extractLineConfig(description);
      Object.assign(currentConfig, extractedConfig);
    }

    // 設定のバリデーション
    const errors = validateLineConfig(currentConfig);
    if (errors.length > 0) {
      await writeToStream(dataStream, `エラー:\n${errors.join('\n')}`);
      return JSON.stringify(currentConfig, null, 2); // エラーがある場合は現在の設定を返す
    }

    // 更新された設定を保存
    const updatedContent = JSON.stringify(currentConfig, null, 2);
    await writeToStream(dataStream, `設定を更新しました:\n${updatedContent}`);
    
    return updatedContent;
  },
});
