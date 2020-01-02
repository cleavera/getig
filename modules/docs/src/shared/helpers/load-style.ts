import { $readFile } from '@cleavera/fs';
import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@cleavera/utils';
import { ImporterReturnType, render, Result, SassError } from 'node-sass';
import { join, sep } from 'path';

export async function $loadStyle(path: string): Promise<string> {
    return new Promise<string>(async(resolve: IPromiseResolver<string>, reject: IPromiseRejector): Promise<void> => {
        render({
            importer: (url: string, prev: string): ImporterReturnType => {
                let basePath: string = path;

                if (prev !== 'stdin') {
                    basePath = prev;
                }

                return { file: join(basePath.substring(0, basePath.lastIndexOf(sep)), url) };
            },
            data: await $readFile(path)
        }, (err: Maybe<SassError> = null, result: Result) => {
            if (!$isNull(err)) {
                reject(err);
            } else {
                resolve(result.css.toString());
            }
        });
    });
}
