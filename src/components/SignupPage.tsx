import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Phone, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate password strength
  useEffect(() => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
    };
    setPasswordValidations(validations);
    setShowPasswordValidation(password.length > 0);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasJoinedGroup) {
      toast({
        title: "Group Membership Required",
        description: "Please join our WhatsApp group before signing up.",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!Object.values(passwordValidations).every((v) => v)) {
      toast({
        title: "Weak Password",
        description: "Password must meet all requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      toast({
        title: "Account Created! 🎉",
        description: "Welcome to InterviewAce!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!hasJoinedGroup) {
      toast({
        title: "Group Membership Required",
        description: "Please join our WhatsApp group before signing up.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome! 🎉",
        description: "Account created successfully with Google.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google Sign Up Failed",
        description: error.message || "Failed to sign up with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinWhatsAppGroup = () => {
    window.open("https://chat.whatsapp.com/GFMgbjUV18O9gve7iYeXQI", "_blank");
    setHasJoinedGroup(true);
  };

  const ValidationItem = ({
    valid,
    text,
  }: {
    valid: boolean;
    text: string;
  }) => (
    <div
      className={`flex items-center gap-2 ${
        valid ? "text-green-500" : "text-gray-400"
      }`}
    >
      {valid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className="text-xs">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex justify-center">
            <img
              src="https://res.cloudinary.com/dtobij9ei/image/upload/v1754071544/ChatGPT_Image_Aug_1_2025_09_28_36_PM_1_xdmldz.png"
              alt="InterviewAce Logo"
              className="h-14 object-contain mx-auto"
            />
          </Link>
        </div>

        <Card className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 backdrop-blur-xl">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold text-white">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join our community of interview aspirants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasJoinedGroup ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">
                  To sign up, you must first join our WhatsApp group.
                </p>
                <Button
                  onClick={joinWhatsAppGroup}
                  className="w-full bg-green-500 hover:bg-green-600 text-white h-10"
                >
                  Join WhatsApp Group
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-gray-400">
                      EMAIL
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/30 border-white/10 text-white h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-gray-400">
                      PHONE
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-black/30 border-white/10 text-white h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs text-gray-400">
                      PASSWORD
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setShowPasswordValidation(true)}
                        onBlur={() =>
                          setShowPasswordValidation(password.length > 0)
                        }
                        className="pl-10 pr-10 bg-black/30 border-white/10 text-white h-10 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs text-gray-400"
                    >
                      CONFIRM PASSWORD
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-black/30 border-white/10 text-white h-10 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {showPasswordValidation && (
                  <div className="border border-white/10 rounded-lg p-3 bg-black/30 mt-2">
                    <div className="grid grid-cols-1 gap-1">
                      <ValidationItem
                        valid={passwordValidations.length}
                        text="At least 8 characters"
                      />
                      <ValidationItem
                        valid={passwordValidations.uppercase}
                        text="Uppercase letter"
                      />
                      <ValidationItem
                        valid={passwordValidations.lowercase}
                        text="Lowercase letter"
                      />
                      <ValidationItem
                        valid={passwordValidations.number}
                        text="Number"
                      />
                      <ValidationItem
                        valid={passwordValidations.special}
                        text="Special character"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-black hover:text-white h-10 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            {hasJoinedGroup && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1a1a1a] px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSignup}
                  variant="outline"
                  className="w-full bg-black/30 border-white/10 text-white h-10 hover:bg-white/10"
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <div className="text-center text-xs mt-6 pt-4 border-t border-white/10">
                  <span className="text-gray-500">
                    Already have an account?{" "}
                  </span>
                  <Link to="/login" className="text-blue-400 hover:underline">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
