#!/usr/bin/env node
// backend/scripts/generate_embeddings.js
// Batch job to generate embeddings for all vendors and upsert to Pinecone
const semantic = require('../services/semanticService');

(async () => {
  try {
    console.log('Starting vendor embeddings upsert...');
    await semantic.upsertAllVendorEmbeddings(100);
    console.log('Embeddings upsert completed.');
    process.exit(0);
  } catch (err) {
    console.error('Embeddings upsert failed:', err.message);
    process.exit(1);
  }
})();
