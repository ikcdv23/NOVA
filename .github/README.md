# Política de cambios

El flujo `workflows/pull-request-only.yml` comprueba los cambios que llegan
por pull request a `main` y `dev`. Si recibe un push directo a cualquiera
de esas ramas, falla de forma visible.

Para que GitHub rechace el push antes de que se incorpore al historial, activa
también una regla de protección en el repositorio:

1. Abre **Settings → Rules → Rulesets → New branch ruleset**.
2. Aplica la regla a `main` y `dev`.
3. Activa **Require a pull request before merging**.
4. Activa **Require status checks to pass** y exige
   **Pull request required / verify-pull-request**.
5. No habilites excepciones de bypass para quienes no deban poder saltarse la
   revisión.

Una GitHub Action se ejecuta después de recibir el push. La regla de protección
es la parte que lo bloquea realmente; el flujo aporta la comprobación requerida
para cada pull request.
