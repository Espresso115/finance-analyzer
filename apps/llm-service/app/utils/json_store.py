import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any


def read_json(path: Path, default: Any):
    if not path.exists():
        return default

    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return default

    return json.loads(text)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        "w",
        encoding="utf-8",
        delete=False,
        dir=path.parent,
        suffix=".tmp",
    ) as tmp:
        json.dump(data, tmp, indent=2, ensure_ascii=False)
        tmp_path = Path(tmp.name)

    tmp_path.replace(path)
