import pymongo
import logging

DATABASE_NAME = 'search-passages'
COLLECTION_NAME = 'passages'
INDEX_KEY = 'wiki_snippets-wiki_40b_en_100-train-full'

def map_items(items, I):
    items_map = {}

    for item in items:
        items_map[item['index_id']] = item

    results_map = []
    for ids in I:
        results_list = []
        for index_id in ids:
            
            item = items_map.get(index_id)
            if item is not None:
                results_list.append(item)
        
        results_map.append(results_list)

    return results_map

class PassagesDatabaseMongoAdapter:

    def __init__(self, mongodb_url):
        logging.info(f'MongoDb url {mongodb_url}, connecting...')

        self.client = pymongo.MongoClient(mongodb_url)
        self.db = self.client[DATABASE_NAME]
        self.collection = self.db[COLLECTION_NAME]

        self.create_index('index_key')
        self.create_index([
            ("index_key", pymongo.ASCENDING),
            ("index_id", pymongo.ASCENDING)
        ])

    def create_index(self, index):
        logging.info('Creating index for topic...')
        result = self.collection.create_index(index, background=True)
        logging.info(f'Created index {result}')

    def get_num_rows(self):
        result = self.collection.aggregate( [
            { "$match": {"index_key": INDEX_KEY} },
            { "$group": { "_id": None, "count": { "$sum": 1 } } }
        ])
        result = list(result)

        return result[0]['count']

    def get_batch(self, I):
        index_list = [[int(i) for i in i_lst] for i_lst in I]
        index_list = flatten(index_list)

        logging.debug('Execute find query to mongo...')
        items = list(self.collection.find({"index_key": INDEX_KEY, 'index_id': { '$in': index_list}}))

        logging.debug('Calculate results passsage map...')
        results_map = map_items(items, I)

        return results_map

def flatten(t):
    return [item for sublist in t for item in sublist]