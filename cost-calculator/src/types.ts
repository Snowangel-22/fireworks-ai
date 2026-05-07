export interface ModelPricing {
  id: string;
  name: string;
  provider: 'fireworks' | 'openai' | 'anthropic';
  inputPricePerMillion: number;   // USD per 1M input tokens
  outputPricePerMillion: number;  // USD per 1M output tokens
}

export interface CalculatorInputs {
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  requestsPerDay: number;
}

export interface ModelCost {
  model: ModelPricing;
  costPerRequest: number;
  costPerDay: number;
  costPerMonth: number;
}
