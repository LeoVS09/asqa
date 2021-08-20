import {gql} from "@apollo/client";

export const searchPassagesGql = gql`
    query SearchPassages($questions: [String!]!) {
        search(input: {
            questions: $questions,
        }){
            nodes {
            question
            passages {
                wiki_id
                score
                article_title
                section_title
                passage_text
            }
            }
        }
    }
`

export const answerGql = gql`
    query Answer($question: String!, $context: String!) {
        answer(input: {
            question: $question,
            context: $context
        }){
            nodes {
            question
            text
            }
        }
    }
`
