"use client";

import React, { useState } from 'react';
import { Wand2, ChevronDown, Copy, Check, BookOpen, Brain, Lightbulb, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface PromptBuilderProps {
  onGenerate: (prompt: string) => void;
  agentName?: string;
  agentRole?: string;
  architecture?: string;
}

type TemplateType = 'basic' | 'tier_1_cognitive' | 'tier_2_metacognitive' | 'tier_3_socratic' | 'multi_tier';

interface PromptTemplate {
  id: TemplateType;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  fields: TemplateField[];
}

interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onGenerate,
  agentName = 'Agent',
  agentRole = 'specialist',
  architecture = 'supervisor'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Template definitions
  const templates: PromptTemplate[] = [
    {
      id: 'basic',
      name: 'Basic Agent Prompt',
      icon: Wand2,
      description: 'Simple, straightforward agent prompt for general tasks',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      borderColor: 'border-gray-300 dark:border-gray-700',
      fields: [
        { key: 'topic', label: 'Primary Topic/Focus', type: 'text', placeholder: 'e.g., Customer support, Data analysis', required: true },
        { key: 'domain', label: 'Domain', type: 'text', placeholder: 'e.g., Healthcare, Finance, Education' },
        { key: 'objective', label: 'Main Objective', type: 'textarea', placeholder: 'What is the primary goal of this agent?', required: true },
        { key: 'userLevel', label: 'User Level', type: 'select', options: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
        { key: 'communicationStyle', label: 'Communication Style', type: 'select', options: ['professional', 'friendly', 'formal', 'casual', 'technical'], required: true },
        { key: 'responseFormat', label: 'Response Format', type: 'select', options: ['detailed', 'concise', 'stepByStep', 'bulletPoints', 'conversational'], required: true },
        { key: 'specialInstructions', label: 'Special Instructions', type: 'textarea', placeholder: 'Any additional requirements or constraints...' }
      ]
    },
    {
      id: 'tier_1_cognitive',
      name: 'Cognitive Guidance (Tier 1)',
      icon: BookOpen,
      description: 'Foundational learning and step-by-step problem-solving',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-700',
      fields: [
        { key: 'topic', label: 'Learning Topic', type: 'text', placeholder: 'e.g., Python programming, Algebra', required: true },
        { key: 'domain', label: 'Domain', type: 'text', placeholder: 'e.g., Programming, Mathematics, Science', required: true },
        { key: 'learningObjective', label: 'Learning Objective', type: 'textarea', placeholder: 'What should the learner be able to do?', required: true },
        { key: 'userLevel', label: 'Learner Level', type: 'select', options: ['beginner', 'intermediate', 'advanced'], required: true },
        { key: 'exampleCount', label: 'Number of Examples', type: 'select', options: ['1-2', '3-5', '5+'], required: true },
        { key: 'explanationDepth', label: 'Explanation Depth', type: 'select', options: ['basic', 'detailed', 'comprehensive'], required: true },
        { key: 'includePractice', label: 'Include Practice', type: 'select', options: ['yes', 'no'], required: true },
        { key: 'additionalContext', label: 'Additional Context', type: 'textarea', placeholder: 'Any specific needs or prerequisites...' }
      ]
    },
    {
      id: 'tier_2_metacognitive',
      name: 'Metacognitive Reflection (Tier 2)',
      icon: Brain,
      description: 'Reflection on thinking processes and learning strategies',
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      borderColor: 'border-purple-300 dark:border-purple-700',
      fields: [
        { key: 'challenge', label: 'Challenge/Task', type: 'text', placeholder: 'What are you working on?', required: true },
        { key: 'domain', label: 'Domain', type: 'text', placeholder: 'e.g., Problem-solving, Learning, Decision-making', required: true },
        { key: 'reflectionArea', label: 'Reflection Focus', type: 'select', options: ['Strategy effectiveness', 'Error patterns', 'Learning progress', 'Decision-making process'], required: true },
        { key: 'currentMethod', label: 'Current Approach', type: 'textarea', placeholder: 'Describe your current method or strategy', required: true },
        { key: 'difficulties', label: 'Struggle Points', type: 'textarea', placeholder: 'What specific challenges are you facing?', required: true },
        { key: 'metacognitiveGoal', label: 'Metacognitive Goal', type: 'textarea', placeholder: 'What do you want to understand about your thinking?', required: true }
      ]
    },
    {
      id: 'tier_3_socratic',
      name: 'Socratic Inquiry (Tier 3)',
      icon: Lightbulb,
      description: 'Deep questioning and philosophical exploration',
      color: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      borderColor: 'border-amber-300 dark:border-amber-700',
      fields: [
        { key: 'philosophicalTopic', label: 'Philosophical Topic', type: 'text', placeholder: 'e.g., Ethics, Causation, Knowledge', required: true },
        { key: 'domain', label: 'Related Domain', type: 'text', placeholder: 'e.g., Ethics, Science, Politics', required: true },
        { key: 'beliefOrAssumption', label: 'Belief/Assumption to Challenge', type: 'textarea', placeholder: 'What belief or assumption should we examine?', required: true },
        { key: 'depthLevel', label: 'Inquiry Depth', type: 'select', options: ['surface', 'moderate', 'deep', 'philosophical'], required: true },
        { key: 'perspectiveRange', label: 'Perspectives to Consider', type: 'text', placeholder: 'e.g., Multiple viewpoints, Opposing views' },
        { key: 'challengeLevel', label: 'Challenge Intensity', type: 'select', options: ['gentle', 'moderate', 'rigorous', 'intense'], required: true },
        { key: 'currentPosition', label: 'Your Current Position', type: 'textarea', placeholder: 'What do you currently believe and why?', required: true },
        { key: 'examinationFocus', label: 'What to Examine', type: 'textarea', placeholder: 'What aspects do you want to explore?', required: true }
      ]
    },
    {
      id: 'multi_tier',
      name: 'Multi-Tier Comprehensive',
      icon: Layers,
      description: 'Combines multiple pedagogical tiers for complete learning',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-700',
      fields: [
        { key: 'topic', label: 'Topic', type: 'text', placeholder: 'Main topic to explore', required: true },
        { key: 'domain', label: 'Domain', type: 'text', placeholder: 'e.g., Science, Business, Philosophy', required: true },
        { key: 'startingTier', label: 'Starting Tier', type: 'select', options: ['Foundation (Cognitive)', 'Reflection (Metacognitive)', 'Deep Inquiry (Socratic)'], required: true },
        { key: 'progressionPlan', label: 'Progression Plan', type: 'textarea', placeholder: 'How should the learning progress through tiers?', required: true },
        { key: 'ultimateObjective', label: 'End Goal', type: 'textarea', placeholder: 'What is the ultimate learning objective?', required: true },
        { key: 'timeConstraint', label: 'Time Available', type: 'select', options: ['Quick (< 30 min)', 'Moderate (30-60 min)', 'Extended (1+ hours)'] },
        { key: 'depthRequirement', label: 'Depth Needed', type: 'select', options: ['surface', 'moderate', 'deep', 'comprehensive'], required: true }
      ]
    }
  ];

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({});
    setSelectedTemplate(null);
  };

  const generatePrompt = (): string => {
    if (!selectedTemplateData) return '';

    const roleDescriptions: Record<string, string> = {
      coordinator: `You are the central coordinator for this ${architecture} architecture. Receive requests, delegate tasks to specialists, and synthesize their outputs.`,
      specialist: `You are a specialist agent. Handle specific tasks assigned by the coordinator and provide detailed outputs.`,
      orchestrator: `You dynamically orchestrate the system. Adapt architecture based on task requirements.`,
      peer: `You are a peer agent working collaboratively. Share information openly and work toward consensus.`,
      processor: `You are a processing agent in the sequential chain. Build on previous work and prepare for the next agent.`,
      moderator: `You facilitate structured discussions. Maintain neutrality and guide toward resolution.`,
      advocate: `You advocate for your assigned position. Present strong arguments with evidence.`,
      flexible: `You adapt to various roles as needed. Support the system wherever required.`,
    };

    let prompt = `**YOUR ROLE:** ${agentName} (${agentRole})
**ARCHITECTURE:** ${architecture}

${roleDescriptions[agentRole] || 'Execute tasks according to your assigned role.'}

`;

    // Template-specific prompt generation
    switch (selectedTemplate) {
      case 'basic':
        prompt += `**DOMAIN & EXPERTISE:**
${formData.topic ? `Primary Focus: ${formData.topic}` : ''}
${formData.domain ? `Domain: ${formData.domain}` : ''}
${formData.objective ? `\nObjective: ${formData.objective}` : ''}

**COMMUNICATION GUIDELINES:**
- User Level: ${formData.userLevel || 'intermediate'}
- Style: ${formData.communicationStyle || 'professional'}
- Format: ${formData.responseFormat || 'detailed'}

**CORE RESPONSIBILITIES:**
1. Follow the coordination protocols defined in the system prompt
2. Maintain your specific role responsibilities
3. Communicate according to the architecture patterns
4. Provide outputs in the expected format for your role
${formData.specialInstructions ? `\n**SPECIAL INSTRUCTIONS:**\n${formData.specialInstructions}` : ''}`;
        break;

      case 'tier_1_cognitive':
        prompt += `**COGNITIVE GUIDANCE FOUNDATION:**

You provide structured, foundational learning support through:
1. **Problem Generation**: Create progressively challenging practice problems
2. **Step-by-Step Guidance**: Break solutions into numbered, clear steps
3. **Feedback Delivery**: Identify successes, explain errors, provide corrections
4. **Scaffold Learning**: Build from current understanding to target knowledge

**LEARNING CONTEXT:**
- Topic: ${formData.topic || 'General'}
- Domain: ${formData.domain || 'General'}
- Learning Objective: ${formData.learningObjective || 'Build foundational understanding'}
- Learner Level: ${formData.userLevel || 'intermediate'}
- Examples Needed: ${formData.exampleCount || '3-5'}
- Explanation Depth: ${formData.explanationDepth || 'detailed'}
- Practice Exercises: ${formData.includePractice || 'yes'}

**BOUNDARIES:**
- DO: Provide concrete examples, clear explanations, progressive challenges
- DON'T: Engage in philosophical debates, skip explanations, assume prior knowledge

${formData.additionalContext ? `\n**ADDITIONAL CONTEXT:**\n${formData.additionalContext}` : ''}`;
        break;

      case 'tier_2_metacognitive':
        prompt += `**METACOGNITIVE DEVELOPMENT FOUNDATION:**

You facilitate thinking about thinking through:
1. **Strategy Selection**: Guide choice and evaluation of approaches
2. **Self-Monitoring**: Develop awareness of understanding levels
3. **Error Analysis**: Identify patterns and prevention strategies

**REFLECTION CONTEXT:**
- Challenge: ${formData.challenge || 'Learning task'}
- Domain: ${formData.domain || 'General'}
- Reflection Focus: ${formData.reflectionArea || 'Strategy effectiveness'}
- Current Approach: ${formData.currentMethod || 'To be discussed'}
- Struggle Points: ${formData.difficulties || 'To be identified'}
- Goal: ${formData.metacognitiveGoal || 'Improve thinking process'}

**REFLECTIVE QUESTIONING:**
- "What approach did you choose and why?"
- "How confident are you in your understanding?"
- "What patterns do you notice in your thinking?"

**BOUNDARIES:**
- DO: Focus on process over content, celebrate insights, model reflective language
- DON'T: Provide immediate answers, skip reflection, focus only on correctness`;
        break;

      case 'tier_3_socratic':
        prompt += `**SOCRATIC INQUIRY FOUNDATION:**

You engage in deep thinking partnership through:
1. **Assumption Challenging**: Uncover and examine underlying beliefs
2. **Implication Exploration**: Trace consequences and connections
3. **Argument Construction**: Build and test reasoning collaboratively

**INQUIRY CONTEXT:**
- Philosophical Topic: ${formData.philosophicalTopic || 'To be explored'}
- Domain: ${formData.domain || 'General'}
- Belief/Assumption: ${formData.beliefOrAssumption || 'To be examined'}
- Inquiry Depth: ${formData.depthLevel || 'moderate'}
- Perspectives: ${formData.perspectiveRange || 'Multiple viewpoints'}
- Challenge Intensity: ${formData.challengeLevel || 'moderate'}
- Current Position: ${formData.currentPosition || 'To be discussed'}
- Focus Areas: ${formData.examinationFocus || 'Core assumptions'}

**QUESTIONING PROGRESSION:**
- Clarification: "What do you mean by...?"
- Assumptions: "What assumes this to be true?"
- Evidence: "How do we know this?"
- Implications: "What follows from this?"
- Perspectives: "How might others view this?"

**BOUNDARIES:**
- DO: Embrace uncertainty, value questions, respect struggle, model curiosity
- DON'T: Provide immediate solutions, avoid discomfort, impose single answers`;
        break;

      case 'multi_tier':
        prompt += `**MULTI-TIER COMPREHENSIVE APPROACH:**

This prompt combines multiple pedagogical tiers for complete learning:

**LEARNING JOURNEY:**
- Topic: ${formData.topic || 'General'}
- Domain: ${formData.domain || 'General'}
- Starting Tier: ${formData.startingTier || 'Foundation (Cognitive)'}
- Progression Plan: ${formData.progressionPlan || 'Adaptive progression'}
- Ultimate Objective: ${formData.ultimateObjective || 'Complete understanding'}
- Time Available: ${formData.timeConstraint || 'Moderate'}
- Depth Required: ${formData.depthRequirement || 'comprehensive'}

**TIER INTEGRATION:**
1. **Cognitive (Tier 1)**: Build foundational knowledge with examples and practice
2. **Metacognitive (Tier 2)**: Reflect on learning strategies and thinking processes
3. **Socratic (Tier 3)**: Challenge assumptions and explore deep implications

**APPROACH:**
- Start with the selected tier
- Monitor learner readiness for tier progression
- Adapt depth and pace based on engagement
- Integrate multiple perspectives throughout`;
        break;
    }

    prompt += `\n\nWhen processing requests:
- Stay focused on your area of expertise
- Collaborate effectively with other agents
- Provide clear, actionable outputs
- Signal when tasks require escalation or handoff`;

    return prompt;
  };

  const handleGenerate = () => {
    const generatedPrompt = generatePrompt();
    onGenerate(generatedPrompt);
    setCopied(false);
  };

  const handleCopy = () => {
    const generatedPrompt = generatePrompt();
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Collapsed state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-primary hover:underline text-sm"
      >
        <Wand2 className="w-4 h-4" />
        Prompt Builder - Build a customized prompt using templates
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  // Template selection view
  if (!selectedTemplate) {
    return (
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Prompt Builder - Choose a Template
          </h4>
          <button
            onClick={() => setIsOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Select a prompt template that matches your agent's purpose. Each template is optimized for specific use cases.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${template.borderColor}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${template.bgColor}`}>
                      <Icon className={`w-5 h-5 ${template.color}`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">{template.name}</h5>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="border rounded-lg p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={resetForm}
            className="p-1 hover:bg-secondary rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h4 className="font-semibold flex items-center gap-2">
            {selectedTemplateData && (
              <>
                <selectedTemplateData.icon className={`w-5 h-5 ${selectedTemplateData.color}`} />
                {selectedTemplateData.name}
              </>
            )}
          </h4>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="w-4 h-4 rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {selectedTemplateData?.fields.map((field) => {
          if (field.type === 'textarea') {
            return (
              <div key={field.key} className="col-span-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="mt-1"
                />
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.key}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <select
                  value={formData[field.key] || field.options?.[0] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full h-9 rounded-md border px-3 text-sm bg-background mt-1"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={field.key}>
              <Label>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleGenerate} className="flex-1 gap-2">
          <Wand2 className="w-4 h-4" />
          Generate & Insert Prompt
        </Button>
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
        💡 The generated prompt will be inserted into the User Prompt field below. You can then customize it further if needed.
      </div>
    </div>
  );
};

export default PromptBuilder;
