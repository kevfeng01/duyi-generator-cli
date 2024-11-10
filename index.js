#! /usr/bin/env node
import figlet from "figlet"
import chalk from "chalk"
import { program } from "commander"
import { templates } from "./constants.js"
import initAction from "./initAction.js"
import logSymbols from "./logSymbols.js"
import { table } from 'table'

// 方法一
// import { readFile } from 'fs/promises'
// const pkg = JSON.parse(
//     await readFile(new URL("./package.json", import.meta.url))
// )
// 方法二
// import pkg from "./package.json" assert {type: 'json'}

// 方法三
// import { createRequire } from "module"
// const require = createRequire(import.meta.url)
// const pkg = require('./package.json')

// 方法四
import fs from "fs-extra"
const pkg = fs.readJsonSync(new URL("./package.json", import.meta.url))

// console.log('pkg', pkg)


program.version(pkg.version, "-v --version", "display the version number")
program
    .name("duyi-cli")
    .description("一个简单的脚手架工具")
    .usage("<command> [options]")
    .on("--help", () => {
        console.log('\r\n' + chalk.bgGreenBright.bold(figlet.textSync("duyi-cli!", {
            font: "Standard",
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 80,
            whitespaceBreak: true
        })))

        console.log(`\r\n Run ${chalk.cyan('duyi-cli <command> --help')} for detailed usage of given command.`)
    })

program
    .command("create <app-name>")
    .description("创建一个新项目")
    .option("-t --template [template]", "输入模板名称创建项目")
    .option("-f --force", "强制覆盖本地同名项目")
    .option("-i --ignore", "忽略相关项目描述，快速创建项目")
    .action(initAction)

program
    .command("list")
    .description("查看所有可用的模板")
    .action((name, option) => {

        const data = templates.map(item => [chalk.greenBright(item.name), chalk.blueBright(item.value), chalk.blueBright(item.desc)])
        const config = {
            header: {
                alignment: 'center',
                content: chalk.yellowBright(logSymbols.star, '所有可用的模板')
            }
        }
        console.log(table(data, config))

        // console.table(data, ["模板名称", "模板地址", "模板描述"])

        // console.log(chalk.yellowBright(logSymbols.star, "所有可用的模板："))
        // templates.forEach((item, index) => {
        //     console.log(chalk.greenBright(index + 1) + " " + chalk.greenBright(item.name) + " " + chalk.blueBright(item.value))
        // })
    })

// console.log('\r\n' + chalk.bgGreenBright.bold(figlet.textSync("duyi-cli!", {
//     font: "Standard",
//     horizontalLayout: 'default',
//     verticalLayout: 'default',
//     width: 80,
//     whitespaceBreak: true
// })))

// console.log(`\r\n Run ${chalk.cyan('duyi-cli <command> --help')} for detailed usage of given command.`)

// console.log('argv', process.argv)

program.parse(process.argv)

// console.log('hello duyi-cli')