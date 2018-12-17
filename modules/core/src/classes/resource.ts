import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@cleavera/utils';
import { createHash, Hash } from 'crypto';
import { readFile } from 'fs';
import { IResource } from '../interfaces/resource.interface';

export class Resource implements IResource {
    public url: string;
    public content: Buffer;

    private constructor(url: string, content: Buffer) {
        this.url = url;
        this.content = content;
    }

    public static async FromFilePath(path: string, targetPath: Maybe<string> = null): Promise<Resource> {
        return new Promise<Resource>((resolve: IPromiseResolver<Resource>, reject: IPromiseRejector): void => {
            readFile(path, (err: Maybe<NodeJS.ErrnoException> = null, content: Buffer) => {
                if (!$isNull(err)) {
                    reject(err);
                }

                if (!$isNull(targetPath)) {
                    resolve(new Resource(targetPath, content));

                    return;
                }

                const hash: Hash = createHash('md5');

                hash.update(content);

                const name: string = hash.digest('hex');
                const extension: string = path.substring(path.lastIndexOf('.'));

                resolve(new Resource(`/resources/${name}${extension}`, content));
            });
        });
    }

    public static FromString(content: string, extension: string, targetPath?: null): Resource;
    public static FromString(content: string, extension: null, targetPath: string): Resource;
    public static FromString(content: string, extension: Maybe<string> = null, targetPath: Maybe<string> = null): Resource {
        const convertedContent: Buffer = Buffer.from(content, 'utf8');

        if (!$isNull(targetPath)) {
            return new Resource(targetPath, convertedContent);
        }

        const hash: Hash = createHash('md5');

        hash.update(content);

        const name: string = hash.digest('hex');

        return new Resource(`/resources/${name}.${extension}`, convertedContent);
    }
}
