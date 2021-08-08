#!/usr/bin/env node

'use strict'

const commander = require('commander')
const { version } = require('../package')
const { init } = require('./init')



commander
  .version(version, '-v, --version')

commander
  .usage('<command> [options]')

commander
  .command('init [templateName] [projectName]')
  .description('Initialize a new project')
  .alias('i')
  .action(init)

commander
  .command('list')
  .description('查看所有可用模板')
  .action(function(){
    console.log(`abcd模板`);
  })

commander.parse(process.argv)