export class AppError {
  readonly #error: Error | undefined;
  readonly #code: string | undefined;
  readonly #message: string | undefined;

  constructor({
    error,
    code,
    message,
  }: {
    error: Error | undefined;
    code: string | undefined;
    message: string | undefined;
  }) {
    this.#error = error;
    this.#code = code ?? undefined;

    if (message) {
      this.#message = message || 'Unknown error';
    }
  }

  get errorDetail() {
    return {
      code: this.#code,
      message: this.#message,
      error: this.#error,
    };
  }
}
