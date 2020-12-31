const monk = require('monk');

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
urls.createIndex({ url: 1, slug: 1 }, { unique: true });

const app = require('express')();

app.get('/api', (req, res) => {
  const path = `/api/item/hello-world/`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

app.get('/api/:id', async (req, res) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
      res.next();
    }
    res.redirect(`/?error=${slug} not found`);
    res.next();
  } catch (error) {
    res.redirect(`/?error=Link not found`);
    res.next();
  }
});

module.exports = app;
