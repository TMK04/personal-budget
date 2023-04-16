import express from 'express';

const app = express();

const PORT = process.env.PORT || 4000;

type Envelope = {
  category: string;
  budget: number;
};
type Username = string;
const username_to_envelopes: Record<Username, Envelope[]> = {
  user1: [
    { category: 'food', budget: 200 },
    { category: 'clothes', budget: 100 },
  ],
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

app.listen(PORT, () => console.log(`running on port ${PORT}`));
