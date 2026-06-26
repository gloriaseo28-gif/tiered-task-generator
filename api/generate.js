// api/generate.js
// Vercel serverless function — runs on the server, never in the browser.
// This is what keeps the Anthropic API key secure.

module.exports = async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lessonObjective, yearLevel, subject, classProfile } = req.body || {};

  // Validate required field
  if (!lessonObjective || lessonObjective.trim().length < 10) {
    return res.status(400).json({ error: 'A lesson objective is required (minimum 10 characters).' });
  }

  // Build the structured prompt from the teacher's inputs
  const userMessage = [
    `Lesson Objective: ${lessonObjective}`,
    `Year Level: ${yearLevel || 'Not specified'}`,
    `Subject: ${subject || 'Not specified'}`,
    '',
    'Class Profile:',
    `- Learning Support (below year level): ${classProfile?.ls || 0} students`,
    `- Standard (at year level): ${classProfile?.st || 0} students`,
    `- Extension / G&T (above year level): ${classProfile?.ex || 0} students`,
    `- EAL/D students: ${classProfile?.eald || 0}`,
    classProfile?.notes ? `- Teacher notes: ${classProfile.notes}` : null,
  ].filter(Boolean).join('\n');

  try {
    // Call the Anthropic API — the key is read from Vercel's environment variables
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are an expert in differentiated instruction aligned with the Australian Curriculum (AC v9).

Generate tiered tasks for three learner groups. Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "lessonFocus": "One sentence: the shared learning goal across all tiers",
  "learningSupport": {
    "description": "Who this serves and the core adaptation in one sentence",
    "tasks": ["Task 1", "Task 2", "Task 3"],
    "scaffolds": ["Support strategy 1", "Support strategy 2"]
  },
  "standard": {
    "description": "Who this serves in one sentence",
    "tasks": ["Task 1", "Task 2", "Task 3"]
  },
  "extension": {
    "description": "Who this serves and the enrichment approach in one sentence",
    "tasks": ["Task 1", "Task 2", "Task 3"],
    "challenges": ["Higher-order challenge 1", "Higher-order challenge 2"]
  }
}

Rules: All tasks must address the lesson objective. Be specific and immediately actionable — avoid generic verbs without concrete direction. Reflect genuine pedagogical differentiation. Use Australian English spelling.`,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const anthropicData = await anthropicResponse.json();

    // Handle errors returned by the Anthropic API
    if (anthropicData.error) {
      console.error('Anthropic API error:', anthropicData.error);
      return res.status(500).json({ error: anthropicData.error.message || 'API error from Anthropic.' });
    }

    // Parse Claude's JSON response and return it to the frontend
    const rawText = anthropicData.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(rawText);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
  }
};
