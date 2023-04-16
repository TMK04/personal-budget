import express from 'express';

const app = express();

const PORT = process.env.PORT || 4000;

type Envelope = {
  budget: number;
};
type Category = string;
type Username = string;
const username_to_envelopes: Record<Username, Record<Category, Envelope>> = {
  user1: {
    food: { budget: 200 },
    clothes: { budget: 100 },
  },
};

/**
 * * Sample url: http://localhost:4000/user1/envelopes
 */
app.get('/:username/envelopes', (req, res) => {
  const username = req.params.username;
  const envelopes = username_to_envelopes[username];
  if (!envelopes) {
    res.status(404).send(`No envelopes found for ${username}`);
    return;
  }
  res.json(envelopes);
});

app.get('/:username/envelopes/:category', (req, res) => {
  const username = req.params.username;
  const category = req.params.category;
  const envelopes = username_to_envelopes[username];
  if (!envelopes) {
    res.status(404).send(`No envelopes found for ${username}`);
    return;
  }

  const envelope = envelopes[category];
  if (!envelope) {
    res.status(404).send(`Category ${category} not found`);
    return;
  }
  res.json(envelope);
});

app.listen(PORT, () => console.log(`running on port ${PORT}`));
