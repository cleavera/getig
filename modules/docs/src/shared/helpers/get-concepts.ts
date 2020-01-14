import { $readFile } from '@cleavera/fs';
import { $isNull, $stringReplace, IPromiseRejector, IPromiseResolver, Maybe } from '@cleavera/utils';
import { IResource, Resource } from '@getig/core';
import * as glob from 'glob';
import { join } from 'path';
import { ROOT } from '../../../root';
import { LOGGER } from '../constants/logger.constant';
import { IConceptPage } from '../interfaces/concept-page.interface';
import { $getFilename } from './get-filename';
import { $parseMarkdown } from './parse-markdown';

const basePath: string = join(ROOT, './content/');

export async function $getConcepts(module: string): Promise<Array<IConceptPage>> {
    return new Promise<Array<IConceptPage>>(async(resolve: IPromiseResolver<Array<IConceptPage>>, reject: IPromiseRejector): Promise<void> => {
        const moduleBasePath: string = join(basePath, module);
        glob(join(moduleBasePath, '/*.md'), async(err: Maybe<Error> = null, files: Array<string>) => {
            if (!$isNull(err)) {
                reject(err);
            }

            const out: Array<IConceptPage> = [];

            for (const fileName of files) {
                let content: string = $parseMarkdown(await $readFile(fileName));
                const outFileName: string = $getFilename(fileName);
                let title: string = outFileName;
                const resources: Array<IResource> = [];

                content = content.replace(/<h1>(.+?)<\/h1>/, (_match: string, matchedTitle: string): string => {
                    title = matchedTitle;

                    return '';
                });

                content = await $stringReplace(content, /<img(?:[\s\S]+?)src="(.+?)"/g, async(match: string, filePath: string): Promise<string> => {
                    let resource: Resource;

                    try {
                        resource = await Resource.FromFilePath(join(moduleBasePath, filePath));
                    } catch (e) {
                        LOGGER.warn(e); // tslint:disable-line no-console

                        return match;
                    }

                    resources.push(resource);

                    return match.replace(filePath, resource.url);
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
