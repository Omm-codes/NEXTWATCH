const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getAIRecommendations = async (userInput, isQuiz = false, quizAnswers = null) => {
  try {
    let prompt;
    
    if (isQuiz && quizAnswers) {
      // Generate prompt from quiz answers
      prompt = generateQuizPrompt(quizAnswers);
    } else {
      // Generate prompt from mood input
      prompt = generateMoodPrompt(userInput);
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a movie and TV show recommendation expert. Provide exactly 8-12 specific movie, TV show, or web series titles based on the user\'s preferences. Return only the titles, one per line, without any additional text, numbers, or explanations. Focus on popular, well-known titles that are likely to be found in movie databases.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse the AI response to extract movie/show titles
    const titles = aiResponse
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0)
      .map(title => title.replace(/^\d+\.\s*/, '')) // Remove numbering if present
      .map(title => title.replace(/^[-*]\s*/, '')) // Remove bullet points if present
      .slice(0, 12); // Limit to 12 titles

    return { titles, error: null };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return { titles: [], error: error.message };
  }
};

const generateMoodPrompt = (moodInput) => {
  return `Based on this mood/preference: "${moodInput}"

Please recommend movies, TV shows, or web series that would match this mood. Consider:
- The emotional tone described
- Any specific genres mentioned
- Social context (alone, with family, friends, partner)
- Time preferences (quick watch, binge-worthy series)
- Any specific elements mentioned (action, comedy, romance, etc.)

Provide a mix of movies, TV shows, and web series that would perfectly match this mood and situation.`;
};

const generateQuizPrompt = (answers) => {
  const { mood, time, genre, company, preference } = answers;
  
  return `Based on these preferences:
- Current mood: ${mood || 'neutral'}
- Available time: ${time || 'flexible'}
- Preferred genre: ${genre || 'any'}
- Watching with: ${company || 'alone'}
- Content preference: ${preference || 'popular'}

Please recommend specific movies, TV shows, or web series that match these criteria. Consider:
- Content that fits the mood and genre
- Appropriate length based on time availability
- Suitable for the viewing company
- Matching the stated preferences for new/popular/classic content

Provide a diverse mix of recommendations including movies, TV shows, and web series.`;
};

// Add new function for generating smart content descriptions
export const generateSmartDescription = async (movieData, userPreferences = null) => {
  try {
    const { title, overview, genres, release_date, vote_average, media_type } = movieData;
    
    const prompt = generateDescriptionPrompt(movieData, userPreferences);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert film and TV critic who writes engaging, personalized content descriptions. Write compelling, concise descriptions that highlight what makes each title special. Keep descriptions between 100-150 words, focusing on emotional appeal and unique aspects. Avoid spoilers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content?.trim();
    
    if (!description) {
      return { description: overview, error: null };
    }

    return { description, error: null };
  } catch (error) {
    console.error('Error generating smart description:', error);
    return { description: movieData.overview, error: error.message };
  }
};

// Add function for generating review summaries
export const generateReviewSummary = async (reviews, movieTitle) => {
  try {
    if (!reviews || reviews.length === 0) {
      return { summary: null, error: 'No reviews available' };
    }

    const reviewTexts = reviews.slice(0, 5).map(review => 
      `${review.author}: ${review.content.substring(0, 500)}...`
    ).join('\n\n');

    const prompt = `Based on these user reviews for "${movieTitle}", create a balanced summary that captures the overall sentiment and key points viewers mentioned:

${reviewTexts}

Please provide a concise summary (2-3 sentences) that reflects the general consensus while highlighting both positive and negative aspects if present.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content reviewer who creates balanced, insightful summaries of user reviews. Focus on capturing the overall sentiment and key themes without revealing major spoilers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim();
    
    return { summary, error: null };
  } catch (error) {
    console.error('Error generating review summary:', error);
    return { summary: null, error: error.message };
  }
};

// Add function for mood-based content highlighting
export const generateMoodBasedHighlight = async (movieData, userMood) => {
  try {
    const prompt = `Given this ${movieData.media_type} and the user's current mood "${userMood}", write a compelling 2-sentence highlight that explains why this content would be perfect for their current state of mind:

Title: ${movieData.title}
Genre: ${movieData.genres?.map(g => g.name).join(', ') || 'Various'}
Overview: ${movieData.overview}

Focus on the emotional appeal and how it matches their mood.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at matching content to viewer emotions. Create personalized, engaging highlights that connect movies/shows to specific moods and feelings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const highlight = data.choices[0]?.message?.content?.trim();
    
    return { highlight, error: null };
  } catch (error) {
    console.error('Error generating mood highlight:', error);
    return { highlight: null, error: error.message };
  }
};

const generateDescriptionPrompt = (movieData, userPreferences) => {
  const { title, overview, genres, release_date, vote_average, media_type, runtime, number_of_seasons } = movieData;
  
  const genreList = genres?.map(g => g.name).join(', ') || 'Various';
  const year = release_date ? new Date(release_date).getFullYear() : 'Unknown';
  const rating = vote_average ? vote_average.toFixed(1) : 'Unrated';
  
  let contentType = media_type === 'tv' ? 'TV series' : 'movie';
  let durationInfo = '';
  
  if (media_type === 'tv' && number_of_seasons) {
    durationInfo = `spanning ${number_of_seasons} season${number_of_seasons > 1 ? 's' : ''}`;
  } else if (runtime) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    durationInfo = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
  }

  let userContext = '';
  if (userPreferences) {
    userContext = `\n\nUser preferences: ${JSON.stringify(userPreferences)}
Please tailor the description to appeal to someone with these preferences.`;
  }

  return `Create an engaging, personalized description for this ${contentType}:

Title: ${title}
Year: ${year}
Genres: ${genreList}
Rating: ${rating}/10
${durationInfo ? `Duration: ${durationInfo}` : ''}
Original Overview: ${overview}

Make the description compelling and highlight what makes this ${contentType} special. Focus on emotional appeal, unique elements, and why someone should watch it. Write in an engaging, conversational tone.${userContext}`;
};

export default {
  getAIRecommendations,
  generateSmartDescription,
  generateReviewSummary,
  generateMoodBasedHighlight
};
