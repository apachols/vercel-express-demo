const monk = require('monk');
const yup = require('yup');
const { nanoid } = require('nanoid');

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

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required()
});

app.post('/api/url', async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    if (!slug) {
      await schema.validate({
        url
      });
    } else {
      await schema.validate({
        slug,
        url
      });
    }

    if (!slug) {
      slug = nanoid(7);
    }
    slug = slug.toLowerCase();

    const newUrl = {
      url,
      slug
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith('E11000')) {
      error.message = 'Slug in use. 🐛';
    }
    next(error);
  }
});

app.get('/api/:id', async (req, res) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.statusCode = 302;
      res.setHeader('Location', url.url);
      // Make sure to explicitly send a response body with the redirect
      // Otherwise, vercel thinks the response was empty and 502s
      res.end('redirect with a body');
    }
    res.end(`Error: ${slug} not found`);
  } catch (error) {
    res.end(`Error: ${error}`);
  }
});

module.exports = app;
