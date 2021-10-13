import Link from "next/link";
// 
import styles from "./header.module.scss";

const Header: React.FC = () => {
  return (
    <header className={styles.container}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  );
};

export default Header;