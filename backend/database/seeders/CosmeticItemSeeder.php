<?php

namespace Database\Seeders;

use App\Models\CosmeticItem;
use App\Models\CosmeticType;
use Illuminate\Database\Seeder;

class CosmeticItemSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем ID типов по их алиасам, чтобы не хардкодить цифры
        $types = CosmeticType::pluck('id', 'alias');

        $items = [
            // --- ПЛАЩИ (5 шт) ---
            [
                'name' => 'Плащ Машиниста',
                'type_alias' => 'cape',
                'price' => 500.00,
                'image_url' => '/images/cosmetics/cape_driver.png',
            ],
            [
                'name' => 'Плащ Начальника Станции',
                'type_alias' => 'cape',
                'price' => 750.00,
                'image_url' => '/images/cosmetics/cape_station_master.png',
            ],
            [
                'name' => 'Плащ Дежурного',
                'type_alias' => 'cape',
                'price' => 600.00,
                'image_url' => '/images/cosmetics/cape_duty.png',
            ],
            [
                'name' => 'Плащ Проводника',
                'type_alias' => 'cape',
                'price' => 450.00,
                'image_url' => '/images/cosmetics/cape_conductor.png',
            ],
            [
                'name' => 'Плащ Ревизора',
                'type_alias' => 'cape',
                'price' => 800.00,
                'image_url' => '/images/cosmetics/cape_inspector.png',
            ],

            // --- ГОЛОВНЫЕ УБОРЫ (5 шт) ---
            [
                'name' => 'Фуражка Машиниста',
                'type_alias' => 'hat',
                'price' => 400.00,
                'image_url' => '/images/cosmetics/hat_driver.png',
            ],
            [
                'name' => 'Фуражка Начальника',
                'type_alias' => 'hat',
                'price' => 550.00,
                'image_url' => '/images/cosmetics/hat_station_master.png',
            ],
            [
                'name' => 'Каска Железнодорожника',
                'type_alias' => 'hat',
                'price' => 300.00,
                'image_url' => '/images/cosmetics/hat_helmet.png',
            ],
            [
                'name' => 'Шапка Путейца',
                'type_alias' => 'hat',
                'price' => 350.00,
                'image_url' => '/images/cosmetics/hat_track_worker.png',
            ],
            [
                'name' => 'Фуражка ДСП',
                'type_alias' => 'hat',
                'price' => 500.00,
                'image_url' => '/images/cosmetics/hat_dsp.png',
            ],

            // --- КРЫЛЬЯ (5 шт) ---
            [
                'name' => 'Крылья Сапсана',
                'type_alias' => 'wings',
                'price' => 1500.00,
                'image_url' => '/images/cosmetics/wings_sapsan.png',
            ],
            [
                'name' => 'Крылья Ласточки',
                'type_alias' => 'wings',
                'price' => 1200.00,
                'image_url' => '/images/cosmetics/wings_swallow.png',
            ],
            [
                'name' => 'Крылья Экспресса',
                'type_alias' => 'wings',
                'price' => 1000.00,
                'image_url' => '/images/cosmetics/wings_express.png',
            ],
            [
                'name' => 'Крылья Грузового',
                'type_alias' => 'wings',
                'price' => 900.00,
                'image_url' => '/images/cosmetics/wings_cargo.png',
            ],
            [
                'name' => 'Крылья Метро',
                'type_alias' => 'wings',
                'price' => 1300.00,
                'image_url' => '/images/cosmetics/wings_metro.png',
            ],
        ];

        foreach ($items as $item) {
            CosmeticItem::updateOrCreate(
                ['name' => $item['name']], // Ищем по имени
                [
                    'type_id' => $types[$item['type_alias']],
                    'price' => $item['price'],
                    'image_url' => $item['image_url'],
                ]
            );
        }

        $this->command->info('15 предметов косметики успешно добавлены/обновлены.');
    }
}
