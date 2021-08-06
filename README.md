# Asqa

Question answering bot. Natural language understanding deep learning model for lnog form answers on open domain quations.

## Goal

Research trying to provide simple architecture, which will able to answer on questions in quality suitable for real usage as QA system or search engine.

## Roadmap

- [x] QA model for [ELI5 dataset](https://facebookresearch.github.io/ELI5/explore.html)
- [ ] Telegram bot integration
- [ ] Use Bigger Wikipedia index, instead [Wiki40b](https://www.tensorflow.org/datasets/catalog/wiki40b) use [wikipedia_en_100_0](https://huggingface.co/datasets/wiki_snippets), which contain two times bigger dataset
- [ ] QA model for [SQuAD dataset](https://rajpurkar.github.io/SQuAD-explorer/)
- [ ] QA model for [CoQA dataset](https://stanfordnlp.github.io/coqa/)
- [ ] QA model for [QReCC dataset](https://github.com/apple/ml-qrecc)
- [ ] Site for direct bot conversation
- [ ] Add urls to wikipedia pages in answers
- [ ] Setup CI/CD for service deployment
- [ ] Setup CI/CD for models deployment

## Development

For create development enviroment used docker. For start development containers and notebooks inside type

```bash
make start
```

### Start specific containers

For start research Jupiter notebook type

```bash
make notebook
```

For notebook in search labmda enviroment type

```bash
make search-notebook
```
