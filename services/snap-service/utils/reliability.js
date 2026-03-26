export const withTimeoutAndRetry = async (fn, options = {}) => {
  const {
    timeout = 5000,
    retries = 3,
    delay = 1000,
    retryOn = (err) => err.retryable || err.statusCode >= 500
  } = options;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (err) {
      lastError = err;
      if (attempt < retries && retryOn(err)) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        continue;
      }
      break;
    }
  }
  throw lastError;
};
