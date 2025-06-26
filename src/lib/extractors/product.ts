import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { ProductMetadata } from '@/types/metadata';
import { URL_PATTERNS } from '@/lib/contentTypes/patterns';

export class ProductExtractor extends BaseExtractor {
  constructor() {
    super('product');
  }

  canHandle(url: string): boolean {
    // Check if URL matches any e-commerce patterns
    const patterns = [
      ...(URL_PATTERNS.amazon || []),
      ...(URL_PATTERNS.etsy || []),
      ...(URL_PATTERNS.ebay || []),
      ...(URL_PATTERNS.shopify || []),
      ...(URL_PATTERNS.product || []),
    ];
    
    return patterns.some(pattern => pattern.test(url.toLowerCase()));
  }

  async extract(options: ExtractorOptions): Promise<ExtractorResult> {
    const { url, html, $ } = options;
    
    // Parse HTML if not already parsed
    const doc = $ || (html ? this.parseHtml(html) : this.parseHtml(await this.fetchHtml(url)));
    
    // Extract OpenGraph data
    const ogData = this.extractOpenGraphData(doc);
    
    // Extract product-specific OpenGraph metadata
    const productData = this.extractProductData(doc);
    
    // Extract basic metadata
    const baseMetadata = this.extractBasicMetadata(doc, url);
    
    // Combine all metadata
    const metadata: ProductMetadata = {
      ...baseMetadata,
      contentType: 'product',
      category: 'ecommerce',
      productId: productData.productId,
      brand: productData.brand,
      price: productData.price && productData.currency ? {
        current: productData.price,
        original: productData.originalPrice,
        currency: productData.currency,
        discount: productData.discount,
      } : undefined,
      availability: productData.availability as ProductMetadata['availability'],
      rating: productData.rating && productData.reviewCount ? {
        average: productData.rating,
        count: productData.reviewCount,
      } : undefined,
      specifications: productData.specifications,
    };
    
    return {
      metadata: this.cleanMetadata(metadata),
      confidence: this.calculateConfidence(metadata),
      source: 'scraping',
    };
  }
  
  private extractProductData(doc: cheerio.CheerioAPI): {
    price?: number;
    originalPrice?: number;
    currency?: string;
    discount?: number;
    availability?: string;
    brand?: string;
    category?: string;
    condition?: string;
    retailerPartNo?: string;
    productId?: string;
    rating?: number;
    reviewCount?: number;
    specifications?: Record<string, string>;
  } {
    const productData: any = {};
    
    // Extract product-specific OpenGraph tags
    const productTags = [
      'product:price:amount',
      'product:price:currency',
      'product:availability',
      'product:brand',
      'product:category',
      'product:condition',
      'product:retailer_part_no',
      'product:product_id',
    ];
    
    productTags.forEach(tag => {
      const value = doc(`meta[property="${tag}"]`).attr('content');
      if (value) {
        const key = tag.split(':').pop()?.replace(/_/g, '');
        if (key) {
          switch (key) {
            case 'amount':
              productData.price = parseFloat(value);
              break;
            case 'currency':
              productData.currency = value;
              break;
            case 'availability':
              productData.availability = value;
              break;
            case 'brand':
              productData.brand = value;
              break;
            case 'category':
              productData.category = value;
              break;
            case 'condition':
              productData.condition = value;
              break;
            case 'retailerpartno':
              productData.retailerPartNo = value;
              break;
            case 'productid':
              productData.productId = value;
              break;
          }
        }
      }
    });
    
    // Extract rating if available
    const ratingValue = doc(`meta[property="product:rating:value"]`).attr('content');
    const ratingScale = doc(`meta[property="product:rating:scale"]`).attr('content');
    if (ratingValue) {
      productData.rating = parseFloat(ratingValue);
    }
    
    // Extract review count
    const reviewCount = doc(`meta[property="product:review_count"]`).attr('content');
    if (reviewCount) {
      productData.reviewCount = parseInt(reviewCount);
    }
    
    // Fallback to schema.org Product data
    const schemaProduct = doc('script[type="application/ld+json"]')
      .toArray()
      .map(el => {
        try {
          return JSON.parse(doc(el).html() || '');
        } catch {
          return null;
        }
      })
      .find(data => data?.['@type'] === 'Product' || data?.['@type']?.includes('Product'));
    
    if (schemaProduct) {
      if (!productData.price && schemaProduct.offers?.price) {
        productData.price = parseFloat(schemaProduct.offers.price);
      }
      if (!productData.currency && schemaProduct.offers?.priceCurrency) {
        productData.currency = schemaProduct.offers.priceCurrency;
      }
      if (!productData.availability && schemaProduct.offers?.availability) {
        productData.availability = schemaProduct.offers.availability.replace('https://schema.org/', '');
      }
      if (!productData.brand && schemaProduct.brand?.name) {
        productData.brand = schemaProduct.brand.name;
      }
      if (!productData.rating && schemaProduct.aggregateRating?.ratingValue) {
        productData.rating = parseFloat(schemaProduct.aggregateRating.ratingValue);
      }
      if (!productData.reviewCount && schemaProduct.aggregateRating?.reviewCount) {
        productData.reviewCount = parseInt(schemaProduct.aggregateRating.reviewCount);
      }
    }
    
    return productData;
  }
  
  private calculateConfidence(metadata: ProductMetadata): number {
    let confidence = 0.5; // Base confidence for product URL pattern match
    
    // Increase confidence based on available data
    if (metadata.price) confidence += 0.1;
    if (metadata.brand) confidence += 0.1;
    if (metadata.availability) confidence += 0.1;
    if (metadata.productId) confidence += 0.1;
    if (metadata.rating) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}