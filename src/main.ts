import express, { Response, json } from 'express';

const app = express();
app.use(json());

const PORT = process.env.PORT || 4000;

type Envelope = {
  budget: number;
  spending: number;
};
type Category = string;
type Username = string;
const username_to_envelopes: Record<Username, Record<Category, Envelope>> = {
  user1: {
    food: { budget: 200, spending: 0 },
    clothes: { budget: 100, spending: 0 },
  },
};

function error404(res: Response, message: string): void {
  res.status(404).send(message);
}
function isValidNum(num: unknown): num is number {
  return typeof num === 'number' && num >= 0;
}
function isValidStr(str: unknown): str is string {
  return typeof str === 'string' && str.length > 0;
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

app.post('/:username/envelopes/transfer', (req, res) => {
  const { username } = req.params;
  if (!(username in username_to_envelopes)) {
    error404(res, `No envelopes found for ${username}`);
    return;
  }
  const { category_to, category_from, transfer_amt } = req.body;
  if (!isValidStr(category_to)) {
    res.status(400).send("Invalid 'category_to'");
    return;
  }
  if (!isValidStr(category_from)) {
    res.status(400).send("Invalid 'category_from'");
    return;
  }
  if (category_to === category_from) {
    res
      .status(400)
      .send("'category_to' and 'category_from' cannot be the same");
    return;
  }
  if (
    !isValidNum(transfer_amt) ||
    transfer_amt > username_to_envelopes[username][category_from]['budget']
  ) {
    res.status(400).send("Invalid 'transfer_amt'");
    return;
  }

  username_to_envelopes[username][category_to]['budget'] -= transfer_amt;
  username_to_envelopes[username][category_from]['budget'] += transfer_amt;
  res
    .status(200)
    .send(
      `Transfered $ ${transfer_amt} from ${category_from} to ${category_to}`,
    );
});

app.post('/:username/envelopes/:category', (req, res) => {
  const { username, category } = req.params;
  if (!(username in username_to_envelopes)) {
    username_to_envelopes[username] = {};
  }
  const { budget } = req.body;
  if (!isValidNum(budget)) {
    res.status(400).send("Invalid 'budget'");
    return;
  }
  username_to_envelopes[username][category] = { budget, spending: 0 };
  res.status(201).send(`Allocated ${budget} to ${category}`);
});

app.patch('/:username/envelopes/:category', (req, res) => {
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
  const { budget, spending } = req.body;
  const budget_valid = isValidNum(budget);
  if (budget_valid) {
    username_to_envelopes[username][category].budget = budget;
  }
  const spending_valid = isValidNum(spending);
  if (spending_valid) {
    if (
      // If provided budget is invalid, check against current budget
      (budget_valid && spending > budget) ||
      spending > username_to_envelopes[username][category].budget
    ) {
      res.status(400).send("Invalid 'spending'");
      return;
    }
    username_to_envelopes[username][category].spending = spending;
  }
  res.status(200).send(`Updated category ${category}`);
});

app.delete('/:username/envelopes/:category', (req, res) => {
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
  delete username_to_envelopes[username][category];
  res.status(200).send(`Deleted ${category} category`);
});

app.listen(PORT, () => console.log(`running on port ${PORT}`));
