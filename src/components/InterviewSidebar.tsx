import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Code, User, Brain, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewSidebarProps {
  activeTab: 'interview' | 'coding';
  onTabChange: (tab: 'interview' | 'coding') => void;
  activeSection?: 'technical' | 'behavioral' | null;
  onSectionChange: (section: 'technical' | 'behavioral' | null) => void;
  activeDifficulty?: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
  questionCounts: {
    technical: { total: number; easy: number; medium: number; hard: number };
    behavioral: { total: number; easy: number; medium: number; hard: number };
    coding: number;
  };
}

export function InterviewSidebar({
  activeTab,
  onTabChange,
  activeSection,
  onSectionChange,
  activeDifficulty,
  onDifficultyChange,
  questionCounts
}: InterviewSidebarProps) {
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="w-80 bg-gradient-card backdrop-blur border-r border-border/50 p-6 space-y-6">
      {/* Main Navigation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Interview Prep</h2>
        </div>
        
        <Button
          variant={activeTab === 'interview' ? 'default' : 'outline'}
          className={cn(
            "w-full justify-start gap-3",
            activeTab === 'interview' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange('interview')}
        >
          <User className="h-4 w-4" />
          <span>Interview Questions</span>
          <Badge variant="secondary" className="ml-auto">
            {questionCounts.technical.total + questionCounts.behavioral.total}
          </Badge>
        </Button>
        
        <Button
          variant={activeTab === 'coding' ? 'default' : 'outline'}
          className={cn(
            "w-full justify-start gap-3",
            activeTab === 'coding' && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange('coding')}
        >
          <Code className="h-4 w-4" />
          <span>Coding Problems</span>
          <Badge variant="secondary" className="ml-auto">
            {questionCounts.coding}
          </Badge>
        </Button>
      </div>

      {/* Interview Sub-sections */}
      {activeTab === 'interview' && (
        <Card className="bg-gradient-card/50 border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Question Types</span>
            </div>
            
            <Button
              variant={activeSection === null ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-between"
              onClick={() => onSectionChange(null)}
            >
              <span>All Questions</span>
              <Badge variant="outline" className="text-xs">
                {questionCounts.technical.total + questionCounts.behavioral.total}
              </Badge>
            </Button>
            
            <Button
              variant={activeSection === 'technical' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-between"
              onClick={() => onSectionChange('technical')}
            >
              <span>Technical</span>
              <Badge variant="outline" className="text-xs">
                {questionCounts.technical.total}
              </Badge>
            </Button>
            
            <Button
              variant={activeSection === 'behavioral' ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-between"
              onClick={() => onSectionChange('behavioral')}
            >
              <span>Behavioral</span>
              <Badge variant="outline" className="text-xs">
                {questionCounts.behavioral.total}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Filter */}
      {activeTab === 'interview' && activeSection && (
        <Card className="bg-gradient-card/50 border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Difficulty</span>
            </div>
            
            <Button
              variant={activeDifficulty === null ? 'default' : 'outline'}
              size="sm"
              className="w-full justify-between"
              onClick={() => onDifficultyChange(null)}
            >
              <span>All</span>
              <Badge variant="outline" className="text-xs">
                {activeSection === 'technical' ? questionCounts.technical.total : questionCounts.behavioral.total}
              </Badge>
            </Button>
            
            {difficulties.map((difficulty) => {
              const count = activeSection === 'technical' 
                ? questionCounts.technical[difficulty.toLowerCase() as keyof typeof questionCounts.technical] as number
                : questionCounts.behavioral[difficulty.toLowerCase() as keyof typeof questionCounts.behavioral] as number;
              
              return (
                <Button
                  key={difficulty}
                  variant={activeDifficulty === difficulty ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "w-full justify-between text-xs",
                    difficulty === 'Easy' && 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50',
                    difficulty === 'Medium' && 'border-amber-500/30 text-amber-600 hover:bg-amber-50',
                    difficulty === 'Hard' && 'border-red-500/30 text-red-600 hover:bg-red-50'
                  )}
                  onClick={() => onDifficultyChange(difficulty)}
                >
                  <span>{difficulty}</span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Question Distribution Summary */}
      {activeTab === 'interview' && (
        <Card className="bg-gradient-card/30 border-border/30">
          <CardContent className="p-4 space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Distribution</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Technical Easy:</span>
                <Badge variant="outline">{questionCounts.technical.easy}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Technical Medium:</span>
                <Badge variant="outline">{questionCounts.technical.medium}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Technical Hard:</span>
                <Badge variant="outline">{questionCounts.technical.hard}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Behavioral Total:</span>
                <Badge variant="outline">{questionCounts.behavioral.total}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}