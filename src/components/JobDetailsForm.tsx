import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JobDetailsFormProps {
  onSubmit: (jobDetails: JobDetails) => void;
  isLoading: boolean;
}

export interface JobDetails {
  jobTitle: string;
  company: string;
  jobDescription: string;
  requirements: string;
  resume: string;
}

export function JobDetailsForm({ onSubmit, isLoading }: JobDetailsFormProps) {
  const [formData, setFormData] = useState<JobDetails>({
    jobTitle: "",
    company: "",
    jobDescription: "",
    requirements: "",
    resume: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof JobDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.jobTitle &&
    formData.company &&
    formData.jobDescription &&
    formData.resume;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-card backdrop-blur border-border/50 shadow-card">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Interview Preparation Setup
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Provide your job details and resume to generate personalized interview
          questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior React Developer"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g. Google, Microsoft"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the complete job description here..."
              value={formData.jobDescription}
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              className="min-h-32 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Key Requirements & Skills</Label>
            <Textarea
              id="requirements"
              placeholder="List key technical skills, experience requirements, etc..."
              value={formData.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              className="min-h-24 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Your Resume</Label>
            <Textarea
              id="resume"
              placeholder="Paste your resume content here..."
              value={formData.resume}
              onChange={(e) => handleChange("resume", e.target.value)}
              className="min-h-40 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <Button
            type="submit"
            variant="premium"
            size="lg"
            disabled={!isFormValid || isLoading}
            className="w-full"
          >
            {isLoading
              ? "Generating Questions..."
              : "Generate Interview Questions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
