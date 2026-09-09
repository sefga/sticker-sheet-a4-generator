import './styles.css';
import { UIController } from './ui/controls';
import { store } from './state';
import { initAnalytics } from './analytics';

// Инициализация контроллера пользовательского интерфейса и аналитики
window.addEventListener('DOMContentLoaded', () => {
  initAnalytics();
  const controller = new UIController();
  // Первоначальный рендер с сохраненными или дефолтными настройками
  controller.render(store.getState());
});
