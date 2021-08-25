class AppContext:

    def __init__(self, engine = None):
        self.engine = engine

    def is_ready(self) -> bool:
        return self.engine is not None

    def set_engine(self, engine):
        self.engine = engine
