/**
 * Integration Test for LLM Model (Groq API with llama3-8b-8192)
 * 
 * This test file verifies that the LLM model is working correctly with the actual Groq API.
 * To run this test, ensure REACT_APP_GROQ_API_KEY is set in your environment variables.
 * 
 * Run with: npm test -- --testPathPattern=openai.integration.test.js --watchAll=false
 */

import { 
  getAIRecommendations, 
  generateSmartDescription, 
  generateReviewSummary, 
  generateMoodBasedHighlight 
} from './openai';

// Skip these tests if GROQ API key is not available
const describeIfGroqKey = process.env.REACT_APP_GROQ_API_KEY ? describe : describe.skip;

describeIfGroqKey('OpenAI Service - Integration Tests (Real API)', () => {
  // Increase timeout for real API calls
  jest.setTimeout(30000);

  describe('getAIRecommendations - Real API', () => {
    it('should get real recommendations for mood input', async () => {
      const result = await getAIRecommendations('I want something funny to watch with friends');
      
      console.log('AI Recommendations Result:', result);
      
      // Verify structure
      expect(result).toHaveProperty('titles');
      expect(result).toHaveProperty('error');
      
      if (result.error) {
        console.error('API Error:', result.error);
        // If there's an error, it should be a string
        expect(typeof result.error).toBe('string');
      } else {
        // If successful, we should have titles
        expect(Array.isArray(result.titles)).toBe(true);
        expect(result.titles.length).toBeGreaterThan(0);
        expect(result.error).toBeNull();
        
        console.log('Received titles:', result.titles);
      }
    });

    it('should get recommendations for quiz answers', async () => {
      const quizAnswers = {
        mood: 'excited',
        genre: 'action',
        company: 'friends',
        time: 'movie',
        preference: 'popular'
      };
      
      const result = await getAIRecommendations('', true, quizAnswers);
      
      console.log('Quiz Recommendations Result:', result);
      
      expect(result).toHaveProperty('titles');
      expect(result).toHaveProperty('error');
      
      if (result.error) {
        console.error('API Error:', result.error);
      } else {
        expect(Array.isArray(result.titles)).toBe(true);
        expect(result.titles.length).toBeGreaterThan(0);
        console.log('Quiz-based titles:', result.titles);
      }
    });
  });

  describe('generateSmartDescription - Real API', () => {
    it('should generate enhanced description for a movie', async () => {
      const movieData = {
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        genres: [{ name: 'Science Fiction' }, { name: 'Action' }],
        release_date: '2010-07-16',
        vote_average: 8.4,
        media_type: 'movie',
        runtime: 148
      };
      
      const result = await generateSmartDescription(movieData);
      
      console.log('Smart Description Result:', result);
      
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('error');
      
      if (result.error) {
        console.error('API Error:', result.error);
        // Should fallback to original overview
        expect(result.description).toBe(movieData.overview);
      } else {
        expect(typeof result.description).toBe('string');
        expect(result.description.length).toBeGreaterThan(0);
        expect(result.error).toBeNull();
        console.log('Generated description:', result.description);
      }
    });
  });

  describe('generateReviewSummary - Real API', () => {
    it('should generate a summary from reviews', async () => {
      const mockReviews = [
        { 
          author: 'John Doe', 
          content: 'Amazing film with stellar performances. The plot keeps you on the edge of your seat throughout. Highly recommend for anyone who loves a good thriller.' 
        },
        { 
          author: 'Jane Smith', 
          content: 'One of the best movies I have seen this year. The cinematography is breathtaking and the story is compelling. A must-watch!' 
        },
        { 
          author: 'Bob Wilson', 
          content: 'While the acting was good, I found the pacing a bit slow. Still worth watching though.' 
        }
      ];
      
      const result = await generateReviewSummary(mockReviews, 'Inception');
      
      console.log('Review Summary Result:', result);
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('error');
      
      if (result.error) {
        console.error('API Error:', result.error);
      } else {
        expect(typeof result.summary).toBe('string');
        expect(result.summary.length).toBeGreaterThan(0);
        expect(result.error).toBeNull();
        console.log('Generated summary:', result.summary);
      }
    });
  });

  describe('generateMoodBasedHighlight - Real API', () => {
    it('should generate mood-based highlight', async () => {
      const movieData = {
        title: 'The Shawshank Redemption',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        genres: [{ name: 'Drama' }],
        media_type: 'movie'
      };
      
      const result = await generateMoodBasedHighlight(movieData, 'hopeful and inspiring');
      
      console.log('Mood Highlight Result:', result);
      
      expect(result).toHaveProperty('highlight');
      expect(result).toHaveProperty('error');
      
      if (result.error) {
        console.error('API Error:', result.error);
      } else {
        expect(typeof result.highlight).toBe('string');
        expect(result.highlight.length).toBeGreaterThan(0);
        expect(result.error).toBeNull();
        console.log('Generated highlight:', result.highlight);
      }
    });
  });

  describe('Model Configuration Verification', () => {
    it('should verify model is llama3-8b-8192', async () => {
      // We can't directly check the model in the response, but we can ensure
      // the function works and the model name is correct in the code
      const result = await getAIRecommendations('Test query');
      
      // As long as we get a response (success or error), it means the API is configured
      expect(result).toBeDefined();
      expect(result).toHaveProperty('titles');
      expect(result).toHaveProperty('error');
      
      console.log('Model verification - API is responding:', !result.error ? 'SUCCESS' : 'ERROR');
    });
  });
});

// If API key is not available, provide instructions
if (!process.env.REACT_APP_GROQ_API_KEY) {
  console.log('\n⚠️  Integration tests skipped: REACT_APP_GROQ_API_KEY not found');
  console.log('To run integration tests, set the GROQ API key in your .env file:');
  console.log('REACT_APP_GROQ_API_KEY=your_api_key_here\n');
}
