#!/usr/bin/env python3
"""Static checks for every skill in skills/. No dependencies.

Checks: frontmatter name matches the folder, description is quoted-safe and
under 1024 characters, every reference file is linked from SKILL.md, every
technique (## section of a model-invoked skill) carries a Support and a Source line, and every
"file.md › Section" pointer resolves to a real heading in some skill.

Usage: python3 scripts/check.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POINTER = re.compile(r"`(?:references/)?([\w-]+\.md)` › ([^|;`\n]+)")
errors = []

# Pointers may name a reference in any skill (sk-interface-audit points into
# interface-mechanics), so resolve against every skill's headings.
ALL_HEADINGS = {}
for ref in ROOT.glob("skills/*/references/*.md"):
    ALL_HEADINGS.setdefault(ref.name, []).extend(
        l[3:].strip() for l in ref.read_text().splitlines() if l.startswith("## ")
    )


def frontmatter(text):
    if not text.startswith("---\n"):
        return {}
    block = text[4 : text.index("\n---", 4)]
    fields = {}
    for line in block.splitlines():
        m = re.match(r"^(\w[\w-]*):\s*(.*)$", line)
        if m:
            fields[m.group(1)] = m.group(2)
    return fields


for skill_md in sorted(ROOT.glob("skills/*/SKILL.md")):
    skill = skill_md.parent
    text = skill_md.read_text()
    fm = frontmatter(text)
    rel = skill_md.relative_to(ROOT)

    if fm.get("name") != skill.name:
        errors.append(f"{rel}: name '{fm.get('name')}' does not match folder '{skill.name}'")
    desc = fm.get("description", "")
    if desc.startswith('"') and desc.endswith('"'):
        desc = desc[1:-1]
    elif ": " in desc:
        errors.append(f"{rel}: unquoted description contains ': ', which breaks YAML")
    if not desc:
        errors.append(f"{rel}: missing description")
    elif len(desc) > 1024:
        errors.append(f"{rel}: description is {len(desc)} characters, limit 1024")

    refs = {p.name: p for p in (skill / "references").glob("*.md")}
    headings = {
        name: [l[3:].strip() for l in p.read_text().splitlines() if l.startswith("## ")]
        for name, p in refs.items()
    }

    for name in refs:
        if f"references/{name}" not in text and f"`{name}`" not in text:
            errors.append(f"{rel}: references/{name} is never named (orphan)")

    # User-invoked workflow skills hold procedures and lead tables, not techniques.
    workflow = fm.get("disable-model-invocation") == "true"
    for name, p in refs.items():
        if workflow:
            continue
        sections = re.split(r"^## ", p.read_text(), flags=re.M)[1:]
        for sec in sections:
            title = sec.splitlines()[0].strip()
            if "**Support:**" not in sec:
                errors.append(f"{p.relative_to(ROOT)}: '{title}' has no Support line")
            if "**Source:**" not in sec:
                errors.append(f"{p.relative_to(ROOT)}: '{title}' has no Source line")

    for src in [skill_md, *refs.values()]:
        for i, line in enumerate(src.read_text().splitlines(), 1):
            for f, sec in POINTER.findall(line):
                sec = sec.strip().rstrip(".")
                if f not in ALL_HEADINGS:
                    errors.append(f"{src.relative_to(ROOT)}:{i}: points to missing file {f}")
                elif not any(h.startswith(sec) for h in ALL_HEADINGS[f]):
                    errors.append(f"{src.relative_to(ROOT)}:{i}: no heading in {f} starts with '{sec}'")

for e in errors:
    print(f"::error::{e}")
print("OK" if not errors else f"{len(errors)} error(s)")
sys.exit(1 if errors else 0)
