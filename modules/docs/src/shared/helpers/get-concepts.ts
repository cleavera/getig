import { $readFile } from '@cleavera/fs';
import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@cleavera/utils';
import { IResource } from '@getig/core';
import * as glob from 'glob';
import { join } from 'path';
import { CONTENT_BASE_PATH } from '../constants/content-base-path.constant';
import { IConceptPage } from '../interfaces/concept-page.interface';
import { $getFilename } from './get-filename';

export async function $getConcepts(module: string): Promise<Array<IConceptPage>> {
    return new Promise<Array<IConceptPage>>(async(resolve: IPromiseResolver<Array<IConceptPage>>, reject: IPromiseRejector): Promise<void> => {
        const moduleBasePath: string = join(CONTENT_BASE_PATH, module);

        glob(join(moduleBasePath, '/*.md'), async(err: Maybe<Error> = null, files: Array<string>) => {
            if (!$isNull(err)) {
                reject(err);
            }

            const out: Array<IConceptPage> = [];

            for (const fileName of files) {
                let content: string = await $readFile(fileName);
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

            resolve(out);
        });
    });
}
