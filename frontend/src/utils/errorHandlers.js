export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.detail || error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  console.error('API Error:', error);
  return message;
};
