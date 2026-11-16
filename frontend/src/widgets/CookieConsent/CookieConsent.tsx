import { useState } from "react";
import { Modal, Button, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { allRoutes } from "@/app/router/routes";
import s from "./CookieConsent.module.scss";

const { Title, Paragraph } = Typography;

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(() => {
    const consent = localStorage.getItem("cookie_consent");
    return !consent;
  });

  const handleAccept = (type: "all" | "necessary") => {
    localStorage.setItem("cookie_consent", type);
    setIsOpen(false);

    if (type === "all") {
      console.log("Пользователь разрешил все cookie. Можно грузить Метрику.");
    }
  };

  return (
    <Modal
      open={isOpen}
      closable={false} // Запрещаем закрывать крестиком без выбора
      maskClosable={false} // Запрещаем закрывать кликом по фону
      footer={null} // Убираем стандартный футер, сделаем свой
      centered
      width={600}
      className={s.cookieModal}
    >
      <div className={s.content}>
        <Title level={3} className={s.title}>
          Мы заботимся о вашей приватности
        </Title>

        <Paragraph className={s.text}>
          Мы используем файлы cookie, чтобы сделать ваше пребывание на сайте
          «Мир студента IT» максимально удобным.
        </Paragraph>

        <div className={s.infoBlock}>
          <p className={s.infoText}>
            <strong>Необходимые cookie:</strong> нужны для работы авторизации,
            корзины и защиты от взломов. Без них сайт не сможет работать.
          </p>
          <p className={s.infoText}>
            <strong>Аналитические cookie:</strong> помогают нам понять, какие
            страницы наиболее популярны, чтобы делать сайт лучше
            (Яндекс.Метрика).
          </p>
        </div>

        <Paragraph className={s.text}>
          Подробнее о том, как мы обрабатываем данные, читайте в{" "}
          <Link
            to={allRoutes.publicRoutes.PRIVACY_PAGE.path}
            className={s.link}
          >
            Политике конфиденциальности
          </Link>
          .
        </Paragraph>

        <Space
          className={s.buttons}
          size="middle"
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Button
            type="primary"
            size="large"
            block
            onClick={() => handleAccept("all")}
            className={s.btnPrimary}
          >
            Принять все cookie
          </Button>
          <Button
            size="large"
            block
            onClick={() => handleAccept("necessary")}
            className={s.btnSecondary}
          >
            Принять только необходимые
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
