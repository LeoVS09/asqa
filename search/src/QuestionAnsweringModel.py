import torch

class QuestionAnsweringModel:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
    
    def encode(self,question,context):
        encoded = self.tokenizer.encode_plus(question, context)
        return encoded["input_ids"], encoded["attention_mask"]

    def decode(self,token):
        answer_tokens = self.tokenizer.convert_ids_to_tokens(token , skip_special_tokens=True)
        return self.tokenizer.convert_tokens_to_string(answer_tokens)

    def predict(self,question,context):
        input_ids, attention_mask = self.encode(question,context)
        start_scores, end_scores = self.model(torch.tensor([input_ids]), attention_mask=torch.tensor([attention_mask])).values()
        ans_tokens = input_ids[torch.argmax(start_scores) : torch.argmax(end_scores)+1]
        answer = self.decode(ans_tokens)
        return answer