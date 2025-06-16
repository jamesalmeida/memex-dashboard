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
    
    // Use different headers for Instagram to avoid blocking
    const headers = url.includes('instagram.com') ? {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    } : {
      'User-Agent': 'Mozilla/5.0 (compatible; MemexBot/1.0; +https://memex.com/bot)'
    };
    
    console.log('Using headers for Instagram:', url.includes('instagram.com') ? 'Browser-like headers' : 'Bot headers');
    
    const response = await fetch(url, {
      headers,
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
      preview: html.substring(0, 500) + '...'
    });
    
    // Instagram-specific debugging
    if (url.includes('instagram.com')) {
      console.log('=== INSTAGRAM HTML ANALYSIS ===');
      console.log('Full HTML preview (first 1000 chars):', html.substring(0, 1000));
      
      // Check if we got a login page or limited content
      if (html.includes('login') || html.includes('Log in')) {
        console.log('WARNING: Instagram returned login page!');
      }
      if (html.includes('javascript') && html.length < 10000) {
        console.log('WARNING: Instagram returned minimal JavaScript-heavy page!');
      }
      console.log('=== END HTML ANALYSIS ===');
    }
    
    const $ = cheerio.load(html)

    // Extract metadata using various strategies
    const metadata = {
      // Title extraction priority: og:title > title tag > h1
      title: 
        (() => {
          const title = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="twitter:title"]').attr('content') ||
                     $('title').text().trim() ||
                     $('h1').first().text().trim() ||
                     'Untitled';
          
          // For Instagram, extract post content or handle special cases
          if (url.includes('instagram.com')) {
            console.log('=== INSTAGRAM METADATA EXTRACTION ===');
            console.log('Original Instagram title:', title);
            
            // Instagram titles format: "52K likes, 353 comments - iamthirtyaf on June 13, 2025: \"post content\""
            if (title && title.includes(' - ') && title.includes(' on ')) {
              // Extract just the post content after the colon
              const colonIndex = title.indexOf(':');
              if (colonIndex !== -1) {
                let postContent = title.substring(colonIndex + 1).trim();
                // Remove quotes and clean up
                postContent = postContent.replace(/^["']|["']$/g, '').trim();
                // Remove excessive whitespace and newlines for cleaner title
                postContent = postContent.replace(/\s+/g, ' ').trim();
                console.log('Extracted Instagram post content:', postContent);
                return postContent;
              }
            }
            
            // Instagram titles are often just "@username on Instagram", use description instead
            const description = $('meta[property="og:description"]').attr('content') ||
                              $('meta[name="description"]').attr('content');
            
            console.log('Instagram description found:', description);
            
            if (description && description.trim() && !description.includes('See photos and videos')) {
              console.log('Using description as title for Instagram:', description);
              return description.trim();
            }
            
            // If no meaningful description, extract username from title
            const match = title.match(/^(.+?)\s+on\s+Instagram/);
            if (match) {
              console.log('Extracted Instagram username from title:', match[1]);
              return `Post by ${match[1]}`;
            }
            
            console.log('Using original Instagram title:', title);
            return title;
          }
          
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
        (() => {
          // For Instagram, extract post images
          if (url.includes('instagram.com')) {
            console.log('=== INSTAGRAM IMAGE EXTRACTION ===');
            
            // Check all possible image meta tags
            const ogImage = $('meta[property="og:image"]').attr('content');
            const twitterImage = $('meta[name="twitter:image"]').attr('content');
            const twitterImageSrc = $('meta[name="twitter:image:src"]').attr('content');
            const ogVideoThumb = $('meta[property="og:video:thumbnail"]').attr('content');
            const itempropImage = $('meta[itemprop="image"]').attr('content');
            
            console.log('Instagram og:image:', ogImage);
            console.log('Instagram twitter:image:', twitterImage);
            console.log('Instagram twitter:image:src:', twitterImageSrc);
            console.log('Instagram video thumbnail:', ogVideoThumb);
            console.log('Instagram itemprop image:', itempropImage);
            
            // Check image dimensions if available
            const ogImageWidth = $('meta[property="og:image:width"]').attr('content');
            const ogImageHeight = $('meta[property="og:image:height"]').attr('content');
            console.log('Instagram og:image dimensions:', ogImageWidth, 'x', ogImageHeight);
            
            // Look for all og:image tags (carousel might have multiple)
            const allOgImages = [];
            $('meta[property="og:image"]').each((i, elem) => {
              const imgUrl = $(elem).attr('content');
              if (imgUrl) {
                allOgImages.push(imgUrl);
              }
            });
            console.log('All og:image tags found:', allOgImages.length, 'images');
            allOgImages.forEach((img, index) => {
              console.log(`  Image ${index + 1}:`, img);
            });
            
            // Try all available image sources
            let imageUrl = ogVideoThumb || ogImage || twitterImage || twitterImageSrc || itempropImage;
            console.log('Instagram selected image URL:', imageUrl);
            
            // Check if URL contains size parameters and try to get better quality
            if (imageUrl) {
              const urlParts = new URL(imageUrl);
              console.log('Image URL pathname:', urlParts.pathname);
              console.log('Image URL search params:', urlParts.search);
              
              // Check for Instagram CDN URL patterns
              if (imageUrl.includes('_n.jpg') || imageUrl.includes('_n.webp')) {
                console.log('This appears to be a square/cropped Instagram image (ends with _n)');
              }
              if (imageUrl.includes('/s150x150/') || imageUrl.includes('/s320x320/') || imageUrl.includes('/s640x640/')) {
                console.log('This appears to be a sized Instagram image with dimensions in path');
              }
              
              // Try to get uncropped/higher quality version - but keep original as fallback
              if (imageUrl.includes('stp=c') && imageUrl.includes('_dst-jpg')) {
                console.log('Detected cropped Instagram image, attempting to get uncropped version...');
                console.log('Original URL:', imageUrl);
                
                // Keep the original URL as fallback
                const originalUrl = imageUrl;
                
                // Try to remove the cropping parameters (c216.0.648.648a_dst-jpg)
                if (imageUrl.includes('stp=c')) {
                  // Replace cropped version with full size
                  const uncroppedUrl = imageUrl.replace(/stp=c[^&]*_dst-jpg[^&]*/, 'stp=dst-jpg');
                  console.log('Trying uncropped version:', uncroppedUrl);
                  
                  // For now, let's be conservative and only use the original URL
                  // The URL modifications might be breaking valid Instagram CDN URLs
                  console.log('Using original URL to avoid breaking image loading');
                  imageUrl = originalUrl;
                }
              }
            }
            
            return imageUrl;
          }
          
          // For Twitter/X, handle differently
          if (url.includes('twitter.com') || url.includes('x.com')) {
            const ogImage = $('meta[property="og:image"]').attr('content');
            // Skip profile pictures (usually contain 'profile_images' in the URL)
            return ogImage && !ogImage.includes('profile_images') ? ogImage : null;
          }
          
          // Default extraction for other sites
          return $('meta[property="og:video:thumbnail"]').attr('content') ||
                 $('meta[name="twitter:player:image"]').attr('content') ||
                 $('meta[property="og:image"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 $('meta[itemprop="image"]').attr('content');
        })(),

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
          // For Instagram, extract username as author
          if (url.includes('instagram.com')) {
            console.log('=== INSTAGRAM AUTHOR EXTRACTION ===');
            console.log('Instagram URL for author extraction:', url);
            
            const urlObj = new URL(url);
            console.log('Instagram pathname for author:', urlObj.pathname);
            
            // First try to extract from URL structure (user URLs)
            const userMatch = urlObj.pathname.match(/^\/([^/]+)\/(p|reel)\//);
            if (userMatch) {
              console.log('Instagram author from user URL:', userMatch[1]);
              return `@${userMatch[1]}`;
            }
            
            // Handle shared URLs (/reel/id or /p/id) - extract from meta tags
            if (urlObj.pathname.match(/^\/(reel|p)\/[^/]+/)) {
              console.log('Shared Instagram URL detected, extracting author from meta tags');
              
              // Try to extract from og:title - new format: "52K likes, 353 comments - iamthirtyaf on June 13, 2025"
              const title = $('meta[property="og:title"]').attr('content');
              console.log('Instagram og:title for author extraction:', title);
              
              if (title) {
                // Handle engagement format: "likes, comments - username on date"
                let match = title.match(/comments?\s*-\s*([^\s]+)\s+on\s+/);
                if (match) {
                  const username = match[1].trim();
                  console.log('Instagram author from engagement format:', username);
                  return `@${username}`;
                }
                
                // Handle format: "username • Instagram photos and videos"
                match = title.match(/^([^•]+)\s*•\s*Instagram/);
                if (match) {
                  const username = match[1].trim();
                  console.log('Instagram author from title (format 1):', username);
                  return `@${username}`;
                }
                
                // Handle format: "username on Instagram"
                match = title.match(/^(.+?)\s+on\s+Instagram/);
                if (match) {
                  const username = match[1].trim();
                  console.log('Instagram author from title (format 2):', username);
                  return `@${username}`;
                }
                
                // Handle format: "@username"
                match = title.match(/^@([\w.]+)/);
                if (match) {
                  console.log('Instagram author from title (format 3):', match[1]);
                  return `@${match[1]}`;
                }
              }
              
              // Try other meta tags
              const twitterCreator = $('meta[name="twitter:creator"]').attr('content');
              if (twitterCreator) {
                console.log('Instagram author from twitter:creator:', twitterCreator);
                return twitterCreator;
              }
              
              const articleAuthor = $('meta[property="article:author"]').attr('content');
              if (articleAuthor) {
                console.log('Instagram author from article:author:', articleAuthor);
                return articleAuthor;
              }
            }
            
            console.log('Could not extract Instagram author');
          }
          
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
      
      // Instagram-specific fields
      instagram_images: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM MULTIPLE IMAGES EXTRACTION ===');
          
          const images = [];
          
          // Try to find all images in og:image meta tags
          $('meta[property="og:image"]').each((i, elem) => {
            const imageUrl = $(elem).attr('content');
            if (imageUrl) {
              console.log(`Instagram image ${i + 1}:`, imageUrl);
              images.push(imageUrl);
            }
          });
          
          // Also check twitter:image tags
          $('meta[name="twitter:image"]').each((i, elem) => {
            const imageUrl = $(elem).attr('content');
            if (imageUrl && !images.includes(imageUrl)) {
              console.log(`Instagram twitter:image ${i + 1}:`, imageUrl);
              images.push(imageUrl);
            }
          });
          
          console.log('Total Instagram images found:', images.length);
          return images.length > 0 ? images : null;
        }
        return null;
      })(),
      
      instagram_username: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM USERNAME EXTRACTION ===');
          console.log('Full Instagram URL:', url);
          
          const urlObj = new URL(url);
          console.log('Instagram URL pathname:', urlObj.pathname);
          
          // Handle different Instagram URL patterns:
          // /username/p/postid (user posts)
          // /username/reel/reelid (user reels)  
          // /reel/reelid (shared reels - no username in URL)
          // /p/postid (shared posts - no username in URL)
          
          // Check if it's a shared reel or post (starts with /reel/ or /p/)
          if (urlObj.pathname.match(/^\/(reel|p)\/[^/]+/)) {
            console.log('This is a shared reel/post URL - no username in URL structure');
            console.log('Username must be extracted from page meta tags');
            return null;
          }
          
          // Extract from user URLs: /username/p/postid or /username/reel/reelid
          const userMatch = urlObj.pathname.match(/^\/([^/]+)\/(p|reel)\//);
          if (userMatch) {
            console.log('Instagram username from user URL:', userMatch[1]);
            return userMatch[1];
          }
          
          // Extract from profile URLs: /username (no trailing path)
          const profileMatch = urlObj.pathname.match(/^\/([^/]+)\/?$/);
          if (profileMatch && !['p', 'reel', 'stories', 'tv'].includes(profileMatch[1])) {
            console.log('Instagram username from profile URL:', profileMatch[1]);
            return profileMatch[1];
          }
          
          console.log('Could not extract Instagram username from URL structure');
        }
        return null;
      })(),
      
      instagram_post_type: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM POST TYPE DETECTION ===');
          
          const videoUrl = $('meta[property="og:video:url"]').attr('content') ||
                          $('meta[property="og:video"]').attr('content');
          
          console.log('Instagram video URL found:', videoUrl);
          
          if (videoUrl) {
            return 'video';
          }
          
          // Check if it's a carousel (multiple images)
          const images = [];
          $('meta[property="og:image"]').each((i, elem) => {
            const imageUrl = $(elem).attr('content');
            if (imageUrl) images.push(imageUrl);
          });
          
          console.log('Instagram total og:image tags found:', images.length);
          
          // Look for carousel indicators in the HTML content
          const hasCarouselIndicator = html.includes('carousel') || 
                                     html.includes('slide') ||
                                     html.includes('multiple') ||
                                     html.includes('photo carousel') ||
                                     html.includes('photos and videos');
          
          console.log('HTML contains carousel indicators:', hasCarouselIndicator);
          
          // Check description for multiple photo indicators
          const description = $('meta[property="og:description"]').attr('content') || 
                            $('meta[name="description"]').attr('content');
          
          const descriptionHasMultiple = description && 
                                       (description.includes('photos and videos') ||
                                        description.includes('multiple') ||
                                        description.includes('carousel') ||
                                        description.includes('slides'));
          
          console.log('Description indicates multiple images:', descriptionHasMultiple);
          console.log('Description content:', description);
          
          // Check title for carousel indicators
          const title = $('meta[property="og:title"]').attr('content');
          const titleHasMultiple = title && 
                                 (title.includes('photos and videos') ||
                                  title.includes('multiple') ||
                                  title.includes('carousel'));
          
          console.log('Title indicates multiple images:', titleHasMultiple);
          
          // If we have multiple images OR text indicators suggest carousel
          if (images.length > 1 || hasCarouselIndicator || descriptionHasMultiple || titleHasMultiple) {
            console.log('Instagram carousel detected! Reasons:', {
              multipleImages: images.length > 1,
              htmlIndicator: hasCarouselIndicator,
              descriptionIndicator: descriptionHasMultiple,
              titleIndicator: titleHasMultiple
            });
            return 'carousel';
          }
          
          return 'photo';
        }
        return null;
      })(),
      
      // Instagram engagement stats
      instagram_engagement: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM ENGAGEMENT EXTRACTION ===');
          
          const title = $('meta[property="og:title"]').attr('content');
          const description = $('meta[property="og:description"]').attr('content');
          
          console.log('Extracting engagement from title:', title);
          console.log('Extracting engagement from description:', description);
          
          const engagement = {};
          
          // Extract from title: "52K likes, 353 comments - iamthirtyaf on June 13, 2025: \"post content\""
          if (title) {
            const likesMatch = title.match(/([\d,K]+)\s+likes?/i);
            if (likesMatch) {
              let likes = likesMatch[1].replace(/,/g, '');
              if (likes.includes('K')) {
                likes = parseFloat(likes.replace('K', '')) * 1000;
              }
              engagement.likes = parseInt(likes);
              console.log('Extracted likes:', engagement.likes);
            }
            
            const commentsMatch = title.match(/([\d,K]+)\s+comments?/i);
            if (commentsMatch) {
              let comments = commentsMatch[1].replace(/,/g, '');
              if (comments.includes('K')) {
                comments = parseFloat(comments.replace('K', '')) * 1000;
              }
              engagement.comments = parseInt(comments);
              console.log('Extracted comments:', engagement.comments);
            }
            
            // Extract username: "52K likes, 353 comments - iamthirtyaf on June 13"
            const usernameMatch = title.match(/comments?\s*-\s*([^\s]+)\s+on\s+/);
            if (usernameMatch) {
              engagement.username = usernameMatch[1];
              console.log('Extracted username from engagement:', engagement.username);
            }
            
            // Extract post date: "username on June 13, 2025"
            const dateMatch = title.match(/on\s+([A-Za-z]+\s+\d+,\s+\d{4})/);
            if (dateMatch) {
              engagement.post_date = dateMatch[1];
              console.log('Extracted post date:', engagement.post_date);
            }
            
            // Extract clean post description: everything after the colon
            const colonIndex = title.indexOf(':');
            if (colonIndex !== -1) {
              let postDescription = title.substring(colonIndex + 1).trim();
              // Remove quotes
              postDescription = postDescription.replace(/^["']|["']$/g, '').trim();
              // Remove excessive line breaks and clean up
              postDescription = postDescription.replace(/\\n+/g, ' ').trim();
              if (postDescription.length > 10) { // Only if we have meaningful content
                engagement.clean_description = postDescription;
                console.log('Extracted clean description:', postDescription);
              }
            }
          }
          
          // Also try extracting from description
          if (description) {
            const descLikesMatch = description.match(/([\d,]+)\s+likes?/);
            if (descLikesMatch && !engagement.likes) {
              engagement.likes = parseInt(descLikesMatch[1].replace(/,/g, ''));
              console.log('Extracted likes from description:', engagement.likes);
            }
            
            const descCommentsMatch = description.match(/([\d,]+)\s+comments?/);
            if (descCommentsMatch && !engagement.comments) {
              engagement.comments = parseInt(descCommentsMatch[1].replace(/,/g, ''));
              console.log('Extracted comments from description:', engagement.comments);
            }
          }
          
          // Add scrape timestamp
          engagement.scraped_at = new Date().toISOString();
          console.log('Added scrape timestamp:', engagement.scraped_at);
          
          console.log('Final Instagram engagement data:', engagement);
          
          return Object.keys(engagement).length > 1 ? engagement : null; // Only return if we got actual data
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
      })(),
      
      // Instagram-specific username and display name
      instagram_username: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM USERNAME EXTRACTION ===');
          
          const title = $('meta[property="og:title"]').attr('content');
          if (title) {
            // Extract from engagement format: "52K likes, 353 comments - iamthirtyaf on June 13"
            const usernameMatch = title.match(/comments?\s*-\s*([^\s]+)\s+on\s+/);
            if (usernameMatch) {
              const username = usernameMatch[1].trim();
              console.log('Extracted Instagram username:', username);
              return username;
            }
          }
        }
        return null;
      })(),
      
      instagram_display_name: (() => {
        if (url.includes('instagram.com')) {
          console.log('=== INSTAGRAM DISPLAY NAME EXTRACTION ===');
          
          const title = $('meta[property="og:title"]').attr('content');
          if (title) {
            // For Instagram, the username is typically the display name too
            const usernameMatch = title.match(/comments?\s*-\s*([^\s]+)\s+on\s+/);
            if (usernameMatch) {
              const displayName = usernameMatch[1].trim();
              console.log('Extracted Instagram display name:', displayName);
              return displayName;
            }
          }
        }
        return null;
      })()
    }

    console.log('Raw extracted metadata:', metadata);
    
    // Instagram-specific metadata logging
    if (url.includes('instagram.com')) {
      console.log('=== INSTAGRAM FINAL METADATA SUMMARY ===');
      console.log('Instagram Title:', metadata.title);
      console.log('Instagram Description:', metadata.description);
      console.log('Instagram Author:', metadata.author);
      console.log('Instagram Username:', metadata.instagram_username);
      console.log('Instagram Main Image:', metadata.thumbnail_url);
      console.log('Instagram All Images:', metadata.instagram_images);
      console.log('Instagram Post Type:', metadata.instagram_post_type);
      console.log('Instagram Video URL:', metadata.video_url);
      console.log('Instagram Video Type:', metadata.video_type);
      console.log('Instagram Engagement:', metadata.instagram_engagement);
      
      // Debug all meta tags for Instagram
      console.log('=== ALL INSTAGRAM META TAGS ===');
      $('meta').each((i, elem) => {
        const property = $(elem).attr('property');
        const name = $(elem).attr('name');
        const content = $(elem).attr('content');
        
        if ((property && (property.includes('og:') || property.includes('video') || property.includes('image'))) ||
            (name && (name.includes('twitter:') || name.includes('image') || name.includes('video')))) {
          console.log(`Meta tag: ${property || name} = ${content}`);
        }
      });
      
      console.log('=== END INSTAGRAM SUMMARY ===');
    }

    // Clean up the metadata
    const cleanedMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([, value]) => value && value.toString().trim())
    )
    
    console.log('Cleaned metadata:', cleanedMetadata);
    
    // Instagram fallback if we didn't get much data
    if (url.includes('instagram.com') && Object.keys(cleanedMetadata).length < 3) {
      console.log('=== INSTAGRAM FALLBACK PROCESSING ===');
      console.log('Limited metadata detected, applying Instagram fallbacks...');
      
      const urlObj = new URL(url);
      
      // Enhance title
      if (!cleanedMetadata.title || cleanedMetadata.title === 'Instagram') {
        if (urlObj.pathname.startsWith('/reel/')) {
          cleanedMetadata.title = 'Instagram Reel';
        } else if (urlObj.pathname.startsWith('/p/')) {
          cleanedMetadata.title = 'Instagram Post';
        }
      }
      
      // Set post type if not detected
      if (!cleanedMetadata.instagram_post_type) {
        if (urlObj.pathname.startsWith('/reel/')) {
          cleanedMetadata.instagram_post_type = 'reel';
        } else if (urlObj.pathname.startsWith('/p/')) {
          cleanedMetadata.instagram_post_type = 'post';
        }
      }
      
      // Extract post/reel ID
      const idMatch = urlObj.pathname.match(/\/(reel|p)\/([^/]+)/);
      if (idMatch) {
        cleanedMetadata.instagram_post_id = idMatch[2];
        console.log('Extracted Instagram post/reel ID:', idMatch[2]);
      }
      
      console.log('Instagram fallback metadata:', cleanedMetadata);
    }

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
      display_name: cleanedMetadata.display_name,
      // Instagram-specific fields
      instagram_username: cleanedMetadata.instagram_username,
      instagram_images: cleanedMetadata.instagram_images,
      instagram_post_type: cleanedMetadata.instagram_post_type,
      instagram_engagement: cleanedMetadata.instagram_engagement
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