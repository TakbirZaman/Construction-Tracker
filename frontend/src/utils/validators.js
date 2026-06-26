export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) return `${fieldName} is required`;
  return null;
};

export const validateNumber = (value, fieldName) => {
  if (value && isNaN(parseFloat(value))) return `${fieldName} must be a number`;
  return null;
};
