import { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Row, Col, Button } from "antd";
import { allRoutes } from "@/app/router/routes";
import { CookieSettingsModal } from "@/features/cookie-settings";
import s from "./Footer.module.scss";

const { Title, Text } = Typography;

export function Footer() {
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <Row justify="center" gutter={[48, 32]}>
          {/* Блок 1: Основное */}
          <Col xs={24} sm={12} md={8}>
            <Title level={5} className={s.columnTitle}>Основное</Title>
            <div className={s.links}>
              <Link to={allRoutes.publicRoutes.REGISTER_PAGE.path} className={s.link}>Регистрация</Link>
              <Link to={allRoutes.publicRoutes.MAIN_PAGE.path} className={s.link}>Главная</Link>
              <Link to={allRoutes.publicRoutes.ABOUT_PAGE.path} className={s.link}>О сервере</Link>
              <Link to={allRoutes.publicRoutes.SHOP_PAGE.path} className={s.link}>Магазин</Link>
            </div>
          </Col>

          {/* Блок 2: Прочее */}
          <Col xs={24} sm={12} md={8}>
            <Title level={5} className={s.columnTitle}>Прочее</Title>
            <div className={s.links}>
              <Link to={allRoutes.publicRoutes.PRIVACY_PAGE.path} className={s.link}>
                Политика конфиденциальности
              </Link>
              
              <Button 
                type="link" 
                onClick={() => setIsCookieModalOpen(true)} 
                className={s.linkButton}
              >
                Настройки Cookie
              </Button>
            </div>
          </Col>
        </Row>

        <div className={s.bottom}>
          <Text className={s.copyright}>
            © {new Date().getFullYear()} Мир студента IT. Все права защищены.
          </Text>
        </div>
      </div>

      <CookieSettingsModal 
        isOpen={isCookieModalOpen} 
        onClose={() => setIsCookieModalOpen(false)} 
      />
    </footer>
  );
}