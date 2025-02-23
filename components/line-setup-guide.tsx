import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';

interface LineConfig {
  accessToken: string;
  webhooks: string;
}

interface SetupStep {
  title: string;
  description: string;
  field: keyof LineConfig;
  type: 'text' | 'password';
  placeholder: string;
  helper: string;
}

const setupSteps: SetupStep[] = [
  {
    title: 'アクセストークンの設定',
    description: 'LINE Developersコンソールで発行したチャネルアクセストークンを入力してください。',
    field: 'accessToken',
    type: 'password',
    placeholder: 'アクセストークンを入力',
    helper: 'アクセストークンは LINE Developers コンソールの「Messaging API設定」タブで発行できます。',
  },
  {
    title: 'Webhook URLの設定',
    description: 'LINEボットがメッセージを受信するためのWebhook URLを入力してください。',
    field: 'webhooks',
    type: 'text',
    placeholder: 'Webhook URLを入力',
    helper: 'Webhook URLは、LINEボットがメッセージを受信するためのエンドポイントです。通常はhttpsで始まる必要があります。',
  }
];

interface LineSetupGuideProps {
  config: LineConfig;
  onConfigChange: (field: keyof LineConfig, value: string) => void;
  onComplete?: () => void;
}

export function LineSetupGuide({ config, onConfigChange, onComplete }: LineSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isStepComplete = (step: number) => {
    const field = setupSteps[step].field;
    return config[field] !== '';
  };

  const isCurrentStepValid = () => {
    return isStepComplete(currentStep);
  };

  const handleNext = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isCurrentStepValid()) {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* ステップインジケーター */}
      <div className="flex justify-between mb-8">
        {setupSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-center"
            onClick={() => setCurrentStep(index)}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${
                  isStepComplete(index)
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }
              `}
            >
              {isStepComplete(index) ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < setupSteps.length - 1 && (
              <div
                className={`
                  w-full h-1 mx-2
                  ${
                    isStepComplete(index)
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* 現在のステップの入力フォーム */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {setupSteps[currentStep].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {setupSteps[currentStep].description}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{setupSteps[currentStep].title}</Label>
            <Input
              type={setupSteps[currentStep].type}
              value={config[setupSteps[currentStep].field]}
              onChange={(e) =>
                onConfigChange(setupSteps[currentStep].field, e.target.value)
              }
              placeholder={setupSteps[currentStep].placeholder}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {setupSteps[currentStep].helper}
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              戻る
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
            >
              {currentStep === setupSteps.length - 1 ? '完了' : '次へ'}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 設定状態の表示 */}
      <Card className="mt-4 p-4">
        <h3 className="font-medium mb-2">設定状態</h3>
        <div className="space-y-2">
          {setupSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  isStepComplete(index)
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
              <span
                className={
                  isStepComplete(index)
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
