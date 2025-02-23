import { ArtifactContentProps, ArtifactDefinition } from '@/components/artifact';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Clock, Send, Image, Sticker, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MessageSchedule {
  delay: number;
  unit: 'minutes' | 'hours' | 'days';
}

interface Message {
  id: string;
  type: 'text' | 'image' | 'sticker';
  content: string;
  schedule?: MessageSchedule;
  status: 'draft' | 'scheduled' | 'sent';
  timestamp: string;
}

interface MessageConfig {
  messages: Message[];
  settings: {
    defaultSchedule: MessageSchedule;
  };
}

function MessagingContent({
  content,
  onSaveContent,
  isCurrentVersion,
}: ArtifactContentProps) {
  const [config, setConfig] = useState<MessageConfig>(() => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        messages: [],
        settings: {
          defaultSchedule: {
            delay: 1,
            unit: 'days'
          }
        }
      };
    }
  });

  const [newMessage, setNewMessage] = useState('');
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [schedule, setSchedule] = useState<MessageSchedule>(config.settings.defaultSchedule);

  useEffect(() => {
    if (!isCurrentVersion) {
      try {
        setConfig(JSON.parse(content));
      } catch {
        // Invalid JSON, keep current state
      }
    }
  }, [content, isCurrentVersion]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: newMessage,
      status: isScheduleMode ? 'scheduled' : 'draft',
      timestamp: new Date().toISOString(),
      ...(isScheduleMode && { schedule })
    };

    const updatedConfig = {
      ...config,
      messages: [...config.messages, message]
    };

    setConfig(updatedConfig);
    onSaveContent(JSON.stringify(updatedConfig, null, 2), false);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ履歴 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {config.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.status === 'sent' ? 'justify-start' : 'justify-end'}`}
          >
            <div className="max-w-[70%]">
              <div className={`
                rounded-lg p-3 
                ${message.status === 'sent' 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'bg-green-500 text-white'
                }
              `}>
                <div className="text-sm">{message.content}</div>
                {message.schedule && (
                  <div className="text-xs mt-1 opacity-70">
                    ⏰ {message.schedule.delay} {message.schedule.unit}後に送信
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.status === 'scheduled' ? '予約済み' : 
                 message.status === 'sent' ? '送信済み' : '下書き'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 入力エリア */}
      <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsScheduleMode(!isScheduleMode)}
            className={isScheduleMode ? 'text-green-500' : ''}
          >
            <Clock className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Sticker className="h-5 w-5" />
          </Button>
        </div>

        {isScheduleMode && (
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="number"
              min="1"
              className="w-24"
              value={schedule.delay}
              onChange={(e) => setSchedule({
                ...schedule,
                delay: parseInt(e.target.value) || 1
              })}
            />
            <select
              className="border rounded p-2"
              value={schedule.unit}
              onChange={(e) => setSchedule({
                ...schedule,
                unit: e.target.value as 'minutes' | 'hours' | 'days'
              })}
            >
              <option value="minutes">分後</option>
              <option value="hours">時間後</option>
              <option value="days">日後</option>
            </select>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <Textarea
            placeholder="メッセージを入力"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const lineMessagingArtifact: ArtifactDefinition = {
  kind: 'line-messaging',
  name: 'LINE配信',
  description: 'LINEメッセージの配信管理',
  icon: 'MessageSquare',
  content: MessagingContent,
};
