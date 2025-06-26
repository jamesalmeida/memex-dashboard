import OpenAI from 'openai';

// Initialize OpenAI client (will be created on-demand)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey,
    });
  }
  return openaiClient;
}

export interface TagGenerationInput {
  title: string;
  content?: string | null;
  description?: string | null;
  url?: string | null;
  thumbnailUrl?: string | null;
  contentType?: string;
  existingTags?: string[];
}

export const openaiService = {
  async generateTags(input: TagGenerationInput): Promise<string[]> {
    const client = getOpenAIClient();
    
    // Prepare content for analysis (limit to 1000 chars to save tokens)
    const contentExcerpt = input.content ? input.content.slice(0, 2000) : '';
    
    const systemMsg = `
      You are an expert tag generator.
      Return ONLY a JSON array of 3–7 tags.
      Each tag must be:
      - 1–2 lowercase words
      - no special characters
      - not semantically overlapping (e.g., if you return "design", do **not** also return "ux design", just return "ux")
      - not in the existing tags list
          `.trim();

    // Build the prompt
    const prompt = `Analyze this saved item and generate 3-8 relevant tags:

    Title: ${input.title || 'No title'}
    Type: ${input.contentType || 'unknown'}
    URL: ${input.url || 'No URL'}
    Description: ${input.description || 'No description'}
    Content excerpt: ${contentExcerpt || 'No content'}
    ${input.thumbnailUrl ? 'Image: Provided below' : ''}

    Current tags: ${input.existingTags?.join(', ') || 'None'}

    Generate tags that:
    - Describe key topics and themes
    - Consider visual elements if an image is provided
    - Are relevant to the content type
    - Are 1-2 words each
    - Are lowercase without special characters
    - Don't duplicate existing tags
    - Would help with categorization and search

    Return only the tags as a JSON array, like ["tag1", "tag2", "tag3"]`;

    try {
      // Build the user message content
      const userContent: any[] = [
        {
          type: 'text',
          text: prompt,
        },
      ];

      // Add image if thumbnail URL is provided
      if (input.thumbnailUrl) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: input.thumbnailUrl,
            detail: 'low', // Use 'low' to save tokens
          },
        });
      }

      // Log the prompt for debugging
      console.log('=== OpenAI Tag Generation ===');
      console.log('Prompt:', prompt);
      if (input.thumbnailUrl) {
        console.log('Including image:', input.thumbnailUrl);
      }

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemMsg,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      try {
        // Remove markdown code block formatting if present
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.slice(7); // Remove ```json
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.slice(3); // Remove ```
        }
        if (cleanResponse.endsWith('```')) {
          cleanResponse = cleanResponse.slice(0, -3); // Remove trailing ```
        }
        cleanResponse = cleanResponse.trim();

        const tags = JSON.parse(cleanResponse);
        if (!Array.isArray(tags)) {
          throw new Error('Response is not an array');
        }
        
        // Validate and clean tags
        return tags
          .filter(tag => typeof tag === 'string' && tag.length > 0)
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0 && tag.length <= 30) // Reasonable length limit
          .slice(0, 7); // Maximum 7 tags
          
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', response);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  },
  
  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  },
};