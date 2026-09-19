import re

with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# We can find the boundaries using regex
# "  en: {" to "  fr: {"
en_match = re.search(r'  en: \{(.*?)\n  fr: \{', text, re.DOTALL)
fr_match = re.search(r'  fr: \{(.*?)\n  ar: \{', text, re.DOTALL)
ar_match = re.search(r'  ar: \{(.*?)\n};', text, re.DOTALL)

if en_match and fr_match and ar_match:
    en_content = "import { Translations } from './types';\n\nexport const en: Translations = {" + en_match.group(1) + "\n};\nexport default en;\n"
    fr_content = "import { Translations } from './types';\n\nexport const fr: Translations = {" + fr_match.group(1) + "\n};\nexport default fr;\n"
    ar_content = "import { Translations } from './types';\n\nexport const ar: Translations = {" + ar_match.group(1) + "\n};\nexport default ar;\n"
    
    with open('src/i18n/en.ts', 'w', encoding='utf-8') as f:
        f.write(en_content)
    with open('src/i18n/fr.ts', 'w', encoding='utf-8') as f:
        f.write(fr_content)
    with open('src/i18n/ar.ts', 'w', encoding='utf-8') as f:
        f.write(ar_content)
        
    print("Successfully split translations!")
else:
    print("Could not match languages")
