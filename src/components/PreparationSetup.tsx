import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  FileText,
  Upload,
  Sparkles,
  File,
  Check,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  generateInterviewQuestions,
  generateCodingQuestions,
} from "@/lib/openRouter";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createInterviewSession } from "@/lib/firebase-utils";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STEPS = [
  {
    title: "Job Details",
    description: "Tell us about the role you're applying for",
  },
  {
    title: "Company Info",
    description: "Share details about the company and requirements",
  },
  {
    title: "Resume Upload",
    description: "Upload your resume for personalized questions",
  },
];

// Types for generated content
type QuestionType = {
  id: string;
  question: string;
  type: string;
  category: string;
};

type CodingProblemType = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
};

type InterviewNewsType = {
  title: string;
  source: string;
  url: string;
};

// Improved text extraction from PDF with better formatting
const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error("Failed to read file"));
            return;
          }

          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let textContent = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();

            // Preserve paragraph structure
            let lastY = 0;
            for (const item of text.items) {
              // @ts-ignore - item has transform property
              const y = item.transform[5];
              if (Math.abs(y - lastY) > 10 && textContent) {
                textContent += "\n\n";
              }
              // @ts-ignore - item has str property
              textContent += item.str + " ";
              lastY = y;
            }
          }

          resolve(textContent);
        } catch (error) {
          console.error("Error extracting PDF text:", error);
          reject(new Error("Failed to extract text from PDF"));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
};

// More targeted redaction of personal information
const redactPersonalInfo = (text: string): string => {
  // Email addresses
  text = text.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "[EMAIL]");

  // Phone numbers
  text = text.replace(
    /(\+\d{1,3}\s?)?(\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
    "[PHONE]"
  );

  // LinkedIn profiles
  text = text.replace(
    /(linkedin\.com\/in\/|linkedin\.com\/pub\/)[\w-]+/gi,
    "[LINKEDIN]"
  );

  return text;
};

export function PreparationSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    companyType: "Product-based",
    jobDescription: "",
    requirements: "",
    resume: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [interviewNews, setInterviewNews] = useState<InterviewNewsType[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generated questions state
  const [generatedInterviewQuestions, setGeneratedInterviewQuestions] =
    useState<QuestionType[]>([]);
  const [generatedCodingProblems, setGeneratedCodingProblems] = useState<
    CodingProblemType[]
  >([]);

  // Fetch interview news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using NewsAPI (requires API key in production)
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=interview+preparation&apiKey=demo`
        );
        const data = await response.json();

        if (data.articles) {
          const filteredNews = data.articles
            .filter((article: any) => article.title && article.source.name)
            .slice(0, 3)
            .map((article: any) => ({
              title: article.title,
              source: article.source.name,
              url: article.url,
            }));

          setInterviewNews(filteredNews);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback news
        setInterviewNews([
          {
            title:
              "Google's New Interview Approach Focuses on Problem-Solving Skills",
            source: "TechCrunch",
            url: "https://example.com",
          },
          {
            title: "How to Ace Your Next Technical Interview: 2025 Guide",
            source: "Medium",
            url: "https://example.com",
          },
          {
            title: "The Rise of Behavioral Interviews in Tech Companies",
            source: "Forbes",
            url: "https://example.com",
          },
        ]);
      }
    };

    fetchNews();
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check if file is PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  // Process uploaded resume
  const handleFileUpload = async () => {
    if (!resumeFile) return;

    setIsUploading(true);

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(resumeFile);

      // Redact personal information
      const redactedText = redactPersonalInfo(extractedText);

      setFormData((prev) => ({ ...prev, resume: redactedText }));

      toast({
        title: "Resume Processed",
        description: "Personal information has been redacted for privacy",
      });
    } catch (error) {
      console.error("Error processing resume:", error);
      toast({
        title: "Processing Error",
        description:
          "Failed to extract text from resume. Please try another file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setElapsedTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    try {
      // Simulate initial processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoadingProgress(10);

      // Generate interview questions
      const questions = await generateInterviewQuestions(
        formData.jobTitle,
        formData.company,
        formData.jobDescription,
        formData.requirements,
        formData.resume
      );

      if (!Array.isArray(questions)) {
        throw new Error(
          "Failed to generate interview questions - invalid response format"
        );
      }

      setGeneratedInterviewQuestions(
        questions.map((q, index) => ({
          ...q,
          id: `question-${index}`,
        }))
      );

      setLoadingProgress(40);

      // Generate coding questions
      const codingQuestions = await generateCodingQuestions(
        formData.jobTitle,
        formData.company,
        formData.companyType
      );

      if (!Array.isArray(codingQuestions)) {
        throw new Error(
          "Failed to generate coding questions - invalid response format"
        );
      }

      setGeneratedCodingProblems(codingQuestions);
      setLoadingProgress(70);

      const sessionData = {
        jobTitle: formData.jobTitle,
        company: formData.company,
        companyType: formData.companyType,
        jobDescription: formData.jobDescription,
        requirements: formData.requirements,
        resume: formData.resume,
        questions: questions.map((q, index) => ({
          ...q,
          id: `question-${index}`,
        })),
        codingQuestions,
      };

      const docRef = await createInterviewSession(currentUser.uid, sessionData);
      setLoadingProgress(100);

      // Final delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Session Created! 🎉",
        description: `Generated ${questions.length} interview questions and ${codingQuestions.length} coding problems.`,
      });
      navigate(`/session/${docRef.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      setIsLoading(false);
      setLoadingProgress(0);

      // Clear timer on error
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Error",
        description: "Failed to create interview session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.jobTitle.trim() && formData.company.trim();
      case 1:
        return formData.companyType.trim();
      case 2:
        return true;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black overflow-x-hidden">
      {/* Simplified Navigation */}
      <div className="bg-black/80 backdrop-blur-lg py-3 px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            {/* Desktop Logo */}
            <div className="hidden md:block">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                alt="InterviewAce Logo"
                className="h-16 object-contain"
              />
            </div>

            {/* Mobile Logo */}
            <div className="md:hidden">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
                alt="InterviewAce Logo"
                className="h-14 object-contain"
              />
            </div>
          </div>

          {/* Back Arrow - Right Side */}
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Interview Preparation Setup
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Let's create a personalized interview session for your target role
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-gray-300 [&>div]:via-gray-100 [&>div]:to-white"
          />
        </div>

        {/* Form Card */}
        <Card className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-black backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {currentStep === 0 && <Building className="h-5 w-5" />}
              {currentStep === 1 && <FileText className="h-5 w-5" />}
              {currentStep === 2 && <Upload className="h-5 w-5" />}
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-white">
                    Job Title *
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer, Data Scientist"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white">
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Amazon"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-white/50"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-white">Company Type *</Label>
                  <RadioGroup
                    value={formData.companyType}
                    onValueChange={(value) =>
                      handleInputChange("companyType", value)
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Product-based"
                        id="product"
                        className="text-blue-400 border-white/20"
                      />
                      <Label htmlFor="product" className="text-white">
                        Product-based (Google, Meta, Apple)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Service-based"
                        id="service"
                        className="text-blue-400 border-white/20"
                      />
                      <Label htmlFor="service" className="text-white">
                        Service-based (TCS, Infosys, Accenture)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Startup"
                        id="startup"
                        className="text-blue-400 border-white/20"
                      />
                      <Label htmlFor="startup" className="text-white">
                        Startup
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-white">
                    Job Description (Optional)
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here for more targeted questions..."
                    value={formData.jobDescription}
                    onChange={(e) =>
                      handleInputChange("jobDescription", e.target.value)
                    }
                    className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-white">
                    Key Requirements (Optional)
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="List key skills and requirements mentioned in the job posting..."
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                    className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-white/50"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-white">
                      Upload Resume (PDF Only)
                    </Label>
                    <div
                      className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                      {resumeFile ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-10 w-10 text-green-500 mb-2" />
                          <p className="text-white font-medium">
                            {resumeFile.name}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <File className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-white font-medium">
                            Click to upload resume
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Supported format: PDF
                          </p>
                        </div>
                      )}
                    </div>
                    {resumeFile && !formData.resume && (
                      <div className="pt-2">
                        <Button
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isUploading ? (
                            <>
                              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Extract Resume Content"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {formData.resume && (
                    <div className="space-y-2">
                      <Label htmlFor="resumeContent" className="text-white">
                        Resume Content Preview
                      </Label>
                      <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {formData.resume}
                      </div>
                      <p className="text-xs text-gray-400">
                        Personal information is automatically redacted for
                        privacy
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation - Made buttons responsive */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !canProceed() ||
                    isLoading ||
                    (resumeFile && !formData.resume)
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 w-full sm:w-auto"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      <span className="truncate">Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="truncate">Create Interview Session</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 w-full sm:w-auto"
                >
                  <span className="truncate">Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simplified Loading Experience */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg transition-opacity duration-300">
            <div className="w-full max-w-md p-8 mx-4 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 rounded-xl shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-black rounded-full flex items-center justify-center border border-white/20">
                      <Sparkles className="h-10 w-10 text-purple-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  Preparing Your Interview Session
                </h3>
                <p className="text-gray-400">
                  Generating personalized content based on your details...
                </p>
              </div>

              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-white mb-2">
                  <span>Progress</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <Progress
                  value={loadingProgress}
                  className="h-2.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500"
                />
              </div>

              {/* Process Steps */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                      loadingProgress >= 10 ? "bg-green-500" : "bg-white/10"
                    }`}
                  >
                    {loadingProgress >= 10 ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs text-white/50">1</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Analyzing Input</h4>
                    <p className="text-xs text-gray-400">
                      Processing job details & resume
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                      loadingProgress >= 40 ? "bg-green-500" : "bg-white/10"
                    }`}
                  >
                    {loadingProgress >= 40 ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs text-white/50">2</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      Generating Questions
                    </h4>
                    <p className="text-xs text-gray-400">
                      Creating interview questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                      loadingProgress >= 70 ? "bg-green-500" : "bg-white/10"
                    }`}
                  >
                    {loadingProgress >= 70 ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs text-white/50">3</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      Coding Challenges
                    </h4>
                    <p className="text-xs text-gray-400">
                      Preparing technical problems
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                      loadingProgress >= 100 ? "bg-green-500" : "bg-white/10"
                    }`}
                  >
                    {loadingProgress >= 100 ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs text-white/50">4</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Finalizing</h4>
                    <p className="text-xs text-gray-400">
                      Preparing your session
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                This usually takes 3-4 minutes. Thanks for your patience!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
