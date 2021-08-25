import torch

class TokenaizerWrapper:
    """Add basic functtionality around base tokenaise"""

    def __init__(self, tokenizer):
        self.tokenizer = tokenizer

        self.eos_token_id = tokenizer.eos_token_id
        self.bos_token_id = tokenizer.bos_token_id

    def encode(self, texts, max_length):
        tokens = self.tokenizer.batch_encode_plus(texts, max_length = max_length, pad_to_max_length=True)
        ids, mask = (
            torch.LongTensor(tokens["input_ids"]),
            torch.LongTensor(tokens["attention_mask"]),
        )

        return ids, mask

    def decode(self, batch_ids):
        return [text.strip() for text in self.tokenizer.batch_decode(batch_ids, skip_special_tokens=True)]
