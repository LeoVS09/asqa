/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Answer
// ====================================================

export interface Answer_answer_nodes {
  __typename: "Answer";
  text: string;
}

export interface Answer_answer {
  __typename: "Answers";
  /**
   * List of answers on questions
   */
  nodes: Answer_answer_nodes[];
}

export interface Answer {
  answer: Answer_answer;
}

export interface AnswerVariables {
  question: string;
  context: string;
}
