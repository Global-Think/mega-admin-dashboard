import fs from 'fs';
import path from 'path';

const ESLINT_CONFIG = `{
  "root": true,
  "env": { "browser": true, "es2021": true, "node": true },
  "extends": [
    "eslint:recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}
`;

const PRETTIER_CONFIG = `{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
`;

const JENKINSFILE = `pipeline {
  agent any
  stages {
    stage('Install') {
      steps { sh 'npm install' }
    }
    stage('Build') {
      steps { sh 'npm run build' }
    }
  }
}
`;

export function injectConfigFiles(projectPath: string): void {
  fs.mkdirSync(projectPath, { recursive: true });
  fs.writeFileSync(path.join(projectPath, '.eslintrc.json'), ESLINT_CONFIG, 'utf8');
  fs.writeFileSync(path.join(projectPath, '.prettierrc'), PRETTIER_CONFIG, 'utf8');
  fs.writeFileSync(path.join(projectPath, 'Jenkinsfile'), JENKINSFILE, 'utf8');
}
