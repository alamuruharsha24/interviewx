import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export interface SessionProgress {
  totalQuestions: number;
  answeredQuestions: number;
  progressPercentage: number;
  lastUpdated: Date;
}

export interface QuestionData {
  id: string;
  question: string;
  type: "technical" | "behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  userAnswer?: string;
  suggestedAnswer?: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    improvedAnswer: string;
  };
}

// Update a specific question in a session
export async function updateQuestionInSession(
  sessionId: string,
  questionId: string,
  updates: Partial<QuestionData>
): Promise<void> {
  if (!sessionId || !questionId) {
    throw new Error("Session ID and Question ID are required");
  }

  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data();
    if (!sessionData.questions || !Array.isArray(sessionData.questions)) {
      throw new Error("Invalid session data structure");
    }

    const updatedQuestions = sessionData.questions.map((q: QuestionData) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    // Calculate progress
    const answeredCount = updatedQuestions.filter((q: QuestionData) => q.userAnswer?.trim()).length;
    const progress = Math.round((answeredCount / updatedQuestions.length) * 100);

    await updateDoc(sessionRef, {
      questions: updatedQuestions,
      progress,
      answeredCount,
      lastUpdated: serverTimestamp(),
    });

    console.log(`Successfully updated question ${questionId} in session ${sessionId}`);
  } catch (error) {
    console.error("Error updating question in session:", error);
    throw error;
  }
}

// Get session progress
export async function getSessionProgress(sessionId: string): Promise<SessionProgress | null> {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }

    const sessionData = sessionDoc.data();
    const questions = sessionData.questions || [];
    const answeredQuestions = questions.filter((q: QuestionData) => q.userAnswer).length;
    
    return {
      totalQuestions: questions.length,
      answeredQuestions,
      progressPercentage: Math.round((answeredQuestions / questions.length) * 100),
      lastUpdated: sessionData.lastUpdated?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting session progress:", error);
    return null;
  }
}

// Get all sessions for a user with progress
export async function getUserSessionsWithProgress(userId: string) {
  if (!userId) {
    console.error("User ID is required");
    return [];
  }

  try {
    const q = query(
      collection(db, "sessions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const sessions: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const questions = data.questions || [];
      const answeredCount = questions.filter((q: QuestionData) => q.userAnswer?.trim()).length;
      const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

      sessions.push({
        id: doc.id,
        ...data,
        progress,
        answeredCount,
        totalQuestions: questions.length,
      });
    });

    console.log(`Retrieved ${sessions.length} sessions for user ${userId}`);
    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return [];
  }
}

// Save user answer to Firebase
export async function saveUserAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<void> {
  if (!sessionId || !questionId) {
    throw new Error("Session ID and Question ID are required");
  }

  try {
    await updateQuestionInSession(sessionId, questionId, { 
      userAnswer: answer,
      answeredAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw error;
  }
}

// Save AI feedback to Firebase
export async function saveFeedback(
  sessionId: string,
  questionId: string,
  feedback: any
): Promise<void> {
  if (!sessionId || !questionId) {
    throw new Error("Session ID and Question ID are required");
  }

  try {
    await updateQuestionInSession(sessionId, questionId, { 
      feedback,
      analyzedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
}

// Save suggested answer to Firebase
export async function saveSuggestedAnswer(
  sessionId: string,
  questionId: string,
  suggestedAnswer: string
): Promise<void> {
  if (!sessionId || !questionId) {
    throw new Error("Session ID and Question ID are required");
  }

  try {
    await updateQuestionInSession(sessionId, questionId, { 
      suggestedAnswer,
      generatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving suggested answer:", error);
    throw error;
  }
}

// Get detailed session analytics
export async function getSessionAnalytics(sessionId: string) {
  if (!sessionId) {
    console.error("Session ID is required");
    return null;
  }

  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      console.error("Session not found:", sessionId);
      return null;
    }

    const sessionData = sessionDoc.data();
    const questions = sessionData.questions || [];
    
    const analytics = {
      totalQuestions: questions.length,
      answeredQuestions: questions.filter((q: QuestionData) => q.userAnswer?.trim()).length,
      questionsWithFeedback: questions.filter((q: QuestionData) => q.feedback).length,
      averageScore: 0,
      technicalQuestions: questions.filter((q: QuestionData) => q.type === "technical").length,
      behavioralQuestions: questions.filter((q: QuestionData) => q.type === "behavioral").length,
      easyQuestions: questions.filter((q: QuestionData) => q.difficulty === "Easy").length,
      mediumQuestions: questions.filter((q: QuestionData) => q.difficulty === "Medium").length,
      hardQuestions: questions.filter((q: QuestionData) => q.difficulty === "Hard").length,
      sessionId,
      userId: sessionData.userId,
      createdAt: sessionData.createdAt,
      lastUpdated: sessionData.lastUpdated,
    };

    // Calculate average score
    const questionsWithScores = questions.filter((q: QuestionData) => q.feedback?.score);
    if (questionsWithScores.length > 0) {
      const totalScore = questionsWithScores.reduce((sum: number, q: QuestionData) => 
        sum + (q.feedback?.score || 0), 0
      );
      analytics.averageScore = Math.round((totalScore / questionsWithScores.length) * 10) / 10;
    }

    return analytics;
  } catch (error) {
    console.error("Error getting session analytics:", error);
    return null;
  }
}
// Create a new session with proper structure
export async function createInterviewSession(
  userId: string,
  sessionData: {
    jobTitle: string;
    company: string;
    companyType: string;
    jobDescription?: string;
    requirements?: string;
    resume?: string;
    questions: any[];
    codingQuestions: any[];
  }
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const sessionDoc = {
      userId,
      ...sessionData,
      questionCount: sessionData.questions.length,
      codingCount: sessionData.codingQuestions.length,
      progress: 0,
      answeredCount: 0,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "sessions"), sessionDoc);
    console.log(`Created new session ${docRef.id} for user ${userId}`);
    return docRef;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

// Get a specific session by ID with user validation
export async function getSessionById(sessionId: string, userId: string) {
  if (!sessionId || !userId) {
    throw new Error("Session ID and User ID are required");
  }

  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data();
    
    // Verify user owns this session
    if (sessionData.userId !== userId) {
      throw new Error("Access denied - session belongs to different user");
    }

    return {
      id: sessionDoc.id,
      ...sessionData,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    throw error;
  }
}