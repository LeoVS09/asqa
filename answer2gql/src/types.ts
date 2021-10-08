import type { ExpressContext } from 'apollo-server-express';
import { AnswerService } from './services';

export interface AnswererContext {
  answerer: AnswerService;
}

export interface AppContext extends AnswererContext, ExpressContext {}
