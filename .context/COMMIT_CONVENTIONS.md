# Commit Conventions

As strictly requested, ALWAYS adhere to these Git commit rules in this repository:

1. **NO Brackets in the Prefix**: Do not use scopes or brackets like `feat(tools):` or `fix(ui):`. Simply use `feat:` or `fix:`.
2. **Emoji AFTER the Prefix**: The emoji MUST come immediately after the prefix. Do NOT put the emoji at the beginning of the commit message.
   - ❌ **Incorrect**: `✨ feat(tools): add new feature`
   - ✅ **Correct**: `feat: ✨ add new feature`
3. **Granular Commits**: Push changes feature by feature. Even small, incremental changes should have their own isolated commits rather than batching large unrelated modifications together.
