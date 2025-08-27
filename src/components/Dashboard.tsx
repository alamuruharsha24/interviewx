import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Plus,
  Calendar,
  Building,
  User,
  LogOut,
  Play,
  Eye,
  Trash2,
  Menu,
  X,
  Star,
  Rocket,
  Lightbulb,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getUserSessionsWithProgress } from "@/lib/firebase-utils";
import { motion } from "framer-motion";

interface Session {
  id: string;
  jobTitle: string;
  company: string;
  companyType: string;
  createdAt: any;
  questionCount: number;
  codingCount: number;
  progress: number;
  answeredCount: number;
}

export function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const loadSessions = async () => {
      try {
        const userSessions = await getUserSessionsWithProgress(currentUser.uid);
        setSessions(userSessions);
      } catch (error) {
        console.error("Error loading sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load sessions. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();

    // Set up real-time listener for session updates
    const q = query(
      collection(db, "sessions"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async () => {
      // Reload sessions when there are changes
      const userSessions = await getUserSessionsWithProgress(currentUser.uid);
      setSessions(userSessions);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, "sessions", sessionId));
      toast({
        title: "Session Deleted",
        description: "Interview session has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black overflow-x-hidden flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="hidden md:block">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                alt="InterviewAce Logo"
                className="h-16 object-contain"
              />
            </div>
            <div className="md:hidden">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
                alt="InterviewAce Logo"
                className="h-14 object-contain"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-4 w-4" />
              <span className="max-w-[180px] truncate">
                {currentUser?.email}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/20 text-gray-300 whitespace-nowrap bg-red-500/10 hover:bg-red-600/20 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-white/10 pt-4 pb-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User className="h-4 w-4" />
                <span className="break-all">{currentUser?.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-white/20 text-gray-300 whitespace-nowrap bg-red-500/10 hover:bg-red-600/20 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">Champion!</span> 👋
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-3xl">
            Every interview is a step closer to your dream job. Let's ace it
            together!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Motivation and Start Section */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-blue-500/30 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 rounded-xl bg-blue-500/10 w-fit mb-4">
                    <Rocket className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-white px-2">
                    Start New Interview Prep
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm sm:text-base px-2">
                    Create a personalized session with AI-generated questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link to="/preparation-setup">
                    <Button
                      size="lg"
                      className="text-base sm:text-lg px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-600/50 hover:to-blue-800/50 border border-blue-500/30 text-white w-full group"
                    >
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Preparation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Tips Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-black border border-purple-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Lightbulb className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Pro Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">
                    Practice consistently - just 20 minutes daily improves
                    skills by 47%
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">
                    Review answers with our AI analyzer to identify improvement
                    areas
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">
                    Focus on your weak areas - targeted practice yields best
                    results
                  </p>
                </li>
              </ul>
            </motion.div>

            {/* Motivation Quote */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-black border border-green-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Today's Motivation
                </h3>
              </div>
              <p className="text-gray-300 italic mb-2">
                "Success is not the absence of failure; it's the persistence
                through failure."
              </p>
              <p className="text-gray-500 text-sm">- A.P.J. Abdul Kalam</p>
            </motion.div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                Your Interview Sessions
              </h2>
              <div className="text-sm text-gray-400">
                {sessions.length}{" "}
                {sessions.length === 1 ? "session" : "sessions"}
              </div>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                  >
                    <Card className="animate-pulse border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black">
                      <CardHeader className="p-4">
                        <div className="h-5 sm:h-6 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2 mt-2"></div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded"></div>
                          <div className="h-4 bg-white/10 rounded w-2/3"></div>
                          <div className="h-8 bg-white/10 rounded mt-2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center py-8 border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black">
                  <CardContent>
                    <div className="mx-auto p-3 rounded-xl bg-white/5 w-fit mb-4">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Ready for Your First Session?
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      Start your journey to interview mastery with a
                      personalized session
                    </p>
                    <Link to="/preparation-setup">
                      <Button className="bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-600/50 hover:to-blue-800/50 border border-blue-500/30 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Session
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg hover:border-blue-500/30 transition-all duration-300">
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg text-white line-clamp-2 break-words">
                              {session.jobTitle}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 text-gray-400 text-xs sm:text-sm truncate">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {session.company} • {session.companyType}
                              </span>
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          <div className="flex gap-2">
                            <div className="text-center p-2 rounded-lg bg-white/5 flex-1 min-w-[70px]">
                              <p className="font-semibold text-white">
                                {session.questionCount || 0}
                              </p>
                              <p className="text-xs text-gray-400">Questions</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5 flex-1 min-w-[70px]">
                              <p className="font-semibold text-white">
                                {session.codingCount || 0}
                              </p>
                              <p className="text-xs text-gray-400">Coding</p>
                            </div>
                          </div>

                          <div className="text-xs text-gray-400 flex items-center gap-1 sm:justify-end">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Link to={`/session/${session.id}`}>
                            <Button className="w-full bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-600/50 hover:to-blue-800/50 border border-blue-500/30 text-white text-sm py-3 group">
                              <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                              Continue Practice
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Animated Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="mt-16 text-center text-gray-500 text-sm py-6 border-t border-white/10"
      >
        <div className="container mx-auto px-4">
          <p className="mb-2">Crafted with passion by A Harsha Vardhan</p>
          <div className="flex justify-center gap-4">
            <span className="flex items-center gap-1">
              <Rocket className="h-4 w-4 text-blue-400" /> AI-Powered Interview
              Prep
            </span>
            <span className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-yellow-400" /> Personalized
              Feedback
            </span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
