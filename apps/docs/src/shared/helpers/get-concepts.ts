import { IResource } from '@getig/core';
import { promises as fs } from 'fs';
import * as glob from 'glob';
import { join } from 'path';
import { promisify } from 'util';

import { CONTENT_BASE_PATH } from '../constants/content-base-path.constant';
import { IConceptPage } from '../interfaces/concept-page.interface';
import { $getFilename } from './get-filename';

export async function $getConcepts(module: string): Promise<Array<IConceptPage>> {
    const moduleBasePath: string = join(CONTENT_BASE_PATH, module);
    const files: Array<string> = await promisify(glob)(join(moduleBasePath, '/*.md'));
    const out: Array<IConceptPage> = [];

    for (const fileName of files) {
        let content: string = await fs.readFile(fileName, {
            encoding: 'utf-8'
        });

        const outFileName: string = $getFilename(fileName);
        let title: string = outFileName;
        const resources: Array<IResource> = [];

        content = content.replace(/# (.+)/, (_match: string, matchedTitle: string): string => {
            title = matchedTitle;

            return '';
        });

        out.push({
            title,
            content,
            resources,
            path: outFileName
        });
    }

    return out;
}
