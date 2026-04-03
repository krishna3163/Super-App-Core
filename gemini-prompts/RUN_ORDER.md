# Gemini Run Order (Phase-by-Phase)

Run in this exact order from workspace root.

## 1) Phase 1
PowerShell:
Get-Content -Raw .\gemini-prompts\PHASE_1_FOUNDATION_PROMPT.md | gemini

## 2) Phase 2
PowerShell:
Get-Content -Raw .\gemini-prompts\PHASE_2_FEATURES_PROMPT.md | gemini

## 3) Phase 3
PowerShell:
Get-Content -Raw .\gemini-prompts\PHASE_3_SECURITY_PROMPT.md | gemini

## 4) Phase 4
PowerShell:
Get-Content -Raw .\gemini-prompts\PHASE_4_SCALE_AND_RELEASE_PROMPT.md | gemini

## Important
- Run next phase only after reviewing output from previous phase.
- If phase output says tests failed, do one fix run with same phase prompt.
- Keep all generated summaries in docs/reports if available.
