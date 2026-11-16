import { Typography } from "antd";
import s from "./PrivacyPage.module.scss";

const { Title, Paragraph } = Typography;

export function PrivacyPage() {
  return (
    <div className={s.container}>
      <Title level={2} className={s.title}>
        Политика конфиденциальности
      </Title>

      <div className={s.content}>
        <Paragraph className={s.text}>
          Настоящая Политика конфиденциальности регулирует порядок обработки и
          использования персональных данных пользователей веб-приложения «Мир
          студента IT» (далее — Сайт).
        </Paragraph>

        <Title level={4} className={s.subtitle}>
          1. Какие данные мы собираем
        </Title>
        <Paragraph className={s.text}>
          При регистрации на Сайте мы собираем следующие данные: Фамилия, Имя,
          Отчество (при наличии), адрес электронной почты (email) и игровой
          логин (никнейм).
        </Paragraph>

        <Title level={4} className={s.subtitle}>
          2. Цели сбора данных
        </Title>
        <Paragraph className={s.text}>
          Персональные данные используются исключительно для идентификации
          пользователя на Сайте, обеспечения работы Личного кабинета, а также
          для предоставления доступа к приобретенной внутриигровой косметике. Мы
          не передаем ваши данные третьим лицам.
        </Paragraph>

        <Title level={4} className={s.subtitle}>
          3. Использование файлов Cookie
        </Title>
        <Paragraph className={s.text}>
          Сайт использует файлы cookie для сохранения авторизации (токенов
          доступа) и корректной работы интерфейса. Вы можете отключить cookie в
          настройках браузера, однако это может повлиять на работоспособность
          Сайта.
        </Paragraph>

        <Title level={4} className={s.subtitle}>
          4. Защита данных
        </Title>
        <Paragraph className={s.text}>
          Мы принимаем необходимые организационные и технические меры для защиты
          персональных данных от неправомерного доступа, уничтожения, изменения
          или распространения. Пароли хранятся исключительно в виде
          криптографических хешей.
        </Paragraph>

        <Title level={4} className={s.subtitle}>
          5. Контакты
        </Title>
        <Paragraph className={s.text}>
          По всем вопросам, связанным с обработкой персональных данных, вы
          можете обратиться к администрации Сайта.
        </Paragraph>
      </div>
    </div>
  );
}
