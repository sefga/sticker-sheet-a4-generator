import './styles.css';
import { UIController } from './ui/controls';
import { store } from './state';

// Инициализация контроллера пользовательского интерфейса
window.addEventListener('DOMContentLoaded', () => {
  const controller = new UIController();
  // Первоначальный рендер с сохраненными или дефолтными настройками
  controller.render(store.getState());
});
