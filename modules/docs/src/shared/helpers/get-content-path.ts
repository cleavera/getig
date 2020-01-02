import { join } from 'path';
import { ROOT } from '../../../root';

export function $getContentPath(path: string): string {
    return join(ROOT, './content', path);
}
