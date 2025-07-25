# Proverb Frontend & Notion Proxy

## Notion-Token als Umgebungsvariable setzen (Vercel)

1. Gehe zu deinem Projekt auf [vercel.com](https://vercel.com/).
2. Öffne die Projekteinstellungen ("Settings").
3. Wähle "Environment Variables".
4. Lege eine neue Variable an:
   - **Name:** `NOTION_TOKEN`
   - **Value:** Dein Notion Integration Token (beginnend mit `secret_...`)
   - **Environment:** `Production` und/oder `Preview`
5. Änderungen speichern und neu deployen.

Das Token wird dann automatisch in der Serverless Function verwendet und ist im Frontend nicht sichtbar. 