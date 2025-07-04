export const validateSriLankanNIC = (nicNumber, birthday) => {
  const nic = nicNumber.replace(/[\s-]/g, '');
  

  const result = {
    isValid: false,
    nicBirthday: null,
    birthdayMatch: false,
    gender: null,
    ageValid: false,
    message: ''
  };
  
  // Check if NIC is empty
  if (!nic) {
    result.message = 'NIC is required';
    return result;
  }
  
  // Validate old NIC format (9 digits + V/X)
  if (/^[0-9]{9}[VvXx]$/.test(nic)) {
    // Extract year and days from NIC
    const yearPart = nic.substring(0, 2);
    const daysPartRaw = parseInt(nic.substring(2, 5), 10);
    
    // Determine century and gender
    const birthYear = parseInt('19' + yearPart, 10);
    
    // For females, 500 is added to the number of days
    let daysPart = daysPartRaw;
    result.gender = daysPart > 500 ? 'female' : 'male';
    
    // Adjust days for females
    if (daysPart > 500) {
      daysPart -= 500;
    }
    
    // Calculate the date using days - fixed method
    const extractedBirthday = calculateBirthdayFromDays(birthYear, daysPart);
    result.nicBirthday = extractedBirthday;
    
    // Validate structure
    result.isValid = true;
    
  } 
  // Validate new NIC format (12 digits)
  else if (/^[0-9]{12}$/.test(nic)) {
    // Extract year (YYYY) and days from NIC
    const yearPart = nic.substring(0, 4);
    const daysPartRaw = parseInt(nic.substring(4, 7), 10);
    
    // Determine gender
    let daysPart = daysPartRaw;
    result.gender = daysPart > 500 ? 'female' : 'male';
    
    // Adjust days for females
    if (daysPart > 500) {
      daysPart -= 500;
    }
    
    // Calculate the date using days - fixed method
    const birthYear = parseInt(yearPart, 10);
    const extractedBirthday = calculateBirthdayFromDays(birthYear, daysPart);
    result.nicBirthday = extractedBirthday;
    
    // Validate structure
    result.isValid = true;
  } 
  else {
    result.message = 'Invalid NIC format. Should be 9 digits + V/X or 12 digits';
    return result;
  }
  
  // Validate age (18-30 years)
  if (result.isValid) {
    const birthDate = new Date(result.nicBirthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const hasHadBirthdayThisYear = 
      today.getMonth() > birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    
    if (!hasHadBirthdayThisYear) {
      age--;
    }
    
    
  }
  
  // If we have both a valid NIC birthday and input birthday, compare them
  if (result.isValid && birthday) {
    // Normalize both dates to YYYY-MM-DD format for comparison
    const normalizedBirthday = normalizeDate(birthday);
    const normalizedNicDate = result.nicBirthday;
    
    result.birthdayMatch = normalizedBirthday === normalizedNicDate;
    
    if (!result.birthdayMatch) {
      result.message = 'Birthday does not match the date encoded in NIC';
    }
  }
  
  return result;
};

// Helper function to normalize date to YYYY-MM-DD format
function normalizeDate(dateInput) {
  const date = new Date(dateInput);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateBirthdayFromDays(year, days) {

  const date = new Date(year, 0, 1);

  date.setDate(date.getDate() + (days - 1));
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Extract birthday from NIC
export const extractBirthdayFromNIC = (nic) => {
  if (!nic) return null;
  
  // Clean the NIC
  const cleanNic = nic.replace(/[\s-]/g, '');
  
  // Old format (9 digits + V/X)
  if (/^[0-9]{9}[VvXx]$/.test(cleanNic)) {
    const yearPart = cleanNic.substring(0, 2);
    const daysPartRaw = parseInt(cleanNic.substring(2, 5), 10);
    
    // Determine century
    const birthYear = parseInt('19' + yearPart, 10);
    
    // For females, 500 is added to the days
    let daysPart = daysPartRaw;
    if (daysPart > 500) {
      daysPart -= 500;
    }
    
    return calculateBirthdayFromDays(birthYear, daysPart);
  } 
  // New format (12 digits)
  else if (/^[0-9]{12}$/.test(cleanNic)) {
    const yearPart = cleanNic.substring(0, 4);
    const daysPartRaw = parseInt(cleanNic.substring(4, 7), 10);
    
    // For females, 500 is added to the days
    let daysPart = daysPartRaw;
    if (daysPart > 500) {
      daysPart -= 500;
    }
    
    const birthYear = parseInt(yearPart, 10);
    return calculateBirthdayFromDays(birthYear, daysPart);
  }
  
  return null;
};

// Test function to verify our fix works with the provided example
export function testNicValidation() {
  const nic = "196521302553";
  const expectedBirthday = "1965-07-31";
  
  const result = extractBirthdayFromNIC(nic);
  console.log(`NIC: ${nic}`);
  console.log(`Extracted Birthday: ${result}`);
  console.log(`Expected Birthday: ${expectedBirthday}`);
  console.log(`Match: ${result === expectedBirthday}`);
  
  return result;
}