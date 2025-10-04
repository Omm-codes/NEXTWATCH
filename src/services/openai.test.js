import { 
  getAIRecommendations, 
  generateSmartDescription, 
  generateReviewSummary, 
  generateMoodBasedHighlight 
} from './openai';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAI Service - LLM Model Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAIRecommendations', () => {
    it('should return recommendations when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'The Shawshank Redemption\nThe Godfather\nThe Dark Knight\nPulp Fiction'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getAIRecommendations('I want action movies');
      
      expect(result.titles).toHaveLength(4);
      expect(result.titles).toContain('The Shawshank Redemption');
      expect(result.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const result = await getAIRecommendations('I want action movies');
      
      expect(result.titles).toEqual([]);
      expect(result.error).toBeTruthy();
    });

    it('should handle quiz mode with quiz answers', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Inception\nInterstellar\nThe Matrix'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const quizAnswers = {
        mood: 'excited',
        genre: 'scifi',
        company: 'friends',
        time: 'movie'
      };

      const result = await getAIRecommendations('', true, quizAnswers);
      
      expect(result.titles).toHaveLength(3);
      expect(result.error).toBeNull();
    });

    it('should handle empty response from API', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: ''
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getAIRecommendations('I want comedies');
      
      expect(result.titles).toEqual([]);
      expect(result.error).toBeTruthy();
    });
  });

  describe('generateSmartDescription', () => {
    it('should return enhanced description when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'An amazing tale of hope and friendship that transcends time.'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const movieData = {
        title: 'The Shawshank Redemption',
        overview: 'Original overview',
        genres: [{ name: 'Drama' }],
        release_date: '1994-09-23',
        vote_average: 8.7,
        media_type: 'movie'
      };

      const result = await generateSmartDescription(movieData);
      
      expect(result.description).toBe('An amazing tale of hope and friendship that transcends time.');
      expect(result.error).toBeNull();
    });

    it('should fallback to original overview on API error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const movieData = {
        title: 'Test Movie',
        overview: 'Original overview text',
        genres: [{ name: 'Drama' }],
        release_date: '2024-01-01',
        vote_average: 7.5,
        media_type: 'movie'
      };

      const result = await generateSmartDescription(movieData);
      
      expect(result.description).toBe('Original overview text');
      expect(result.error).toBeTruthy();
    });
  });

  describe('generateReviewSummary', () => {
    it('should return review summary when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Overall, viewers praised the film for its compelling story and performances.'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const reviews = [
        { author: 'John', content: 'Great movie with excellent acting and story.' },
        { author: 'Jane', content: 'Loved it! One of the best films I have seen.' }
      ];

      const result = await generateReviewSummary(reviews, 'Test Movie');
      
      expect(result.summary).toBe('Overall, viewers praised the film for its compelling story and performances.');
      expect(result.error).toBeNull();
    });

    it('should handle empty reviews', async () => {
      const result = await generateReviewSummary([], 'Test Movie');
      
      expect(result.summary).toBeNull();
      expect(result.error).toBe('No reviews available');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const reviews = [
        { author: 'John', content: 'Great movie.' }
      ];

      const result = await generateReviewSummary(reviews, 'Test Movie');
      
      expect(result.summary).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('generateMoodBasedHighlight', () => {
    it('should return mood-based highlight when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Perfect for your adventurous mood, this film takes you on an epic journey.'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const movieData = {
        title: 'Indiana Jones',
        overview: 'An adventure movie',
        genres: [{ name: 'Adventure' }],
        media_type: 'movie'
      };

      const result = await generateMoodBasedHighlight(movieData, 'adventurous');
      
      expect(result.highlight).toBe('Perfect for your adventurous mood, this film takes you on an epic journey.');
      expect(result.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const movieData = {
        title: 'Test Movie',
        overview: 'Test overview',
        genres: [{ name: 'Drama' }],
        media_type: 'movie'
      };

      const result = await generateMoodBasedHighlight(movieData, 'happy');
      
      expect(result.highlight).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('API Configuration', () => {
    it('should use correct model name (llama3-8b-8192)', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await getAIRecommendations('test');
      
      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.model).toBe('llama3-8b-8192');
    });

    it('should use correct API endpoint', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response'
            }
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await getAIRecommendations('test');
      
      const fetchCall = global.fetch.mock.calls[0];
      
      expect(fetchCall[0]).toBe('https://api.groq.com/openai/v1/chat/completions');
    });
  });
});
