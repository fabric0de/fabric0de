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
 * Fixes YAML pipe syntax by parsing line by line
 */
const fixYamlPipeSyntax = (jsonString: string): string => {
  const lines = jsonString.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line has YAML pipe syntax: "field": | or "field": |-
    const yamlPipeMatch =
      line.match(/^(\s*"(?:answer|question|explanation)"\s*:\s*)\|-\s*$/) ||
      line.match(/^(\s*"(?:answer|question|explanation)"\s*:\s*)\|\s*$/);
    if (yamlPipeMatch) {
      const prefix = yamlPipeMatch[1];
      const contentLines: string[] = [];
      i++; // Skip the pipe line

      // Collect all content lines until we hit the next field or closing brace
      // We need to be very careful to detect field boundaries accurately
      while (i < lines.length) {
        const nextLine = lines[i];
        const trimmedNextLine = nextLine.trim();

        // Early detection: if this line looks like a field, break immediately
        // This prevents content from being included when it shouldn't
        if (
          trimmedNextLine.match(
            /^"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
          ) ||
          nextLine.match(
            /^\s+"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
          )
        ) {
          break;
        }

        // Check if this is just a comma (sometimes appears after YAML pipe content)
        // If next line after comma is a field, we should break here
        const isJustComma = trimmedNextLine === ',';
        if (isJustComma && i + 1 < lines.length) {
          const lineAfterComma = lines[i + 1];
          const trimmedAfterComma = lineAfterComma.trim();
          // If next line is a field, break here (comma will be handled separately)
          if (
            trimmedAfterComma.match(
              /^"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
            ) ||
            lineAfterComma.match(
              /^\s+"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
            )
          ) {
            break;
          }
        }

        // Check if this is an empty line or whitespace-only line
        // If next line after empty line is a field, we should break here
        const isEmptyLine = trimmedNextLine === '' || trimmedNextLine === '  "';
        if (isEmptyLine && i + 1 < lines.length) {
          const lineAfterEmpty = lines[i + 1];
          const trimmedAfterEmpty = lineAfterEmpty.trim();
          // If next line is a field, break here (empty line marks end of YAML content)
          if (
            trimmedAfterEmpty.match(
              /^"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
            ) ||
            lineAfterEmpty.match(
              /^\s+"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
            )
          ) {
            break;
          }
        }

        // Check if this is the start of a new field
        // Pattern must match: "field": (with optional leading whitespace/comma)
        // Examples: "difficulty":,   "difficulty":, , "difficulty":
        // Must check both trimmed and original to handle various indentation patterns
        const fieldPattern =
          /"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/;

        // More aggressive field detection - check multiple patterns
        // Priority: exact matches first, then fallbacks
        const isNewField =
          // Check trimmed line (handles cases with leading comma)
          trimmedNextLine.match(fieldPattern) ||
          // Check original line with leading whitespace (common pattern: 2 spaces + quote)
          nextLine.match(
            /^\s+"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
          ) ||
          // Very specific: check for field pattern with exactly 2 spaces prefix
          nextLine.match(/^  "(?:difficulty|tags|type|id)"\s*:/) ||
          // Check for lines starting with whitespace and quote, then field pattern
          (nextLine.match(/^\s+"/) && nextLine.match(fieldPattern)) ||
          // Additional check: if line starts with quote after whitespace and contains field name
          (nextLine.match(/^\s+"/) &&
            (nextLine.includes('"difficulty":') ||
              nextLine.includes('"tags":') ||
              nextLine.includes('"type":') ||
              nextLine.includes('"id":')));

        if (isNewField) {
          break;
        }

        // Check if this is a closing brace
        const isClosingBrace =
          trimmedNextLine === '}' ||
          trimmedNextLine === ',}' ||
          trimmedNextLine.match(/^,?\s*}/) ||
          nextLine.match(/^\s*}\s*$/);

        if (isClosingBrace) {
          break;
        }

        // Remove leading indentation but preserve the line
        const cleanedLine = nextLine.replace(/^\s+/, '');
        // Check if this line is just a quote (marks end of YAML content in some cases)
        if (cleanedLine.trim() === '"' && i + 1 < lines.length) {
          const lineAfterQuote = lines[i + 1];
          if (
            lineAfterQuote
              .trim()
              .match(
                /^"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:/
              )
          ) {
            break; // Quote followed by field marks end of content
          }
        }
        contentLines.push(cleanedLine);
        i++;
      }

      // Remove trailing empty lines
      while (
        contentLines.length > 0 &&
        contentLines[contentLines.length - 1].trim() === ''
      ) {
        contentLines.pop();
      }

      const content = contentLines.join('\n').trim();
      result.push(`${prefix}"${escapeValue(content)}"`);
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
};

/**
 * Extracts JSON object by matching braces properly
 */
const extractJsonObject = (content: string): string => {
  const startIndex = content.indexOf('{');
  if (startIndex === -1) {
    return content;
  }

  let braceCount = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        return content.substring(startIndex, i + 1);
      }
    }
  }

  // If we didn't find a closing brace, return the original
  return content;
};

/**
 * Cleans JSON string by removing markdown code blocks and fixing malformed values
 */
export const cleanJsonString = (content: string): string => {
  let jsonString = content.trim();

  // Remove outer markdown code blocks first (more aggressive)
  // Handle cases where code blocks appear at the start
  jsonString = jsonString.replace(
    /^```(?:json|markdown|javascript)?\s*\n?/gm,
    ''
  );
  jsonString = jsonString.replace(/\n?\s*```$/gm, '');
  jsonString = jsonString.replace(/([^\\])```/g, '$1');
  // Also handle cases where code blocks wrap the entire JSON
  // More aggressive: remove any remaining code block markers
  while (jsonString.includes('```')) {
    const before = jsonString;
    jsonString = jsonString.replace(/```/g, '');
    if (jsonString === before) break; // No change, exit loop
  }
  // Remove code block markers at start/end of lines
  const lines = jsonString.split('\n');
  if (lines.length > 0 && lines[0].trim().startsWith('```')) {
    lines[0] = lines[0].replace(/```/g, '');
  }
  if (lines.length > 0 && lines[lines.length - 1].trim().endsWith('```')) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/```/g, '');
  }
  jsonString = lines.join('\n');

  // Extract JSON object before processing YAML pipe (using proper brace matching)
  jsonString = extractJsonObject(jsonString);

  // Fix YAML pipe syntax (|) - must be done using line-by-line parsing
  jsonString = fixYamlPipeSyntax(jsonString);

  // Fix invalid escape sequences (like \# which should be #)
  // JSON only allows: \\, \/, \", \b, \f, \n, \r, \t, \uXXXX
  // Remove invalid escape sequences (keep only valid ones)
  jsonString = jsonString.replace(/\\([^\\/\"bfnrtu])/g, (match, char) => {
    // If it's not a valid escape sequence, remove the backslash
    // Valid sequences: \\, \/, \", \b, \f, \n, \r, \t, \uXXXX
    if (!['\\', '/', '"', 'b', 'f', 'n', 'r', 't', 'u'].includes(char)) {
      return char; // Remove the backslash, keep the character
    }
    return match; // Keep valid escape sequences
  });

  // Fix unescaped newlines and control characters in string values
  // This handles cases where newlines or control chars appear directly in JSON strings
  // Pattern: "field": "text\nmore text" or "field": "text with control chars"
  jsonString = jsonString.replace(
    /("(?:answer|question|explanation)"\s*:\s*")([^"]*?)\n([^"]*?)(")/g,
    (match, prefix, beforeNewline, afterNewline, suffix) => {
      // Only fix if this looks like an unescaped newline (not already escaped as \\n)
      if (!beforeNewline.endsWith('\\') && !match.includes('\\n')) {
        // Escape the newline and escape any backslashes in the content
        const escapedBefore = beforeNewline
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"');
        const escapedAfter = afterNewline
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"');
        return `${prefix}${escapedBefore}\\n${escapedAfter}${suffix}`;
      }
      return match;
    }
  );

  // Fix control characters in string values (must be done after newline fixing)
  // JSON doesn't allow unescaped control characters (0x00-0x1F) except \n, \r, \t
  // We need to escape them properly
  jsonString = jsonString.replace(
    /("(?:answer|question|explanation)"\s*:\s*")([^"]*?)([\x00-\x1F])([^"]*?)(")/g,
    (match, prefix, before, controlChar, after, suffix) => {
      // Skip if the control char is already escaped (backslash before it)
      if (before.endsWith('\\')) {
        return match;
      }
      const charCode = controlChar.charCodeAt(0);
      let escapedChar: string;
      // Handle common control characters
      if (charCode === 10)
        escapedChar = '\\n'; // newline
      else if (charCode === 13)
        escapedChar = '\\r'; // carriage return
      else if (charCode === 9)
        escapedChar = '\\t'; // tab
      else {
        // For other control chars, use \uXXXX format
        escapedChar = `\\u${charCode.toString(16).padStart(4, '0')}`;
      }
      // Escape any special chars in before and after
      const escapedBefore = before.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const escapedAfter = after.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `${prefix}${escapedBefore}${escapedChar}${escapedAfter}${suffix}`;
    }
  );

  // Fix code blocks in JSON string values
  const codeBlockPatterns = [
    /("(?:answer|question|explanation)"\s*:\s*)\s*```([\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\n\s*})/g,
  ];

  for (const pattern of codeBlockPatterns) {
    jsonString = jsonString.replace(pattern, (match, prefix, content) => {
      const cleaned = content.replace(/\s*```\s*/g, '').trim();
      return `${prefix}"${escapeValue(cleaned)}"`;
    });
  }

  return jsonString.trim();
};

/**
 * Simple JSON parser - cleans and parses JSON string
 */
export const parseJson = <T = unknown>(content: string): T => {
  const cleaned = cleanJsonString(content);
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // If parsing fails, check if YAML pipe syntax is still present
    if (cleaned.includes('": |')) {
      // Try fixing YAML pipe syntax again
      const fixed = fixYamlPipeSyntax(cleaned);
      return JSON.parse(fixed) as T;
    }
    throw e;
  }
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

    // Try fixing YAML pipe syntax using line-by-line parsing
    cleaned = fixYamlPipeSyntax(cleaned);

    // Try fixing unclosed code blocks
    const codeBlockPattern =
      /("(?:answer|question|explanation)"\s*:\s*)\s*```([\s\S]*?)(?=\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\s*})/g;
    cleaned = cleaned.replace(codeBlockPattern, (match, prefix, content) => {
      const cleanedContent = content.replace(/\s*```\s*/g, '').trim();
      return `${prefix}"${escapeValue(cleanedContent)}"`;
    });

    try {
      return JSON.parse(cleaned) as T;
    } catch (e2) {
      // Last resort: extract JSON object and fix incomplete fields
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        let extractedJson = cleaned.substring(jsonStart, jsonEnd + 1);

        // Fix YAML pipe syntax in extracted JSON using line-by-line parsing
        extractedJson = fixYamlPipeSyntax(extractedJson);

        // If YAML pipe syntax is still present, try a more aggressive fix
        // Handle both | and |- syntax
        if (extractedJson.includes('": |') || extractedJson.includes('": |-')) {
          // Try to fix remaining YAML pipe syntax by finding the pattern and fixing it
          extractedJson = extractedJson.replace(
            /("(?:answer|question|explanation)"\s*:\s*)\|-\s*\n((?:[^\n]|\n(?!\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\s*}))[\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\n\s*}|$)/g,
            (match, prefix, content) => {
              const lines = content.split('\n');
              const cleanedLines = lines
                .map((line: string) => line.replace(/^\s+/, ''))
                .filter((line: string) => line.trim() || line === '');
              const cleanedContent = cleanedLines.join('\n').trim();
              return `${prefix}"${escapeValue(cleanedContent)}"`;
            }
          );
          extractedJson = extractedJson.replace(
            /("(?:answer|question|explanation)"\s*:\s*)\|\s*\n((?:[^\n]|\n(?!\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\s*}))[\s\S]*?)(?=\n\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\n\s*}|$)/g,
            (match, prefix, content) => {
              const lines = content.split('\n');
              const cleanedLines = lines
                .map((line: string) => line.replace(/^\s+/, ''))
                .filter((line: string) => line.trim() || line === '');
              const cleanedContent = cleanedLines.join('\n').trim();
              return `${prefix}"${escapeValue(cleanedContent)}"`;
            }
          );
        }

        // Fix unquoted field values
        const unquotedFieldPattern =
          /("(?:answer|question|explanation)"\s*:\s*)([^,}]+?)(?=\s*"(?:difficulty|tags|type|id|question|answer|explanation)"\s*:|\s*[,}])/g;
        extractedJson = extractedJson.replace(
          unquotedFieldPattern,
          (match, prefix, value) => {
            if (!value.trim().startsWith('"')) {
              const cleanedValue = value
                .replace(/\s*```\s*/g, '')
                .replace(/^\s*\|\s*\n?/g, '')
                .trim();
              return `${prefix}"${escapeValue(cleanedValue)}"`;
            }
            return match;
          }
        );

        // Try to fix incomplete JSON (truncated responses)
        // Look for patterns like ",difficulty" or ",tags" without proper quote closure
        // This happens when the answer string isn't properly closed before the next field
        // Pattern 1: "answer":"...text",difficulty" -> should be "answer":"...text","difficulty":"
        const incompleteStringPattern1 =
          /("(?:answer|question|explanation)"\s*:\s*")([^"]*?)(,difficulty|,tags|,type|,id)("?[^"]*?)$/;
        const match1 = extractedJson.match(incompleteStringPattern1);
        if (match1) {
          const [fullMatch, prefix, content, nextField, rest] = match1;
          // The string wasn't properly closed before the next field
          // Close it and fix the next field format
          const fixedContent = content.trim();
          // Remove any trailing newlines or backslashes that shouldn't be there
          const cleanedContent = fixedContent
            .replace(/\\n$/, '')
            .replace(/\n$/, '');
          // Fix the next field: ",difficulty" -> ","difficulty":"
          const fixedNextField = nextField.substring(1); // Remove leading comma
          // If rest doesn't start with quote, add it
          let fixedRest = rest.trim();
          if (!fixedRest.startsWith('"')) {
            fixedRest = `"${fixedRest}`;
          }
          // Ensure it ends with proper JSON structure
          if (!fixedRest.includes(':')) {
            fixedRest = `${fixedRest}:"intermediate"`;
          }
          extractedJson = extractedJson.replace(
            incompleteStringPattern1,
            `${prefix}${escapeValue(cleanedContent)}","${fixedNextField}":${fixedRest}`
          );
        } else {
          // Check for pattern where answer ends with \n and then ",difficulty" appears
          // Pattern: "answer":"...text\n",difficulty" -> should be "answer":"...text","difficulty"
          const patternWithNewline =
            /("answer"\s*:\s*")([^"]*?)\\n",(difficulty|tags|type|id)"/;
          const matchWithNewline = extractedJson.match(patternWithNewline);
          if (matchWithNewline) {
            const [fullMatch, prefix, content, nextField] = matchWithNewline;
            const fixedContent = content.trim();
            extractedJson = extractedJson.replace(
              patternWithNewline,
              `${prefix}${escapeValue(fixedContent)}","${nextField}":`
            );
          } else {
            // Check if answer field is unclosed at the end (no difficulty field found)
            // This handles cases where the response was truncated mid-answer
            if (!extractedJson.includes('"difficulty"')) {
              const answerUnclosedPattern = /("answer"\s*:\s*")([^"]*?)$/;
              const answerMatch = extractedJson.match(answerUnclosedPattern);
              if (answerMatch) {
                const [_, prefix, content] = answerMatch;
                // If content is very long and ends abruptly, truncate it reasonably
                const fixedContent = content.trim();
                // Take first 500 characters if it's too long (likely truncated)
                // Also remove any incomplete escape sequences at the end
                let truncatedContent =
                  fixedContent.length > 500
                    ? fixedContent.substring(0, 500)
                    : fixedContent;
                // Remove trailing backslashes that might be incomplete escape sequences
                truncatedContent = truncatedContent.replace(/\\+$/, '');
                extractedJson = extractedJson.replace(
                  answerUnclosedPattern,
                  `${prefix}${escapeValue(truncatedContent)}","difficulty":"intermediate","tags":[],"type":"open"}`
                );
              }
            }
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
