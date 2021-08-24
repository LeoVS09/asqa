import logging
from config import settings


class SearchEngine:
    def __init__(self, model, passages, index, reindex_size = 0, meaningfull_size = 100):
        """
            Create search engine based on embeding model and database index.
            @param model - Embeding model for embed question in searchable reprosentation
            @param passages - Database of text passages, which need to return 
            @param index - Index of passages of text, which preform search
        """
        self.model = model
        self.passages = passages
        self.index = index

        self.reindex_size = reindex_size
        self.use_reindex = reindex_size > 0
        self.meaningfull_size = meaningfull_size

    def search_passages(self, questions, passages_count):
        """
            Sarch multiple passages of texts for each question,
            @param questions - Questions to search
            @param passages_count - Number of passages to return per each question
        """
        # Embed questtion in representation which can be searched in index
        logging.debug('Embed questions...')
        questions_embeding = self.model.embed_questions(questions)
        
        # Find batch passages of texts related to questions      
        passages_count_to_search = passages_count
        if self.use_reindex:
            passages_count_to_search = self.reindex_size
        
        logging.debug('Search in index...')
        D, I = self.index.search(questions_embeding, passages_count_to_search)
        
        # Extract texts from passages database
        logging.debug('Retrive passages...')
        passages = self.passages.get_batch(I)
        
        # add seacr score to passage index
        logging.debug('Add score to passages...')
        results = self.add_scores_to_passages(passages, D)

        if self.use_reindex:
            logging.debug('Filter reindex...')
            results = self.filter_reindex_batch(results, passages_count)

        return results

    def add_scores_to_passages(self, passages, D):
        results = []
        for (passages_per_question, scores_per_question) in zip(passages, D):
            passages_per_question = [p.copy() for p in passages_per_question]
            
            for p, score in zip(passages_per_question, scores_per_question):
                p['score'] = float(score)

            results.append(passages_per_question)

        return results

    def filter_reindex_batch(self, founded_batch, passages_count):
        results = []
        for piece in founded_batch:
            results.append(self.filter_reindex(piece, passages_count))

        return results


    def filter_reindex(self, founded, passages_count):
        logging.debug(f'Founded size {len(founded)} and passages count {passages_count}')
        if len(founded) < passages_count:
            return founded

        logging.debug('Filter meaningfull items...')
        # TODO: rewrite alghoritm to not use meaningfull size
        #  better dynamically calcualte which texts parts have bigger size
        meaningfull = list(filter(lambda x: len(x['passage_text']) > self.meaningfull_size, founded))
        if len(meaningfull) == 0:
            # found possibly very big, not will sort, because it possibly not have any meaning
            return founded[-passages_count:]

        if len(meaningfull) <= passages_count:
            return meaningfull

        logging.debug('Sort best items...')
        best = sorted(meaningfull, key=lambda x: x['score'])
        return best[-passages_count:]

        


        


