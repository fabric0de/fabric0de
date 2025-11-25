/**
 * JSON parsing utilities for Cloudflare AI responses
 * Removes markdown code blocks and parses JSON
 */

/**
 * Escapes string values for JSON
 */
export const escapeValue = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
};

/**
 * Cleans JSON string by removing markdown code blocks and fixing malformed values
 */
export const cleanJsonString = (content: string): string => {
  let jsonString = content.trim();

  // Fix code blocks in JSON string values (must be done before removing outer blocks)
  const codeBlockPatterns = [
    /("(?:answer|question|explanation)"\s*:\s*)\|\s*\n\s*```([\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id|question|answer)"\s*:|\n\s*})/g,
    /("(?:answer|question|explanation)"\s*:\s*)\s*```([\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id|question|answer)"\s*:|\n\s*})/g,
  ];

  for (const pattern of codeBlockPatterns) {
    jsonString = jsonString.replace(pattern, (match, prefix, content) => {
      const cleaned = content.replace(/\s*```\s*/g, '').trim();
      return `${prefix}"${escapeValue(cleaned)}"`;
    });
  }

  // Remove outer markdown code blocks
  jsonString = jsonString.replace(
    /^```(?:json|markdown|javascript)?\s*\n?/gm,
    ''
  );
  jsonString = jsonString.replace(/\n?\s*```$/gm, '');
  jsonString = jsonString.replace(/([^\\])```/g, '$1');

  // Extract JSON object
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonString = jsonMatch[0];
  }

  return jsonString.trim();
};

/**
 * Simple JSON parser - cleans and parses JSON string
 */
export const parseJson = <T = unknown>(content: string): T => {
  const cleaned = cleanJsonString(content);
  return JSON.parse(cleaned) as T;
};

/**
 * JSON parser with fallback - attempts to fix malformed JSON on parse failure
 */
export const parseJsonWithFallback = <T = unknown>(jsonString: string): T => {
  let cleaned = cleanJsonString(jsonString);

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    const originalError = e as Error;

    // Try fixing unclosed code blocks with more permissive patterns
    const fieldPatterns = [
      /("(?:answer|question|explanation)"\s*:\s*)\s*```([\s\S]*?)(?=\s*"(?:difficulty|tags|type|id)"\s*:|\s*})/g,
      /("(?:answer|question|explanation)"\s*:\s*)\|\s*\n\s*([\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id)"\s*:|\n\s*})/g,
    ];

    for (const pattern of fieldPatterns) {
      cleaned = cleaned.replace(pattern, (match, prefix, content) => {
        const cleaned = content.replace(/\s*```\s*/g, '').trim();
        return `${prefix}"${escapeValue(cleaned)}"`;
      });
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (e2) {
      // Last resort: extract JSON object and fix incomplete answer field
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        let extractedJson = cleaned.substring(jsonStart, jsonEnd + 1);
        const answerMatch = extractedJson.match(/"answer"\s*:\s*([^,}]+)/);

        if (answerMatch && !answerMatch[1].trim().startsWith('"')) {
          const answerStart = extractedJson.indexOf(answerMatch[0]);
          const afterAnswer = extractedJson.substring(
            answerStart + answerMatch[0].length
          );
          const nextFieldMatch = afterAnswer.match(
            /^\s*[,}]|^\s*"(?:difficulty|tags|type|id)"/
          );

          if (nextFieldMatch) {
            const answerValue = afterAnswer.substring(
              0,
              afterAnswer.indexOf(nextFieldMatch[0])
            );
            extractedJson =
              extractedJson.substring(0, answerStart + answerMatch[0].length) +
              `"${escapeValue(answerValue.replace(/\s*```\s*/g, '').trim())}"` +
              afterAnswer.substring(afterAnswer.indexOf(nextFieldMatch[0]));
          }
        }

        try {
          return JSON.parse(extractedJson) as T;
        } catch (e3) {
          throw new Error(
            `JSON parsing failed: ${originalError.message}. Original: ${jsonString.substring(0, 200)}...`
          );
        }
      }

      throw new Error(
        `JSON parsing failed: ${originalError.message}. Original: ${jsonString.substring(0, 200)}...`
      );
    }
  }
};
