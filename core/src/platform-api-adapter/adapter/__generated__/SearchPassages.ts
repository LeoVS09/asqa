/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchPassages
// ====================================================

export interface SearchPassages_search_nodes_passages {
  __typename: "Passage";
  /**
   * Id of entity in wikidata, can be linked to wikipedia page
   */
  wiki_id: string | null;
  /**
   * Score of relativity passage to answer, bigger better
   */
  score: number | null;
  article_title: string;
  section_title: string;
  passage_text: string;
}

export interface SearchPassages_search_nodes {
  __typename: "SearchResult";
  question: string;
  /**
   * Passages of texts for question
   */
  passages: SearchPassages_search_nodes_passages[];
}

export interface SearchPassages_search {
  __typename: "SearchResults";
  nodes: SearchPassages_search_nodes[];
}

export interface SearchPassages {
  search: SearchPassages_search;
}

export interface SearchPassagesVariables {
  questions: string[];
}
