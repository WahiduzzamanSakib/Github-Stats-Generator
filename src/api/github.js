/**
 * Fetches GitHub user profile data by username.
 * Supports an optional GitHub token stored in localStorage under 'github_token' to bypass rate limits.
 * @param {string} username
 * @returns {Promise<Object>} The user profile data.
 */
export const fetchGitHubUser = async (username) => {
  const headers = {};
  const token = localStorage.getItem("github_token");
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/users/${username}`, { headers });
  
  if (!response.ok) {
    let errorMessage = "";
    try {
      const data = await response.json();
      if (data && data.message) {
        errorMessage = data.message;
      }
    } catch (e) {
      // ignore JSON parsing errors
    }

    if (response.status === 404) {
      throw new Error("User not found on GitHub.");
    }
    
    if (response.status === 403 && errorMessage.toLowerCase().includes("rate limit")) {
      throw new Error(
        "GitHub API rate limit exceeded. Please try again later or add your Personal Access Token to localStorage ('github_token') to increase limits."
      );
    }

    throw new Error(errorMessage || `Failed to fetch user data (Status: ${response.status})`);
  }
  
  return await response.json();
};
