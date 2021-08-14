import pymongo
import logging

DATABASE_NAME = 'search-passages'
COLLECTION_NAME = 'passages'
INDEX_KEY = 'wiki_snippets-wiki_40b_en_100-train-full'

class PassagesDatabaseMongoAdapter:

    def __init__(self, mongodb_url):
        logging.info(f'MongoDb url {mongodb_url}, connecting...')

        self.client = pymongo.MongoClient(mongodb_url)
        self.db = self.client[DATABASE_NAME]
        self.collection = self.db[COLLECTION_NAME]

        logging.info('Creating index for topic...')
        index = self.collection.create_index('index_key')
        logging.info(f'Created index for topic {INDEX_KEY}: {index}')
        
        logging.info('Start initial topic count computation...')
        self.num_rows = self._get_num_rows()
        logging.info(f'Count of rows in index: {self.num_rows}')

    def _get_num_rows(self):
        result = self.collection.aggregate( [
            { "$match": {"index_key": INDEX_KEY} },
            { "$group": { "_id": None, "count": { "$sum": 1 } } }
        ])
        result = list(result)

        return result[0]['count']

    def get_batch(self, I):
        self.collection.find_one({"index_key": INDEX_KEY})
        index_list = [[int(i) for i in i_lst] for i_lst in I]
        index_list = flatten(t)

        items = self.collection.find_one({"index_key": INDEX_KEY, 'index_id': { '$in': index_list}})

        results_map = []
        item_i = 0
        for list in I:
            results_list = []
            for i in range(len(list)):
                results_list.append(list[item_i])
                item_i += 1
            
            results_map.append(results_list)

        return results_map

def flatten(t):
    return [item for sublist in t for item in sublist]