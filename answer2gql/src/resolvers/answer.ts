import type { IFieldResolver } from '@graphql-tools/utils';
import { AppContext } from 'src/types';

export interface AnswerInput {
  question: string;
  context: string;
}

export interface AnswerArgs {
  input: AnswerInput;
}

export interface Answer {
  text: string;
}

export interface Answers {
  nodes: Answer[];
}

export const answer: IFieldResolver<
  any,
  AppContext,
  AnswerArgs,
  Promise<Answers>
> = async (parent, { input }, context, info) => {
  const answers = await context.answerer.answer(input.question, input.context);
  return {
    nodes: answers.map((text) => ({ text })),
  };
};
