import fs from 'fs';
import path from 'path';
import { execPromise } from '../utils/execPromise.js';
import ora from 'ora';
import chalk from 'chalk';
import { addSwaggerAnimation } from '../cliAnimations/animation.js';
import { swaggerConfig, swaggerConfigExtra } from '../boilerPlates/configs/swagger.config.js';

export const createSwaggerConfig = async () => {
    const projectRoot = process.cwd();
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(chalk.red("❌ package.json not found. Make sure you are in a NestJS project."));
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!((packageJson.dependencies && packageJson.dependencies['@nestjs/core']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@nestjs/core']))) {
        console.log(chalk.red("❌ This is not a NestJS project. Make sure you are in the root directory."));
        return;
    }

    const hasSwagger =
        (packageJson.dependencies && packageJson.dependencies['@nestjs/swagger']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@nestjs/swagger']);

    if (!hasSwagger) {
        addSwaggerAnimation.start();
        await execPromise(`npm install @nestjs/swagger@7 swagger-ui-express`, { 
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8'
        });
        addSwaggerAnimation.stop();
        console.log(chalk.green("✅ Swagger installed successfully!"));
    } else {
        console.log(chalk.yellow("✅ Swagger is already installed."));
    }

    const mainTsPath = path.join(projectRoot, 'src', 'main.ts');
    if (!fs.existsSync(mainTsPath)) {
        console.log(chalk.red("❌ main.ts not found. Make sure you are in the correct directory."));
        return;
    }

    // Create or update `swagger.config.ts`
    const swaggerConfigPath = path.join(projectRoot, 'src', 'swagger.config.ts');
    if (!fs.existsSync(swaggerConfigPath)) {
        fs.writeFileSync(swaggerConfigPath, swaggerConfig, 'utf8');
        console.log(chalk.green(`✅ Swagger configuration file created: ${swaggerConfigPath}`));
    } else {
        console.log(chalk.yellow(`✅ Swagger configuration already exists at: ${swaggerConfigPath}`));
    }

    console.log(chalk.whiteBright("\n To Enbale Swagger, update your `main.ts` file:\n"));
    console.log(chalk.cyan(swaggerConfigExtra));
};
