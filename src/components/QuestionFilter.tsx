import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface QuestionFilterProps {
  questions: any[];
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
  questionType: 'technical' | 'behavioral';
}

export function QuestionFilter({
  questions,
  selectedDifficulty,
  onDifficultyChange,
  questionType
}: QuestionFilterProps) {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  const getCountByDifficulty = (difficulty: string) => {
    return questions.filter(q => q.difficulty === difficulty).length;
  };
  
  const getTotalCount = () => questions.length;

  return (
    <Card className="bg-gradient-card backdrop-blur border-border/50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium">Filter by Difficulty</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedDifficulty ? getCountByDifficulty(selectedDifficulty) : getTotalCount()} questions
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDifficulty === null ? "default" : "outline"}
            size="sm"
            onClick={() => onDifficultyChange(null)}
            className="text-xs"
          >
            All ({getTotalCount()})
          </Button>
          
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => onDifficultyChange(difficulty)}
              className={`text-xs ${
                difficulty === 'Easy' 
                  ? 'border-green-500/50 text-green-600 hover:bg-green-50' 
                  : difficulty === 'Medium'
                  ? 'border-yellow-500/50 text-yellow-600 hover:bg-yellow-50'
                  : 'border-red-500/50 text-red-600 hover:bg-red-50'
              }`}
            >
              {difficulty} ({getCountByDifficulty(difficulty)})
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}