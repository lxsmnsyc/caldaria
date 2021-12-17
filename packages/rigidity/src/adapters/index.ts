import HTTPAdapter from './http-adapter';
import VanillaAdapter from './vanilla-adapter';
import HTTP2Adapter from './http2-adapter';
import VercelAdapter from './vercel-adapter';
import WorkerAdapter from './worker-adapter';
import { AdapterType, Adapter } from '../types';

const adapters: Record<AdapterType, Adapter<any>> = {
  http: HTTPAdapter,
  vanilla: VanillaAdapter,
  http2: HTTP2Adapter,
  vercel: VercelAdapter,
  worker: WorkerAdapter,
};

export default adapters;
