
export const stripHtml = (html: string): string => {
  // Remove HTML tags and decode entities
  const stripped = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  return stripped;
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getContentPreview = (htmlContent: string, maxLength: number = 150): string => {
  const cleanText = stripHtml(htmlContent);
  return truncateText(cleanText, maxLength);
};
