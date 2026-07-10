import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sketchify</h1>
          <p className={styles.tagline}>
            Turn any photo into a pencil sketch. Runs entirely in your browser.
          </p>
        </div>
        <span className={styles.privacy}>nothing is uploaded</span>
      </header>

      <main className={styles.layout}>
        <section className={styles.preview}>{/* Stage goes here */}</section>
        {/* Controls sidebar goes here */}
      </main>
    </div>
  );
}
