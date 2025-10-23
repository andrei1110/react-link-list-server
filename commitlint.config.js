module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nova funcionalidade
        "fix", // Correção de bug
        "docs", // Documentação
        "style", // Formatação, falta de ponto e vírgula, etc.
        "refactor", // Refatoração de código
        "test", // Adicionando testes
        "chore", // Manutenção do build, configurações, etc.
        "ci", // Configurações de CI
        "perf", // Melhorias de performance
        "revert", // Revertendo commits
      ],
    ],
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
  },
};
