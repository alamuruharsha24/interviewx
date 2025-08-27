// OpenRouter API integration for DeepSeek R1
const API_KEYS = [
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
];


// Smart key rotation with randomization and load balancing
let keyUsageCount = new Array(API_KEYS.length).fill(0);
let lastUsedIndex = -1;

function getNextApiKey(): string {
  // Find the least used key, but avoid using the same key consecutively
  const minUsage = Math.min(...keyUsageCount);
  const availableKeys = keyUsageCount
    .map((count, index) => ({ index, count }))
    .filter((item) => item.count === minUsage && item.index !== lastUsedIndex);

  // If all keys have been used equally and we need to avoid the last used key
  if (availableKeys.length === 0) {
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    lastUsedIndex = randomIndex;
    keyUsageCount[randomIndex]++;
    return API_KEYS[randomIndex];
  }

  // Randomly select from the least used keys
  const selectedKey =
    availableKeys[Math.floor(Math.random() * availableKeys.length)];
  lastUsedIndex = selectedKey.index;
  keyUsageCount[selectedKey.index]++;

  return API_KEYS[selectedKey.index];
}

function determineCompanyType(company: string, jobDescription: string): string {
  const companyLower = company.toLowerCase();
  const descriptionLower = jobDescription.toLowerCase();

  // Product-based companies
  if (
    companyLower.includes("google") ||
    companyLower.includes("microsoft") ||
    companyLower.includes("apple") ||
    companyLower.includes("amazon") ||
    companyLower.includes("meta") ||
    companyLower.includes("facebook") ||
    companyLower.includes("netflix") ||
    companyLower.includes("uber") ||
    companyLower.includes("airbnb") ||
    descriptionLower.includes("product development") ||
    descriptionLower.includes("product team")
  ) {
    return "Product-based";
  }

  // Service-based companies
  if (
    companyLower.includes("tcs") ||
    companyLower.includes("infosys") ||
    companyLower.includes("wipro") ||
    companyLower.includes("accenture") ||
    companyLower.includes("cognizant") ||
    companyLower.includes("capgemini") ||
    descriptionLower.includes("client") ||
    descriptionLower.includes("consulting") ||
    descriptionLower.includes("outsourcing")
  ) {
    return "Service-based";
  }

  // Startup indicators
  if (
    descriptionLower.includes("startup") ||
    descriptionLower.includes("fast-paced") ||
    descriptionLower.includes("early stage") ||
    descriptionLower.includes("seed") ||
    descriptionLower.includes("series a") ||
    descriptionLower.includes("series b")
  ) {
    return "Startup";
  }

  // Default to product-based if uncertain
  return "Product-based";
}

function getCompanySpecificGuidelines(companyType: string): string {
  switch (companyType) {
    case "Product-based":
      return `- Focus on system design, scalability, and architecture questions
- Include questions about product thinking and user experience
- Emphasize coding best practices and clean code principles
- Ask about handling large-scale systems and performance optimization
- Include questions about innovation and problem-solving approaches
- Deep OOP + Design Patterns + System Design
- OOP: Advanced applications like designing systems (e.g., parking lot, movie booking), SOLID principles, IS-A vs HAS-A
- DSA: Medium-Hard levels like sliding window, dynamic programming, graphs, trees, hashing
- JD Alignment: High, with focus on stack internals, optimization, integration`;

    case "Service-based":
      return `- Focus on client communication and project management skills
- Include questions about working with diverse technologies and frameworks
- Emphasize adaptability and learning new technologies quickly
- Ask about handling multiple projects and time management
- Include questions about working in team environments and collaboration
- OOP: Theoretical + Simple coding, e.g., encapsulation, abstraction, method overloading/overriding, access modifiers
- DSA: Beginner-Medium like sorting, searching, linked lists, stacks/queues, string problems
- JD Alignment: Medium, with basics in languages/databases mentioned, aptitude/logical questions
- Include aptitude, puzzles, basic SQL if relevant`;

    case "Startup":
      return `- Focus on adaptability and wearing multiple hats
- Include questions about working in fast-paced, uncertain environments
- Emphasize ownership, initiative, and self-direction
- Ask about building from scratch and rapid prototyping
- Include questions about growth mindset and learning agility
- OOP: Applied in real-world coding, e.g., structuring classes for products, composition vs inheritance
- DSA: Easy-Medium like array/string manipulation, hashmaps, basic recursion, sorting/filtering
- JD Alignment: Very High, with practical features, debugging, quick implementation in their stack`;

    default:
      return `- Focus on relevant technical skills and problem-solving abilities
- Include questions about teamwork and communication
- Emphasize continuous learning and professional development
- Ask about handling challenges and deadlines`;
  }
}

export async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  retries = 3
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const apiKey = getNextApiKey();

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Interview Prep AI",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages,
            temperature: 0.3, // Slightly increased for more variety in responses
            max_tokens: 8000, // Optimized for faster response
            top_p: 0.7,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          // Retry on rate limit or server errors
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      const content = data.choices[0].message.content;

      // Simplified truncation detection - only check for obvious truncation
      const isLikelyTruncated =
        // Only check for completely broken JSON structure
        (content.includes("```json") && !content.includes("```")) ||
        // Check if content ends mid-word or mid-object
        (content.includes('"question":') && content.trim().endsWith(",")) ||
        // Check if array is started but never closed
        (content.trim().startsWith("[") &&
          !content.includes("]") &&
          content.length < 500);

      if (isLikelyTruncated) {
        console.warn("Response appears to be truncated, retrying...");
        throw new Error("Response was truncated");
      }

      return content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt === retries - 1) {
        throw new Error(
          `Failed to get response after ${retries} attempts: ${error}`
        );
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        1000 * Math.pow(2, attempt) + Math.random() * 1000,
        10000
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("All retry attempts failed");
}

export async function generateInterviewQuestions(
  jobTitle: string,
  company: string,
  jobDescription: string,
  requirements: string,
  resume: string
) {
  // Determine company type based on company name and description
  const companyType = determineCompanyType(company, jobDescription);

  const prompt = `Generate 85 unique interview questions tailored specifically for the role of ${jobTitle} at ${company} (${companyType}). Base the questions directly on the provided job description, key requirements (skills/technologies), and candidate's resume. Extract key skills, technologies, experiences, and responsibilities from the job description, requirements, and resume. Ensure questions cover these areas proportionally and are diverse. Avoid generic questions; make them relevant to the mentioned skills (e.g., if React and Node.js are in requirements/resume, include specific questions on React hooks, Node.js async patterns). Align with company type patterns, focusing on OOP concepts, DSA levels, and JD alignment as per guidelines. Do not repeat questions across different roles or generate the same set.

Job Details:
- Title: ${jobTitle}
- Company: ${company} (${companyType})
- Description: ${jobDescription || "Not provided"}
- Requirements/Key Skills: ${requirements || "Not provided"}
- Resume/Experience: ${resume || "Not provided"}

Return ONLY a JSON array with 85 questions:
- 60 technical questions (20 easy, 20 medium, 20 hard) – Categorize based on key skills (e.g., "React", "SQL", "DSA: Graphs") 
- 25 behavioral questions (8 easy, 9 medium, 8 hard) – Tie to resume experiences and job responsibilities

Format:
[
  {"question": "Question text", "type": "technical", "difficulty": "Easy", "category": "React"},
  {"question": "Question text", "type": "behavioral", "difficulty": "Medium", "category": "Leadership"}
]

Company focus for ${companyType}:
${getCompanySpecificGuidelines(companyType)}

Generate realistic, commonly-asked questions that directly align with the JD skills, resume experiences, OOP (core/advanced as per type), DSA (level as per type), and best practices. Prioritize questions that match patterns for the company type (e.g., system design for product-based, fundamentals for service-based, practical for startups). Ensure diversity and relevance to avoid repetition. Return only the JSON array, no other text.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert interviewer specializing in tailoring questions to specific job descriptions, key skills, and resumes. Generate unique, diverse questions based on provided details. Return only valid JSON arrays of interview questions. No explanations, no markdown formatting.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await callOpenRouter(messages);

  try {
    // Clean response - remove markdown formatting if present
    let cleanResponse = response.trim();

    // Remove markdown code blocks
    if (cleanResponse.includes("```")) {
      const match = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        cleanResponse = match[1].trim();
      }
    }

    // Try to parse the JSON
    const parsedData = JSON.parse(cleanResponse);

    // Validate it's an array
    if (!Array.isArray(parsedData)) {
      throw new Error("Response is not an array");
    }

    // Filter valid questions
    const validQuestions = parsedData.filter(
      (q) =>
        q &&
        typeof q === "object" &&
        q.question &&
        q.type &&
        q.difficulty &&
        q.category
    );

    if (validQuestions.length === 0) {
      throw new Error("No valid questions found in response");
    }

    console.log(`Generated ${validQuestions.length} valid questions`);
    return validQuestions;
  } catch (error) {
    console.error("JSON parsing failed:", error);
    console.error("Raw response length:", response.length);

    // Fallback: Try to extract partial JSON
    try {
      // Look for individual question objects
      const questionMatches = response.match(
        /{[^{}]*"question"[^{}]*"type"[^{}]*"difficulty"[^{}]*"category"[^{}]*}/g
      );

      if (questionMatches && questionMatches.length > 0) {
        const questions = questionMatches
          .map((match) => {
            try {
              return JSON.parse(match);
            } catch {
              return null;
            }
          })
          .filter((q) => q !== null);

        if (questions.length > 10) {
          // At least 10 questions to be useful
          console.warn(
            `Using ${questions.length} recovered questions from partial response`
          );
          return questions;
        }
      }
    } catch (recoveryError) {
      console.error("Recovery also failed:", recoveryError);
    }

    throw new Error("Failed to generate questions. Please try again.");
  }
}

export async function generateAnswer(
  question: string,
  jobTitle: string,
  resume: string,
  questionType: "technical" | "behavioral"
) {
  const isBehavioral = questionType === "behavioral";

  const prompt = `You are an expert interview coach. Generate a natural, concise, and memorable answer for this ${questionType} interview question. Make it flow like a human speaking, with short paragraphs. You can include 1-2 simple points in behavioral answers if it makes it easier to remember. For technical answers, include a properly formatted, short code snippet that can be used directly. Keep everything easy to recall and professional.

Question: ${question}
Job Title: ${jobTitle}
Candidate's Resume: ${resume}

${
  isBehavioral
    ? `
For behavioral questions, tell a brief story about a challenge or situation. Focus on what YOU did, the result, and any lesson learned. Keep it natural and conversational. Include simple points if needed but avoid long lists. Use metrics or impact statements if relevant. Example: "I noticed our deployment process was slow, so I automated tests and reduced errors, which cut release time by 20%. It taught me the value of proactive problem-solving."`
    : `
For technical questions, give a short definition or concept explanation. Provide a properly formatted code snippet that can be copy-pasted, like:

const person = {
  name: "Alice",
  greet: function() {
    console.log("Hello, my name is " + this.name);
  }
};
person.greet(); // Output: Hello, my name is Alice

Then mention key considerations, best practices, or trade-offs in a short paragraph. Keep it concise, clear, and easy to recall.`
}

Formatting rules:
- Natural, conversational paragraphs
- Short and concise
- Logical flow
- Confident, professional tone
- End with an impact or takeaway`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert interview coach generating concise, natural, professional answers. Include short code snippets for technical answers that are properly formatted and usable directly.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  return await callOpenRouter(messages);
}

export async function generateCodingQuestions(
  jobTitle: string,
  company: string,
  companyType: string
) {
  const prompt = `You are an expert coding interviewer who knows the most commonly asked coding questions. Generate 30 coding/DSA questions that are frequently asked in interviews for ${jobTitle} at ${companyType} companies like ${company}. Questions must be based on typical patterns for the company type, with focus on DSA levels, OOP integration where relevant, and best match to common problems.

Company Type Focus for ${companyType}:
${
  companyType === "Product-based"
    ? "- System design elements, scalability problems\n- Complex algorithms and optimization\n- Data structures for large-scale systems\n- Advanced problem-solving patterns\n- Medium-Hard DSA: sliding window, DP, graphs, trees, hashing\n- OOP mix: design patterns in problems"
    : companyType === "Service-based"
    ? "- Standard algorithms and data structures\n- Array, string, and tree problems\n- Basic dynamic programming\n- Practical coding scenarios\n- Easy-Medium DSA: sorting, searching, linked lists, stacks, queues\n- OOP basics in coding"
    : "- Fast problem-solving skills\n- Versatile coding abilities\n- Efficient algorithms\n- Real-world application problems\n- Easy-Medium DSA: arrays/strings, hashmaps, recursion, sorting\n- Applied OOP in practical scenarios"
}

For each question, provide:
1. title: The question title
2. difficulty: Easy/Medium/Hard (distribute evenly)
3. category: The main topic (Array, String, Tree, Graph, DP, etc.)
4. description: Brief description of the problem
5. platform: "leetcode" or "geeksforgeeks"
6. url: The actual URL to the problem (use real LeetCode/GFG URLs)
7. tags: Array of relevant tags

Return as JSON array with this format:
[
  {
    "title": "Two Sum",
    "difficulty": "Easy",
    "category": "Array",
    "description": "Find two numbers that add up to target",
    "platform": "leetcode",
    "url": "https://leetcode.com/problems/two-sum/",
    "tags": ["array", "hash-table"]
  }
]

Generate popular, frequently-asked questions that have high probability of appearing in actual interviews, matching the company type patterns.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert coding interviewer who generates realistic, frequently-asked coding questions. Always respond with valid JSON only.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await callOpenRouter(messages);

  try {
    let jsonString = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    // Try to parse the JSON
    const parsedData = JSON.parse(jsonString);

    // Ensure it's an array and has the expected structure
    if (!Array.isArray(parsedData)) {
      throw new Error("Response is not an array");
    }

    // Validate each question has required fields
    const validQuestions = parsedData.filter(
      (q) => q.title && q.difficulty && q.category && q.description
    );

    if (validQuestions.length === 0) {
      throw new Error("No valid coding questions found in response");
    }

    return validQuestions;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Raw response:", response);

    // Fallback: Try to extract a partial JSON array if truncated
    try {
      const partialMatch = response.match(/\[\s*{[\s\S]*?(?=\s*$)/);
      if (partialMatch) {
        const partialJson = partialMatch[0] + "]";
        const parsedPartial = JSON.parse(partialJson);
        if (Array.isArray(parsedPartial) && parsedPartial.length > 0) {
          console.warn(
            "Using partial coding questions response due to truncation"
          );
          return parsedPartial;
        }
      }
    } catch (partialError) {
      console.error("Partial extraction also failed:", partialError);
    }

    throw new Error("Failed to generate coding questions. Please try again.");
  }
}

export async function analyzeAnswer(
  question: string,
  userAnswer: string,
  jobTitle: string
) {
  const prompt = `You are an expert interviewer evaluating a candidate's answer. Analyze this interview response:

Question: ${question}
Job Title: ${jobTitle}
Candidate's Answer: ${userAnswer}

Provide a detailed analysis with:
1. Score (1-10 scale)
2. 2-4 specific strengths of the answer
3. 2-4 areas for improvement
4. An improved version of the answer that addresses the weaknesses

Return the response as JSON with this exact format:
{
  "score": 7,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "improvedAnswer": "The improved answer text here..."
}

Be constructive and specific in your feedback. Focus on:
- Clarity and structure
- Technical accuracy (if applicable)
- Use of examples
- Confidence and professionalism
- Completeness of the response

IMPORTANT: Ensure your JSON response is properly formatted with all strings properly terminated.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert interviewer who provides detailed, constructive feedback on interview answers. Always respond with valid JSON only. Ensure all strings are properly terminated and the JSON is valid.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const response = await callOpenRouter(messages);

    // Extract JSON from markdown code blocks if present
    let jsonString = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    // Sanitize the JSON string to fix common issues
    const sanitizedJson = sanitizeJsonString(jsonString);

    try {
      return JSON.parse(sanitizedJson);
    } catch (parseError) {
      console.error("JSON parsing failed after sanitization:", parseError);

      // Try to extract just the JSON object if there's extra text
      const jsonObjectMatch = sanitizedJson.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          return JSON.parse(jsonObjectMatch[0]);
        } catch (objectError) {
          console.error("Failed to parse extracted JSON object:", objectError);
        }
      }

      // If all else fails, try to manually construct a valid response
      try {
        // Extract score
        const scoreMatch = sanitizedJson.match(/"score":\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

        // Extract strengths
        const strengthsMatch = sanitizedJson.match(
          /"strengths":\s*\[([^\]]*)\]/
        );
        const strengths = strengthsMatch
          ? strengthsMatch[1]
              .split(",")
              .map((s) => s.replace(/"/g, "").trim())
              .filter((s) => s)
          : ["Good attempt", "Relevant experience"];

        // Extract improvements
        const improvementsMatch = sanitizedJson.match(
          /"improvements":\s*\[([^\]]*)\]/
        );
        const improvements = improvementsMatch
          ? improvementsMatch[1]
              .split(",")
              .map((s) => s.replace(/"/g, "").trim())
              .filter((s) => s)
          : ["Could be more structured", "Add more specific examples"];

        // Extract improved answer
        const improvedAnswerMatch = sanitizedJson.match(
          /"improvedAnswer":\s*"([^"]*)"/
        );
        const improvedAnswer = improvedAnswerMatch
          ? improvedAnswerMatch[1]
          : "The candidate could improve their answer by providing more specific examples and structuring their response more clearly.";

        return {
          score,
          strengths,
          improvements,
          improvedAnswer,
        };
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
        throw new Error(
          "Failed to analyze answer due to invalid response format. Please try again."
        );
      }
    }
  } catch (error) {
    console.error("Failed to get response from API:", error);
    throw new Error("Failed to analyze answer. Please try again.");
  }
}

// Enhanced JSON sanitization function
function sanitizeJsonString(str: string): string {
  if (!str || typeof str !== "string") return "{}";

  // Remove control characters
  let sanitized = str.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Try to fix unterminated strings by adding missing quotes
  const quoteCount = (sanitized.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // Add a closing quote at the end if there's an odd number of quotes
    sanitized += '"';
  }

  // Try to fix unescaped quotes within strings
  sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

  // Try to fix missing commas between array elements
  sanitized = sanitized.replace(/"\s*"\s*"/g, '","');

  // Try to fix missing commas between object properties
  sanitized = sanitized.replace(/"\s*}\s*{/g, "},{");

  // Try to fix trailing commas
  sanitized = sanitized.replace(/,\s*([}\]])/g, "$1");

  // Try to fix missing closing braces
  const openBraceCount = (sanitized.match(/{/g) || []).length;
  const closeBraceCount = (sanitized.match(/}/g) || []).length;
  if (openBraceCount > closeBraceCount) {
    sanitized += "}".repeat(openBraceCount - closeBraceCount);
  }

  // Try to fix missing closing brackets
  const openBracketCount = (sanitized.match(/\[/g) || []).length;
  const closeBracketCount = (sanitized.match(/\]/g) || []).length;
  if (openBracketCount > closeBracketCount) {
    sanitized += "]".repeat(openBracketCount - closeBracketCount);
  }

  return sanitized;
}
