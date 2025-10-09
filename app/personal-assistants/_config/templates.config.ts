import {
  Brain,
  Search,
  MessageSquare,
  Sparkles,
  Shield,
  FileText,
  Users,
  Zap,
  Scale,
  TrendingUp,
  Terminal,
  Edit2,
  User,
  GitBranch,
  CheckCircle,
  BarChart3,
  FolderKanban,
  ShoppingCart,
  BookOpen,
  Layers,
  Briefcase,
  LucideIcon,
  Shuffle,
} from "lucide-react";

export interface AgentTemplate {
  name: string;
  icon: LucideIcon;
}

export interface QuickStartAgent {
  role: string;
  name: string;
  type: string;
  tiers: string[];
}

export interface QuickStartTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  architecture: string;
  description: string;
  category: "pedagogical" | "business" | "educational";
  agents: QuickStartAgent[];
}

export const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  orchestrator: { name: "Orchestrator", icon: Brain },
  researcher: { name: "Research Specialist", icon: Search },
  analyst: { name: "Data Analyst", icon: MessageSquare },
  creative: { name: "Creative Thinker", icon: Sparkles },
  skeptic: { name: "Critical Reviewer", icon: Shield },
  writer: { name: "Content Creator", icon: FileText },
  facilitator: { name: "Facilitator", icon: Users },
  generalist: { name: "General Assistant", icon: Zap },
  debater: { name: "Debate Specialist", icon: Scale },
  manager: { name: "Team Manager", icon: Users },
  strategist: { name: "Strategic Planner", icon: TrendingUp },
  developer: { name: "Developer", icon: Terminal },
  critic: { name: "Editor/Critic", icon: Edit2 },
  specialist: { name: "Specialist", icon: User },
  collaborator: { name: "Collaborator", icon: Users },
  synthesizer: { name: "Synthesizer", icon: GitBranch },
  reviewer: { name: "Reviewer", icon: CheckCircle },
  meta_coordinator: { name: "Meta Coordinator", icon: Brain },
};

export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: "customer_support",
    name: "Customer Support",
    icon: MessageSquare,
    architecture: "supervisor",
    description: "Handle customer inquiries with specialized agents",
    category: "pedagogical",
    agents: [
      {
        role: "coordinator",
        name: "Support Coordinator",
        type: "orchestrator",
        tiers: [],
      },
      {
        role: "specialist",
        name: "Technical Expert",
        type: "analyst",
        tiers: ["tier_2"],
      },
      {
        role: "specialist",
        name: "Product Specialist",
        type: "researcher",
        tiers: ["tier_1"],
      },
      {
        role: "specialist",
        name: "Response Writer",
        type: "writer",
        tiers: ["tier_1"],
      },
    ],
  },
  {
    id: "decision_making",
    name: "Decision Analysis",
    icon: Scale,
    architecture: "debate",
    description: "Evaluate decisions from multiple perspectives",
    category: "pedagogical",
    agents: [
      {
        role: "moderator",
        name: "Decision Moderator",
        type: "facilitator",
        tiers: ["tier_3"],
      },
      {
        role: "advocate",
        name: "Pro Advocate",
        type: "debater",
        tiers: ["tier_3"],
      },
      {
        role: "advocate",
        name: "Con Advocate",
        type: "debater",
        tiers: ["tier_3"],
      },
      {
        role: "critic",
        name: "Risk Analyst",
        type: "skeptic",
        tiers: ["tier_3"],
      },
    ],
  },
  {
    id: "research_team",
    name: "Research Team",
    icon: Search,
    architecture: "network",
    description: "Collaborative research with peer agents",
    category: "pedagogical",
    agents: [
      {
        role: "peer",
        name: "Data Researcher",
        type: "researcher",
        tiers: ["tier_1"],
      },
      {
        role: "peer",
        name: "Market Analyst",
        type: "analyst",
        tiers: ["tier_2"],
      },
      {
        role: "peer",
        name: "Trend Spotter",
        type: "creative",
        tiers: ["tier_1"],
      },
      {
        role: "peer",
        name: "Fact Checker",
        type: "skeptic",
        tiers: ["tier_3"],
      },
    ],
  },
  {
    id: "project_management",
    name: "Project Management",
    icon: Briefcase,
    architecture: "hierarchical",
    description: "Multi-level project coordination and execution",
    category: "pedagogical",
    agents: [
      {
        role: "senior_supervisor",
        name: "Project Director",
        type: "strategist",
        tiers: ["tier_2"],
      },
      {
        role: "team_lead",
        name: "Development Lead",
        type: "manager",
        tiers: ["tier_2"],
      },
      {
        role: "team_lead",
        name: "QA Lead",
        type: "manager",
        tiers: ["tier_2"],
      },
      {
        role: "specialist",
        name: "Developer 1",
        type: "developer",
        tiers: ["tier_1"],
      },
      {
        role: "specialist",
        name: "Developer 2",
        type: "developer",
        tiers: ["tier_1"],
      },
      {
        role: "specialist",
        name: "QA Specialist 1",
        type: "analyst",
        tiers: ["tier_2"],
      },
      {
        role: "specialist",
        name: "QA Specialist 2",
        type: "analyst",
        tiers: ["tier_2"],
      },
    ],
  },
  {
    id: "adaptive_assistant",
    name: "Adaptive Assistant",
    icon: Shuffle,
    architecture: "adaptive",
    description: "Dynamic system that adjusts to task requirements",
    category: "pedagogical",
    agents: [
      {
        role: "orchestrator",
        name: "Meta Coordinator",
        type: "orchestrator",
        tiers: [],
      },
      {
        role: "flexible",
        name: "Flex Agent 1",
        type: "generalist",
        tiers: ["tier_1", "tier_2", "tier_3"],
      },
      {
        role: "flexible",
        name: "Flex Agent 2",
        type: "specialist",
        tiers: ["tier_1"],
      },
      {
        role: "flexible",
        name: "Flex Agent 3",
        type: "generalist",
        tiers: ["tier_1", "tier_2", "tier_3"],
      },
    ],
  },
  {
    id: "data_pipeline",
    name: "Data Analysis Pipeline",
    icon: BarChart3,
    architecture: "sequential",
    description: "Process and analyze business data in stages",
    category: "business",
    agents: [
      {
        role: "processor",
        name: "Data Collector",
        type: "researcher",
        tiers: ["tier_1"],
      },
      {
        role: "processor",
        name: "Data Validator",
        type: "analyst",
        tiers: ["tier_1"],
      },
      {
        role: "processor",
        name: "Data Analyzer",
        type: "analyst",
        tiers: ["tier_2"],
      },
      {
        role: "processor",
        name: "Insight Generator",
        type: "strategist",
        tiers: ["tier_3"],
      },
      {
        role: "processor",
        name: "Report Creator",
        type: "writer",
        tiers: ["tier_1"],
      },
    ],
  },
  {
    id: "project_coordination",
    name: "Project Coordination",
    icon: FolderKanban,
    architecture: "network",
    description: "Agile project management with collaborative teams",
    category: "business",
    agents: [
      {
        role: "peer",
        name: "Product Owner",
        type: "strategist",
        tiers: ["tier_2"],
      },
      {
        role: "peer",
        name: "Scrum Master",
        type: "facilitator",
        tiers: ["tier_2"],
      },
      {
        role: "peer",
        name: "Tech Lead",
        type: "developer",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "peer",
        name: "UX Designer",
        type: "creative",
        tiers: ["tier_1"],
      },
      {
        role: "peer",
        name: "QA Engineer",
        type: "reviewer",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "peer",
        name: "DevOps Engineer",
        type: "specialist",
        tiers: ["tier_1"],
      },
    ],
  },
  {
    id: "sales_automation",
    name: "Sales Process Automation",
    icon: ShoppingCart,
    architecture: "supervisor",
    description: "Automate and optimize sales workflows",
    category: "business",
    agents: [
      {
        role: "coordinator",
        name: "Sales Director",
        type: "orchestrator",
        tiers: [],
      },
      {
        role: "specialist",
        name: "Lead Qualifier",
        type: "analyst",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "specialist",
        name: "Sales Rep",
        type: "facilitator",
        tiers: ["tier_2"],
      },
      {
        role: "specialist",
        name: "Solution Engineer",
        type: "specialist",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "specialist",
        name: "Contract Specialist",
        type: "reviewer",
        tiers: ["tier_1"],
      },
      {
        role: "specialist",
        name: "Account Manager",
        type: "manager",
        tiers: ["tier_2"],
      },
    ],
  },
  {
    id: "course_management",
    name: "Adaptive Course Management",
    icon: BookOpen,
    architecture: "adaptive",
    description: "Complete course delivery with personalized learning paths",
    category: "educational",
    agents: [
      {
        role: "orchestrator",
        name: "Course Director",
        type: "meta_coordinator",
        tiers: [],
      },
      {
        role: "flexible",
        name: "Lead Instructor",
        type: "facilitator",
        tiers: ["tier_1", "tier_3"],
      },
      {
        role: "flexible",
        name: "Content Specialist",
        type: "researcher",
        tiers: ["tier_1"],
      },
      {
        role: "flexible",
        name: "Assessment Manager",
        type: "analyst",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "flexible",
        name: "Learning Coach",
        type: "manager",
        tiers: ["tier_2"],
      },
      {
        role: "flexible",
        name: "Peer Facilitator",
        type: "collaborator",
        tiers: ["tier_2", "tier_3"],
      },
      {
        role: "flexible",
        name: "Progress Analyst",
        type: "reviewer",
        tiers: ["tier_2"],
      },
    ],
  },
  {
    id: "course_modules",
    name: "Course Module Pipeline",
    icon: Layers,
    architecture: "sequential",
    description: "Step-by-step course progression with clear checkpoints",
    category: "educational",
    agents: [
      {
        role: "processor",
        name: "Prerequisite Checker",
        type: "analyst",
        tiers: ["tier_1"],
      },
      {
        role: "processor",
        name: "Content Deliverer",
        type: "writer",
        tiers: ["tier_1"],
      },
      {
        role: "processor",
        name: "Practice Designer",
        type: "creative",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "processor",
        name: "Knowledge Assessor",
        type: "reviewer",
        tiers: ["tier_2"],
      },
      {
        role: "processor",
        name: "Mastery Certifier",
        type: "specialist",
        tiers: ["tier_2", "tier_3"],
      },
    ],
  },
  {
    id: "study_group",
    name: "Interactive Study Group",
    icon: MessageSquare,
    architecture: "network",
    description: "TA-led peer discussion with diverse student perspectives",
    category: "educational",
    agents: [
      {
        role: "peer",
        name: "Teaching Assistant",
        type: "facilitator",
        tiers: ["tier_1", "tier_2", "tier_3"],
      },
      {
        role: "peer",
        name: "The Overachiever",
        type: "researcher",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "peer",
        name: "The Creative Thinker",
        type: "creative",
        tiers: ["tier_1", "tier_3"],
      },
      {
        role: "peer",
        name: "The Skeptic",
        type: "skeptic",
        tiers: ["tier_3"],
      },
    ],
  },
  {
    id: "school_advisor",
    name: "Comprehensive School Advisor",
    icon: Users,
    architecture: "supervisor",
    description: "Full-service academic advising with specialist support",
    category: "educational",
    agents: [
      {
        role: "coordinator",
        name: "Head Advisor",
        type: "orchestrator",
        tiers: [],
      },
      {
        role: "specialist",
        name: "Academic Planner",
        type: "strategist",
        tiers: ["tier_1", "tier_2"],
      },
      {
        role: "specialist",
        name: "Career & Applications",
        type: "facilitator",
        tiers: ["tier_2", "tier_3"],
      },
      {
        role: "specialist",
        name: "Administrative Support",
        type: "analyst",
        tiers: ["tier_1"],
      },
      {
        role: "specialist",
        name: "Wellness Coach",
        type: "manager",
        tiers: ["tier_2", "tier_3"],
      },
    ],
  },
];
