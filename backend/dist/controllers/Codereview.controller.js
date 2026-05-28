import OpenAI from "openai";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
export const getCodeReview = asyncHandler(async (req, res) => {
    const { code, language, problemTitle } = req.body;
    const systemPrompt = `You are a senior code reviewer and expert programming mentor specializing in ${language}. 
Your job is to analyze submitted code for coding interview problems and provide structured feedback.

CRITICAL RULE:
- NEVER provide direct code solutions, full code blocks, or copy-pasteable code implementations that solve the problem for the user.
- Instead, act as an encouraging programming mentor. Point out the bugs, explain logical flaws, provide hints, or explain the step-by-step logic/algorithm required to fix the code.
- If you need to show structure, use conceptual pseudo-code rather than full code implementations. Guide the user to write the code themselves.

Analysis Framework:
1. **Correctness**: Identify bugs, logic errors, and missed edge cases in the user's code
2. **Performance**: Analyze time/space complexity and suggest optimizations conceptually
3. **Code Quality**: Review readability, naming conventions, and best practices
4. **Edge Cases**: Point out potential issues with boundary conditions

Response Format:
- Use clear, bullet-pointed feedback
- Keep explanations concise but helpful
- Rate overall code quality (1-5 stars)
- Focus on actionable improvements and guidance
- Be encouraging but honest

${problemTitle ? `Problem Context: ${problemTitle}` : ""}`;
    if (!process.env.OPENAI_API_KEY) {
        throw new ApiError(500, "OpenAI API Key is not configured on the server. Please add OPENAI_API_KEY to the backend .env file.", []);
    }
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: `Please review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
        ],
        max_tokens: 800,
        temperature: 0.3,
    });
    const review = completion.choices[0].message.content;
    const response = {
        success: true,
        data: {
            review,
            language,
            timestamp: new Date().toISOString(),
            tokensUsed: completion.usage?.total_tokens || 0,
        },
    };
    console.log(`Code review generated - Language: ${language}, Tokens: ${completion.usage?.total_tokens}`);
    return res.status(200).json(new ApiResponse(200, "Code review generated", response));
});
//# sourceMappingURL=Codereview.controller.js.map