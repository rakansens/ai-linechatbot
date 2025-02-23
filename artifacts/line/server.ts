import { DocumentHandler, createDocumentHandler } from '@/lib/artifacts/server';
import { ArtifactKind } from '@/components/artifact';
import { CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from '@/lib/artifacts/server';
import { DataStreamWriter } from 'ai';

function writeToStream(stream: DataStreamWriter, content: string) {
  stream.write(`${content}\n`);
}

export const lineDocumentHandler: DocumentHandler<'line'> = createDocumentHandler({
  kind: 'line' as ArtifactKind,
  onCreateDocument: async ({
    id,
    title,
    dataStream,
  }: CreateDocumentCallbackProps) => {
    const initialContent = JSON.stringify({
      channelId: '',
      channelSecret: '',
      accessToken: '',
      webhooks: [],
      richMenus: [],
      templates: [],
    }, null, 2);

    writeToStream(dataStream, initialContent);
    return initialContent;
  },
  onUpdateDocument: async ({
    document,
    description,
    dataStream,
  }: UpdateDocumentCallbackProps) => {
    // Parse existing content
    const content = JSON.parse(document.content || '{}');
    
    // Update content based on description
    // This will be enhanced with natural language processing later
    writeToStream(dataStream, JSON.stringify(content, null, 2));
    
    return JSON.stringify(content, null, 2);
  },
});
