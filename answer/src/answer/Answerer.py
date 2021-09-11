from .TokenaizerWrapper import TokenaizerWrapper

class Answerer:

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = TokenaizerWrapper(tokenizer)

    # Based on https://huggingface.co/transformers/main_classes/model.html#transformers.generation_utils.GenerationMixin.generate
    def answer(self, 
        question: str,
        context: str,
        max_input_length: int = 1024,
        num_answers: int = 10,
        num_beams: int = 8,
        min_answer_length: int = 64, 
        max_answer_length: int = 256,
        do_sample: bool = False,
        temperature: float = 1.0,
        top_p: float = 1.0, 
        top_k: int = 50,
        no_repeat_ngram_size: int = 3,
        length_penalty: float = 1.0,
        max_time: float = None
    ) -> list:
        """
            Answer on question with given context
            @param question - question on which need to answer
            @param context - context for qustion
            @param max_input_length - summary maximum length of question and context document
            @param min_answer_length - minimum length of answer
            @param max_answer_length - maximum length of answer
            @param num_answers - count of answers to generate per question
            @param do_sample - Whether or not to use sampling ; use greedy decoding otherwise
            @param num_beams - Number of beams for beam search. 1 means no beam search
            @param temperature - The value used to module the next token probabilities
            @param top_k - The number of highest probability vocabulary tokens to keep for top-k-filtering
            @param top_p - if set to float < 1, only the most probable tokens with probabilities that add up to top_p or higher are kept for generation.
            @param no_repeat_ngram_size - if set to int > 0, all ngrams of that size can only occur once.
            @param length_penalty - Exponential penalty to the length. 1.0 means no penalty. Set to values < 1.0 in order to encourage the model to generate shorter sequences, to a value > 1.0 in order to encourage the model to produce longer sequences.
            @param max_time - The maximum amount of time you allow the computation to run for in seconds. generation will still finish the current pass after allocated time has been passed.
            @return list of strings, answers on question
        """

        question_document = f"question: {question} context: {context}"

        question_ids, question_mask = self.tokenizer.encode([question_document], max_length = max_input_length)
        
        n_beams = num_answers if num_beams is None else max(num_beams, num_answers)
        
        answer_ids = self.model.generate(
            input_ids = question_ids,
            attention_mask = question_mask,
            min_length = min_answer_length,
            max_length = max_answer_length,
            do_sample = do_sample,
            early_stopping = True,
            num_beams = 1 if do_sample else n_beams,
            temperature = temperature,
            top_k = top_k,
            top_p = top_p,
            eos_token_id = self.tokenizer.eos_token_id,
            no_repeat_ngram_size = no_repeat_ngram_size,
            num_return_sequences = num_answers,
            decoder_start_token_id = self.tokenizer.bos_token_id,
            length_penalty = length_penalty,
            max_time = max_time
        )

        return self.tokenizer.decode(answer_ids)


        
