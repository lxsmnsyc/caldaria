import { getReasonPhrase } from 'http-status-codes';

export default class StatusCode extends Error {
  public readonly value: number;

  public readonly reason?: Error;

  constructor(value: number, reason?: Error) {
    super(`${value}: ${getReasonPhrase(value)}`);
    this.reason = reason;
    this.value = value;
  }
}
