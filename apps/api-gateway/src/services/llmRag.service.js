import fs from 'fs/promises';
import axios from 'axios';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/$/, '');

export const isRagIntegrationConfigured = () =>
  Boolean(normalizeBaseUrl(process.env.LLM_SERVICE_URL) || normalizeBaseUrl(process.env.RAG_SERVICE_URL));

export const isRagIntegrationEnabled = () => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  const explicitValue = String(process.env.RAG_INTEGRATION_ENABLED || '').toLowerCase();

  if (['0', 'false', 'no'].includes(explicitValue)) {
    return false;
  }

  return isRagIntegrationConfigured()
    && (
      ['1', 'true', 'yes'].includes(explicitValue)
      || Boolean(normalizeBaseUrl(process.env.RAG_SERVICE_URL))
    );
};

const llmServiceUrl = () => normalizeBaseUrl(process.env.LLM_SERVICE_URL);
const ragServiceUrl = () => normalizeBaseUrl(process.env.RAG_SERVICE_URL);

const withTimeout = (timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
};

export const ingestDocumentWithRag = async (file) => {
  if (!isRagIntegrationEnabled()) {
    return null;
  }

  const timeout = withTimeout(Number.parseInt(process.env.RAG_INGEST_TIMEOUT_MS || '360000', 10));
  const buffer = await fs.readFile(file.path);
  const uploadFormData = () => {
    const formData = new FormData();
    const blob = new Blob([buffer], {
      type: file.mimetype || 'application/octet-stream'
    });

    formData.append('file', blob, file.originalname || file.filename);
    return formData;
  };

  try {
    let lastError;

    if (llmServiceUrl()) {
      try {
        const response = await fetch(`${llmServiceUrl()}/rag/documents/ingest?process=true`, {
          method: 'POST',
          body: uploadFormData(),
          signal: timeout.signal
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.detail || data.error || `RAG ingestion failed with ${response.status}`);
        }

        return data;
      } catch (error) {
        lastError = error;
      }
    }

    if (!ragServiceUrl()) {
      throw lastError || new Error('RAG service URL is not configured');
    }

    const uploadResponse = await fetch(`${ragServiceUrl()}/upload`, {
      method: 'POST',
      body: uploadFormData(),
      signal: timeout.signal
    });
    const uploadData = await uploadResponse.json().catch(() => ({}));

    if (!uploadResponse.ok) {
      throw new Error(uploadData.detail || uploadData.error || `RAG upload failed with ${uploadResponse.status}`);
    }

    const documentId = uploadData.document_id;

    if (!documentId) {
      throw new Error('RAG upload response did not include document_id');
    }

    const processResponse = await fetch(`${ragServiceUrl()}/process/${documentId}`, {
      method: 'POST',
      signal: timeout.signal
    });
    const processData = await processResponse.json().catch(() => ({}));

    if (!processResponse.ok) {
      throw new Error(processData.detail || processData.error || `RAG processing failed with ${processResponse.status}`);
    }

    return {
      documentId,
      filename: uploadData.filename || file.originalname || file.filename,
      status: processData.status || uploadData.status || 'uploaded',
      upload: uploadData,
      processing: processData,
      chunkCount: processData.chunk_count || 0,
      indexedChunkCount: processData.indexed_chunk_count || 0
    };
  } finally {
    timeout.clear();
  }
};

export const queryRag = async ({
  question,
  topK,
  documentIds,
  conversationId,
  generateAnswer = true
}) => {
  if (!isRagIntegrationEnabled()) {
    return null;
  }

  const body = {
    question,
    top_k: topK,
    document_ids: documentIds,
    generate_answer: generateAnswer,
    conversation_id: conversationId
  };
  const timeout = Number.parseInt(process.env.RAG_QUERY_TIMEOUT_MS || '180000', 10);

  const postToRag = async (url, requestBody) => {
    try {
      const { data } = await axios.post(url, requestBody, { timeout });
      return data;
    } catch (error) {
      if (!requestBody.generate_answer) {
        throw error;
      }

      // On timeout or network failure, rethrow — don't silently drop the answer
      const isNetworkError = error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || !error.response;
      if (isNetworkError) {
        throw error;
      }

      // Only fall back to retrieval-only on HTTP errors (e.g. 503 from LLM endpoint)
      const retrievalOnlyBody = {
        ...requestBody,
        generate_answer: false
      };
      const { data } = await axios.post(url, retrievalOnlyBody, { timeout });
      return {
        ...data,
        generationUnavailable: true
      };
    }
  };

  if (llmServiceUrl()) {
    try {
      return await postToRag(`${llmServiceUrl()}/rag/query`, body);
    } catch (error) {
      if (!ragServiceUrl()) {
        throw error;
      }
    }
  }

  return postToRag(`${ragServiceUrl()}/query`, body);
};
