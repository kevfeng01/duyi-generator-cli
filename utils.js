import fs from 'fs-extra'
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import logSymbols from './logSymbols.js';
import shell from "shelljs"

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

export function isUnicodeSupported() {
    const { env } = process;
    const { TERM, TERM_PROGRAM } = env;

    if (process.platform !== 'win32') {
        return TERM !== 'linux'; // Linux console (kernel)
    }

    return Boolean(env.WT_SESSION) // Windows Terminal
        || Boolean(env.TERMINUS_SUBLIME) // Terminus (<0.2.27)
        || env.ConEmuTask === '{cmd::Cmder}' // ConEmu and cmder
        || TERM_PROGRAM === 'Terminus-Sublime'
        || TERM_PROGRAM === 'vscode'
        || TERM === 'xterm-256color'
        || TERM === 'alacritty'
        || TERM === 'rxvt-unicode'
        || TERM === 'rxvt-unicode-256color'
        || env.TERMINAL_EMULATOR === 'JetBrains-JediTerm';
}

export async function removeDir(dir) {
    const spinner = ora({
        text: `正在删除文件夹${chalk.cyan(dir)}`,
        color: 'yellow'
    }).start()

    try {
        await fs.remove(resolveApp(dir))
        spinner.succeed(chalk.greenBright(`删除文件夹${chalk.cyan(dir)}成功`))
    } catch (err) {
        spinner.fail(chalk.redBright(`删除文件夹${chalk.cyan(dir)}失败`))
        console.log(err)
        return
    }
}

export async function changePackageJson(name, info) {
    try {
        const pkg = await fs.readJson(resolveApp(`${name}/package.json`))
        Object.keys(info).forEach(item => {
            if (item === 'name') {
                pkg[item] = info[item] && info[item].trim() ? info[item].trim() : name
            } else if (item === 'keywords') {
                pkg[item] = info[item].split(',')
            } else if (info[item] && info[item].trim()) {
                pkg[item] = info[item]
            }
        })

        await fs.writeJson(resolveApp(`${name}/package.json`, pkg, { spaces: 2 }))
    } catch (err) {
        console.log(logSymbols.error, chalk.red('对不起，修改自定义package.json失败，请手动修改。'))
        console.log(err)
    }
}

export function npmInstall(dir) {
    const spinner = ora("正在安装......")
    if (shell.exec(`cd ${shell.pwd()}/${dir} && npm install -d --force`).code !== 0) {
        console.log(logSymbols.error, chalk.redBright("对不起，依赖安装失败，请手动安装"))
        shell.exit(1)
    }
    spinner.succeed(chalk.greenBright("~~~依赖安装成功~~~"))
    spinner.succeed(chalk.greenBright("~~~项目创建完成~~~"))

    shell.exit(1)
}