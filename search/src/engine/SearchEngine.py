
class SearchEngine:
    def __init__(self, model, passages, index):
        """
            Create search engine based on embeding model and database index.
            @param model - Embeding model for embed question in searchable reprosentation
            @param passages - Database of text passages, which need to return 
            @param index - Index of passages of text, which preform search
        """
        self.model = model
        self.passages = passages
        self.index = index

    def search_passages(self, questions, passages_count):
        """
            Sarch multiple passages of texts for each question,
            @param questions - Questions to search
            @param passages_count - Number of passages to return per each question
        """
        # Embed questtion in representation which can be searched in index
        questions_embeding = self.model.embed_questions(questions)
        # Find batch passages of texts related to questions      
        D, I = self.index.search(questions_embeding, passages_count)
        # Extract texts from passages database
        passages = self.passages.get_batch(I)
        # add seacr score to passage index
        results = self.add_scores_to_passages(passages, D)

        return results

    def add_scores_to_passages(self, passages, D):
        results = []
        for (passages_per_question, scores_per_question) in zip(passages, D):
            passages_per_question = [p.copy() for p in passages_per_question]
            
            for p, score in zip(passages_per_question, scores_per_question):
                p['score'] = float(score)

            results.append(passages_per_question)

        return results

        


        


