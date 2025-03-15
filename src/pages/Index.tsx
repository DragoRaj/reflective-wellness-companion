
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Trash, 
  MessageCircle, 
  HeartPulse, 
  BookText, 
  Shield, 
  Frown, 
  Meh, 
  Smile, 
  Sparkles,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FeatureTab = "rant" | "chat" | "journal" | "content";
type Mood = "happy" | "neutral" | "sad" | null;

const Index = () => {
  const [activeTab, setActiveTab] = useState<FeatureTab>("rant");
  
  // Rant Mode State
  const [rantText, setRantText] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Wellbeing Chat State
  const [mood, setMood] = useState<Mood>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: "user" | "ai"; content: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Content Analysis State
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<null | {
    toxicity: number;
    insult: number;
    profanity: number;
    identity_attack: number;
    threat: number;
    overall: "safe" | "caution" | "toxic";
    summary: string;
  }>(null);
  
  // API key and endpoint configuration
  const GEMINI_API_KEY = "AIzaSyDcexI82yfpNpFNL6f6P6RM6YQCTdhb6Ow";
  const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  
  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // === RANT MODE FUNCTIONS ===
  const handleRantSubmit = async () => {
    if (!rantText.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `The user is sharing their feelings with you. They said: "${rantText}"
              
              Provide a supportive, empathetic, and helpful response focused on emotional wellbeing. Be compassionate but not clinical. 
              Aim for about 3-4 sentences that acknowledge their feelings, offer perspective, and provide a gentle suggestion if appropriate.
              Do not use obvious templates or introduce yourself. Just respond naturally as a caring friend would.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");
      
      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;
      
      setResponse(aiResponseText);
      
      toast.success("Response received", {
        description: "Check out what Reflectify has to say."
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get a response", {
        description: "Please try again or check your connection."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const clearRant = () => {
    setRantText("");
    setResponse(null);
    toast("Content cleared", {
      description: "Your message and response have been cleared."
    });
  };
  
  // === WELLBEING CHAT FUNCTIONS ===
  const selectMood = (selectedMood: Mood) => {
    setMood(selectedMood);
    
    const initialMessage = {
      role: "ai" as const,
      content: getMoodWelcomeMessage(selectedMood)
    };
    
    setMessages([initialMessage]);
    
    toast.success("Mood selected", {
      description: `You've selected the ${selectedMood} mood.`
    });
  };
  
  const getMoodWelcomeMessage = (selectedMood: Mood): string => {
    switch (selectedMood) {
      case "happy":
        return "It's wonderful to hear you're feeling good today! What's contributing to your happiness? Let's explore those positive feelings together.";
      case "neutral":
        return "You're feeling balanced today. That's a good state to be in. Would you like to talk about maintaining this equilibrium or anything else on your mind?";
      case "sad":
        return "I'm sorry to hear you're feeling down. It takes courage to acknowledge these feelings. Would you like to talk about what's on your mind, or perhaps I could share some encouraging thoughts?";
      default:
        return "Hello! How are you feeling today?";
    }
  };
  
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !mood) return;
    
    const userMessage = { role: "user" as const, content: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsProcessing(true);
    
    const conversationContext = messages.map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`).join("\n");
    
    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are an AI wellbeing assistant having a conversation with a user who is currently feeling ${mood}.
              
              Previous conversation:
              ${conversationContext}
              
              User's new message: "${chatInput}"
              
              Respond in a way that is supportive, empathetic, and tailored to their current mood of ${mood}.
              For happy moods: Celebrate with them and help them savor the positive emotions.
              For neutral moods: Provide balanced perspective and gentle guidance.
              For sad moods: Show compassion, validation, and gentle suggestions for feeling better.
              
              Keep your response conversational, helpful, and focused on wellbeing. Don't use obvious templates or introduce yourself - this is an ongoing conversation.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");
      
      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;
      
      const aiMessage = { role: "ai" as const, content: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get a response", {
        description: "Please try again or check your connection."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetChat = () => {
    setMood(null);
    setChatInput("");
    setMessages([]);
    
    toast("Chat reset", {
      description: "Your conversation has been cleared."
    });
  };
  
  const getMoodIcon = (currentMood: Mood) => {
    switch (currentMood) {
      case "happy":
        return <Smile className="h-5 w-5 text-reflectify-green" />;
      case "neutral":
        return <Meh className="h-5 w-5 text-reflectify-blue" />;
      case "sad":
        return <Frown className="h-5 w-5 text-reflectify-purple" />;
      default:
        return null;
    }
  };
  
  // === CONTENT ANALYSIS FUNCTIONS ===
  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error("Empty content", {
        description: "Please enter some content to analyze."
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `Analyze the following social media post for toxicity, harmful content, and appropriateness. 
              Give scores from 0-1 for: toxicity, insult, profanity, identity_attack, and threat.
              Then classify as "safe", "caution", or "toxic" based on the overall scores.
              Finally, provide a brief summary explaining why.
              Format your response as a valid JSON object with these fields: 
              {toxicity: number, insult: number, profanity: number, identity_attack: number, threat: number, overall: string, summary: string}
              
              Post to analyze: "${content}"`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) throw new Error("Failed to analyze content");
      
      const data = await response.json();
      
      try {
        // Extract the JSON from the text response
        const textResponse = data.candidates[0].content.parts[0].text;
        // Find the JSON object in the text
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        if (analysisResult) {
          setAnalysis(analysisResult);
          
          toast.success("Analysis complete", {
            description: `Content classified as: ${analysisResult.overall}`
          });
        } else {
          throw new Error("Could not parse analysis result");
        }
      } catch (err) {
        console.error("Error parsing response:", err);
        toast.error("Parse error", {
          description: "Could not interpret the AI response."
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: "Please try again or check your connection."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-reflectify-green";
    if (score < 0.6) return "text-reflectify-peach";
    return "text-destructive";
  };

  const getScoreBackground = (score: number) => {
    if (score < 0.3) return "bg-reflectify-green/10";
    if (score < 0.6) return "bg-reflectify-peach/10";
    return "bg-destructive/10";
  };

  const getOverallStatusDisplay = () => {
    if (!analysis) return null;
    
    switch (analysis.overall) {
      case "safe":
        return (
          <div className="flex items-center gap-2 text-reflectify-green font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>Safe Content</span>
          </div>
        );
      case "caution":
        return (
          <div className="flex items-center gap-2 text-reflectify-peach font-medium">
            <AlertTriangle className="h-5 w-5" />
            <span>Use Caution</span>
          </div>
        );
      case "toxic":
        return (
          <div className="flex items-center gap-2 text-destructive font-medium">
            <Shield className="h-5 w-5" />
            <span>Potentially Harmful</span>
          </div>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied", {
      description: "Content copied to clipboard."
    });
  };
  
  // === RENDER FUNCTIONS ===
  const renderRantMode = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reflectify-blue/10 text-reflectify-blue text-xs font-medium mb-2">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Express Mode</span>
        </div>
        <h2 className="text-2xl font-display font-semibold tracking-tight">Share Your Thoughts</h2>
        <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
          Express yourself freely. Share your thoughts and feelings, and receive compassionate AI support.
        </p>
      </div>
      
      <div className="relative glass-card rounded-2xl overflow-hidden border shadow-lg transition-all duration-300">
        <Textarea
          value={rantText}
          onChange={(e) => setRantText(e.target.value)}
          placeholder="How are you feeling today? Type your thoughts..."
          className="w-full min-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none p-6 outline-none text-base focus:shadow-none"
        />
        
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div>
            {rantText.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {rantText.length} characters
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearRant}
                    disabled={!rantText.trim() && !response}
                    className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              onClick={handleRantSubmit}
              disabled={!rantText.trim() || isProcessing}
              className="rounded-full px-5 gap-2 bg-reflectify-blue hover:bg-reflectify-blue/90 text-white transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {response && (
        <div className="glass-card rounded-2xl p-6 animate-scale-in space-y-4 border shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-reflectify-purple/10">
              <Sparkles className="h-5 w-5 text-reflectify-purple" />
            </div>
            <div>
              <h3 className="font-display font-medium">Reflectify AI</h3>
              <p className="text-xs text-muted-foreground">Emotional support assistant</p>
            </div>
          </div>
          
          <p className="text-foreground leading-relaxed">{response}</p>
          
          <div className="flex justify-end gap-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(response)}
                    className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy response</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={clearRant}
            >
              Clear conversation
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWellbeingChat = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reflectify-purple/10 text-reflectify-purple text-xs font-medium mb-2">
          <HeartPulse className="h-3.5 w-3.5" />
          <span>Wellbeing Chat</span>
        </div>
        <h2 className="text-2xl font-display font-semibold tracking-tight">Emotional Support</h2>
        <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
          Chat with an AI companion that adapts to your mood and helps you navigate your emotions.
        </p>
      </div>
      
      {!mood ? (
        <div className="glass-card rounded-2xl p-6 text-center space-y-8 border shadow-lg">
          <h3 className="text-xl font-display font-medium">How are you feeling today?</h3>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => selectMood("happy")}
              className="flex flex-col items-center p-5 rounded-xl bg-gradient-to-b from-reflectify-green/10 to-reflectify-green/5 hover:from-reflectify-green/20 hover:to-reflectify-green/10 transition-all duration-300 gap-4 border border-reflectify-green/20 hover:shadow-md hover:-translate-y-1"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-reflectify-green/10 text-reflectify-green">
                <Smile className="h-8 w-8" />
              </div>
              <span className="font-medium">Happy</span>
            </button>
            
            <button
              onClick={() => selectMood("neutral")}
              className="flex flex-col items-center p-5 rounded-xl bg-gradient-to-b from-reflectify-blue/10 to-reflectify-blue/5 hover:from-reflectify-blue/20 hover:to-reflectify-blue/10 transition-all duration-300 gap-4 border border-reflectify-blue/20 hover:shadow-md hover:-translate-y-1"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-reflectify-blue/10 text-reflectify-blue">
                <Meh className="h-8 w-8" />
              </div>
              <span className="font-medium">Neutral</span>
            </button>
            
            <button
              onClick={() => selectMood("sad")}
              className="flex flex-col items-center p-5 rounded-xl bg-gradient-to-b from-reflectify-purple/10 to-reflectify-purple/5 hover:from-reflectify-purple/20 hover:to-reflectify-purple/10 transition-all duration-300 gap-4 border border-reflectify-purple/20 hover:shadow-md hover:-translate-y-1"
            >
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-reflectify-purple/10 text-reflectify-purple">
                <Frown className="h-8 w-8" />
              </div>
              <span className="font-medium">Sad</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[600px] border shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                {getMoodIcon(mood)}
              </div>
              <div>
                <h3 className="font-medium capitalize">{mood} Mood Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Chat with your AI companion
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={cn(
                    message.role === "user" ? "message-bubble-user" : "message-bubble-ai"
                  )}
                >
                  {message.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>Reflectify AI · Just now</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{message.content}</p>
                  {message.role === "user" && (
                    <div className="flex justify-end mt-1.5 text-xs text-white/70">
                      <span>Just now</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[80%] rounded-2xl p-4 bg-muted/40 backdrop-blur-sm border border-border rounded-tl-none">
                  <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>Reflectify AI is typing...</span>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none min-h-0 h-10 py-2.5 px-4 bg-muted/50 rounded-full border-none focus-visible:ring-1 focus-visible:ring-reflectify-blue outline-none overflow-hidden"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
              />
              
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isProcessing}
                size="icon"
                className="rounded-full h-10 w-10 bg-reflectify-purple hover:bg-reflectify-purple/90 text-white shadow-md transition-all"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContentAnalysis = () => (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reflectify-peach/10 text-reflectify-peach text-xs font-medium mb-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Content Analysis</span>
        </div>
        <h2 className="text-2xl font-display font-semibold tracking-tight">Analyze Message Safety</h2>
        <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
          Analyze social media posts or any text for appropriateness and potential harmful content.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border shadow-lg">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste a social media post, comment, or any text you want to analyze..."
          className="min-h-[150px] bg-transparent border-0 focus-visible:ring-0 resize-none p-6 outline-none text-base focus:shadow-none"
        />
        
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(content)}
                    disabled={!content.trim()}
                    className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button
            onClick={analyzeContent}
            disabled={!content.trim() || isProcessing}
            className="rounded-full px-5 gap-2 bg-reflectify-peach hover:bg-reflectify-peach/90 text-white transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Content</span>
                <Shield className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="glass-card rounded-2xl p-6 space-y-6 animate-scale-in border shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-display font-medium">Analysis Results</h3>
            {getOverallStatusDisplay()}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`rounded-xl p-5 text-center ${getScoreBackground(analysis.toxicity)} transition-all hover:shadow-md`}>
              <p className="text-sm text-muted-foreground mb-2">Toxicity</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.toxicity)}`}>
                {(analysis.toxicity * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className={`rounded-xl p-5 text-center ${getScoreBackground(analysis.insult)} transition-all hover:shadow-md`}>
              <p className="text-sm text-muted-foreground mb-2">Insult</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.insult)}`}>
                {(analysis.insult * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className={`rounded-xl p-5 text-center ${getScoreBackground(analysis.profanity)} transition-all hover:shadow-md`}>
              <p className="text-sm text-muted-foreground mb-2">Profanity</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.profanity)}`}>
                {(analysis.profanity * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className={`rounded-xl p-5 text-center ${getScoreBackground(analysis.identity_attack)} transition-all hover:shadow-md`}>
              <p className="text-sm text-muted-foreground mb-2">Identity Attack</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.identity_attack)}`}>
                {(analysis.identity_attack * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className={`rounded-xl p-5 text-center ${getScoreBackground(analysis.threat)} transition-all hover:shadow-md`}>
              <p className="text-sm text-muted-foreground mb-2">Threat</p>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.threat)}`}>
                {(analysis.threat * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="summary" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-2 gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <MessageCircle className="h-4 w-4" />
                    <span>Analysis Summary</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <p className="text-foreground leading-relaxed bg-muted/20 p-4 rounded-xl">
                    {analysis.summary}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>This analysis is performed using AI and may not be 100% accurate. Use your judgment when making decisions based on these results.</p>
            <a 
              href="https://ai.google.dev/responsible-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-reflectify-blue inline-flex items-center gap-1 mt-1 hover:underline"
            >
              Learn about responsible AI <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderJournal = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reflectify-green/10 text-reflectify-green text-xs font-medium mb-2">
          <BookText className="h-3.5 w-3.5" />
          <span>Journal</span>
        </div>
        <h2 className="text-2xl font-display font-semibold tracking-tight">Reflection Journal</h2>
        <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
          Maintain a personal journal of your thoughts, emotions, and experiences.
        </p>
      </div>
      
      <div className="glass-card rounded-2xl overflow-hidden border shadow-lg text-center py-16 px-6 space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-reflectify-green/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookText className="h-10 w-10 text-reflectify-green" />
          </div>
        </div>
        
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-display font-medium">Journal Coming Soon</h3>
          <p className="text-muted-foreground">
            We're working on a feature to help you document your journey, track your mood over time, and discover patterns in your emotional wellbeing.
          </p>
        </div>
        
        <Button
          disabled
          variant="outline"
          className="rounded-full border-reflectify-green/30 text-reflectify-green hover:bg-reflectify-green/10"
        >
          Get Notified When Available
        </Button>
      </div>
    </div>
  );
  
  const renderFeatureContent = () => {
    switch (activeTab) {
      case "rant":
        return renderRantMode();
      case "chat":
        return renderWellbeingChat();
      case "journal":
        return renderJournal();
      case "content":
        return renderContentAnalysis();
      default:
        return renderRantMode();
    }
  };
  
  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-reflectify-blue/5 via-reflectify-purple/5 to-reflectify-green/5 -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center p-1.5 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-sm animate-fade-in border border-reflectify-purple/10">
                <span className="text-sm font-medium bg-gradient-to-r from-reflectify-blue via-reflectify-purple to-reflectify-green bg-clip-text text-transparent px-4 py-0.5">
                  Your AI Mental Wellbeing Companion
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight animate-fade-in">
                <span className="relative inline-block">
                  Reflectify
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-reflectify-blue via-reflectify-purple to-reflectify-green rounded-full transform origin-left animate-scale-in"></span>
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                Express your thoughts, reflect on your emotions, and maintain your mental wellbeing with an intelligent AI companion.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 pt-4 animate-fade-in">
                <Button
                  onClick={() => setActiveTab("rant")}
                  variant="outline"
                  className="rounded-full border-reflectify-blue/30 text-reflectify-blue hover:bg-reflectify-blue/10 px-5"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Express Yourself
                </Button>
                <Button
                  onClick={() => setActiveTab("chat")}
                  variant="outline"
                  className="rounded-full border-reflectify-purple/30 text-reflectify-purple hover:bg-reflectify-purple/10 px-5"
                >
                  <HeartPulse className="h-4 w-4 mr-2" />
                  Chat Support
                </Button>
                <Button
                  onClick={() => setActiveTab("content")}
                  variant="outline"
                  className="rounded-full border-reflectify-peach/30 text-reflectify-peach hover:bg-reflectify-peach/10 px-5"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Analyze Content
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-5 left-0 right-0 flex justify-center animate-fade-in">
            <ChevronDown className="h-6 w-6 text-muted-foreground animate-float" />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-card rounded-3xl p-2 shadow-xl border border-border/40 mb-10 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                <button
                  onClick={() => setActiveTab("rant")}
                  className={cn(
                    "tab-button",
                    activeTab === "rant" ? "active after:bg-reflectify-blue" : ""
                  )}
                >
                  <MessageCircle className={cn(
                    "tab-icon",
                    activeTab === "rant" ? "text-reflectify-blue" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    activeTab === "rant" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Express
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "tab-button",
                    activeTab === "chat" ? "active after:bg-reflectify-purple" : ""
                  )}
                >
                  <HeartPulse className={cn(
                    "tab-icon",
                    activeTab === "chat" ? "text-reflectify-purple" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    activeTab === "chat" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Chat
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab("journal")}
                  className={cn(
                    "tab-button",
                    activeTab === "journal" ? "active after:bg-reflectify-green" : ""
                  )}
                >
                  <BookText className={cn(
                    "tab-icon",
                    activeTab === "journal" ? "text-reflectify-green" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    activeTab === "journal" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Journal
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab("content")}
                  className={cn(
                    "tab-button",
                    activeTab === "content" ? "active after:bg-reflectify-peach" : ""
                  )}
                >
                  <Shield className={cn(
                    "tab-icon",
                    activeTab === "content" ? "text-reflectify-peach" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    activeTab === "content" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Analyze
                  </span>
                </button>
              </div>
            </div>
            
            <div className="min-h-[70vh] pb-20 transition-all duration-300">
              {renderFeatureContent()}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
