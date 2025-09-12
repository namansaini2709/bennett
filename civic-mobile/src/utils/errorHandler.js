import { Alert } from 'react-native';

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  let message = defaultMessage;
  
  if (error?.response) {
    // Server responded with error status
    message = error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error?.request) {
    // Network error
    message = 'Network error. Please check your internet connection.';
  } else if (error?.message) {
    // Other errors
    message = error.message;
  }

  console.error('API Error:', error);
  return message;
};

export const showErrorAlert = (error, title = 'Error') => {
  const message = handleApiError(error);
  Alert.alert(title, message);
};

export const showSuccessAlert = (message, title = 'Success', onOk) => {
  Alert.alert(title, message, [
    { text: 'OK', onPress: onOk }
  ]);
};

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm }
    ]
  );
};

export const isNetworkError = (error) => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         !error?.response;
};

export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Please check your internet connection and try again.';
  }
  
  return error?.response?.data?.message || 
         error?.message || 
         'An unexpected error occurred.';
};