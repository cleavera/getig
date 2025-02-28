import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { LogLevel } from '../classes/logger';
import { LOGGER } from '../constants/logger.constant';
import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IResource } from '../interfaces/resource.interface';

export async function bootstrap(module: IComponentDefinition, basePath: string = process.cwd(), logLevel: LogLevel = LogLevel.WARN): Promise<void> {
    LOGGER.configure(logLevel);

    await MODULE_REGISTRY.generate(new module(), basePath);

    for (const resource of RESOURCE_STORE.getResources()) {
        const { url, content }: IResource = await resource;
        const path: string = join(basePath, url);
        const directory: string = dirname(path);

        await fs.mkdir(directory, {
            recursive: true
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable, @typescript-eslint/no-explicit-any
        }).catch((error: any) => {
             
            if (error?.code !== 'EEXIST') {
                throw error;
            }
        });

        await fs.writeFile(join(basePath, url), content);
    }
}
