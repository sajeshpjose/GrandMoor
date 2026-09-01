#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Lists
  html = html.replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');

  // Numbered lists
  html = html.replace(/<p>\d+\. (.*?)<\/p>/g, '<li>$1</li>');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

// Read all markdown files from content/blog/posts/
const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');
const blogDir = path.join(__dirname, '..', 'blog');

// Ensure blog directory exists
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// Process each markdown file
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

// Collect summary data for each post so we can rebuild the blog listing page below
const posts = [];

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter and content
  const { data, content } = matter(fileContent);

  // Generate slug from filename (keep the date prefix — it's part of the
  // published URL, e.g. /blog/2024-09-12-why-freight-forwarders-own-warehouse)
  const slug = file.replace(/\.md$/, '');
  const htmlFileName = file.replace(/\.md$/, '.html');
  const readTime = Math.ceil(content.split(' ').length / 200);

  // Convert markdown to HTML
  const htmlContent = markdownToHtml(content);

  // Create HTML file with full page structure
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${data.description || ''}">
    <meta name="robots" content="index, follow">
    <title>${data.title} | Grandmoor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }
        .blog-container {
            max-width: 800px;
            margin: 60px auto;
            padding: 0 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 40px;
        }
        .blog-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            font-size: 0.9rem;
            color: #999;
        }
        .blog-category {
            display: inline-block;
            background: #f0f0f0;
            color: #667eea;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        h1 {
            font-size: 2.5rem;
            margin: 30px 0 20px 0;
            line-height: 1.3;
            color: #1a1a1a;
        }
        h2 {
            font-size: 1.8rem;
            margin: 40px 0 20px 0;
            color: #1a1a1a;
        }
        h3 {
            font-size: 1.4rem;
            margin: 30px 0 15px 0;
            color: #1a1a1a;
        }
        p {
            margin-bottom: 20px;
            line-height: 1.8;
        }
        a {
            color: #667eea;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 30px;
            color: #667eea;
            font-weight: 600;
        }
        ul, ol {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        @media (max-width: 768px) {
            .blog-container {
                padding: 20px;
                margin: 20px auto;
            }
            h1 {
                font-size: 1.8rem;
            }
            h2 {
                font-size: 1.4rem;
            }
        }
    </style>
</head>
<body>
    <div class="blog-container">
        <a href="/blog" class="back-link">← Back to Blog</a>

        <div class="blog-meta">
            <span class="blog-category">${data.category || 'Blog'}</span>
            <span>📅 ${new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>⏱️ ${readTime} min read</span>
        </div>

        <h1>${data.title}</h1>

        ${htmlContent}
    </div>
</body>
</html>`;

  // Write HTML file
  const outputPath = path.join(blogDir, htmlFileName);
  fs.writeFileSync(outputPath, fullHtml, 'utf-8');
  console.log(`✅ Generated ${htmlFileName}`);

  posts.push({
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date,
    category: data.category || 'Blog',
    tags: Array.isArray(data.tags) ? data.tags : [],
    image: data.image || '',
    readTime,
  });
});

console.log('🎉 All blog posts converted to HTML!');

// Regenerate the blog listing page (blog/index.html) so newly published posts
// actually show up and are linked from the blog. Individual post pages above
// were always generated correctly, but nothing used to rebuild this listing.
const categoryEmoji = {
  'Thought Leadership': '💡',
  'How-To': '🛠️',
  'Market Insight': '📊',
  'Operations': '📦',
};

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const cardsHtml = posts.map(post => {
  const emoji = categoryEmoji[post.category] || '📄';
  const dateFormatted = post.date
    ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const tagsHtml = post.tags
    .slice(0, 3)
    .map(t => `                        <span class="blog-card-tag">${t}</span>`)
    .join('\n');

  const bannerHtml = post.image
    ? `<img src="${post.image}" alt="${post.title}" style="width:100%;height:200px;object-fit:cover;display:block;">`
    : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:700;">${emoji}</div>`;

  return `            <article class="blog-card">
                <div class="blog-card-image" style="padding:0;overflow:hidden;">${bannerHtml}</div>
                <div class="blog-card-content">
                    <div class="blog-card-category">${post.category}</div>
                    <h2><a href="/blog/${post.slug}" class="blog-card-link">${post.title}</a></h2>
                    <p>${post.description}</p>
                    <div class="blog-card-meta">
                        <span>📅 ${dateFormatted}</span>
                        <span>⏱️ ${post.readTime} min read</span>
                    </div>
                    <div class="blog-card-tags">
${tagsHtml}
                    </div>
                    <a href="/blog/${post.slug}" class="blog-card-link">Read Article →</a>
                </div>
            </article>`;
}).join('\n\n');

const indexPath = path.join(blogDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

const gridStartMarker = '<div class="blog-grid">';
const gridEndMarker = '        </div>\n    </div>\n</body>\n</html>';

const gridStart = indexHtml.indexOf(gridStartMarker);
const gridEnd = indexHtml.indexOf(gridEndMarker, gridStart);

if (gridStart === -1 || gridEnd === -1) {
  console.error('⚠️  Could not find blog-grid section in blog/index.html — skipping listing regeneration.');
} else {
  const updatedIndexHtml =
    indexHtml.slice(0, gridStart) +
    gridStartMarker + '\n' +
    cardsHtml + '\n' +
    gridEndMarker +
    indexHtml.slice(gridEnd + gridEndMarker.length);

  fs.writeFileSync(indexPath, updatedIndexHtml, 'utf-8');
  console.log(`🎉 Blog listing page regenerated with ${posts.length} post(s)!`);
}
