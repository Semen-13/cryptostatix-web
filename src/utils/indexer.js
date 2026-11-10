import fs from 'fs';
import path from 'path';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function submitToGoogleIndex(slug) {
  const domain = 'https://cryptostatix.pp.ua';
  const articleUrl = `${domain}/${slug.replace(/^\/+/, '')}`;
  const currentDate = new Date().toISOString().split('T')[0];

  // 1. Обновление sitemap.xml
  try {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    let sitemapContent = "";

    if (fs.existsSync(sitemapPath)) {
      sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    } else {
      sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }

    if (!sitemapContent.includes(articleUrl)) {
      const newUrlEntry = `
  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
  </url>`;

      sitemapContent = sitemapContent.replace('</urlset>', `${newUrlEntry}\n</urlset>`);
      fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
      console.log(`📄 Sitemap обновлен новой ссылкой: ${articleUrl}`);
    }
  } catch (err) {
    console.warn('⚠️ Ошибка обновления sitemap.xml:', err.message);
  }

  // 2. Отправка пинга в Google Indexing API
  try {
    const serviceAccountEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
      console.warn("⚠️ Google Indexing API креды не настроены в переменных окружения.");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    });

    const accessToken = tokenResponse.data.access_token;

    const indexingResponse = await axios.post(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        url: articleUrl,
        type: 'URL_UPDATED'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`⚡ Google Indexing API успешно уведомлен для: ${articleUrl}`, indexingResponse.data);
  } catch (err) {
    console.warn('⚠️ Ошибка отправки в Google Indexing API:', err.response?.data || err.message);
  }
}