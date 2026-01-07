// Schema index - exports all schemas
import video from './video';
import category from './category';
import actress from './actress';
import producer from './producer';
import picture from './picture';
import cut from './cut';
import { videoBlock } from './videoBlock';

export const schemaTypes = [video, category, actress, producer, picture, cut, videoBlock];
