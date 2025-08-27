import React, { useState } from 'react';
import { JobDetailsForm, type JobDetails } from './JobDetailsForm';
import { QuestionSection, type Question } from './QuestionSection';
import { CodingSection, type CodingQuestion } from './CodingSection';
import { InterviewSidebar } from './InterviewSidebar';
import { generateInterviewQuestions, generateAnswer, analyzeAnswer, generateCodingQuestions } from '@/lib/openRouter';
import { useToast } from '@/hooks/use-toast';
import { Brain, Sparkles } from 'lucide-react';

export function InterviewApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string>('');
  const [analyzingQuestionId, setAnalyzingQuestionId] = useState<string>('');
  const [isCodingLoading, setIsCodingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'interview' | 'coding'>('interview');
  const [activeSection, setActiveSection] = useState<'technical' | 'behavioral' | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const { toast } = useToast();

  const handleJobSubmit = async (details: JobDetails) => {
    setIsLoading(true);
    setJobDetails(details);

    try {
      const generatedQuestions = await generateInterviewQuestions(
        details.jobTitle,
        details.company,
        details.jobDescription,
        details.requirements,
        details.resume
      );

      const questionsWithIds: Question[] = generatedQuestions.map((q: any, index: number) => ({
        ...q,
        id: `question-${index}`
      }));

      setQuestions(questionsWithIds);
      
      // Generate coding questions simultaneously
      setIsCodingLoading(true);
      let codingQs: CodingQuestion[] = [];
      try {
        const companyType = details.company.toLowerCase().includes('google') || details.company.toLowerCase().includes('microsoft') ? 'Product-based' : 'Service-based';
        codingQs = await generateCodingQuestions(details.jobTitle, details.company, companyType);
        setCodingQuestions(codingQs);
      } catch (error) {
        console.error('Error generating coding questions:', error);
        toast({
          title: "Warning",
          description: "Interview questions generated successfully, but coding questions failed to load.",
          variant: "destructive",
        });
      } finally {
        setIsCodingLoading(false);
      }
      
      const technicalCount = questionsWithIds.filter(q => q.type === 'technical').length;
      const behavioralCount = questionsWithIds.filter(q => q.type === 'behavioral').length;
      
      toast({
        title: "Questions Generated! 🎉",
        description: `Generated ${technicalCount} technical, ${behavioralCount} behavioral, and ${codingQs.length} coding questions.`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please check your input and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!answer.trim() || !jobDetails) return;

    setIsAnalyzing(true);
    setAnalyzingQuestionId(questionId);
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const feedback = await analyzeAnswer(
        question.question,
        answer,
        jobDetails.jobTitle
      );

      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, userAnswer: answer, feedback }
          : q
      ));

      toast({
        title: "Answer Analyzed! ✅",
        description: `Score: ${feedback.score}/10. Check the detailed feedback below.`,
      });
    } catch (error) {
      console.error('Error analyzing answer:', error);
      toast({
        title: "Error",
        description: "Failed to analyze answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalyzingQuestionId('');
    }
  };

  const handleGenerateAnswer = async (questionId: string) => {
    if (!jobDetails) return;

    setIsGenerating(true);
    setGeneratingQuestionId(questionId);
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const suggestedAnswer = await generateAnswer(
        question.question,
        jobDetails.jobTitle,
        jobDetails.resume,
        question.type
      );

      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, suggestedAnswer }
          : q
      ));

      toast({
        title: "AI Answer Generated! 🤖",
        description: "Review the suggested answer and adapt it to your style.",
      });
    } catch (error) {
      console.error('Error generating answer:', error);
      toast({
        title: "Error",
        description: "Failed to generate answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGeneratingQuestionId('');
    }
  };

  // Calculate question counts for sidebar
  const getQuestionCounts = () => {
    const technical = questions.filter(q => q.type === 'technical');
    const behavioral = questions.filter(q => q.type === 'behavioral');
    
    return {
      technical: {
        total: technical.length,
        easy: technical.filter(q => q.difficulty === 'Easy').length,
        medium: technical.filter(q => q.difficulty === 'Medium').length,
        hard: technical.filter(q => q.difficulty === 'Hard').length,
      },
      behavioral: {
        total: behavioral.length,
        easy: behavioral.filter(q => q.difficulty === 'Easy').length,
        medium: behavioral.filter(q => q.difficulty === 'Medium').length,
        hard: behavioral.filter(q => q.difficulty === 'Hard').length,
      },
      coding: codingQuestions.length
    };
  };

  // Filter questions based on active section and difficulty
  const getFilteredQuestions = () => {
    let filtered = questions;
    
    if (activeSection) {
      filtered = filtered.filter(q => q.type === activeSection);
    }
    
    if (activeDifficulty) {
      filtered = filtered.filter(q => q.difficulty === activeDifficulty);
    }
    
    return filtered;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-hero backdrop-blur">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 backdrop-blur">
              <Brain className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Interview Prep AI
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">
                AI-powered interview preparation with personalized questions and feedback
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {questions.length === 0 ? (
        <main className="container mx-auto px-4 py-8 space-y-8">
          <JobDetailsForm onSubmit={handleJobSubmit} isLoading={isLoading} />
        </main>
      ) : (
        <div className="flex min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <InterviewSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setActiveDifficulty(null); // Reset difficulty when section changes
            }}
            activeDifficulty={activeDifficulty}
            onDifficultyChange={setActiveDifficulty}
            questionCounts={getQuestionCounts()}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden">
            {/* Success Message */}
            <div className="p-6 border-b border-border/50 bg-gradient-hero/30 backdrop-blur">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Questions ready for {jobDetails?.jobTitle} at {jobDetails?.company}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Practice with AI-generated questions tailored to your profile
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-200px)]">
              {activeTab === 'interview' ? (
                <QuestionSection
                  questions={getFilteredQuestions()}
                  onAnswerSubmit={handleAnswerSubmit}
                  onGenerateAnswer={handleGenerateAnswer}
                  isGenerating={isGenerating}
                  isAnalyzing={isAnalyzing}
                  generatingQuestionId={generatingQuestionId}
                  analyzingQuestionId={analyzingQuestionId}
                  hideFilters={true}
                />
              ) : (
                <CodingSection
                  questions={codingQuestions}
                  isLoading={isCodingLoading}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by DeepSeek R1 via OpenRouter • Built for interview success</p>
        </div>
      </footer>
    </div>
  );
}