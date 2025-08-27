import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Code, Sparkles, CheckCircle, Crown, Zap } from 'lucide-react';

interface LoadingExperienceProps {
  isVisible: boolean;
  progress: number;
  onComplete?: () => void;
}

const loadingSteps = [
  {
    id: 1,
    title: "Analyzing Your Profile",
    description: "Understanding your experience and target role",
    icon: Brain,
    duration: 20
  },
  {
    id: 2,
    title: "Researching Company Culture",
    description: "Gathering insights about your target company",
    icon: Target,
    duration: 25
  },
  {
    id: 3,
    title: "Generating Technical Questions",
    description: "Creating 60+ personalized technical questions",
    icon: Code,
    duration: 30
  },
  {
    id: 4,
    title: "Crafting Behavioral Scenarios",
    description: "Designing 20+ behavioral interview questions",
    icon: Sparkles,
    duration: 15
  },
  {
    id: 5,
    title: "Curating Coding Challenges",
    description: "Selecting 30+ relevant DSA problems",
    icon: Crown,
    duration: 10
  }
];

const tips = [
  "💡 Practice the STAR method for behavioral questions",
  "🎯 Research the company's recent projects and initiatives",
  "⚡ Review fundamentals: time/space complexity, system design basics",
  "🚀 Prepare 3-4 thoughtful questions to ask the interviewer",
  "🔥 Practice explaining your thought process out loud",
  "💪 Remember: confidence comes from preparation!",
  "🌟 Smile and maintain good eye contact during the interview",
  "📈 Think of challenges as opportunities to showcase growth"
];

export function LoadingExperience({ isVisible, progress, onComplete }: LoadingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTip, setCurrentTip] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Update current step based on progress
    const newStep = Math.min(Math.ceil(progress / 20), 5);
    setCurrentStep(newStep);

    // Mark steps as completed
    const completed = loadingSteps
      .filter(step => (step.id - 1) * 20 < progress)
      .map(step => step.id);
    setCompletedSteps(completed);

    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 1000);
    }
  }, [progress, isVisible, onComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-slide-up">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass animate-glow">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-semibold brand-text text-lg">
              Crafting Your Perfect Interview Session
            </span>
          </div>
          
          <h2 className="text-3xl font-bold">
            Hang tight! Amazing things are being prepared...
          </h2>
          <p className="text-muted-foreground">
            Our AI is working hard to create the most relevant questions for your success
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant="outline" className="font-mono">
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="h-3 bg-muted/30">
            <div 
              className="h-full bg-gradient-royal rounded-full transition-all duration-500 ease-out shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const Icon = step.icon;
            
            return (
              <Card key={step.id} className={`
                glass transition-all duration-500 border
                ${isActive ? 'border-primary shadow-glow scale-105' : ''}
                ${isCompleted ? 'border-success/50 bg-success/5' : ''}
              `}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`
                    p-3 rounded-xl transition-all duration-300
                    ${isCompleted ? 'bg-success/20' : isActive ? 'bg-primary/20 animate-pulse' : 'bg-muted/20'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-success" />
                    ) : (
                      <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors ${
                      isCompleted ? 'text-success' : isActive ? 'text-primary' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {isActive && (
                    <div className="animate-spin">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Rotating Tips */}
        <Card className="glass border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 animate-float">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pro Tip</h4>
                <p className="text-sm text-muted-foreground transition-all duration-500">
                  {tips[currentTip]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fun Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass text-center p-4">
            <div className="text-2xl font-bold text-primary">80+</div>
            <div className="text-xs text-muted-foreground">Total Questions</div>
          </Card>
          <Card className="glass text-center p-4">
            <div className="text-2xl font-bold text-primary">30+</div>
            <div className="text-xs text-muted-foreground">Coding Problems</div>
          </Card>
          <Card className="glass text-center p-4">
            <div className="text-2xl font-bold text-primary">AI</div>
            <div className="text-xs text-muted-foreground">Powered Feedback</div>
          </Card>
        </div>
      </div>
    </div>
  );
}