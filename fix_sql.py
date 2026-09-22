with open('mariadb-schema.sql', 'r', encoding='utf-8') as f:
    s = f.read()
s = s.replace("LONGTEXT NOT NULL DEFAULT ''", "LONGTEXT DEFAULT ''")
s = s.replace("LONGTEXT NOT NULL DEFAULT '[]'", "LONGTEXT DEFAULT '[]'")
with open('mariadb-schema.sql', 'w', encoding='utf-8') as f:
    f.write(s)
print('Corrección de LONGTEXT aplicada.')
