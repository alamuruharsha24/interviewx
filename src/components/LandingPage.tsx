import React, { useEffect, useState, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  ArrowRight,
  Crown,
  Code,
  Brain,
  Monitor,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Star,
  Zap,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Lightbulb,
  Cpu,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react";

// Optimized animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimized scroll handling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    setIsScrolled(scrolled);

    if (isMenuOpen && window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" &&
        target.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();
        const targetId = target.getAttribute("href")?.substring(1);
        const targetElement = document.getElementById(targetId || "");
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleSmoothScroll);
    return () => document.removeEventListener("click", handleSmoothScroll);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black text-white overflow-x-hidden">
      {/* Performance optimizations */}
      <style>
        {`
          /* Simplified animations for mobile performance */
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          .floating {
            animation: float 10s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 0.25; }
          }
          
          .pulse-blur {
            animation: pulse 2s ease-in-out infinite;
          }
          
          /* Prevent white flash on scroll */
          body {
            background-color: black;
            padding-top: env(safe-area-inset-top);
          }
          
          /* Optimize for Capacitor app */
          html, body, #root {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
          }
          
          /* Performance optimizations */
          .will-change-opacity {
            will-change: opacity;
          }

          /* Status bar styling */
          .status-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: env(safe-area-inset-top);
            background-color: #000000;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 100;
          }

          /* iOS specific styles */
          @supports (-webkit-touch-callout: none) {
            .status-bar {
              background-color: rgba(0, 0, 0, 0.8);
            }
            nav {
              -webkit-backdrop-filter: blur(20px);
            }
          }
          
          /* Hide scrollbar */
          ::-webkit-scrollbar {
            display: none;
            width: 0;
          }
          
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Button gradients */
          .btn-gradient-primary {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05);
          }
          
          .btn-gradient-secondary {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          
          .btn-gradient-secondary:hover {
            background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          }
          
          .text-gradient {
            background: linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Remove white rectangle on hover */
          .feature-card:hover .card-title {
            background: linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Enhanced hover effects */
          .hover-lift {
            transition: all 0.2s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-2px);
          }
        `}
      </style>

      {/* Fixed Status Bar */}
      <div className="status-bar"></div>

      {/* Enhanced Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? "bg-black/90 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
        style={{
          top: "env(safe-area-inset-top)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Logo Container */}
            <div className="flex items-center">
              {/* Desktop Logo */}
              <div className="hidden md:block">
                <img
                  src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                  alt="Interview X Logo"
                  className="h-14 object-contain"
                />
              </div>

              {/* Mobile Logo */}
              <div className="md:hidden">
                <img
                  src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
                  alt="Interview X Logo"
                  className="h-12 object-contain"
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-white/5 p-1"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-3 px-2"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-3 px-2"
              >
                How It Works
              </a>
              <Link to="/pricing">
                <span className="text-gray-300 hover:text-white transition-colors text-base font-medium py-3 px-2">
                  Pricing
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/5 py-3 px-4 text-base"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="btn-gradient-primary group px-6 py-3 hover-lift">
                  <span className="text-gradient group-hover:text-white text-base font-medium">
                    Get Started
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 text-gray-300 group-hover:text-white" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-lg">
            <div className="flex flex-col gap-1 p-2">
              <a
                href="#features"
                className="text-gray-300 hover:text-white hover:bg-white/5 py-4 px-4 text-base font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-white hover:bg-white/5 py-4 px-4 text-base font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <Link
                to="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/5 py-4 px-4 text-base font-medium rounded-lg transition-colors"
              >
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white hover:bg-white/5 py-4 text-base font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-gradient-primary w-full group py-4 hover-lift">
                    <span className="text-gradient group-hover:text-white text-base font-medium">
                      Get Started
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with optimized top padding */}
      <section
        className="pt-40 md:pt-60 pb-16 md:pb-24 px-4 relative min-h-screen flex items-center"
        style={{ paddingTop: "calc(4rem + env(safe-area-inset-top))" }}
      >
        <div className="absolute top-0 left-1/4 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-3xl -z-10 floating hidden md:block"></div>
        <div className="absolute top-0 right-1/4 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-3xl -z-10 floating hidden md:block"></div>

        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="bg-white/5 text-gray-300 border border-white/10 mb-4 px-4 py-1 text-sm">
                  Premium AI-Powered Interview Mastery
                </Badge>
              </motion.div>

              <motion.h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Master Your{" "}
                <span className="text-blue-400">Next Interview</span> with AI
                Precision
              </motion.h1>

              <motion.p
                className="text-gray-300 mb-6 leading-relaxed text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Our AI model generates{" "}
                <span className="text-blue-400">
                  85+ tailored questions (60 technical, 25 behavioral)
                </span>{" "}
                and <span className="text-blue-400">30+ coding challenges</span>{" "}
                based on your job title, description, company, and resume.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/signup">
                  <Button className="btn-gradient-secondary px-6 py-4 font-medium group text-base w-full sm:w-auto hover-lift">
                    <span className="text-gradient group-hover:text-white">
                      Start Premium Prep
                    </span>
                    <Crown className="ml-2 h-4 w-4 text-gray-300 group-hover:text-white" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="grid grid-cols-3 gap-3 mt-6 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { value: "85+", label: "Questions" },
                  { value: "30+", label: "Challenges" },
                  { value: "AI", label: "Tailored" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="text-lg font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="relative mt-8 lg:mt-0"
            >
              <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-400">
                      AI-Powered Interview Simulation
                    </div>
                    <div className="text-lg font-bold">Technical Screening</div>
                  </div>
                  <div className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                    AI Analysis
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Question</div>
                    <div className="text-sm">
                      How would you design a scalable web service for handling
                      millions of concurrent users?
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">
                      Your response
                    </div>
                    <div className="text-sm">
                      I would implement a microservices architecture with load
                      balancing, implement caching strategies using Redis, and
                      use a CDN for static assets...
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#1a1a1a] to-black border border-white/10 rounded-lg p-3">
                    <div className="text-white text-xs mb-1 flex items-center gap-1">
                      <Brain className="h-3 w-3" /> AI Feedback
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        Excellent architectural approach! Consider discussing
                        database sharding strategies and rate limiting
                        implementation for security.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-black/50 to-[#1a1a1a]/50 border-y border-white/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: "85+", label: "Questions" },
              { value: "60+", label: "Technical" },
              { value: "25+", label: "Behavioral" },
              { value: "30+", label: "Coding" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                variants={fadeInUp}
              >
                <div className="text-xl md:text-2xl font-bold mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-white/5 text-gray-300 border border-white/10 mb-3 px-3 py-1 text-sm">
                PREMIUM FEATURES
              </Badge>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Everything You Need to{" "}
              <span className="text-gradient">Excel</span> in Interviews
            </motion.h2>
            <motion.p
              className="text-gray-300 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              AI-powered interview preparation tailored to your specific role,
              company, and resume.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="h-6 w-6 text-white" />,
                title: "85+ Tailored Questions",
                description:
                  "60 technical and 25 behavioral questions customized for your role",
              },
              {
                icon: <Code className="h-6 w-6 text-white" />,
                title: "30+ Coding Challenges",
                description: "Company-specific problems with difficulty levels",
              },
              {
                icon: <Brain className="h-6 w-6 text-white" />,
                title: "AI-Powered Feedback",
                description: "Real-time analysis with detailed scoring",
              },
              {
                icon: <Cpu className="h-6 w-6 text-white" />,
                title: "Resume-Based Questions",
                description: "Questions generated based on your resume",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-white" />,
                title: "Job Description Analysis",
                description: "Custom questions from job descriptions",
              },
              {
                icon: <Shield className="h-6 w-6 text-white" />,
                title: "Company-Specific Prep",
                description: "Tailored for target company's interview style",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="will-change-opacity"
              >
                <Card className="bg-black/50 backdrop-blur-sm border border-white/10 group transition-all h-full overflow-hidden feature-card hover-lift">
                  <CardHeader className="pb-3">
                    <div className="bg-white/5 w-10 h-10 rounded-lg flex items-center justify-center mb-3 border border-white/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg text-gradient card-title transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-white/5 text-gray-300 border border-white/10 mb-3 px-3 py-1 text-sm">
                HOW IT WORKS
              </Badge>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              The <span className="text-gradient">Premium</span> Approach to
              Interview Success
            </motion.h2>
            <motion.p
              className="text-gray-300 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              How our AI platform transforms your interview preparation
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                  <Users className="h-5 w-5 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold">Traditional Preparation</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Generic questions that don't match your target role",
                  "No feedback on your responses",
                  "Time-consuming research",
                  "No progress tracking",
                  "Preparing without guidance",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-gray-300 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-full p-1 mt-1">
                      <ChevronLeft className="h-3 w-3 text-gray-400" />
                    </div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="mt-6 p-3 bg-black/30 border border-white/10 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    Result: Unprepared for real interviews
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-6 relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  Interview X AI Preparation
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  "85+ questions tailored to your role and company",
                  "Real-time AI feedback with detailed analysis",
                  "30+ coding challenges from top companies",
                  "Resume-based question generation",
                  "Difficulty level customization",
                  "Progress tracking and analytics",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-gray-300 text-sm"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-full p-1 mt-1">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="mt-6 p-3 bg-gradient-to-r from-[#1a1a1a] to-black border border-white/10 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    Result: Confident and prepared for success
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-white/5 text-gray-300 border border-white/10 mb-3 px-3 py-1 text-sm">
                SAMPLE QUESTIONS
              </Badge>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="text-gradient">Challenging</span> Questions
              You'll Master
            </motion.h2>
            <motion.p
              className="text-gray-300 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Our AI generates questions based on your specific role and
              experience level
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                category: "System Design",
                questions: [
                  "Design a URL shortening service like TinyURL",
                  "How would you architect a real-time collaborative editing tool like Google Docs?",
                  "Design a recommendation system for an e-commerce platform",
                ],
              },
              {
                category: "Technical Deep Dive",
                questions: [
                  "Explain the React Virtual DOM and its performance benefits",
                  "How does garbage collection work in JavaScript?",
                  "Compare microservices vs monolith architecture for a fintech application",
                ],
              },
              {
                category: "Behavioral",
                questions: [
                  "Tell me about a time you had to handle a difficult team conflict",
                  "Describe a project where you had to learn a new technology quickly",
                  "How do you prioritize tasks when working on multiple projects?",
                ],
              },
              {
                category: "Coding Challenges",
                questions: [
                  "Implement a rate limiter for an API",
                  "Design an LRU cache with O(1) operations",
                  "Write a function to detect cycles in a directed graph",
                ],
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-6 hover-lift"
              >
                <h3 className="text-xl font-bold mb-4 text-gradient">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.questions.map((question, qIndex) => (
                    <li
                      key={qIndex}
                      className="flex items-start gap-2 text-gray-300 text-sm"
                    >
                      <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-[#1a1a1a]/50"></div>

        <div className="container mx-auto max-w-3xl text-center relative">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="bg-white/5 text-gray-300 border border-white/10 mb-4 px-4 py-1 text-sm">
                PREMIUM INTERVIEW MASTERY
              </Badge>
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Ready to <span className="text-gradient">Master</span> Your Career
              Future?
            </motion.h2>

            <motion.p
              className="text-gray-300 max-w-xl mx-auto mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Our AI doesn't predict exact questions - it prepares you for{" "}
              <span className="text-blue-400 font-medium">ANY question</span> by
              enhancing your skills and knowledge.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link to="/signup">
                <Button className="btn-gradient-secondary px-6 py-4 font-medium group text-base w-full hover-lift">
                  <span className="text-gradient group-hover:text-white">
                    Begin Premium Preparation
                  </span>
                  <Crown className="ml-2 h-4 w-4 text-gray-300 group-hover:text-white" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="ghost"
                  className="px-5 py-4 font-medium text-gray-300 hover:text-white hover:bg-white/5 text-base w-full"
                >
                  View Pricing Plans
                </Button>
              </Link>
            </motion.div>

            <motion.p
              className="text-gray-500 mt-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              No credit card required • Premium tools • Cancel anytime
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="border-t border-white/10 bg-black pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div>
              <div className="mb-4 flex justify-center">
                <img
                  src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                  alt="Interview X Logo"
                  className="h-14 object-contain"
                />
              </div>
              <p className="text-gray-400 mb-4 text-sm text-center max-w-md mx-auto">
                Premium AI-powered interview preparation platform.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-base mb-3">Contact Us</h4>
              <a
                href="mailto:ask.interviewx@gmail.com"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ask.interviewx@gmail.com
              </a>
              <p className="text-gray-500 text-xs mt-3">
                Created by A. Harsha Vardhan
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs mb-3 md:mb-0">
              © 2025 INTERVIEW X. All rights reserved.
            </p>
            <div className="flex gap-4 text-gray-500 text-xs">
              <span className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
