import shell from 'shelljs'
import chalk from 'chalk'
import clone from "./gitClone.js"
import logSymbols from './logSymbols.js'
import { changePackageJson, npmInstall, removeDir } from "./utils.js"
import fs from 'fs-extra'
import { inquirerChoose, inquirerConfirm, inquirerInputs } from './interactive.js'
import { templates, messages } from './constants.js'


export default async function (name, option) {
    // console.log('创建的项目名字是：' + name)
    console.log(option)
    if (!shell.which('git')) {
        console.log(logSymbols.error, chalk.redBright('对不起，要先安装git'))
        shell.exit(1)
    }
    if (name.match(/[\u4E00-\u9FFF`~!@#$%&^*()[\]\\;:<.>?]/g)) {
        console.log(logSymbols.error, chalk.redBright('对不起，项目名称存在非法字符'))
        return
    }

    let repository = ""

    if (option.template) {
        const template = templates.find(template => template.name === option.template)
        if (!template) {
            console.log(logSymbols.error, `不存在模板${chalk.yellowBright(option.template)}`)
            console.log(`\r\n 运行${logSymbols.arrow} ${chalk.cyanBright("duyi-cli list")} 查看所有可用模板\r\n `)
            return
        }
        repository = template.value
    } else {
        const answer = await inquirerChoose("请选择一个项目模板", templates)
        console.log('answer', answer)
        repository = answer.choose
    }

    if (fs.existsSync(name) && !option.force) {
        console.log(logSymbols.warning, `已经存在项目文件夹${chalk.yellowBright(name)}`)
        // console.log("请问你要删除吗？(y/N)")

        const answer = await inquirerConfirm(`是否删除文件夹${chalk.yellowBright(name)}`)
        console.log(answer)

        if (answer.confirm) {
            await removeDir(name)
        } else {
            console.log(logSymbols.error, chalk.redBright(`对不起，创建文件夹失败，存在同名文件夹，${chalk.cyan(name)}`))
        }
    } else if (fs.existsSync(name) && option.force) {
        console.log(logSymbols.warning, `已经存在项目文件夹${chalk.yellowBright(name)}`)
        await removeDir(name)
    }

    try {
        await clone("yingside/webpack-template", "test", {}, err => {
            console.log(err ? "Error" : "Success")
        })
    } catch (err) {
        console.log(logSymbols.error, chalk.redBright("对不起，项目创建失败"))
        console.log(err)
        shell.exit(1)
    }

    if (!option.ignore) {
        const answers = await inquirerInputs(messages)
        await changePackageJson(name, answers)
    }

    npmInstall(name)
}