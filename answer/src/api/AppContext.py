class AppContext:

    def __init__(self, answerer = None):
        self.answerer = answerer

    def is_ready(self) -> bool:
        return self.answerer is not None

    def set_answerer(self, answerer):
        self.answerer = answerer
