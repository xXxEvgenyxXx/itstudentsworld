import hashlib
import os

def check_integrity():
    # Путь к папке, где лежит сам скрипт
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Путь к корню проекта (на уровень выше папки integrity_check)
    project_root = os.path.dirname(current_dir)
    
    manifest_path = os.path.join(current_dir, 'manifest.txt')

    if not os.path.exists(manifest_path):
        print("Ошибка: файл manifest.txt не найден!")
        return

    print(f"--- Запуск проверки целостности ---")
    
    with open(manifest_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        if not line.strip():
            continue
            
        # Разделяем хеш и путь
        expected_hash, filepath = line.strip().split('  ', 1)
        
        # Формируем полный путь к рабочему файлу
        full_filepath = os.path.join(project_root, filepath)

        if not os.path.exists(full_filepath):
            print(f"[ОТСУТСТВУЕТ] {filepath}")
            continue

        # Вычисляем текущий хеш
        with open(full_filepath, 'rb') as file_to_check:
            file_hash = hashlib.sha256(file_to_check.read()).hexdigest()

        # Сравниваем
        if file_hash == expected_hash.lower():
            print(f"[OK] {filepath}")
        else:
            print(f"[НАРУШЕНИЕ] {filepath}")

if __name__ == '__main__':
    check_integrity()