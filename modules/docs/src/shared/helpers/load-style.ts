import { $readFile } from '@cleavera/fs';
import { ImporterReturnType, render, Result } from 'node-sass';
import { join, sep } from 'path';
import { promisify } from 'util';

export async function $loadStyle(path: string): Promise<string> {
    const result: Result = await promisify(render)({
        importer: (url: string, prev: string): ImporterReturnType => {
            let basePath: string = path;

            if (prev !== 'stdin') {
                basePath = prev;
            }

            return {
                file: join(basePath.substring(0, basePath.lastIndexOf(sep)), url)
            };
        },
        data: await $readFile(path)
    });

    return result.css.toString();
}
