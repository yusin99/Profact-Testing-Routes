const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const cors = require('cors'); // Importing cors

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Map offer titles to Stripe price IDs
const priceIds = {
  '30 dossiers': process.env.PRICE_30_DOSSIERS,
  '50 dossiers': process.env.PRICE_50_DOSSIERS,
  '70 dossiers': process.env.PRICE_70_DOSSIERS,
  '90 dossiers': process.env.PRICE_90_DOSSIERS,
  '110 dossiers': process.env.PRICE_110_DOSSIERS,
  '130 dossiers': process.env.PRICE_130_DOSSIERS,
  '170 dossiers': process.env.PRICE_170_DOSSIERS,
  '190 dossiers': process.env.PRICE_190_DOSSIERS,
  '200 dossiers': process.env.PRICE_200_DOSSIERS,
};

app.post('/create-checkout-session', async (req, res) => {
  const { offerTitle, offerPrice } = req.body;

  if (!offerTitle || !offerPrice) {
    return res.status(400).json({ error: 'Missing offerTitle or offerPrice' });
  }

  const priceId = priceIds[offerTitle];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid offerTitle' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Ensure this is a subscription priceId
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.SUCCESS_URL}`,
      cancel_url: `${process.env.CANCEL_URL}`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
