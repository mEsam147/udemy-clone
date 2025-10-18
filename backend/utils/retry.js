exports.retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!error.message?.includes("429")) {
        throw error;
      }

      const backoffDelay = initialDelay * Math.pow(2, i);
      console.warn(
        `Rate limited (429). Retrying in ${backoffDelay}ms... (Attempt ${
          i + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};
