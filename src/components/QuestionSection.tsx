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
  BarChart3,
  Plus,
  LogOut,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIFamaMJOk4UjWBPTMVXM5sXKJRCF9wJs",
  authDomain: "interview-preparation-ap-aa6d6.firebaseapp.com",
  projectId: "interview-preparation-ap-aa6d6",
  storageBucket: "interview-preparation-ap-aa6d6.appspot.com",
  messagingSenderId: "630863414235",
  appId: "1:630863414235:web:762536b6a1f99c6ba0ddfe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define interfaces
interface Question {
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

interface JobSession {
  id: string;
  title: string;
  company: string;
  role: string;
  createdAt: Date;
  progress: number;
  // Questions will be loaded separately from the subcollection
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
  storageKey?: string;
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

// Component for progress display
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}

// Component for job session selection
function JobSessionSelector({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateNewSession,
}: {
  sessions: JobSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
}) {
  return (
    <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white text-lg font-medium mb-3">Job Sessions</h3>
      <div className="flex flex-wrap gap-2">
        {sessions.map((session) => (
          <Button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            variant={currentSessionId === session.id ? "default" : "outline"}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentSessionId === session.id
                ? "bg-white text-black"
                : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
            }`}
          >
            {session.company} - {session.role}
            <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
              {session.progress}%
            </Badge>
          </Button>
        ))}
        <Button
          onClick={onCreateNewSession}
          variant="outline"
          className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
        >
          <Plus className="h-4 w-4 mr-1" /> New Session
        </Button>
      </div>
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
  storageKey = "interview-questions-data",
}: QuestionSectionProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [isListening, setIsListening] = useState(false);
  const [listeningQuestionId, setListeningQuestionId] = useState<string | null>(
    null
  );
  const [speechSupported, setSpeechSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [analysisErrors, setAnalysisErrors] = useState<{
    [key: string]: string;
  }>({});
  const [retryCounts, setRetryCounts] = useState<{ [key: string]: number }>({});
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef<string>("");
  const finalTranscriptRef = useRef<string>("");
  const isStoppingRef = useRef(false);

  // Initialize user answers from questions
  useEffect(() => {
    const initialAnswers: { [key: string]: string } = {};
    questions.forEach((q) => {
      if (q.userAnswer) {
        initialAnswers[q.id] = q.userAnswer;
      }
    });
    setUserAnswers(initialAnswers);
  }, [questions]);

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
    };
  }, [listeningQuestionId, userAnswers]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    try {
      // Clear any previous error for this question
      setAnalysisErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });

      await onAnswerSubmit(questionId, answer);

      // Reset retry count on success
      setRetryCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[questionId];
        return newCounts;
      });
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
    try {
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
              <div className="flex items-center gap-2 mt-2">
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
                  isRetrying
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

// Main Interview Dashboard Component
export default function InterviewDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jobSessions, setJobSessions] = useState<JobSession[]>([]);
  const [currentSession, setCurrentSession] = useState<JobSession | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingQuestionId, setGeneratingQuestionId] = useState<
    string | undefined
  >();
  const [analyzingQuestionId, setAnalyzingQuestionId] = useState<
    string | undefined
  >();

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSessions(user.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user's job sessions from Firestore
  const loadUserSessions = async (userId: string) => {
    try {
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      const q = query(sessionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const sessions: JobSession[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          title: data.title,
          company: data.company,
          role: data.role,
          createdAt: data.createdAt.toDate(),
          progress: data.progress || 0,
        });
      }

      setJobSessions(sessions);

      // Set the first session as current if none is selected
      if (sessions.length > 0 && !currentSession) {
        await selectSession(sessions[0].id);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading sessions:", error);
      setIsLoading(false);
    }
  };

  // Load questions for a specific session
  const loadSessionQuestions = async (sessionId: string) => {
    if (!currentUser) return [];

    try {
      const questionsRef = collection(
        db,
        `users/${currentUser.uid}/sessions/${sessionId}/questions`
      );
      const q = query(questionsRef, orderBy("id"));
      const querySnapshot = await getDocs(q);

      const questions: Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });

      return questions;
    } catch (error) {
      console.error("Error loading questions:", error);
      return [];
    }
  };

  // Select a session and load its questions
  const selectSession = async (sessionId: string) => {
    const session = jobSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      const questions = await loadSessionQuestions(sessionId);
      setCurrentQuestions(questions);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setJobSessions([]);
      setCurrentSession(null);
      setCurrentQuestions([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Create a new job session
  const createNewSession = async () => {
    if (!currentUser) return;

    try {
      // Default questions for a new session
      const defaultQuestions: Question[] = [
        {
          id: "1",
          question:
            "What is the difference between `==` and `.Equals()` in C#?",
          type: "technical",
          difficulty: "Easy",
          category: "C#",
        },
        {
          id: "2",
          question: "Explain the concept of inheritance in OOP.",
          type: "technical",
          difficulty: "Easy",
          category: "OOP",
        },
        {
          id: "3",
          question:
            "What is the time complexity of searching for an element in a sorted array using binary search?",
          type: "technical",
          difficulty: "Easy",
          category: "DSA",
        },
        {
          id: "4",
          question:
            "What is the difference between `throw` and `throw ex` in C# exception handling?",
          type: "technical",
          difficulty: "Easy",
          category: "C#",
        },
        {
          id: "5",
          question: "What is boxing and unboxing in C#?",
          type: "technical",
          difficulty: "Easy",
          category: "C#",
        },
      ];

      // Create session document
      const sessionRef = doc(
        collection(db, `users/${currentUser.uid}/sessions`)
      );
      const newSession: JobSession = {
        id: sessionRef.id,
        title: `Session ${jobSessions.length + 1}`,
        company: "New Company",
        role: "New Role",
        createdAt: new Date(),
        progress: 0,
      };

      await setDoc(sessionRef, {
        title: newSession.title,
        company: newSession.company,
        role: newSession.role,
        createdAt: serverTimestamp(),
        progress: newSession.progress,
      });

      // Add questions to the subcollection
      for (const question of defaultQuestions) {
        const questionRef = doc(
          collection(
            db,
            `users/${currentUser.uid}/sessions/${sessionRef.id}/questions`
          )
        );
        await setDoc(questionRef, {
          ...question,
          id: questionRef.id, // Use Firestore-generated ID
        });
      }

      // Update local state
      setJobSessions([newSession, ...jobSessions]);
      setCurrentSession(newSession);
      setCurrentQuestions(defaultQuestions);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Update a question in the current session
  const updateQuestion = async (
    questionId: string,
    updates: Partial<Question>
  ) => {
    if (!currentSession || !currentUser) return;

    try {
      // Update Firestore
      const questionRef = doc(
        db,
        `users/${currentUser.uid}/sessions/${currentSession.id}/questions/${questionId}`
      );
      await updateDoc(questionRef, updates);

      // Update local state
      setCurrentQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
      );

      // Calculate new progress
      const updatedQuestions = currentQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      const answeredCount = updatedQuestions.filter((q) => q.userAnswer).length;
      const newProgress = Math.round(
        (answeredCount / updatedQuestions.length) * 100
      );

      // Update session progress
      const sessionRef = doc(
        db,
        `users/${currentUser.uid}/sessions`,
        currentSession.id
      );
      await updateDoc(sessionRef, {
        progress: newProgress,
      });

      // Update jobSessions array with the updated progress
      setJobSessions(
        jobSessions.map((session) =>
          session.id === currentSession.id
            ? { ...session, progress: newProgress }
            : session
        )
      );
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!currentSession) return;

    setIsAnalyzing(true);
    setAnalyzingQuestionId(questionId);

    // Simulate analysis (in a real app, this would be an API call)
    setTimeout(async () => {
      const feedback = {
        score: Math.floor(Math.random() * 5) + 6, // Random score between 6-10
        strengths: ["Good structure", "Relevant examples"],
        improvements: ["Could provide more details", "Add code examples"],
        improvedAnswer:
          "This is an improved answer suggestion based on your response.",
      };

      await updateQuestion(questionId, { userAnswer: answer, feedback });

      setIsAnalyzing(false);
      setAnalyzingQuestionId(undefined);
    }, 1500);
  };

  // Handle AI answer generation
  const handleGenerateAnswer = async (questionId: string) => {
    if (!currentSession) return;

    setIsGenerating(true);
    setGeneratingQuestionId(questionId);

    // Simulate AI generation (in a real app, this would be an API call)
    setTimeout(async () => {
      const suggestedAnswer =
        "This is a sample AI-generated answer that demonstrates how to respond to this interview question effectively. It includes relevant details and examples.";

      await updateQuestion(questionId, { suggestedAnswer });

      setIsGenerating(false);
      setGeneratingQuestionId(undefined);
    }, 2000);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Render when no user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-center">
              Interview Preparation Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-center">
              Sign in to access your interview preparation sessions
            </p>
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render when no sessions exist
  if (jobSessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Interview Preparation Dashboard
            </h1>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-white/20 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>

          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No interview sessions yet
            </h3>
            <p className="text-gray-400 mb-4">
              Create your first job interview session to get started
            </p>
            <Button
              onClick={createNewSession}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render main dashboard with current session
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Interview Preparation Dashboard
          </h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-white/20 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        <JobSessionSelector
          sessions={jobSessions}
          currentSessionId={currentSession?.id || null}
          onSelectSession={selectSession}
          onCreateNewSession={createNewSession}
        />

        {currentSession && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                {currentSession.company} - {currentSession.role}
              </h2>
              <ProgressBar progress={currentSession.progress} />
            </div>

            <QuestionSection
              questions={currentQuestions}
              onAnswerSubmit={handleAnswerSubmit}
              onGenerateAnswer={handleGenerateAnswer}
              isGenerating={isGenerating}
              isAnalyzing={isAnalyzing}
              generatingQuestionId={generatingQuestionId}
              analyzingQuestionId={analyzingQuestionId}
              storageKey={`session-${currentSession.id}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
