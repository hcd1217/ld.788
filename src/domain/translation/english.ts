import BaseLanguage from './base-language.ts';

export default class English extends BaseLanguage {
  protected readonly dictionary: Record<string, string> = {};
}
