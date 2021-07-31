#!/usr/bin/env python
# coding: utf-8

# # Resarch for QA system
# 
# Research based on https://github.com/huggingface/notebooks/blob/master/longform-qa/Long_Form_Question_Answering_with_ELI5_and_Wikipedia.ipynb

# In[1]:


# plotly standard imports
import plotly.graph_objs as go
import chart_studio.plotly as py

# Cufflinks wrapper on plotly
import cufflinks

# Data science imports
import pandas as pd
import numpy as np

# Options for pandas
pd.options.display.max_columns = 30

# Display all cell outputs
from IPython.core.interactiveshell import InteractiveShell
InteractiveShell.ast_node_interactivity = 'all'

from plotly.offline import iplot, init_notebook_mode
cufflinks.go_offline(connected=True)
init_notebook_mode(connected=True)

# Set global theme
cufflinks.set_config_file(world_readable=True, theme='pearl')


# ## Prepare datasets
# 
# The training relies on two datasets: ELI5, a processed version of the r/explainlikeimfive subreddit, and the Wiki40b Wikipedia image. You can download both using the 🤗nlp linrary with:

# In[2]:


import nlp
eli5 = nlp.load_dataset('eli5', cache_dir='./datasets')
wiki40b_snippets = nlp.load_dataset('wiki_snippets', name='wiki40b_en_100_0', cache_dir='./datasets')['train']


# Additionally, all of the useful methods used in this notebook are compiled in the lfqa_utils.py script:
# 
# 

# In[3]:


from lfqa_utils import *


# ## Task and Data Description
# 
# Let's recap: we are interested in the task of Long Form Question Answering. As in other Question Answering tasks, the model is presented with a question, and is required to generate a natural language answer. Whereas a majority of QA datasets contain mostly factoid questions, where the answer, such as a date or the name of a single entity, can be expressed in a few words or single sentence, Long Form QA focuses on questions which call for an explanation consisting of a few sentences or a few paragraphs.
# 
# In order to teach a model to answer such questions, we use questions and answers written by Reddit users. Note that the nlp.load_dataset command above actually downloaded questions and their associated answers from the r/explainlikeimfive, r/askscience, and r/AskHistorians subreddits. We focus here on the ELI5/explainlikeimfive part to train the system, as these examples tend to be a little simpler.

# In[4]:


eli5['test_eli5'][12345]


# Each enttity can have multiple answers rated by score
# 
# 

# In[5]:



wiki40b_snippets[8991855]


# Here, we choose to give the model access to Wikipedia text. Full Wikipedia articles are typically too long for most current models to handle, and notable exceptions like the Reformer or Longformer architectures unfortunately do not yet have pre-trained sequence-to-sequence variants. Thus, we follow previous work in splitting Wikipedia articles into disjoint snippets of 100 words, and keep track of the title of the article and sections a snippet came from. Here's how you can get a pre-processed Wiki40b version split into 100-word passages with the nlp library, and an example snippet which has some of the information we're looking for ("little conduction would occur since air is a poor conductor of heat"):
# 
# 

# ## Sparse Retrieval: Making Support Documents with ElasticSearch
# 
# In this section, we show how to use either such a "classical" Information Retrieval (IR) system based on sparse word matching with ElasticSearch, an extremely popular and efficient search engine that can be used for finding documents that match a given query based on word overlap.
# 
# Specifically, ElasticSearch provides a convenient way to index documents so they can easily be queried for nearest neighbor search using the BM25 similarity function (which relies on TF-IDF weighting of words). While this word-matching based approach has obvious limitations, such as failing to take synonyms and sometimes grammatical variation into account, it does pretty well overall and has only recently been overtaken by embedding-based systems for Wikipedia-based Open-Domain QA tasks.
# 
# If you starting in docker, elasticsearch will be running in separate container

# In[6]:


es_client = Elasticsearch([{'host': 'elasticsearch', 'port': '9200'}])


# Here's the command to create the index, it should take one to three hours depending on your system.

# In[7]:


if not es_client.indices.exists('wiki40b_snippets_100w'):
    make_es_index_snippets(es_client, wiki40b_snippets, index_name='wiki40b_snippets_100w')


# Now let's test the ElasticSearch retriever with our running example ELI5 question about skin-to-water heat transfer by returning the 10 best candidate passages:

# In[8]:


question = eli5['test_eli5'][12345]['title']
doc, res_list = query_es_index(question, es_client, index_name='wiki40b_snippets_100w')

df = pd.DataFrame({
    'Article': ['---'] + [res['article_title'] for res in res_list],
    'Sections': ['---'] + [res['section_title'] if res['section_title'].strip() != '' else res['article_title']
                 for res in res_list],
    'Text': ['--- ' + question] + [res['passage_text'] for res in res_list],
})
df.style.set_properties(**{'text-align': 'left'})


# We can immediately see both the strengths and limitations of this approach. The system manages to retrieve documents that are all broadly on topic, mentioning some combination of water, air, relative temperature, and temperature transfer. In spite of this, only example 8 ends up containing information that is actually relevant to the question:
# 
# Cold air with high relative humidity "feels" colder than dry air of the same temperature because high humidity in cold weather increases the conduction of heat from the body.
# 
# We got lucky this time, but this passage could as easily have been ranked 11th and not been included in the support document we provide to the answer generation system. As it is, the model will have to sort through mostly off-topic information to find this sentence when reading the resulting supporting document.
# 
# ## Retrieving Support Documents with an ELI5-Trained Dense Model
# 
# 
# The sparse retriever works by finding passages which feature the words from the query. However, it has no way to know *a priori* which of these words are more important in context, and seems to struggle with understanding the central theme of the query (human-perceived temperature).
# 
# Thankfully, some recent works have taken advantage of advances in pre-trained contextual word representations to solve this problem. Models such as [DPR](https://arxiv.org/abs/2004.04906) or [REALM](https://arxiv.org/abs/2002.08909) for example learn to compute a vector representation of the query, as well as vector representations of Wikipedia passages in such a way that the passages that best answers a question maximize the dot product between the two representations. Retrieval is then reduced to a Maximum Inner Product Search, which can be executed efficiently using systems like [FAISS](https://github.com/facebookresearch/faiss).
# 
# These successes are very encouraging for our Open-Domain Long Form QA application. However, our task and setup do not quite meet the requirements of either of either of these approaches. On the one hand, the [DPR](https://arxiv.org/abs/2004.04906) system is trained using gold passage annotations: most major QA dataset tell the system which Wikipedia passage contains the answer. Unfortunately, we do not have such annotations for the ELI5 data. On the other hand, while [REALM](https://arxiv.org/abs/2002.08909) is trained without passage supervision, it requires a pretty expensive pre-training step with an [Inverse Cloze Task](https://arxiv.org/abs/1906.00300) (100,000 steps with batch size 4096), and the ability to re-compute the embeddings of all Wikipedia passages regularly during training.
# 
# In order to train a similar dense retrieval system at reduced cost without having access to gold passage annotation, we will have to **take advantage of another unique feature of our dataset**, namely the fact that the long form answers are quite similar in style to the Wikipedia passages we want to index. Our hypothesis then is that if we train a system to embed the questions and answers in our dataset in a way that allows us to easily match questions to answers, then using the answer embedder on Wikipedia passages should allow us to similarly match questions to supporting evidence from Wikipedia.
# 
# ### Contrastive Training with ELI5 In-Batch Negatives
# 
# As mentioned above, we want to train a system to produce question and answer embeddings, such that the dot product between the representation of a question and any of its answers is greater than between it and answers of all of the other questions in the dataset.  
# 
# Unfortunately, actually comparing all questions to all answers before taking every single gradient step is computationally prohibitive: instead, we follow previous work in simply processing medium to large batches of question-answer pairs, and making sure that the dot product of a question with its answer is larger than with all other answers in the batch, and *vice versa*.  
# 
# We use a cross-entropy loss for the multinomial distribution over all of the answers (or questions) in a batch, and make use of [PyTorch gradient checkpointing](https://pytorch.org/docs/stable/checkpoint.html) to be able to use large batches with limited GPU memory: you can find all implementation details in the `RetrievalQAEmbedder` class in `eli5_utils.py`.
# 
# ---
# We use a single BERT-style pre-trained model to embed the questions and answers, and learn different projection matrices to bring both representations down to dimension 128: the projection matrices are trained from scratch as the sentence embedding model is fine-tuned. We found that the 8-layer distilled version of BERT from the Well-Read Students Learn Better paper performed as well or better as full BERT for a notable gain in computation speed: if you want an even faster model, that work provides pre-trained models spanning the full range of computation/accuracy trade-offs.
# 
# The model can than be trained with the following code: with batch size 32/512 on a single 16GB GPU, you can run 10 training epochs in under 6 hours.

# In[ ]:


# training arguments
class ArgumentsQAR():
    def __init__(self):
        self.batch_size = 512
        self.max_length = 128
        self.checkpoint_batch_size = 32
        self.print_freq = 100
        self.pretrained_model_name = "google/bert_uncased_L-8_H-768_A-12"
        self.model_save_name = "retriever_models/eli5_retriever_model_l-8_h-768_b-512-512"
        self.learning_rate = 2e-4
        self.num_epochs = 10

qar_args = ArgumentsQAR()

# prepare torch Dataset objects
qar_train_dset = ELI5DatasetQARetriver(eli5['train_eli5'], training=True)
qar_valid_dset = ELI5DatasetQARetriver(eli5['validation_eli5'], training=False)

# load pre-trained BERT and make model
qar_tokenizer, qar_model = make_qa_retriever_model(
        model_name=qar_args.pretrained_model_name,
        from_file=None,
        device="cuda:0"
)

# train the model
train_qa_retriever(qar_model, qar_tokenizer, qar_train_dset, qar_valid_dset, qar_args)


# If you don't want to train the model yourself, you can also download trained weights from the [Hugging Face model repository](https://huggingface.co/models) with:

# In[9]:


qar_tokenizer = AutoTokenizer.from_pretrained('yjernite/retribert-base-uncased', cache_dir='./tokenaizers')
qar_model = AutoModel.from_pretrained('yjernite/retribert-base-uncased', cache_dir='./models').to('cuda:0')
_ = qar_model.eval()


# Once the model is trained, it can be used to compute passage embeddings for all Wikipedia snippets. The `make_qa_dense_index` method takes advantage of `numpy` memory-mapping, so embeddings are written directly to disk. Again with a single GPU, computing the full set of passage embeddings should take about 18 hours.

# In[10]:


import os

if not os.path.isfile('wiki40b_passages_reps_32_l-8_h-768_b-512-512.dat'):
    make_qa_dense_index(
        qar_model, qar_tokenizer, wiki40b_snippets, device='cuda:0',
        index_name='wiki40b_passages_reps_32_l-8_h-768_b-512-512.dat'
    )


# ### Using the Trained Dense Retriever and Wikipedia Index
# 
# Now that we have trained our model to compute query and answer embeddings and used it to compute passage embeddings for all our Wikipedia snippets, let's see whether it can actually find supporting evidence for a new question. Recall the the two steps to using the dense retriever: we first compute an embedding for a new question, then do Max Inner Product Search with the pre-computed passage representations.
# 
# ---
# 
# At test time, the Retriever Model encodes the question, and compares its embedding to the pre-computed representation of
# all the Wikipedia passages. The ten passages with the closest embedding are returned to create the support document.
# 
# ---
# 
# The MIPS part can be executed efficiently with the `faiss` library. Additionally, since we computed 128-dimensional passage embeddings, the whole of the representations fits on a GPU, making retrieval even faster. We can create the `faiss_gpu` index with the following code:

# In[11]:


# faiss_res = faiss.StandardGpuResources()
wiki40b_passage_reps = np.memmap(
            'wiki40b_passages_reps_32_l-8_h-768_b-512-512.dat',
            dtype='float32', mode='r',
            shape=(wiki40b_snippets.num_rows, 128)
)

# wiki40b_index_flat = faiss.IndexFlatIP(128)
# wiki40b_gpu_index = faiss.index_cpu_to_gpu(faiss_res, 0, wiki40b_index_flat)
# wiki40b_gpu_index.add(wiki40b_passage_reps)

wiki40b_index_flat = faiss.IndexFlatIP(128)

wiki40b_index_flat.add(wiki40b_passage_reps)


# Now we can use the `query_qa_dense_index` function to query the dense index for our running example question about perceived temperature:

# In[12]:


question = eli5['test_eli5'][12345]['title']
doc, res_list = query_qa_dense_index(question, qar_model, qar_tokenizer, wiki40b_snippets, wiki40b_index_flat, device='cuda:0')

df = pd.DataFrame({
    'Article': ['---'] + [res['article_title'] for res in res_list],
    'Sections': ['---'] + [res['section_title'] if res['section_title'].strip() != '' else res['article_title']
                 for res in res_list],
    'Text': ['--- ' + question] + [res['passage_text'] for res in res_list],
})
df.style.set_properties(**{'text-align': 'left'})


# The retrieved documents are quite different from the ones returned by the sparse retrieval, with a greater focus on how water helps draw heat from a body, either through evaporation or through better conduction, which is information the model needs to answer this question.
# 
# The retriever still misses out on one aspect of the query: the way the question is formulated implies that in the considered scenario the person is immersed in water rather than just wet, which makes the "latent heat" and evaporation arguments a little less relevant, but that's a really subtle distinction!
# 
# ### Retriever Model Evaluation
# 
# We have trained a retrieval model that *seems* to be working a little better than the traditional word-matching based approach, at least on our running example. Before we use it to actually answer questions, however, we would like to be able to get some **quantitative evaluation** of the performances of both approaches.
# 
# For the retriever, we want to favor **recall** over precision: our first priority is to make sure that all of the information needed to write the answers is present in the support document. If there is unrelated information, the generation model can learn to sort it out. We measure this by computing the proportion of words in the high-scoring answers which are present in the retrieved support document. To focus on important words, we also weigh answer words by their *Inverse Document Frequency*. This gives us the following **IDF-recall** scoring function:

# In[13]:


# We first select high-scoring answers (answers beyond the first must have a score of at least 3)
test_qa_list = [(exple['title'],
                ' '.join([a 
                          for i, (a, sc) in enumerate(zip(exple['answers']['text'], exple['answers']['score'])) \
                          if i == 0 or sc >= 3
                         ]))
                for exple in eli5['test_eli5']]

# We then compute word frequencies in answer text
answer_doc_freq = {}
for q, a in test_qa_list:
    for w in a.lower().split():
        answer_doc_freq[w] = answer_doc_freq.get(w, 0) + 1

# The IDF-recall function is then:
def da_idf_recall(doc, answer):
    d_words = dict([(w, True) for w in doc.lower().split()])
    a_words = answer.lower().split()   
    recall = sum([1. / math.log(1 + answer_doc_freq.get(w, 1)) for w in a_words if w in d_words]) /                 sum([1. / math.log(1 + answer_doc_freq.get(w, 1)) for w in a_words])
    return recall


# The `evaluate_retriever` function in `eli5_utils.py` takes a retrieval and scoring function and computes both the average retrieval time and score of the document relative the the provided answer. Let's write some short-hand functions for the dense and sparse retrievers with our currently loaded indexes, and evaluate them on the ELI5 test set (be advised that evaluating the retriever on the full test set takes up to two hours):

# In[ ]:


def dense_ret_for_eval(question, n_ret):
    _, dense_res_list = query_qa_dense_index(
        question, qar_model, qar_tokenizer, wiki40b_snippets, wiki40b_index_flat, n_results=n_ret, device='cuda:0'
    )
    dense_doc = ' '.join([res['passage_text'] for res in dense_res_list])
    return dense_doc

def sparse_ret_for_eval(question, n_ret):
    _, sparse_res_list = query_es_index(
        question, es_client, index_name='wiki40b_snippets_100w', n_results=n_ret
    )
    sparse_doc = ' '.join([res['passage_text'] for res in sparse_res_list])
    return sparse_doc

dense_score = evaluate_retriever(test_qa_list, dense_ret_for_eval, da_idf_recall)
sparse_score = evaluate_retriever(test_qa_list, sparse_ret_for_eval, da_idf_recall)

df = pd.DataFrame({
    'IDF-Recall': [sparse_score['idf_recall'], dense_score['idf_recall']],
    'Time/Query': [sparse_score['retrieval_time'], dense_score['retrieval_time']],
}, index=[ 'Sparse', 'Dense'])
df.style.format({'IDF-Recall': "{:.4f}", 'Time/Query': "{:.4f}"})


# This metric obviously has limitations. Since it only looks at individual word matches, it is oblivious to *word order* or *paraphrases* among others. However, we can be encouraged by the fact that the dense retriever not only yields **higher IDF-recall**, it also takes **less than a third of the time** of the ElasticSearch-based system! Considering these results, we can confidently use it for the next part: training the sequence-to-sequence answer generation system.
# 
# ## Generating Answers with a Sequence-to-Sequence Model
# 
# Now that we know how to create an evidence document with supporting information for a given question, let's look into training the second component of our system: the **answer generation module**. We will instantiate it as a sequence-to-sequence model which uses the [BART](https://arxiv.org/abs/1910.13461) architecture, and initialize it with the [bart-large pretrained weights](https://huggingface.co/facebook/bart-large).  
# 
# In short, the [BART paper](https://arxiv.org/abs/1910.13461) uses a denoising auto-encoder style objective to pre-train an encoder-decoder model (similarly to how masked language modeling is used to pre-trained BERT-style encoders). Among other applications, they show that large-scale pre-training with their objective followed by fine-tuning on ELI5 data yields the state-of-the-art ROUGE performance for the original version of the dataset (which uses pre-computed support documents made from CommonCrawl pages).
# 
# We provide the concatenation of the question and support document as input to the model, and train the decoder to minimize the perplexity of the gold answer. One notable choice is that **we train the model using all high-scoring answers in the training set**, so the model will see several instances of the same question-document input with different outputs. The supporting passages are separated by a special token `<P>`, so the input for our running example will look like:
# 
# > question: Why does water heated to room temperature feel colder than the air around it? context: \\<P\> when the skin is completely wet. The body continuously loses ... this heat comes from the liquid itself and the surrounding gas and surfaces. \\<P\> protected by a glass panel. Consequently, these types of collectors... Since heat loss due to convection cannot cross a vacuum, it forms an efficient isolation mechanism to keep heat inside the collector pipes. Since two flat \\<P\> ... \\<P\> changes. Conduction On... Fluids—especially gases—are less conductive. Thermal contact conductance is the study of heat conduction between solid bodies in contact. The process of heat transfer
# 
# The first thing we do is pre-compute the support documents for the training and validation sets so we can use all available GPUs to train the sequence-to-sequence model. The model is then trained with the `train_qa_s2s` function in `eli5_utils.py`. A 16GB GPU accomodates up to two examples at a time, so here is the code to train the model using 4 GPUs with `torch.nn.DataPArallel`. One epoch should take about 18 hours:

# In[ ]:


# pre-computing support documents
eli5_train_docs = []
for example in eli5['train_eli5']:
    support_doc, dense_res_list = query_qa_dense_index(
        example['title'], qar_model, qar_tokenizer, wiki40b_snippets, wiki40b_gpu_index, n_results=n_ret
    )
    eli5_train_docs += [(example['q_id'], support_doc, dense_res_list)]

eli5_valid_docs = []
for example in eli5['validation_eli5']:
    support_doc, dense_res_list = query_qa_dense_index(
        example['title'], qar_model, qar_tokenizer, wiki40b_snippets, wiki40b_gpu_index, n_results=n_ret
    )
    eli5_valid_docs += [(example['q_id'], support_doc, dense_res_list)]

# training loop proper
class ArgumentsS2S():
    def __init__(self):
        self.batch_size = 8
        self.backward_freq = 16
        self.max_length = 1024
        self.print_freq = 100
        self.model_save_name = "seq2seq_models/eli5_bart_model"
        self.learning_rate = 2e-4
        self.num_epochs = 3

s2s_args = ArgumentsS2S()

eli5_train_docs = json.load(open('precomputed/eli5_train_precomputed_dense_docs.json'))
eli5_valid_docs = json.load(open('precomputed/eli5_valid_precomputed_dense_docs.json'))
s2s_train_dset = ELI5DatasetS2S(eli5['train_eli5'], document_cache=dict([(k, d) for k, d, src_ls in eli5_train_docs]))
s2s_valid_dset = ELI5DatasetS2S(eli5['validation_eli5'], document_cache=dict([(k, d) for k, d, src_ls in eli5_valid_docs]), training=False)

qa_s2s_tokenizer, pre_model = make_qa_s2s_model(
    model_name="facebook/bart-large",
    from_file=None,
    device="cuda:0"
)
qa_s2s_model = torch.nn.DataParallel(pre_model)

train_qa_s2s(qa_s2s_model, qa_s2s_tokenizer, s2s_train_dset, s2s_valid_dset, s2s_args)


# Again, if you don't want to train the model yourself, we made trained weights available on the [Hugging Face model repository](https://huggingface.co/models) , which you can download with:

# In[ ]:


qa_s2s_tokenizer = AutoTokenizer.from_pretrained('yjernite/bart_eli5', cache_dir='./tokenaizers')
qa_s2s_model = AutoModelForSeq2SeqLM.from_pretrained('yjernite/bart_eli5', cache_dir='./models').to('cuda:0')
_ = qa_s2s_model.eval()


# We now have everything we need to answer any question! Now let's try the full system on our running example along with the first four questions of the test set:

# In[ ]:


questions = []
answers = []

for i in [12345] + [j for j in range(4)]:
    # create support document with the dense index
    question = eli5['test_eli5'][i]['title']
    doc, res_list = query_qa_dense_index(
        question, qar_model, qar_tokenizer,
        wiki40b_snippets, wiki40b_index_flat, device='cuda:0'
    )
    # concatenate question and support document into BART input
    question_doc = "question: {} context: {}".format(question, doc)
    # generate an answer with beam search
    answer = qa_s2s_generate(
            question_doc, qa_s2s_model, qa_s2s_tokenizer,
            num_answers=1,
            num_beams=8,
            min_len=64,
            max_len=256,
            max_input_length=1024,
            device="cuda:0"
    )[0]
    questions += [question]
    answers += [answer]

df = pd.DataFrame({
    'Question': questions,
    'Answer': answers,
})
df.style.set_properties(**{'text-align': 'left'})


# We made it, and a lot of these answers actually make sense! The model seems to sometimes struggle with coherence and with starting some of the answers, but we're getting some pretty good information overall.
# 
# ## Metrics computing
# 
# The last thing we'll do is see how we can get a quantitative evaluation of the model performance. Here, we'll use the ROUGE implementation provided in the `nlp` library.  
# 
# Note that it is a different implementation than the one used in the [BART](https://arxiv.org/abs/1910.13461) and [ELI5](https://arxiv.org/abs/1907.09190) papers: the [rouge](https://pypi.org/project/rouge/) Python package they use normalises all numerical values, among other pre-processing choices, leading to higher numbers. We reproduce their evaluation in the Appendix section, but recommend using the more sensitive metric provided by the `nlp` package, which can be computed with:

# In[ ]:


from tqdm import tqdm

predicted = []
reference = []

# Generate answers for the full test set
for i in tqdm(range(eli5['test_eli5'].num_rows)):
    # create support document with the dense index
    question = eli5['test_eli5'][i]['title']
    doc, res_list = query_qa_dense_index(
        question, qar_model, qar_tokenizer,
        wiki40b_snippets, wiki40b_gpu_index, device='cuda:1'
    )
    # concatenate question and support document into BART input
    question_doc = "question: {} context: {}".format(question, doc)
    # generate an answer with beam search
    answer = qa_s2s_generate(
            question_doc, qa_s2s_model, qa_s2s_tokenizer,
            num_answers=1,
            num_beams=8,
            min_len=96,
            max_len=256,
            max_input_length=1024,
            device="cuda:0"
    )[0]
    predicted += [answer]
    reference += [eli5['test_eli5'][i]['answers']['text'][0]]


# In[ ]:


# Compare each generation to the fist answer from the dataset
nlp_rouge = nlp.load_metric('rouge')

scores = nlp_rouge.compute(
    predicted, reference,
    rouge_types=['rouge1', 'rouge2', 'rougeL', 'rougeLsum'],
    use_agregator=True, use_stemmer=False
)
df = pd.DataFrame({
    'rouge1': [scores['rouge1'].mid.precision, scores['rouge1'].mid.recall, scores['rouge1'].mid.fmeasure],
    'rouge2': [scores['rouge2'].mid.precision, scores['rouge2'].mid.recall, scores['rouge2'].mid.fmeasure],
    'rougeL': [scores['rougeL'].mid.precision, scores['rougeL'].mid.recall, scores['rougeL'].mid.fmeasure],
}, index=[ 'P', 'R', 'F'])
df.style.format({'rouge1': "{:.4f}", 'rouge2': "{:.4f}", 'rougeL': "{:.4f}"})


# ### Original metrics
# 
# Here we reproduce the ROUGE evaluation from the original [ELI5 paper](https://arxiv.org/abs/1907.09190) to be able to comparable our performance to theirs. Our generation setting leads to lower ROUGE-1 and ROUGE-2 than the state-of-the-art reported in [BART](https://arxiv.org/abs/1910.13461) (30.6 and 6.2 respectively), and higher ROUGE-L (24.3).

# In[ ]:


from nltk import PorterStemmer
from rouge import Rouge
from spacy.lang.en import English
from time import time

stemmer = PorterStemmer()
rouge = Rouge()
tokenizer = English().Defaults.create_tokenizer()

def compute_rouge_eli5(compare_list):
    preds = [" ".join([stemmer.stem(str(w))
                       for w in tokenizer(pred)])
             for gold, pred in compare_list]
    golds = [" ".join([stemmer.stem(str(w))
                       for w in tokenizer(gold)])
             for gold, pred in compare_list]
    scores = rouge.get_scores(preds, golds, avg=True)
    return scores


compare_list = [(g, p) for p, g in zip(predicted, reference)]
scores = compute_rouge_eli5(compare_list)
df = pd.DataFrame({
    'rouge1': [scores['rouge-1']['p'], scores['rouge-1']['r'], scores['rouge-1']['f']],
    'rouge2': [scores['rouge-2']['p'], scores['rouge-2']['r'], scores['rouge-2']['f']],
    'rougeL': [scores['rouge-l']['p'], scores['rouge-l']['r'], scores['rouge-l']['f']],
}, index=[ 'P', 'R', 'F'])
df.style.format({'rouge1': "{:.4f}", 'rouge2': "{:.4f}", 'rougeL': "{:.4f}"})


# In[ ]:





# In[ ]:




