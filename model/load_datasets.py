import nlp

eli5 = nlp.load_dataset('eli5', cache_dir='./datasets')
wiki40b_snippets = nlp.load_dataset('wiki_snippets', name='wiki40b_en_100_0', cache_dir='./datasets')