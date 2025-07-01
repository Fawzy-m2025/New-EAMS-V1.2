
import { Message } from "@/types/chat";

// Financial data references for the AI to use
const financialMetrics = {
  revenue: {
    total: "$2,456,800",
    growth: "12% increase year-over-year",
    breakdown: "65% from Pump Stations, 35% from Maintenance Services"
  },
  expenses: {
    total: "$1,256,300",
    breakdown: {
      labor: "25.5% - $320,500",
      carRent: "19.9% - $250,000",
      rawMaterials: "14.3% - $180,300",
      equipment: "33.4% - $420,000",
      utilities: "6.8% - $85,000"
    }
  },
  netIncome: {
    total: "$1,200,500",
    margin: "48.9% of revenue"
  },
  trends: [
    "Expenses increased by 8% compared to last quarter",
    "Revenue growth is outpacing expense growth",
    "Equipment costs constitute the largest expense category"
  ]
};

// Context tracking for better conversation flow
const trackTopics = (message: string): string[] => {
  const topics = [];
  const topicKeywords = {
    revenue: ["revenue", "income", "earnings", "sales", "money coming in"],
    expenses: ["expenses", "costs", "spending", "expenditures"],
    profit: ["profit", "margin", "net income", "earnings", "bottom line"],
    trends: ["trend", "pattern", "over time", "historical", "forecast", "prediction"],
    breakdown: ["breakdown", "distribution", "allocation", "split", "divide"]
  };
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      topics.push(topic);
    }
  });
  
  return topics;
};

// Generate AI response based on user message and conversation context
export const generateResponse = (message: string, previousMessages: Message[]): Message => {
  const messageTopics = trackTopics(message);
  let responseContent = "";
  
  // Handle greetings
  if (message.toLowerCase().match(/hi|hello|hey|greetings/)) {
    responseContent = "Hello! I'm your financial insights assistant. How can I help you analyze your financial data today?";
  } 
  // Handle general questions about data
  else if (message.toLowerCase().includes("summary") || message.toLowerCase().includes("overview")) {
    responseContent = `Here's a financial summary:\n• Total Revenue: ${financialMetrics.revenue.total} (${financialMetrics.revenue.growth})\n• Total Expenses: ${financialMetrics.expenses.total}\n• Net Income: ${financialMetrics.netIncome.total} (${financialMetrics.netIncome.margin})`;
  }
  // Handle revenue questions
  else if (messageTopics.includes("revenue")) {
    responseContent = `Based on current data, revenue stands at ${financialMetrics.revenue.total} with ${financialMetrics.revenue.growth}. The breakdown shows ${financialMetrics.revenue.breakdown}.`;
  }
  // Handle expense questions
  else if (messageTopics.includes("expenses")) {
    const { total, breakdown } = financialMetrics.expenses;
    responseContent = `Current expenses are ${total}. The main categories are:\n• Labor: ${breakdown.labor}\n• Car Rent: ${breakdown.carRent}\n• Raw Materials: ${breakdown.rawMaterials}\n• Equipment: ${breakdown.equipment}\n• Utilities: ${breakdown.utilities}`;
  }
  // Handle profit/margin questions
  else if (messageTopics.includes("profit")) {
    responseContent = `The current net income is ${financialMetrics.netIncome.total}, which represents ${financialMetrics.netIncome.margin}.`;
  }
  // Handle trend analysis
  else if (messageTopics.includes("trends")) {
    responseContent = "Based on the financial data, I've identified these key trends:\n" + 
      financialMetrics.trends.map(trend => `• ${trend}`).join("\n");
  }
  // Default response with context awareness
  else {
    // Check previous conversation for context
    const recentTopics = previousMessages
      .slice(-3)
      .flatMap(msg => trackTopics(msg.content));
    
    if (recentTopics.includes("revenue") || recentTopics.includes("expenses")) {
      responseContent = `I notice we were discussing financial metrics. Would you like me to provide more detailed analysis on revenue trends or expense breakdowns?`;
    } else {
      responseContent = `I'm here to help analyze your financial data. You can ask about revenue, expenses, profit margins, or trends. What specific information would you like to know?`;
    }
  }
  
  return {
    id: crypto.randomUUID(),
    content: responseContent,
    role: 'assistant',
    timestamp: new Date()
  };
};

// Format message content with formatting for better readability
export const formatMessageContent = (content: string): string => {
  // Replace newlines with HTML line breaks
  return content.replace(/\n/g, '<br/>');
};
