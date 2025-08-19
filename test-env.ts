// test-env.ts
console.log("Endpoint:", process.env.APPWRITE_ENDPOINT);
console.log("Project:", process.env.APPWRITE_PROJECT_ID);
console.log("API Key exists?", !!process.env.APPWRITE_API_KEY);