"use strict";

const templates = require('./template')
const download = require('download-git-repo')
const ora = require('ora')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const fs = require('fs')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

function init(templateName, projectName) {
  if (!templateName) {
    console.log(chalk.red(`\n ${logSymbols.error} Please enter template name.`))
    console.log(chalk.green(`\n ${logSymbols.success} init <template-name> <project-name>`))
    process.exit()
  }

  if (!projectName) {
    console.log(chalk.red(`\n ${logSymbols.error} Please enter project name.`))
    console.log(chalk.green(`\n ${logSymbols.success} init <template-name> <project-name>`))
    process.exit()
  }
  const template = templates[templateName]

  if(!template) {
    console.log(chalk.red(`\n ${logSymbols.error} Template ${templateName} is not exist!`))
    console.log(chalk.green(`\n ${logSymbols.warning} Current Available  Template`))
    Object.keys(templates).forEach( item =>  console.log(chalk.green(`\n ${logSymbols.info} ${item} - ${templates[item].desc}`)))
    process.exit();
  }

  const spinner = ora('Downloading the template...').start()

  download(template.git, projectName, function (err) {
    if (err) {
      spinner.fail('Template download failed.')
      return
    }
    spinner.succeed('Templates downloaded successfully.')

    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入项目名称',
        default: projectName
      }
      ])
      .then(answers => {
        const packagePath = `${projectName}/package.json`
        const packageContent = fs.readFileSync(packagePath, 'utf8')
        const packageResult = handlebars.compile(packageContent)(answers)
        fs.writeFileSync(packagePath, packageResult)
        console.log(logSymbols.success, chalk.green('The template was initialized successfully'))
      })
      .catch(error => {
        if(error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
      })
    })

}

module.exports = { init }