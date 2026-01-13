import { CommitType, CommitTypeConfig } from '../types';

export class CommitClassifier {
  classify(message: string): CommitType {
    const lowerMessage = message.toLowerCase();

    for (const [type, config] of Object.entries(CommitTypeConfig)) {
      for (const pattern of config.patterns) {
        if (pattern.test(lowerMessage)) {
          return type as CommitType;
        }
      }
    }

    return CommitType.FEATURE;
  }
}