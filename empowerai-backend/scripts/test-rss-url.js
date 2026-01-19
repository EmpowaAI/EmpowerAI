/**
 * Quick script to test RSS feed URLs
 * This helps us find working RSS feeds
 */

const Parser = require('rss-parser');
const parser = new Parser();

const testUrls = [
  'https://www.myjobmag.co.za/feeds/rss.xml',
  'https://www.myjobmag.co.za/feed/',
  'https://www.myjobmag.co.za/jobs/feed/',
  'https://www.myjobmag.co.za/rss.xml',
  'https://jobs.businessinsider.co.za/rss',
  'https://www.careers24.com/rss',
  'https://www.careerjet.co.za/rss/jobs.xml?l=south+africa',
  'https://www.alljobs.co.za/rss',
];

async function testRssUrls() {
  console.log('Testing RSS feed URLs...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`✅ SUCCESS - Found ${feed.items?.length || 0} items`);
      if (feed.title) console.log(`   Title: ${feed.title}`);
      if (feed.items && feed.items.length > 0) {
        console.log(`   First item: ${feed.items[0].title}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ FAILED - ${error.message.substring(0, 100)}`);
      console.log('');
    }
  }
}

testRssUrls();
