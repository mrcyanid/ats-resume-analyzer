// Extracts all words with 3+ letters, lowercase, whole-word matches only
export const extractKeywords = (text) => {
  if (!text) return [];
  return text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
};
