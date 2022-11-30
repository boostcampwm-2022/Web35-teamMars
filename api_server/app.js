const express = require("express");
const { getData } = require("./data/configData");

const PORT = 8080;
let coinInfos = null;
let marketCapInfos = null;

getData().then((result) => {
  coinInfos = result.coinInfos;
  marketCapInfos = result.marketCapInfos;
});

setInterval(() => {
  getData().then((result) => {
    coinInfos = result.coinInfos;
    marketCapInfos = result.marketCapInfos;
  });
}, 60 * 60 * 1000);

const app = express();

app.get("/coin-info/:code", (req, res) => {
  const code = req.params.code;
  if (coinInfos === null) {
    res.status(503).end();
  }
  if (!code || !coinInfos[code]) {
    res.status(404).end();
  }
  res.status(200).send(coinInfos[code]);
});

app.get("/market-cap-info", (req, res) => {
  if (marketCapInfos === null) {
    res.status(503).end();
  }
  res.status(200).send(marketCapInfos);
});

app.listen(PORT, () => {
  console.log(`server listening port ${PORT}`);
});