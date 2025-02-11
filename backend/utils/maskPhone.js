export const maskPhoneNumber = (message) => {
    const phoneNumberRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{1,3}\)?[-.\s]?)?(\d{3})[-.\s]?\d{4}/g; // Matches various phone formats
    
    // Replace detected phone numbers with asterisks
    return message.replace(phoneNumberRegex, (match) => '*'.repeat(match.length));
  };
  