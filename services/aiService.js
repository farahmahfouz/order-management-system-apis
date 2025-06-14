const axios = require('axios');

exports.generatePromoMessages = async (itemName, price) => {
  const prompt = `
Generate 3 catchy promotional messages for a product named "${itemName}" priced at ${price} EGP.
Include styles suitable for SMS, social media, and email.
Each message should be short, attention-grabbing, and creative.
`;
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mixtral-8x7b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const text = res.data.choices[0].message.content.trim();
  return text.split('\n').filter((line) => line.trim());
};
