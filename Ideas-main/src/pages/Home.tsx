import Dashboards from '../components/Dashboard';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Header />
      <Navbar />
      <Dashboards />
      <Footer />
    </>
  );
}
