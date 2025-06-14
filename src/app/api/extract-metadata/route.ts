import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    console.log('=== Backend API: Extract Metadata Started ===');
    console.log('Received URL:', url);
    
    if (!url) {
      console.log('Error: URL is required');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the webpage
    console.log('Fetching webpage...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MemexBot/1.0; +https://memex.com/bot)'
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000)
    })

    console.log('Fetch response:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log('HTML fetched:', {
      length: html.length,
      preview: html.substring(0, 200) + '...'
    });
    
    const $ = cheerio.load(html)

    // Extract metadata using various strategies
    const metadata = {
      // Title extraction priority: og:title > title tag > h1
      title: 
        (() => {
          let title = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="twitter:title"]').attr('content') ||
                     $('title').text().trim() ||
                     $('h1').first().text().trim() ||
                     'Untitled';
          
          // For Twitter/X, extract display name and username, use description as title
          if (url.includes('twitter.com') || url.includes('x.com')) {
            console.log('Original X/Twitter title:', title);
            
            // If we have a description, use that as the title (the actual tweet content)
            const description = $('meta[property="og:description"]').attr('content') ||
                              $('meta[name="twitter:description"]').attr('content');
            
            if (description && description.trim()) {
              console.log('Using description as title for X/Twitter:', description);
              return description.trim();
            }
            
            // Fallback: try to extract tweet content from title
            const match = title.match(/^.+?\s+on\s+(?:Twitter|X):\s*"?(.+?)"?$/);
            if (match) {
              const tweetContent = match[1].replace(/"$/, ''); // Remove trailing quote if present
              console.log('Extracted tweet content from title:', tweetContent);
              return tweetContent;
            }
            
            // Final fallback: just remove the "on X" part
            const cleanTitle = title.replace(/\s+on\s+(?:Twitter|X)$/, '');
            console.log('Cleaned title (removed "on X"): ', cleanTitle);
            return cleanTitle;
          }
          
          return title;
        })(),

      // Description extraction
      description:
        (() => {
          // For Twitter/X, avoid duplicating the title if we used description as title
          if (url.includes('twitter.com') || url.includes('x.com')) {
            const ogDesc = $('meta[property="og:description"]').attr('content');
            const twitterDesc = $('meta[name="twitter:description"]').attr('content');
            const metaDesc = $('meta[name="description"]').attr('content');
            const itemDesc = $('meta[itemprop="description"]').attr('content');
            
            // Return the first available description
            return ogDesc || twitterDesc || metaDesc || itemDesc;
          }
          
          return $('meta[property="og:description"]').attr('content') ||
                 $('meta[name="twitter:description"]').attr('content') ||
                 $('meta[name="description"]').attr('content') ||
                 $('meta[itemprop="description"]').attr('content');
        })(),

      // Thumbnail/image extraction - prioritize actual content over profile pics
      thumbnail_url:
        $('meta[property="og:video:thumbnail"]').attr('content') ||
        $('meta[name="twitter:player:image"]').attr('content') ||
        // For Twitter, only use og:image if it's not a profile picture
        (() => {
          const ogImage = $('meta[property="og:image"]').attr('content');
          if (ogImage && (url.includes('twitter.com') || url.includes('x.com'))) {
            // Skip profile pictures (usually contain 'profile_images' in the URL)
            return ogImage.includes('profile_images') ? null : ogImage;
          }
          return ogImage;
        })() ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[itemprop="image"]').attr('content'),

      // Profile picture extraction (separate from content thumbnails)
      profile_image:
        (() => {
          const ogImage = $('meta[property="og:image"]').attr('content');
          if (ogImage && (url.includes('twitter.com') || url.includes('x.com'))) {
            // Extract profile picture if og:image contains profile_images
            return ogImage.includes('profile_images') ? ogImage : null;
          }
          return null;
        })(),

      // Video URL extraction
      video_url:
        $('meta[property="og:video:url"]').attr('content') ||
        $('meta[property="og:video:secure_url"]').attr('content') ||
        $('meta[property="og:video"]').attr('content') ||
        $('meta[name="twitter:player:stream"]').attr('content') ||
        $('meta[name="twitter:player"]').attr('content'),

      // Video type and dimensions
      video_type:
        $('meta[property="og:video:type"]').attr('content') ||
        $('meta[name="twitter:player:stream:content_type"]').attr('content'),
      
      video_width: $('meta[property="og:video:width"]').attr('content'),
      video_height: $('meta[property="og:video:height"]').attr('content'),

      // Author extraction
      author:
        (() => {
          // For Twitter/X, use the display name as author
          if (url.includes('twitter.com') || url.includes('x.com')) {
            const title = $('meta[property="og:title"]').attr('content');
            if (title) {
              const match = title.match(/^(.+?)\s+on\s+(?:Twitter|X):/);
              if (match) return match[1].trim();
            }
            
            // Fallback to username
            const titleMatch = title?.match(/@(\w+)/);
            if (titleMatch) return titleMatch[0];
            
            const urlMatch = url.match(/(?:twitter|x)\.com\/(\w+)\/status/);
            if (urlMatch) return `@${urlMatch[1]}`;
          }
          
          return $('meta[property="og:site_name"]').attr('content') ||
                 $('meta[name="author"]').attr('content') ||
                 $('meta[property="article:author"]').attr('content') ||
                 $('meta[name="twitter:creator"]').attr('content');
        })(),

      // Published date
      published_date:
        $('meta[property="article:published_time"]').attr('content') ||
        $('meta[property="og:updated_time"]').attr('content') ||
        $('time[datetime]').attr('datetime'),

      // Additional structured data
      price: $('meta[property="product:price:amount"]').attr('content'),
      
      // YouTube specific
      duration: $('meta[itemprop="duration"]').attr('content'),
      
      // File size for downloads
      file_size: $('meta[property="og:file_size"]').attr('content'),
      
      // Social media specific (Twitter/X)
      likes: $('meta[name="twitter:data1"]').attr('content')?.replace(/[^\d]/g, '') || 
             $('[data-testid="like"]').first().text()?.replace(/[^\d]/g, ''),
      retweets: $('meta[name="twitter:data2"]').attr('content')?.replace(/[^\d]/g, '') ||
                $('[data-testid="retweet"]').first().text()?.replace(/[^\d]/g, ''),
      replies: $('[data-testid="reply"]').first().text()?.replace(/[^\d]/g, ''),
      
      // Extract engagement numbers from page text if available
      views: $('meta[name="twitter:data3"]').attr('content')?.replace(/[^\d]/g, '') ||
             $('[data-testid="views"]').first().text()?.replace(/[^\d]/g, ''),
      
      // Extract username without @ for Twitter/X
      username: (() => {
        if (url.includes('twitter.com') || url.includes('x.com')) {
          console.log('Extracting username from URL and title');
          
          // First try from URL
          const urlMatch = url.match(/(?:twitter|x)\.com\/(\w+)\/status/);
          if (urlMatch) {
            console.log('Extracted username from URL:', urlMatch[1]);
            return urlMatch[1];
          }
          
          // Then try from title
          const title = $('meta[property="og:title"]').attr('content');
          if (title) {
            const titleMatch = title.match(/@(\w+)/);
            if (titleMatch) {
              console.log('Extracted username from title:', titleMatch[1]);
              return titleMatch[1]; // Return without @ symbol
            }
          }
        }
        return null;
      })(),
      
      // Extract display name for Twitter/X
      display_name: (() => {
        if (url.includes('twitter.com') || url.includes('x.com')) {
          const title = $('meta[property="og:title"]').attr('content');
          console.log('Extracting display name from title:', title);
          
          if (title) {
            // Handle format: "dennis (@dennismuellr) on X"
            let match = title.match(/^(.+?)\s+\(@\w+\)\s+on\s+(?:Twitter|X)$/);
            if (match) {
              console.log('Extracted display name (format 1):', match[1].trim());
              return match[1].trim();
            }
            
            // Handle format: "Display Name on X: tweet content"
            match = title.match(/^(.+?)\s+on\s+(?:Twitter|X):/);
            if (match) {
              // Remove username in parentheses if present
              const displayName = match[1].replace(/\s+\(@\w+\)$/, '').trim();
              console.log('Extracted display name (format 2):', displayName);
              return displayName;
            }
            
            // Handle format: "Display Name (@username) on X"
            match = title.match(/^(.+?)\s+\(@\w+\)\s+on\s+(?:Twitter|X)$/);
            if (match) {
              console.log('Extracted display name (format 3):', match[1].trim());
              return match[1].trim();
            }
          }
        }
        return null;
      })(),
      
      // Extract tweet posted date
      tweet_date: (() => {
        if (url.includes('twitter.com') || url.includes('x.com')) {
          // Try to find the date in various meta tags
          const descDate = $('meta[property="og:description"]').attr('content')?.match(/(\d{1,2}:\d{2}\s*[AP]M\s*·\s*\w+\s*\d{1,2},\s*\d{4})/);
          if (descDate) return descDate[1];
          
          // Look for Twitter-specific date format
          const timeTag = $('time').attr('datetime');
          if (timeTag) return timeTag;
        }
        return null;
      })()
    }

    console.log('Raw extracted metadata:', metadata);

    // Clean up the metadata
    const cleanedMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([, value]) => value && value.toString().trim())
    )
    
    console.log('Cleaned metadata:', cleanedMetadata);

    // Log specific fields of interest
    console.log('Key metadata fields:', {
      title: cleanedMetadata.title,
      description: cleanedMetadata.description,
      thumbnail_url: cleanedMetadata.thumbnail_url,
      profile_image: cleanedMetadata.profile_image,
      author: cleanedMetadata.author,
      video_url: cleanedMetadata.video_url,
      video_type: cleanedMetadata.video_type,
      username: cleanedMetadata.username,
      display_name: cleanedMetadata.display_name
    });

    // Ensure thumbnail URL is absolute
    if (cleanedMetadata.thumbnail_url && !cleanedMetadata.thumbnail_url.startsWith('http')) {
      const baseUrl = new URL(url)
      cleanedMetadata.thumbnail_url = new URL(cleanedMetadata.thumbnail_url, baseUrl.origin).href
      console.log('Made thumbnail URL absolute:', cleanedMetadata.thumbnail_url);
    }

    console.log('=== Backend API: Extract Metadata Completed ===');
    return NextResponse.json(cleanedMetadata)

  } catch (error) {
    console.error('Error extracting metadata:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to extract metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}