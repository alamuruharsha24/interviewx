import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Mic,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  saveUserAnswer, 
  saveFeedback, 
  saveSuggestedAnswer,
  updateSessionProgress 
} from "@/lib/firebase-utils";

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define interfaces
export interface Question {
  id: string;
  question: string;
  type: "technical" | "behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  suggestedAnswer?: string;
  userAnswer?: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    improvedAnswer: string;
  };
}

interface QuestionSectionProps {
  questions: Question[];
  onAnswerSubmit: (questionId: string, answer: string) => Promise<void>;
  onGenerateAnswer: (questionId: string) => Promise<void>;
  isGenerating: boolean;
  isAnalyzing: boolean;
  generatingQuestionId?: string;
  analyzingQuestionId?: string;
  hideFilters?: boolean;
  sessionId: string;
  onQuestionsUpdate?: (questions: Question[]) => void;
}

// Utility functions
const extractCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    const language = match[1] || "javascript";
    const code = match[2].trim();
    parts.push({ type: "code", language, content: code });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ type: "text", content: text }];
};

// Component for code snippets
const CodeSnippet = ({
  code,
  language = "javascript",
}: {
  code: string;
  language?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string, language: string) => {
    // Basic keyword highlighting for common languages
    const keywords: Record<string, RegExp> = {
      javascript:
        /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|default)\b/g,
      typescript:
        /\b(function|const|let|var|if|else|for|while|return|class|interface|type|import|export|from|default)\b/g,
      python:
        /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|with)\b/g,
      java: /\b(public|private|protected|class|interface|void|static|int|String|boolean|if|else|for|while|return)\b/g,
      csharp:
        /\b(public|private|protected|class|interface|void|static|int|string|bool|if|else|for|while|return)\b/g,
    };

    let highlighted = code;

    // Highlight keywords
    if (keywords[language]) {
      highlighted = highlighted.replace(
        keywords[language],
        '<span class="text-blue-400">$&</span>'
      );
    }

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])(.*?)\1/g,
      '<span class="text-green-400">$1$2$1</span>'
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-yellow-400">$1</span>'
    );

    // Highlight comments
    if (
      language === "javascript" ||
      language === "typescript" ||
      language === "java" ||
      language === "csharp"
    ) {
      highlighted = highlighted.replace(
        /(\/\/.*$)/gm,
        '<span class="text-gray-500">$1</span>'
      );
    }

    if (language === "python") {
      highlighted = highlighted.replace(
        /(#.*$)/gm,
        '<span class="text-gray-500">$1</span>'
      );
    }

    return highlighted;
  };

  return (
    <div className="relative my-4 rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy code
            </>
          )}
        </button>
      </div>
      <pre className="bg-[#1e1e1e] text-sm text-gray-200 p-4 overflow-x-auto font-mono">
        <code
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language),
          }}
        />
      </pre>
    </div>
  );
};

// Component for filtering questions
function QuestionFilter({
  selectedType,
  onTypeChange,
  selectedDifficulty,
  onDifficultyChange,
  typeCounts,
  difficultyCounts,
  totalQuestions,
  filteredCount,
}: {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
  typeCounts: Record<string, number>;
  difficultyCounts: Record<string, number>;
  totalQuestions: number;
  filteredCount: number;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const typeColors: Record<string, string> = {
    behavioral: "bg-blue-500/90",
    technical: "bg-purple-500/90",
  };
  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-500/90",
    Medium: "bg-yellow-500/90",
    Hard: "bg-red-500/90",
  };
  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filter Questions
        {(selectedType !== null || selectedDifficulty !== null) && (
          <span className="bg-blue-500 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center">
            {filteredCount}
          </span>
        )}
        {showFilters ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {showFilters && (
        <Card className="bg-[#1a1a1a] border border-white/10 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white text-sm mb-3 font-medium">
                  Filter by Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onTypeChange(null)}
                    variant={!selectedType ? "default" : "outline"}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !selectedType
                        ? "bg-white text-black"
                        : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                    }`}
                  >
                    All ({totalQuestions})
                  </Button>
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <Button
                      key={type}
                      onClick={() => onTypeChange(type)}
                      variant={selectedType === type ? "default" : "outline"}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedType === type
                          ? `${typeColors[type]} text-white`
                          : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white text-sm mb-3 font-medium">
                  Filter by Difficulty
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onDifficultyChange(null)}
                    variant={!selectedDifficulty ? "default" : "outline"}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !selectedDifficulty
                        ? "bg-white text-black"
                        : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                    }`}
                  >
                    All ({totalQuestions})
                  </Button>
                  {Object.entries(difficultyCounts).map(
                    ([difficulty, count]) => (
                      <Button
                        key={difficulty}
                        onClick={() => onDifficultyChange(difficulty)}
                        variant={
                          selectedDifficulty === difficulty
                            ? "default"
                            : "outline"
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedDifficulty === difficulty
                            ? `${difficultyColors[difficulty]} text-white`
                            : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                        }`}
                      >
                        {difficulty} ({count})
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10">
              <div className="flex flex-col sm:flexRow sm:items-center justify-between gap-3">
                <div className="text-gray-300 text-sm">
                  Showing{" "}
                  <span className="font-medium text-white">
                    {filteredCount}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-white">
                    {totalQuestions}
                  </span>{" "}
                  questions
                </div>
                {(selectedType !== null || selectedDifficulty !== null) && (
                  <button
                    onClick={() => {
                      onTypeChange(null);
                      onDifficultyChange(null);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main QuestionSection component
export function QuestionSection({
  questions,
  onAnswerSubmit,
  onGenerateAnswer,
  isGenerating,
  isAnalyzing,
  generatingQuestionId,
  analyzingQuestionId,
  hideFilters = false,
  sessionId,
  onQuestionsUpdate,
}: QuestionSectionProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [listeningQuestionId, setListeningQuestionId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [analysisErrors, setAnalysisErrors] = useState<{ [key: string]: string }>({});
  const [retryCounts, setRetryCounts] = useState<{ [key: string]: number }>({});
  const [savingAnswers, setSavingAnswers] = useState<{ [key: string]: boolean }>({});
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef<string>("");
  const finalTranscriptRef = useRef<string>("");
  const isStoppingRef = useRef(false);
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Initialize user answers from questions and sync with Firebase
  useEffect(() => {
    const initialAnswers: { [key: string]: string } = {};
    questions.forEach((q) => {
      if (q.userAnswer) {
        initialAnswers[q.id] = q.userAnswer;
      }
    });
    setUserAnswers(initialAnswers);
  }, [questions]);

  // Debounced save function for user answers
  const debouncedSaveAnswer = async (questionId: string, answer: string) => {
    if (!sessionId || !currentUser) return;

    // Clear existing timeout for this question
    if (saveTimeoutRef.current[questionId]) {
      clearTimeout(saveTimeoutRef.current[questionId]);
    }

    // Set saving state
    setSavingAnswers(prev => ({ ...prev, [questionId]: true }));

    // Set new timeout
    saveTimeoutRef.current[questionId] = setTimeout(async () => {
      try {
        await saveUserAnswer(sessionId, questionId, answer);
        console.log(`Auto-saved answer for question ${questionId}`);
        
        // Update progress after saving
        await updateSessionProgress(sessionId);
        
        // Clear saving state
        setSavingAnswers(prev => {
          const newState = { ...prev };
          delete newState[questionId];
          return newState;
        });
      } catch (error) {
        console.error("Error auto-saving answer:", error);
        setSavingAnswers(prev => {
          const newState = { ...prev };
          delete newState[questionId];
          return newState;
        });
      }
    }, 2000); // Save after 2 seconds of no typing
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      // Request microphone permission
      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then(() => {
          setPermissionGranted(true);
        })
        .catch((err) => {
          console.warn("Microphone permission denied:", err);
          setPermissionGranted(false);
        });
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setIsListening(true);
        interimTranscriptRef.current = "";
        finalTranscriptRef.current = "";
      };
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        finalTranscriptRef.current += finalTranscript;
        interimTranscriptRef.current = interimTranscript;
        if (listeningQuestionId) {
          const currentAnswer = userAnswers[listeningQuestionId] || "";
          const baseText = currentAnswer.trim();
          const combinedTranscript = (
            finalTranscriptRef.current + interimTranscriptRef.current
          ).trim();
          let newText = baseText;
          if (combinedTranscript) {
            newText = baseText
              ? `${baseText} ${combinedTranscript}`
              : combinedTranscript;
          }
          setUserAnswers((prev) => ({
            ...prev,
            [listeningQuestionId]: newText,
          }));
          
          // Auto-save the transcribed text
          debouncedSaveAnswer(listeningQuestionId, newText);
        }
      };
      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setPermissionGranted(false);
        }
        stopListening();
      };
      recognition.onend = () => {
        if (isStoppingRef.current) {
          isStoppingRef.current = false;
        } else {
          setIsListening(false);
          setListeningQuestionId(null);
        }
      };
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      // Clear all timeouts on unmount
      Object.values(saveTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [listeningQuestionId, userAnswers, sessionId, currentUser]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    
    // Auto-save with debouncing
    debouncedSaveAnswer(questionId, answer);
  };

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!answer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionId || !currentUser) {
      toast({
        title: "Session Error",
        description: "Session not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear any previous error for this question
      setAnalysisErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });

      // Save user answer immediately
      await saveUserAnswer(sessionId, questionId, answer);

      // Call the parent's onAnswerSubmit which will handle the AI analysis
      await onAnswerSubmit(questionId, answer);

      // Reset retry count on success
      setRetryCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[questionId];
        return newCounts;
      });

      // Update progress after successful submission
      await updateSessionProgress(sessionId);

    } catch (error) {
      console.error("Error submitting answer:", error);
      // Increment retry count
      const currentRetryCount = retryCounts[questionId] || 0;
      const newRetryCount = currentRetryCount + 1;
      setRetryCounts((prev) => ({
        ...prev,
        [questionId]: newRetryCount,
      }));
      if (newRetryCount >= 3) {
        setAnalysisErrors((prev) => ({
          ...prev,
          [questionId]:
            "Failed to analyze answer after multiple attempts. Please try again later.",
        }));
      } else {
        setAnalysisErrors((prev) => ({
          ...prev,
          [questionId]: `Failed to analyze answer. Retrying... (${newRetryCount}/3)`,
        }));
        // Retry after a delay
        setTimeout(() => {
          handleAnswerSubmit(questionId, answer);
        }, 2000 * newRetryCount);
      }
    }
  };

  const handleGenerateAnswer = async (questionId: string) => {
    if (!sessionId || !currentUser) {
      toast({
        title: "Session Error",
        description: "Session not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear any previous error
      setAnalysisErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });

      await onGenerateAnswer(questionId);
    } catch (error) {
      console.error("Error generating answer:", error);
      setAnalysisErrors((prev) => ({
        ...prev,
        [questionId]: "Failed to generate answer. Please try again.",
      }));
    }
  };

  const startListening = (questionId: string) => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (!permissionGranted) {
      alert(
        "Microphone access is required. Please allow microphone access and try again."
      );
      return;
    }
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      }
      interimTranscriptRef.current = "";
      finalTranscriptRef.current = "";
      setListeningQuestionId(questionId);
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (error) {
          setIsListening(false);
          setListeningQuestionId(null);
        }
      }, 100);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      isStoppingRef.current = true;
      setIsListening(false);
      setListeningQuestionId(null);
      try {
        recognitionRef.current.stop();
      } catch (error) {
        isStoppingRef.current = false;
      }
    }
  };

  const toggleListening = (questionId: string) => {
    if (isListening && listeningQuestionId === questionId) {
      stopListening();
    } else {
      startListening(questionId);
    }
  };

  const SoundWave = () => (
    <div className="flex items-center justify-center space-x-1 h-4">
      <div
        className="w-1 bg-blue-500 rounded-full animate-pulse"
        style={{
          height: "4px",
          animationDelay: "0ms",
          animationDuration: "1s",
        }}
      ></div>
      <div
        className="w-1 bg-blue-500 rounded-full animate-pulse"
        style={{
          height: "8px",
          animationDelay: "200ms",
          animationDuration: "1s",
        }}
      ></div>
      <div
        className="w-1 bg-blue-500 rounded-full animate-pulse"
        style={{
          height: "6px",
          animationDelay: "400ms",
          animationDuration: "1s",
        }}
      ></div>
      <div
        className="w-1 bg-blue-500 rounded-full animate-pulse"
        style={{
          height: "10px",
          animationDelay: "600ms",
          animationDuration: "1s",
        }}
      ></div>
    </div>
  );

  // Compute counts for filter
  const typeCounts = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const difficultyCounts = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Filter questions based on selections
  const filteredQuestions = questions.filter((q) => {
    const typeMatch = selectedType ? q.type === selectedType : true;
    const difficultyMatch = selectedDifficulty
      ? q.difficulty === selectedDifficulty
      : true;
    return typeMatch && difficultyMatch;
  });

  const renderQuestion = (question: Question) => {
    const currentRetryCount = retryCounts[question.id] || 0;
    const isRetrying = currentRetryCount > 0 && currentRetryCount < 3;
    const isSaving = savingAnswers[question.id] || false;
    
    return (
      <Card
        key={question.id}
        className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg hover:border-white/30 transition-colors mb-6"
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg leading-relaxed text-white">
                {question.question}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  className={`${
                    question.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : question.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  } border`}
                >
                  {question.difficulty}
                </Badge>
                <Badge className="bg-white/5 border border-white/10 text-gray-300">
                  {question.category}
                </Badge>
                <Badge
                  className={`${
                    question.type === "technical"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  } border`}
                >
                  {question.type === "technical" ? "Technical" : "Behavioral"}
                </Badge>
                {isSaving && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Saving...
                  </Badge>
                )}
                {question.userAnswer && !isSaving && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Answered
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.suggestedAnswer && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-white">
                  AI Suggested Answer
                </span>
              </div>
              <div className="text-sm text-white leading-relaxed space-y-3">
                {extractCodeBlocks(question.suggestedAnswer).map(
                  (part, idx) => {
                    if (part.type === "code") {
                      return (
                        <CodeSnippet
                          key={idx}
                          code={part.content}
                          language={part.language}
                        />
                      );
                    } else {
                      return part.content
                        .split("\n\n")
                        .map((paragraph, pIdx) => (
                          <p
                            key={`${idx}-${pIdx}`}
                            className="text-sm leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ));
                    }
                  }
                )}
              </div>
            </div>
          )}
          {question.feedback && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm text-white">
                  Answer Analysis
                </span>
                <Badge className="bg-white/5 border border-white/10 text-gray-300">
                  Score: {question.feedback.score}/10
                </Badge>
              </div>
              {question.feedback.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-500 mb-1">
                    Strengths:
                  </h4>
                  <ul className="text-sm text-white space-y-1">
                    {question.feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {question.feedback.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-yellow-500 mb-1">
                    Areas for Improvement:
                  </h4>
                  <ul className="text-sm text-white space-y-1">
                    {question.feedback.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {question.feedback.improvedAnswer && (
                <div className="pt-3 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Improved Answer Suggestion:
                  </h4>
                  <div className="text-sm text-white leading-relaxed bg-white/5 p-3 rounded-md">
                    {extractCodeBlocks(question.feedback.improvedAnswer).map(
                      (part, idx) => {
                        if (part.type === "code") {
                          return (
                            <CodeSnippet
                              key={idx}
                              code={part.content}
                              language={part.language}
                            />
                          );
                        } else {
                          return part.content
                            .split("\n\n")
                            .map((paragraph, pIdx) => (
                              <p
                                key={`${idx}-${pIdx}`}
                                className="text-sm leading-relaxed"
                              >
                                {paragraph}
                              </p>
                            ));
                        }
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {analysisErrors[question.id] && (
            <div
              className={`p-3 rounded-lg ${
                isRetrying
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  isRetrying ? "text-yellow-400" : "text-red-400"
                }`}
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{analysisErrors[question.id]}</span>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                placeholder={
                  speechSupported && permissionGranted
                    ? "Type your answer here or use the microphone button..."
                    : "Type your answer here..."
                }
                value={userAnswers[question.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className={`min-h-24 bg-white/5 border ${
                  isListening && listeningQuestionId === question.id
                    ? "border-blue-500 ring-1 ring-blue-500/50"
                    : "border-white/10"
                } focus:border-primary/50 text-white placeholder:text-gray-500`}
                disabled={isListening && listeningQuestionId === question.id}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {speechSupported ? (
                  <>
                    <button
                      onClick={() => toggleListening(question.id)}
                      className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
                        isListening && listeningQuestionId === question.id
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-white/10 text-gray-400 hover:bg-white/20"
                      } ${
                        !permissionGranted
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!permissionGranted}
                      title={
                        !permissionGranted
                          ? "Microphone permission required"
                          : isListening && listeningQuestionId === question.id
                          ? "Stop recording"
                          : "Start voice input"
                      }
                    >
                      {isListening && listeningQuestionId === question.id ? (
                        <SoundWave />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                    {!permissionGranted && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Mic access needed
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Speech not supported
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  handleAnswerSubmit(
                    question.id,
                    userAnswers[question.id] || ""
                  )
                }
                disabled={
                  !userAnswers[question.id]?.trim() ||
                  analyzingQuestionId === question.id ||
                  (isListening && listeningQuestionId === question.id) ||
                  isRetrying ||
                  isSaving
                }
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-[#1a1a1a] to-black hover:from-[#2a2a2a] hover:to-[#1a1a1a] border border-white/10 text-white"
              >
                {analyzingQuestionId === question.id ? (
                  <span className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </span>
                ) : isRetrying ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </span>
                ) : (
                  "Submit Answer"
                )}
              </Button>
              <Button
                onClick={() => handleGenerateAnswer(question.id)}
                disabled={
                  generatingQuestionId === question.id ||
                  (isListening && listeningQuestionId === question.id) ||
                  isRetrying
                }
                variant="outline"
                size="sm"
                className="bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
              >
                {generatingQuestionId === question.id ? (
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </span>
                ) : (
                  "Generate AI Answer"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (questions.length === 0) {
    return null;
  }

  if (hideFilters) {
    return (
      <div className="w-full space-y-6">{questions.map(renderQuestion)}</div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <QuestionFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        typeCounts={typeCounts}
        difficultyCounts={difficultyCounts}
        totalQuestions={questions.length}
        filteredCount={filteredQuestions.length}
      />
      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(renderQuestion)
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4 text-gray-700" />
            <h3 className="text-lg font-medium">No questions found</h3>
            <p className="mt-1 text-sm">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}