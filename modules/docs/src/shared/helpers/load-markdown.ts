import { Maybe } from '@cleavera/utils';
import { LOGGER } from '../constants/logger.constant';
import { $loadContent } from './load-content';
import { $parseMarkdown } from './parse-markdown';

export async function $loadMarkdown(path: string, optional?: true): Promise<Maybe<string>>;
export async function $loadMarkdown(path: string, optional?: false): Promise<string>;
export async function $loadMarkdown(path: string, optional: boolean = false): Promise<Maybe<string>> {
    try {
        return $parseMarkdown(await $loadContent(path));
    } catch (e) {
        if (!optional) {
            LOGGER.error(e);

            return process.exit(1);
        }

        if (e.code !== 'ENOENT') {
            LOGGER.error(e);

            return process.exit(1);
        }

        return null;
    }
}
