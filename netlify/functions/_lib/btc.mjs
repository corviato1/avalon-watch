const ESPLORA_BASE = "https://blockstream.info/api";

async function fetchText(url) {
  const res = await fetch(url, { headers: { accept: "text/plain" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.text()).trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

export async function getTip() {
  const tipHeight = Number(await fetchText(`${ESPLORA_BASE}/blocks/tip/height`));
  const tipHash = await fetchText(`${ESPLORA_BASE}/block-height/${tipHeight}`);
  return { tipHeight, tipHash };
}

export async function getCoinbaseOutputs(blockHash) {
  const txids = await fetchJson(`${ESPLORA_BASE}/block/${blockHash}/txids`);
  const coinbaseTxid = txids?.[0];
  if (!coinbaseTxid) throw new Error("Coinbase txid missing");

  const tx = await fetchJson(`${ESPLORA_BASE}/tx/${coinbaseTxid}`);
  const addresses = (tx.vout || [])
    .map((v) => v?.scriptpubkey_address)
    .filter(Boolean);

  return { coinbaseTxid, addresses, rawTx: tx };
}
