export const formatSpecializations = (specializations: string[], format: 'inline' | 'multiline' = 'inline') => {
  if (!specializations || !Array.isArray(specializations)) return '';
  
  if (format === 'multiline') {
    return specializations.join('\n');
  }
  
  if (specializations.length === 1) return specializations[0];
  if (specializations.length === 2) return `${specializations[0]} & ${specializations[1]}`;
  
  const lastItem = specializations[specializations.length - 1];
  const restItems = specializations.slice(0, -1);
  return `${restItems.join(', ')} & ${lastItem}`;
};