// utils/noteUtils.ts
export const extractTagsFromNote = (note: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = note.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

export const formatNoteWithHighlights = (note: string): string => {
  // Replace hashtags with styled spans
  return note.replace(/#(\w+)/g, '<span style="color: var(--accent-green); font-weight: bold;">#$1</span>');
};