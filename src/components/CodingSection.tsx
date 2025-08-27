import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Loader } from "lucide-react";

export interface CodingQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  platform: "leetcode" | "geeksforgeeks";
  url: string;
  tags: string[];
}

interface CodingSectionProps {
  questions: CodingQuestion[];
  isLoading: boolean;
}

export function CodingSection({ questions, isLoading }: CodingSectionProps) {
  const easyQuestions = questions.filter((q) => q.difficulty === "Easy");
  const mediumQuestions = questions.filter((q) => q.difficulty === "Medium");
  const hardQuestions = questions.filter((q) => q.difficulty === "Hard");

  const handleQuestionClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderQuestionCard = (question: CodingQuestion) => (
    <Card
      key={question.title}
      className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg hover:border-primary/50 transition-all duration-300"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle
            className="text-base leading-relaxed text-white hover:text-primary transition-colors cursor-pointer"
            onClick={() => handleQuestionClick(question.url)}
          >
            {question.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={
                question.difficulty === "Hard"
                  ? "destructive"
                  : question.difficulty === "Medium"
                  ? "secondary"
                  : "default"
              }
              className="bg-white/5 border border-white/10 text-gray-300"
            >
              {question.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs bg-white/5 border border-white/10 text-gray-300"
            >
              {question.platform === "leetcode" ? "LC" : "GFG"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">{question.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-xs bg-white/5 border border-white/10 text-gray-300"
            >
              {question.category}
            </Badge>
            {(question.tags || []).slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-white/5 border border-white/10 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuestionClick(question.url)}
            className="ml-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Solve
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <Code className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-white">Coding Questions</h2>
          <Badge
            variant="secondary"
            className="bg-white/5 border border-white/10 text-gray-300"
          >
            Loading...
          </Badge>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-black animate-pulse"
            >
              <CardHeader>
                <div className="h-5 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-white/10 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-3">
        <Code className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Coding Questions</h2>
        <Badge
          variant="secondary"
          className="bg-white/5 border border-white/10 text-gray-300"
        >
          {questions.length} questions
        </Badge>
      </div>

      {easyQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="text-lg font-semibold text-green-500">
              Easy ({easyQuestions.length})
            </h3>
          </div>
          <div className="grid gap-4">
            {easyQuestions.map(renderQuestionCard)}
          </div>
        </div>
      )}

      {mediumQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <h3 className="text-lg font-semibold text-yellow-500">
              Medium ({mediumQuestions.length})
            </h3>
          </div>
          <div className="grid gap-4">
            {mediumQuestions.map(renderQuestionCard)}
          </div>
        </div>
      )}

      {hardQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="text-lg font-semibold text-red-500">
              Hard ({hardQuestions.length})
            </h3>
          </div>
          <div className="grid gap-4">
            {hardQuestions.map(renderQuestionCard)}
          </div>
        </div>
      )}
    </div>
  );
}
