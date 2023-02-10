export class TicketsHelpersService {
  tokenize(text: string, tokens: Record<string, any>): string {
    let newText = text;

    for (const [key, value] of Object.entries(tokens)) {
      newText = newText.replace(new RegExp(`{{ ?${key} ?}}`, 'g'), value);
    }

    return newText;
  }
}
