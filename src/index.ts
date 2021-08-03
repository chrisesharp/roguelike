import { start } from './start';
import { Logger } from './common/logger';

const log = new Logger();
log.info("Starting...");
start(process.env.ROLE);