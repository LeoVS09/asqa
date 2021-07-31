#!/usr/bin/env python
# coding: utf-8

# # Demo QA
# 
# Demo of questions and answers for system

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


# ## Evaluate Search Engine
# 
# Check how search engine found context for system

# In[2]:


import nlp
eli5 = nlp.load_dataset('eli5', cache_dir='./datasets')
wiki40b_snippets = nlp.load_dataset('wiki_snippets', name='wiki40b_en_100_0', cache_dir='./datasets')['train']


# In[3]:


from lfqa_utils import *


# In[4]:


qar_tokenizer = AutoTokenizer.from_pretrained('yjernite/retribert-base-uncased', cache_dir='./tokenaizers')
qar_model = AutoModel.from_pretrained('yjernite/retribert-base-uncased', cache_dir='./models').to('cuda:0')
_ = qar_model.eval()


# In[5]:


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


# In[6]:


question = eli5['test_eli5'][12342]['title']
doc, res_list = query_qa_dense_index(question, qar_model, qar_tokenizer, wiki40b_snippets, wiki40b_index_flat, device='cuda:0')

df = pd.DataFrame({
    'Article': ['---'] + [res['article_title'] for res in res_list],
    'Sections': ['---'] + [res['section_title'] if res['section_title'].strip() != '' else res['article_title']
                 for res in res_list],
    'Text': ['--- ' + question] + [res['passage_text'] for res in res_list],
})
df.style.set_properties(**{'text-align': 'left'})


# ## Answer generation

# In[7]:


qa_s2s_tokenizer = AutoTokenizer.from_pretrained('yjernite/bart_eli5', cache_dir='./tokenaizers')
qa_s2s_model = AutoModelForSeq2SeqLM.from_pretrained('yjernite/bart_eli5', cache_dir='./models').to('cuda:0')
_ = qa_s2s_model.eval()


# In[17]:


def answer_on(question):
    doc, res_list = query_qa_dense_index(
        question, qar_model, qar_tokenizer,
        wiki40b_snippets, wiki40b_index_flat, device='cuda:0'
    )
    # concatenate question and support document into BART input
    question_doc = "question: {} context: {}".format(question, doc)
    # generate an answer with beam search
    answers = qa_s2s_generate(
            question_doc, qa_s2s_model, qa_s2s_tokenizer,
            num_answers=10,
            num_beams=8,
            min_len=64,
            max_len=256,
            max_input_length=1024,
            device="cuda:0"
    )
    
    return answers


# In[11]:


questions = []
answers = []

for i in [12342] + [j for j in range(4)]:
    # create support document with the dense index
    question = eli5['test_eli5'][i]['title']
    answer = answer_on(question)[0]
    questions += [question]
    answers += [answer]

df = pd.DataFrame({
    'Question': questions,
    'Answer': answers,
})
df.style.set_properties(**{'text-align': 'left'})


# In[33]:


def print_answer(question):
    answer = answer_on(question)[0]
    print('Question:', question, '\nAnswer:', answer)


# In[34]:


print_answer('Why sky is blue?')


# In[35]:


print_answer('Why so hard to generate ideas?')


# In[36]:


print_answer('Why we feels bad, when long time not sleep?')


# In[ ]:




