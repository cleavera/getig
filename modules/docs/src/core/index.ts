import { Logger } from '@cleavera/debug';
import { $bootstrap } from '@getig/core';
import { join } from 'path';

import { ROOT } from '../../root';
import { LOGGER } from '../shared';
import { CoreModule } from './core.module';

LOGGER.configure(Logger.LogLevel.SILLY);

$bootstrap(CoreModule, join(ROOT, './dist')).then(() => {
    LOGGER.info('Compilation completed');
}, (e: Error) => {
    throw e;
});

process.on('unhandledRejection', (reason: unknown | null | undefined) => {
    if (reason instanceof Error) {
        LOGGER.error(reason);
    } else {
        LOGGER.error(new Error(JSON.stringify(reason)));
    }

    process.exit(1);
});
