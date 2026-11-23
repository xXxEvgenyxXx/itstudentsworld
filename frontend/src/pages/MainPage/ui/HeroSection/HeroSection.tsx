import { useRef } from "react";
import { Button, Typography } from "antd";
import s from "./HeroSection.module.scss";

const { Title, Text } = Typography;

export function HeroSection() {
  const nextSectionRef = useRef<HTMLDivElement>(null);

  const scrollToNextSection = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={s.hero}>
      {/* Блок с текстом (слева внизу) */}
      <div className={s.content}>
        <Title level={1} className={s.title}>
          Мир студента IT - <span className={s.highlight}>уникальное кубическое путешествие</span>
        </Title>
        
        <Text className={s.subtitle}>
          Стройте бесконечные магистрали, прокладывайте маршруты и создавайте уникальные станции
        </Text>
      </div>

      {/* Блок с кнопкой (по центру внизу) */}
      <div className={s.buttonWrapper}>
        <Button
          type="primary"
          size="large"
          className={s.startButton}
          onClick={scrollToNextSection}
        >
          НАЧАТЬ ИГРУ
        </Button>
      </div>

      {/* Невидимый якорь для скролла */}
      <div ref={nextSectionRef} className={s.scrollAnchor} />
    </section>
  );
}