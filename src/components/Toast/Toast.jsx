import styles from './Toast.module.css';

export default function Toast({ message, type = 'success' }) {
  const getIcon = () => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className={`${styles.toast} ${message ? styles.show : ''} ${styles[type]}`}>
      <span className={`mi-outlined ${styles.icon}`}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
}
