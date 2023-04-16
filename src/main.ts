import express, { Response, json } from 'express';

const app = express();
app.use(json());

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

function error404(res: Response, message: string): void {
  res.status(404).send(message);
}

/**
 * * Sample url: http://localhost:4000/user1/envelopes
 */
app.get('/:username/envelopes', (req, res) => {
  const { username } = req.params;
  if (!(username in username_to_envelopes)) {
    error404(res, `No envelopes found for ${username}`);
    return;
  }
  const envelopes = username_to_envelopes[username];
  res.json(envelopes);
});

app.get('/:username/envelopes/:category', (req, res) => {
  const { username, category } = req.params;
  if (!(username in username_to_envelopes)) {
    error404(res, `No envelopes found for ${username}`);
    return;
  }
  const envelopes = username_to_envelopes[username];

  if (!(category in envelopes)) {
    error404(res, `Category ${category} not found`);
    return;
  }
  const envelope = envelopes[category];
  res.json(envelope);
});

app.post('/:username/envelopes/:category', (req, res) => {
  const { username, category } = req.params;
  if (!(username in username_to_envelopes)) {
    username_to_envelopes[username] = {};
    return;
  }
  const { budget } = req.body;
  username_to_envelopes[username][category] = { budget };
  res.status(201).send(`Allocated ${budget} to ${category}`);
});

app.listen(PORT, () => console.log(`running on port ${PORT}`));
