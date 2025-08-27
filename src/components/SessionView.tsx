import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  Calendar,
  User,
  Code,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { generateAnswer, analyzeAnswer } from "@/lib/openRouter";
import { QuestionSection } from "./QuestionSection";
import { CodingSection } from "./CodingSection";
import { 
  updateQuestionInSession, 
  saveFeedback, 
  saveSuggestedAnswer,
  saveUserAnswer
} from "@/lib/firebase-utils";

interface SessionData {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  companyType: string;
  jobDescription?: string;
  requirements?: string;
  resume?: string;
  questions: any[];
  codingQuestions: any[];
  questionCount: number;
  codingCount: number;
  createdAt: any;
}

export function SessionView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string>("");
  const [analyzingQuestionId, setAnalyzingQuestionId] = useState<string>("");
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId || !currentUser) return;

      try {
        const sessionDoc = await getDoc(doc(db, "sessions", sessionId));

        if (!sessionDoc.exists()) {
          toast({
            title: "Session Not Found",
            description: "The requested session could not be found.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        const data = sessionDoc.data() as SessionData;

        if (data.userId !== currentUser.uid) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this session.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Add default difficulties if they don't exist
        const questionsWithDefaults = data.questions.map((question) => ({
          ...question,
          difficulty: question.difficulty || "medium",
        }));

        setSessionData({
          ...data,
          id: sessionDoc.id,
          questions: questionsWithDefaults,
        });
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load session. Please try again.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, currentUser, navigate, toast]);

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!answer.trim() || !sessionData) return;

    setIsAnalyzing(true);
    setAnalyzingQuestionId(questionId);
    try {
      const question = sessionData.questions.find((q) => q.id === questionId);
      if (!question) return;

      // Save user answer first with proper error handling
      await saveUserAnswer(sessionId!, questionId, answer);
      
      const feedback = await analyzeAnswer(
        question.question,
        answer,
        sessionData.jobTitle
      );

      // Save feedback to Firebase
      await saveFeedback(sessionId!, questionId, feedback);

      // Update local state
      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === questionId ? { ...q, userAnswer: answer, feedback } : q
              ),
            }
          : null
      );

      toast({
        title: "Answer Analyzed! ✅",
        description: `Score: ${feedback.score}/10. Check the detailed feedback below.`,
      });
    } catch (error) {
      console.error("Error analyzing answer:", error);
      toast({
        title: "Error",
        description: "Failed to analyze answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalyzingQuestionId("");
    }
  };

  const handleGenerateAnswer = async (questionId: string) => {
    if (!sessionData) return;

    setIsGenerating(true);
    setGeneratingQuestionId(questionId);
    try {
      const question = sessionData.questions.find((q) => q.id === questionId);
      if (!question) return;

      const suggestedAnswer = await generateAnswer(
        question.question,
        sessionData.jobTitle,
        sessionData.resume || "",
        question.type
      );

      // Save suggested answer to Firebase
      await saveSuggestedAnswer(sessionId!, questionId, suggestedAnswer);

      // Update local state
      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === questionId ? { ...q, suggestedAnswer } : q
              ),
            }
          : null
      );

      toast({
        title: "AI Answer Generated! 🤖",
        description: "Review the suggested answer and adapt it to your style.",
      });
    } catch (error) {
      console.error("Error generating answer:", error);
      toast({
        title: "Error",
        description: "Failed to generate answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGeneratingQuestionId("");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black overflow-x-hidden flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center justify-center gap-8 text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Updated logo with your image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
              alt="InterviewAce Logo"
              className="h-24 object-contain mx-auto"
            />
          </motion.div>

          <div className="space-y-3">
            <motion.h2
              className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Preparing Your Session
            </motion.h2>
            <motion.p
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Curating interview questions and analyzing your profile...
            </motion.p>
          </div>

          <motion.div
            className="w-full max-w-md mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Loading</span>
              <span>InterviewX</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "10%" }}
                animate={{
                  width: ["10%", "40%", "80%", "100%"],
                  background: [
                    "linear-gradient(to right, #3b82f6, #8b5cf6)",
                    "linear-gradient(to right, #8b5cf6, #ec4899)",
                    "linear-gradient(to right, #ec4899, #f97316)",
                    "linear-gradient(to right, #f97316, #3b82f6)",
                  ],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black overflow-x-hidden flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6 text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Updated logo with your image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
              alt="InterviewAce Logo"
              className="h-24 object-contain mx-auto"
            />
          </motion.div>

          <div className="p-4 bg-red-500/10 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Session Not Found</h2>
            <p className="text-gray-400">
              The requested interview session could not be located.
            </p>
          </div>

          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all">
              Return to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-lg py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {/* Updated logo with your image - added mobile logo */}
                <Link to="/" className="flex items-center gap-2">
                  {/* Mobile logo (hidden on desktop) */}
                  <div className="md:hidden">
                    <img
                      src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
                      alt="InterviewAce Logo"
                      className="h-14 object-contain"
                    />
                  </div>

                  {/* Desktop logo (hidden on mobile) */}
                  <div className="hidden md:block">
                    <img
                      src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                      alt="InterviewAce Logo"
                      className="h-10 object-contain"
                    />
                  </div>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-white/10 bg-gradient-to-r from-[#1a1a1a] to-black hover:from-[#2a2a2a] hover:to-[#1a1a1a] text-white rounded-lg px-4 py-2 text-sm flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Session Header */}
      <motion.div
        className="border-b border-white/10 bg-gradient-to-r from-[#1a1a1a] to-black backdrop-blur-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Job Title and Company Info */}
            <div>
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {sessionData.jobTitle}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-lg text-gray-300">
                    <Building className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">{sessionData.company}</span>
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                      {sessionData.companyType}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <span>Created: {formatDate(sessionData.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-400" />
                    <span>{currentUser?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards - Fixed grid layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {sessionData.questionCount}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Questions
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                      <Target className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {sessionData.codingCount}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Coding</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                      <Code className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {
                          sessionData.questions.filter((q) => q.userAnswer)
                            .length
                        }
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Answered
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                      <User className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {Math.round(
                          (sessionData.questions.filter((q) => q.userAnswer)
                            .length /
                            sessionData.questions.length) *
                            100
                        ) || 0}
                        %
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Done</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg">
                      <Target className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl overflow-x-hidden">
        <Tabs defaultValue="interview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a] border border-white/10">
            <TabsTrigger
              value="interview"
              className="flex items-center gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              Interview
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="flex items-center gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-400 text-xs sm:text-sm"
            >
              <Code className="h-3 w-3 sm:h-4 sm:w-4" />
              Coding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interview">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <QuestionSection
                questions={sessionData.questions}
                onAnswerSubmit={handleAnswerSubmit}
                onGenerateAnswer={handleGenerateAnswer}
                isGenerating={isGenerating}
                isAnalyzing={isAnalyzing}
                generatingQuestionId={generatingQuestionId}
                analyzingQuestionId={analyzingQuestionId}
                sessionId={sessionId}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="coding">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CodingSection
                questions={sessionData.codingQuestions}
                isLoading={false}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
