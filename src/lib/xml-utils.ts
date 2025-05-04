
/**
 * Utility functions for working with XML
 */

/**
 * Convert XML string to a JavaScript object
 */
export const xmlToJson = (xml: string): Record<string, any> => {
  // This is a simplified implementation
  // In a production app, we would use a proper XML parser
  try {
    const parseValue = (content: string): string | number | boolean => {
      if (content === 'true' || content === 'false') {
        return content === 'true';
      }
      if (!isNaN(Number(content))) {
        return Number(content);
      }
      return content;
    };
    
    // Very simple parser that extracts some basic tag values
    const result: Record<string, any> = {};
    const tagRegex = /<([^>\/]+)>([^<]+)<\/[^>]+>/g;
    let match;
    
    while ((match = tagRegex.exec(xml)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      result[key] = parseValue(value);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to parse XML:", error);
    return {};
  }
};

/**
 * Convert JavaScript object to XML string
 */
export const jsonToXml = (json: Record<string, any>): string => {
  // This is a simplified implementation
  // In a production app, we would use a proper XML generator
  try {
    let xml = '';
    
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const value = json[key];
        
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects
          xml += `<${key}>${jsonToXml(value)}</${key}>`;
        } else {
          // Handle primitive values
          xml += `<${key}>${value}</${key}>`;
        }
      }
    }
    
    return xml;
  } catch (error) {
    console.error("Failed to generate XML:", error);
    return "";
  }
};
