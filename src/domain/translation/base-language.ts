export default abstract class BaseLanguage {
  protected abstract readonly dictionary: Record<string, string>;

  translate(key: string, ...args: Array<string | number>): string {
    const value = this.dictionary[key];
    if (!value) {
      console.ignore(`Translation key not found: ${key}`);
      return key;
    }

    return this.#convert(value, ...args);
  }

  #convert(template: string, ...args: Array<string | number>): string {
    let result = template;
    for (const arg of args) {
      result = arg ? result.replace('%s', (arg || '').toString()) : result;
    }

    return result;
  }
}
