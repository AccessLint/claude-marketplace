#!/usr/bin/env bash
# Serve the frozen fixture site for the benchmark (default port 8000).
# Frozen, local, deterministic page state — point both arms at http://localhost:<port>/.
set -euo pipefail
cd "$(dirname "$0")/fixtures"
port="${1:-8000}"
echo "Serving benchmark fixtures at http://localhost:${port}/  (clean.html forms.html widget.html media.html)"
exec python3 -m http.server "${port}"
