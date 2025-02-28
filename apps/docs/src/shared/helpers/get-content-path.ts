import { join } from 'path';

import { CONTENT_BASE_PATH } from '../constants/content-base-path.constant';

export function $getContentPath(path: string): string {
    return join(CONTENT_BASE_PATH, path);
}
