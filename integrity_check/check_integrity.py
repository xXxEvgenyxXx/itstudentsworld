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
    
    # Счетчики для итоговой статистики
    ok_count = 0
    violation_count = 0
    missing_count = 0

    # Используем utf-8-sig, чтобы автоматически отсечь BOM в начале файла, если он есть
    with open(manifest_path, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        print('-------------------------------')

        # split(None, 1) делит строку по любому количеству пробелов/табуляций, 
        # что защищает от случайных лишних пробелов в файле
        parts = line.split(None, 1)
        if len(parts) != 2:
            print(f"Ошибка формата строки (ожидался хэш и путь): {line}")
            continue
            
        expected_hash, filepath = parts
        
        # Приводим к нижнему регистру и убираем случайные пробелы
        expected_hash = expected_hash.strip().lower()
        
        print(f"Ожидаемый хэш: {expected_hash} (Длина: {len(expected_hash)})")
        print(f"Путь к файлу:  {filepath}")
        
        # Формируем полный путь к рабочему файлу
        full_filepath = os.path.join(project_root, filepath)

        if not os.path.exists(full_filepath):
            print(f"[ОТСУТСТВУЕТ] {filepath}")
            missing_count += 1
            continue

        # Вычисляем текущий хеш
        with open(full_filepath, 'rb') as file_to_check:
            file_hash = hashlib.sha256(file_to_check.read()).hexdigest()

        print(f"Фактический хэш: {file_hash} (Длина: {len(file_hash)})")

        # Сравниваем
        if file_hash == expected_hash:
            print(f"[OK] {filepath}")
            ok_count += 1
        else:
            print(f"[НАРУШЕНИЕ] {filepath}")
            violation_count += 1

    print('\n=================================')
    print("ИТОГИ ПРОВЕРКИ:")
    print(f"Успешно (OK): {ok_count}")
    print(f"Изменено (НАРУШЕНИЕ): {violation_count}")
    print(f"Отсутствует (ОТСУТСТВУЕТ): {missing_count}")
    print("=================================")

if __name__ == '__main__':
    check_integrity()