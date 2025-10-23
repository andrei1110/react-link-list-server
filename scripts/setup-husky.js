const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Git Hooks...');

try {
  // Verificar se estamos em um repositório Git
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

  // Instalar husky
  console.log('📦 Instalando Husky...');
  execSync('npx husky install', { stdio: 'inherit' });

  // Adicionar hook de pre-commit
  console.log('🔧 Configurando pre-commit hook...');
  const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;

  fs.writeFileSync('.husky/pre-commit', preCommitHook);
  execSync('chmod +x .husky/pre-commit', { stdio: 'inherit' });

  // Adicionar hook de commit-msg
  console.log('🔧 Configurando commit-msg hook...');
  const commitMsgHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
`;

  fs.writeFileSync('.husky/commit-msg', commitMsgHook);
  execSync('chmod +x .husky/commit-msg', { stdio: 'inherit' });

  console.log('✅ Git Hooks configurados com sucesso!');
  console.log('📝 Agora seus commits serão validados automaticamente.');
} catch (error) {
  console.error('❌ Erro na configuração:', error.message);
  process.exit(1);
}
