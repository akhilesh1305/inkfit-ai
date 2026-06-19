/**
 * Central AI module — re-exports providers, generations, and context.
 * Import from `@/lib/ai` throughout the app.
 */
export {
  hasOpenAIKey,
  hasGeminiKey,
  hasAnyAIProvider,
  getActiveProvider,
  generate,
  generateText,
  generateImageFromPrompt,
  parseAIJson,
  AIServiceError,
  checkRateLimit,
  type AIProviderName,
  type GenerateTextOptions,
  type GenerateTextResult,
} from "@/lib/ai/providers";

export {
  buildAIContext,
  formatBrandContext,
  getBrandKit,
  type AIContext,
} from "@/lib/ai/context";

export { trackAIGeneration } from "@/lib/ai/usage";

export {
  generateBrandVoiceProfile,
  generateRepurposeOutput,
  generateLinkedInPostAI,
  generateSEOArticleAI,
  generateCarouselAI,
  enhanceMarketingOSAI,
  regenerateMarketingOSSectionAI,
  executeEmployeeStepAI,
  generateBlog,
  generateSocialPosts,
  generateLinkedInCarousel,
  generateCommentSuggestions,
  generateViralIdeas,
  optimizeSEO,
  researchKeywords,
  analyzeCompetitor,
  suggestTopics,
  generateImage,
  generateDemoContent,
  getDemoCalendarEvents,
  type BlogRequest,
  type SocialRequest,
  type LinkedInCarouselRequest,
  type SEORequest,
  type SEOResult,
  type ImageRequest,
  type GenerationOptions,
} from "@/lib/ai/generations";
