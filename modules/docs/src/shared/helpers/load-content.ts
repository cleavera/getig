import { $readFile } from '@cleavera/fs';
import { $getContentPath } from './get-content-path';

export async function $loadContent(path: string): Promise<string> {
    return await $readFile($getContentPath(path));
}
