// api/generate.js
// Vercel serverless function — runs on the server, never in the browser.
// v2: Generates a tiered assessment worksheet + exit slip (replaces v1 task descriptions)

module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lessonObjective, yearLevel, subject, syllabusOutcome, classProfile } = req.body || {};

  if (!lessonObjective || lessonObjective.trim().length < 10) {
    return res.status(400).json({ error: 'A lesson objective is required (minimum 10 characters).' });
  }

  const userMessage = [
    `Year Level: ${yearLevel || 'Not specified'}`,
    `Subject: ${subject || 'Not specified'}`,
    syllabusOutcome ? `NSW Syllabus Outcome (teacher-specified — use as primary alignment anchor): ${syllabusOutcome}` : null,
    `Lesson Objective: ${lessonObjective}`,
    '',
    'Class Profile:',
    `- Foundation tier (below year level): ${classProfile?.ls || 0} students`,
    `- Core tier (at year level): ${classProfile?.st || 0} students`,
    `- Extension tier (above year level / G&T): ${classProfile?.ex || 0} students`,
    `- EAL/D students: ${classProfile?.eald || 0}`,
    classProfile?.notes ? `- Teacher notes: ${classProfile.notes}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are an expert assessment designer working within the NSW Syllabus and Australian Curriculum (AC v9). You design differentiated assessment materials for Australian classroom teachers.

Generate a complete assessment package for ONE lesson. Return ONLY valid JSON with no markdown, no backticks, no preamble, and no text outside the JSON object.

DIFFICULTY TIERS — indicated by symbols on the worksheet, not labels:
- Symbol: a single diamond (◆) = Foundation. Students below year level. Scaffolded steps, familiar numbers, concrete contexts.
- Symbol: two diamonds (◆◆) = Core. Students at year level. Independent application without scaffolding.
- Symbol: three diamonds (◆◆◆) = Extension. Students above year level or G&T. Requires reasoning, justification, generalisation, or proof — not just harder numbers.

CRITICAL RULES FOR QUESTION WRITING:
1. Write ACTUAL questions with specific numbers, real contexts, and complete scenarios — never placeholder text
2. Every question must be immediately usable — a student picks up this sheet and starts without further explanation
3. Differentiation must be genuinely pedagogical: the three-diamond question requires a different cognitive process, not just more complex arithmetic
4. Use Australian English spelling throughout
5. Use Australian contexts where relevant (AUD currency, Australian place names, Australian scenarios)
6. All maths questions must contain real numbers students actually calculate with
7. Three-diamond questions must require written explanation, justification, or mathematical reasoning — pure computation is not sufficient

NSW SYLLABUS OUTCOME: If a teacher-specified NSW Syllabus Outcome is provided in the input, treat it as the authoritative alignment anchor. Include it verbatim in the syllabusOutcomes array in your response, and map all exit slip questions directly to it using its exact code.

WORKSHEET STRUCTURE:
- Exactly 3 concept groups
- Each group covers a distinct aspect of the lesson objective
- Each group contains exactly 3 questions, one per tier
- Students complete only their assigned tier across all groups
- Exit slip: 3 questions of graduated difficulty that ALL students attempt, completable in 5-10 minutes
- Each exit slip question maps to a specific NSW Syllabus outcome code

Return this exact JSON structure with no deviations:
{
  "lessonInfo": {
    "title": "Specific and descriptive lesson title",
    "syllabusOutcomes": [
      {"code": "NSW Syllabus code e.g. MA3-7NA", "description": "Full outcome description from NSW Syllabus"}
    ]
  },
  "worksheet": {
    "topInstruction": "Complete the questions at your assigned level for each section.",
    "conceptGroups": [
      {
        "conceptTitle": "Short concept area title",
        "questions": [
          {"tier": 1, "symbol": "a single diamond", "question": "Complete question with specific numbers", "workingLines": 3, "answer": "Complete answer with working"},
          {"tier": 2, "symbol": "two diamonds", "question": "Complete question with specific numbers", "workingLines": 4, "answer": "Complete answer with working"},
          {"tier": 3, "symbol": "three diamonds", "question": "Complete question requiring reasoning", "workingLines": 5, "answer": "Complete answer with reasoning"}
        ]
      },
      {
        "conceptTitle": "Second concept area",
        "questions": [
          {"tier": 1, "symbol": "a single diamond", "question": "...", "workingLines": 3, "answer": "..."},
          {"tier": 2, "symbol": "two diamonds", "question": "...", "workingLines": 4, "answer": "..."},
          {"tier": 3, "symbol": "three diamonds", "question": "...", "workingLines": 5, "answer": "..."}
        ]
      },
      {
        "conceptTitle": "Third concept area",
        "questions": [
          {"tier": 1, "symbol": "a single diamond", "question": "...", "workingLines": 3, "answer": "..."},
          {"tier": 2, "symbol": "two diamonds", "question": "...", "workingLines": 4, "answer": "..."},
          {"tier": 3, "symbol": "three diamonds", "question": "...", "workingLines": 5, "answer": "..."}
        ]
      }
    ]
  },
  "exitSlip": {
    "instruction": "Complete all three questions before leaving class. (5-10 minutes)",
    "questions": [
      {"questionNumber": 1, "tier": 1, "question": "Foundation level question", "syllabusOutcomeCode": "NSW code", "workingLines": 3, "answer": "Complete answer"},
      {"questionNumber": 2, "tier": 2, "question": "Core level question", "syllabusOutcomeCode": "NSW code", "workingLines": 4, "answer": "Complete answer"},
      {"questionNumber": 3, "tier": 3, "question": "Extension question requiring written reasoning", "syllabusOutcomeCode": "NSW code", "workingLines": 5, "answer": "Answer with reasoning"}
    ]
  },
  "googleFormsText": "Exit Slip questions for Google Form:\n\nQuestion 1: [exact question text]\n\nQuestion 2: [exact question text]\n\nQuestion 3: [exact question text]"
}

IMPORTANT: In the symbol field, write the actual diamond characters: use the unicode diamond character. One diamond for tier 1, two diamonds for tier 2, three diamonds for tier 3.`;

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const anthropicData = await anthropicResponse.json();

    if (anthropicData.error) {
      console.error('Anthropic API error:', anthropicData.error);
      return res.status(500).json({ error: anthropicData.error.message || 'API error from Anthropic.' });
    }

    const rawText = anthropicData.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(rawText);

    // Normalise symbols in case the model wrote text instead of characters
    const symbolMap = { 1: '◆', 2: '◆◆', 3: '◆◆◆' };
    if (parsed.worksheet && parsed.worksheet.conceptGroups) {
      parsed.worksheet.conceptGroups.forEach(group => {
        group.questions.forEach(q => {
          q.symbol = symbolMap[q.tier] || q.symbol;
        });
      });
    }
    if (parsed.exitSlip && parsed.exitSlip.questions) {
      parsed.exitSlip.questions.forEach(q => {
        q.symbol = symbolMap[q.tier] || q.symbol;
      });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Something went wrong generating the worksheet. Please try again.' });
  }
};
