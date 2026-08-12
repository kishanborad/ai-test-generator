import * as webllm from '@mlc-ai/web-llm';
import type { AIMessage, AIResponse, ModelId } from '../types';
import { buildStoryPrompt, buildRecordingPrompt, buildFixPrompt } from './prompts';

let engine: webllm.MLCEngine | null = null;
let currentModel: ModelId | null = null;

const MODEL_MAP: Record<ModelId, string> = {
  'qwen-coder': 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
  'phi-mini': 'Phi-3.5-mini-instruct-q4f16_1-MLC',
};

function post(msg: AIResponse) {
  self.postMessage(msg);
}

async function loadModel(modelId: ModelId) {
  if (currentModel === modelId && engine) {
    post({ type: 'complete', data: 'Model already loaded' });
    return;
  }

  const modelName = MODEL_MAP[modelId];
  engine = new webllm.MLCEngine();

  engine.setInitProgressCallback((report: webllm.InitProgressReport) => {
    post({ type: 'progress', data: report.text, progress: report.progress });
  });

  await engine.reload(modelName);
  currentModel = modelId;
  post({ type: 'complete', data: 'Model loaded' });
}

async function generate(msg: AIMessage) {
  if (!engine) {
    post({ type: 'error', data: 'No model loaded' });
    return;
  }

  let prompt: string;
  if (msg.actions && msg.actions.length > 0) {
    prompt = buildRecordingPrompt(msg.actions, msg.domSnapshot || '');
  } else if (msg.failureContext) {
    prompt = buildFixPrompt(msg.failureContext);
  } else {
    prompt = buildStoryPrompt(msg.userStory || '', msg.domSnapshot || '');
  }

  let fullResponse = '';

  const chunks = await engine.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    max_tokens: 4096,
    temperature: 0.3,
  });

  for await (const chunk of chunks) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      fullResponse += token;
      post({ type: 'token', data: token });
    }
  }

  post({ type: 'complete', data: fullResponse });
}

self.onmessage = async (e: MessageEvent<AIMessage>) => {
  const msg = e.data;
  try {
    switch (msg.type) {
      case 'load-model':
        await loadModel(msg.modelId);
        break;
      case 'generate':
      case 'fix':
        await generate(msg);
        break;
    }
  } catch (err) {
    post({ type: 'error', data: err instanceof Error ? err.message : 'Unknown error' });
  }
};
