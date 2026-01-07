import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Send, MessageSquare, Book, Users, Upload, Shield } from "lucide-react";

const HelpCenter = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.full_name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ ...formData, subject: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Failed to submit ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      category: "Getting Started",
      icon: Book,
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Sign Up' on the login page. If you're a student, enter your full name exactly as it appears in our college database. If you're a teacher, use the name registered with the admin.",
        },
        {
          q: "What roles are available on the platform?",
          a: "There are three roles: Students (can download and bookmark materials), Teachers (can upload study materials), and Admins (can manage users and approve content).",
        },
        {
          q: "I can't sign up as a student. What should I do?",
          a: "Your name must be in our college student database. If you believe your name should be there, please contact your administrator or submit a support ticket.",
        },
      ],
    },
    {
      category: "Uploading Materials",
      icon: Upload,
      questions: [
        {
          q: "How do I upload study materials?",
          a: "Teachers can upload materials from their dashboard. Go to the Teacher Dashboard, fill in the material details, select a subject, and upload your file.",
        },
        {
          q: "What file formats are supported?",
          a: "We support PDF, DOC, DOCX, PPT, PPTX, and image files. Maximum file size is 10MB.",
        },
        {
          q: "Why is my uploaded material not visible?",
          a: "All materials go through an admin review process. Once approved, your material will be visible to students. You'll receive an email notification about the status.",
        },
      ],
    },
    {
      category: "Using Materials",
      icon: Users,
      questions: [
        {
          q: "How do I download study materials?",
          a: "Navigate to the Materials page or a specific subject, find the material you need, and click the Download button. Downloads are tracked in your Student Dashboard.",
        },
        {
          q: "Can I bookmark materials for later?",
          a: "Yes! Click the bookmark icon on any material card. Access all your bookmarks from your Student Dashboard.",
        },
        {
          q: "How do I search for specific materials?",
          a: "Use the search bar on the Materials page. You can search by title, subject name, or author name.",
        },
      ],
    },
    {
      category: "Account & Security",
      icon: Shield,
      questions: [
        {
          q: "How do I reset my password?",
          a: "On the login page, click 'Forgot Password' and enter your email. You'll receive a link to reset your password.",
        },
        {
          q: "Can I change my display name?",
          a: "Contact an administrator to update your registered name as it needs to match our database records.",
        },
        {
          q: "How is my data protected?",
          a: "We use industry-standard encryption and follow best practices for data protection. Read our Privacy Policy for more details.",
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero">
              <HelpCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Help Center
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions or submit a support request
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* FAQs */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((category, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-6 shadow-card"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {category.category}
                      </h3>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIdx) => (
                        <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                          <AccordionTrigger className="text-left text-sm font-medium">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Form */}
            <div className="lg:sticky lg:top-8">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Still need help?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submit a support ticket and we'll get back to you
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What do you need help with?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero hover:opacity-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
