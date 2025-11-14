export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export class SitemapGenerator {
  static async generateSitemap(): Promise<string> {
    const baseUrl = 'https://grader-marketplace.com';
    const urls: SitemapUrl[] = [];

    // Static pages
    const staticPages = [
      { loc: '/', changefreq: 'daily' as const, priority: 1.0 },
      { loc: '/gallery', changefreq: 'daily' as const, priority: 0.9 },
      { loc: '/parts', changefreq: 'daily' as const, priority: 0.9 },
      { loc: '/about', changefreq: 'monthly' as const, priority: 0.7 },
      { loc: '/contact', changefreq: 'monthly' as const, priority: 0.7 },
      { loc: '/faq', changefreq: 'monthly' as const, priority: 0.6 },
      { loc: '/login', changefreq: 'yearly' as const, priority: 0.5 },
      { loc: '/register', changefreq: 'yearly' as const, priority: 0.5 }
    ];

    // Add static pages
    staticPages.forEach(page => {
      urls.push({
        loc: `${baseUrl}${page.loc}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      });
    });

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
  }

  static async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /
Allow: /gallery
Allow: /parts
Allow: /about
Allow: /contact
Allow: /faq

# Sitemap location
Sitemap: https://grader-marketplace.com/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
  }
}
