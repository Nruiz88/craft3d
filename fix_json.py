content = open('D:\\webs\\craft3d\\mariadb-schema.sql', 'r', encoding='utf-8').read()
old = "JSON NOT NULL DEFAULT ('[]')"
new = "LONGTEXT NOT NULL DEFAULT '[]'"
content = content.replace(old, new)
open('D:\\webs\\craft3d\\mariadb-schema.sql', 'w', encoding='utf-8').write(content)
print("Reemplazado.")
print("JSON restantes:", content.count("JSON"))
