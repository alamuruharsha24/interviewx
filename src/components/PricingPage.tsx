import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, CheckCircle, Smile, Rocket, ArrowLeft } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" } as const,
  },
};

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black text-white overflow-x-hidden">
      {/* Header with Back Button */}
      <div className="py-6 px-4 flex justify-between items-center">
        <div className="hidden md:block">
          <img
            src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
            alt="InterviewAce Logo"
            className="h-12 object-contain"
          />
        </div>
        <div className="md:hidden">
          <img
            src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
            alt="InterviewAce Logo"
            className="h-10 object-contain"
          />
        </div>

        <Link to="/">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/5 p-2 sm:px-4 sm:py-2"
            size="sm"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Back to Home</span>
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-[20rem] h-[20rem] bg-white/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <Badge className="bg-white/5 text-gray-300 border border-white/10 backdrop-blur-md mb-4 px-6 py-2 font-medium">
              Free Forever During Beta
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Interview Prep Made
              <br />
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Fun & Effective
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Master interviews with AI-powered challenges. No credit card
              needed!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-md mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 backdrop-blur-xl shadow-lg shadow-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white to-gray-300"></div>

              <CardHeader className="text-center pb-6 pt-10">
                <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 w-fit mb-4 border border-white/20">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Free Beta Access
                </CardTitle>
                <div className="pt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    $0
                  </span>
                  <span className="text-gray-300">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                <div className="space-y-3">
                  {[
                    "85+ AI-Generated Questions",
                    "30+ Coding Challenges",
                    "Instant Feedback & Analysis",
                    "Progress Tracking",
                    "Unlimited Practice Sessions",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/signup" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-[#1a1a1a] to-black hover:from-[#2a2a2a] hover:to-[#1a1a1a] px-6 py-5 font-medium border border-white/10 shadow-lg shadow-white/5 group">
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white">
                      Start Practicing Now
                    </span>
                    <Rocket className="ml-3 h-5 w-5 text-gray-300 group-hover:text-white group-hover:animate-bounce" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Fun Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Interview Prep Can Be
              <br />
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Actually Fun
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              We've transformed interview prep from stressful to enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-white mx-auto" />,
                title: "Game-Like Challenges",
                description: "Bite-sized exercises with instant feedback",
              },
              {
                icon: <Star className="h-8 w-8 text-white mx-auto" />,
                title: "Achievement Badges",
                description: "Unlock rewards as you master skills",
              },
              {
                icon: <Smile className="h-8 w-8 text-white mx-auto" />,
                title: "Stress-Free Practice",
                description: "No judgment, just improvement",
              },
              {
                icon: <Rocket className="h-8 w-8 text-white mx-auto" />,
                title: "Rapid Progress",
                description: "See your skills skyrocket in days",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 backdrop-blur-xl shadow-lg shadow-white/5 p-6 rounded-2xl"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial
      <section className="py-16 px-4 bg-gradient-to-r from-black/50 to-[#1a1a1a]/50">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-lg shadow-white/10"
          >
            <div className="text-5xl mb-4">"</div>
            <p className="text-xl italic text-gray-300 max-w-2xl mx-auto mb-6">
              I went from dreading interviews to actually enjoying the
              preparation process. Landed my dream job in 3 weeks!
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-300"></div>
              <div>
                <p className="font-semibold">Alex Morgan</p>
                <p className="text-sm text-gray-400">
                  Software Engineer @Google
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl text-center relative">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-white/10"
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {" "}
                Ace Your Interviews?
              </span>
            </h2>

            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
              Join thousands who turned interview stress into success
            </p>

            <Link to="/signup">
              <Button className="bg-gradient-to-r from-[#1a1a1a] to-black hover:from-[#2a2a2a] hover:to-[#1a1a1a] px-8 py-5 font-medium border border-white/10 shadow-lg shadow-white/5 group">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white">
                  Start Free Practice Now
                </span>
                <Rocket className="ml-3 h-5 w-5 text-gray-300 group-hover:text-white group-hover:animate-bounce" />
              </Button>
            </Link>

            <p className="text-gray-500 mt-6 text-sm">
              No credit card • No commitment • Just results
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex justify-center mb-4">
            <div className="hidden md:block">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
                alt="InterviewAce Logo"
                className="h-12 object-contain"
              />
            </div>
            <div className="md:hidden">
              <img
                src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754072127/ChatGPT_Image_Aug_1_2025_09_34_27_PM_1_gdl3vj.png"
                alt="InterviewAce Logo"
                className="h-10 object-contain"
              />
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Making interview preparation enjoyable and effective
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Created by A. Harsha Vardhan
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} InterviewAce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
