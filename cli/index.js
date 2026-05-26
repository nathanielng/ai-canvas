#!/usr/bin/env node

import { Command } from 'commander';
import * as objectCommands from './commands/object.js';
import * as connectorCommands from './commands/connector.js';
import * as configCommands from './commands/config.js';
import * as utilityCommands from './commands/utility.js';

const program = new Command();

program
  .name('canvas')
  .description('Free-form diagramming tool with CLI interface')
  .version('0.1.0');

// Object commands
program
  .command('object:add')
  .argument('<file>', 'Canvas JSON file')
  .argument('<type>', 'Object type (rectangle, text, container)')
  .option('-x, --x <number>', 'X position', '0')
  .option('-y, --y <number>', 'Y position', '0')
  .option('-w, --width <number>', 'Width', '100')
  .option('-h, --height <number>', 'Height', '100')
  .option('-p, --property <key=value...>', 'Properties (e.g. fill="#fff" stroke="#000")')
  .action((file, type, options) => objectCommands.add(file, type, options).catch(fail));

program
  .command('object:list')
  .argument('<file>', 'Canvas JSON file')
  .action((file) => objectCommands.list(file).catch(fail));

program
  .command('object:get')
  .argument('<file>', 'Canvas JSON file')
  .argument('<id>', 'Object ID')
  .action((file, id) => objectCommands.get(file, id).catch(fail));

program
  .command('object:update')
  .argument('<file>', 'Canvas JSON file')
  .argument('<id>', 'Object ID')
  .option('-p, --position <x,y>', 'New position (e.g. 100,200)')
  .option('-s, --size <w,h>', 'New size (e.g. 200,150)')
  .option('--property <key=value...>', 'Update properties')
  .action((file, id, options) => objectCommands.update(file, id, options).catch(fail));

program
  .command('object:delete')
  .argument('<file>', 'Canvas JSON file')
  .argument('<id>', 'Object ID')
  .action((file, id) => objectCommands.delete(file, id).catch(fail));

// Connector commands
program
  .command('connector:add')
  .argument('<file>', 'Canvas JSON file')
  .argument('<source>', 'Source object ID')
  .argument('<target>', 'Target object ID')
  .option('--property <key=value...>', 'Properties')
  .action((file, source, target, options) =>
    connectorCommands.add(file, source, target, options).catch(fail)
  );

program
  .command('connector:list')
  .argument('<file>', 'Canvas JSON file')
  .action((file) => connectorCommands.list(file).catch(fail));

program
  .command('connector:delete')
  .argument('<file>', 'Canvas JSON file')
  .argument('<id>', 'Connector ID')
  .action((file, id) => connectorCommands.delete(file, id).catch(fail));

// Config commands
program
  .command('config:get')
  .argument('<file>', 'Canvas JSON file')
  .option('-k, --key <key>', 'Specific key (e.g. layoutDirection)')
  .action((file, options) => configCommands.get(file, options).catch(fail));

program
  .command('config:set')
  .argument('<file>', 'Canvas JSON file')
  .argument('<key>', 'Config key')
  .argument('<value>', 'Config value')
  .action((file, key, value) => configCommands.set(file, key, value).catch(fail));

// Utility commands
program
  .command('init')
  .argument('[file]', 'Output file', 'canvas.json')
  .option('--name <name>', 'Canvas name')
  .action((file, options) => utilityCommands.init(file, options).catch(fail));

program
  .command('validate')
  .argument('<file>', 'Canvas JSON file')
  .action((file) => utilityCommands.validate(file).catch(fail));

program.parse();

function fail(error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
